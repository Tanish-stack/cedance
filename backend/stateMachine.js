/**
 * State machine for task lifecycle and dependency propagation.
 *
 * Status values:
 * - Assigned
 * - In Progress
 * - Blocked
 * - Pending Verification
 * - Needs Rework
 * - Complete
 *
 * Rule: Complete strictly requires a passing evidence record (or source === 'manager' override).
 */

const store = require("./lib/store");

const VALID_STATUSES = [
    "Assigned",
    "In Progress",
    "Blocked",
    "Pending Verification",
    "Needs Rework",
    "Complete",
];

const VALID_TRANSITIONS = {
    "Assigned": ["In Progress", "Blocked", "Pending Verification"],
    "In Progress": ["Blocked", "Pending Verification"],
    "Blocked": ["In Progress"],
    "Pending Verification": ["Complete", "Needs Rework", "In Progress"],
    "Needs Rework": ["In Progress", "Blocked", "Pending Verification"],
    "Complete": ["In Progress"],
};

function canTransition(currentStatus, targetStatus, source = "system") {
    if (source === "manager") return true;
    if (currentStatus === targetStatus) return true;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
}

/**
 * Executes a verified status change on a task.
 * Updates task row, manages at_risk flags on downstream tasks, and logs task_events.
 */
async function transitionTask({
    taskId,
    newStatus,
    reason = null,
    source = "system",
    confidence = null,
    progressPct = null,
    blockerText = null,
    blockerOwnerId = null,
}) {
    const task = await store.getTaskById(taskId);
    if (!task) {
        throw new Error(`Task ${taskId} not found`);
    }

    const currentStatus = task.status;

    // Validate status name
    if (!VALID_STATUSES.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }

    // Check transition rules
    if (!canTransition(currentStatus, newStatus, source)) {
        throw new Error(
            `Illegal status transition from "${currentStatus}" to "${newStatus}" (source: ${source})`
        );
    }

    // Rule: Setting Complete requires a passing evidence record or manager override
    if (newStatus === "Complete" && source !== "manager") {
        const evidenceList = await store.getEvidence(taskId);
        const hasPassed = evidenceList.some((e) => e.verification_result === "pass");
        if (!hasPassed) {
            throw new Error(
                "Cannot transition to Complete: No passing evidence record found."
            );
        }
    }

    // Prepare updates
    const updates = {
        status: newStatus,
    };

    if (progressPct != null) {
        updates.progress_pct = progressPct;
    } else if (newStatus === "Complete") {
        updates.progress_pct = 100;
    }

    if (newStatus === "Blocked") {
        if (blockerText !== undefined) updates.blocker_text = blockerText;
        if (blockerOwnerId !== undefined) updates.blocker_owner_id = blockerOwnerId;
    } else if (newStatus === "In Progress" && currentStatus === "Blocked") {
        // Clearing blocker on resumption
        updates.blocker_text = null;
        updates.blocker_owner_id = null;
    }

    // Perform database update
    const updatedTask = await store.updateTask(taskId, updates);

    // Log to task_events
    await store.logTaskEvent({
        task_id: taskId,
        old_status: currentStatus,
        new_status: newStatus,
        reason: reason || `Transitioned to ${newStatus}`,
        source: source,
        confidence: confidence,
    });

    // Propagate risk to downstream dependencies
    if (newStatus === "Blocked") {
        await propagateRiskToDependents(taskId, true);
    } else if (newStatus === "In Progress" || newStatus === "Complete") {
        await propagateRiskToDependents(taskId, false);
    }

    return updatedTask;
}

/**
 * Propagates at_risk to dependent tasks
 */
async function propagateRiskToDependents(taskId, isAtRisk) {
    try {
        const dependentIds = await store.getDependents(taskId);
        for (const depId of dependentIds) {
            if (isAtRisk) {
                await store.updateTask(depId, { at_risk: true });
                await store.logTaskEvent({
                    task_id: depId,
                    old_status: null,
                    new_status: null,
                    reason: `Marked At Risk due to upstream blocker on task ${taskId}`,
                    source: "system",
                });
            } else {
                // Check if any other upstream dependencies are still blocked
                const dependencies = await store.getDependencies(depId);
                let stillBlocked = false;
                for (const upId of dependencies) {
                    const upTask = await store.getTaskById(upId);
                    if (upTask && upTask.status === "Blocked") {
                        stillBlocked = true;
                        break;
                    }
                }
                if (!stillBlocked) {
                    await store.updateTask(depId, { at_risk: false });
                }
            }
        }
    } catch (err) {
        console.warn("Failed to propagate risk to dependents:", err.message);
    }
}

module.exports = {
    VALID_STATUSES,
    VALID_TRANSITIONS,
    canTransition,
    transitionTask,
    propagateRiskToDependents,
};
