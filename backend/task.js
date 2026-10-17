/**
 * Task business logic: creation, assignment notification, dependency linking, and enriched queries.
 */

const store = require("./lib/store");
const { sendToUser } = require("./lib/telegram");

async function createTaskWithNotification(taskInput) {
    const {
        title,
        description = "",
        owner_id = null,
        deadline = null,
        acceptance_criteria = "",
        evidence_required = "text",
        project_id = null,
        dependencies = [],
    } = taskInput;

    if (!title || !title.trim()) {
        throw new Error("Task title is required");
    }

    const project = await store.getProject();
    const resolvedProjectId = project_id || project?.id;

    const task = await store.createTask({
        project_id: resolvedProjectId,
        title: title.trim(),
        description: description.trim(),
        owner_id: owner_id || null,
        status: "Assigned",
        progress_pct: 0,
        deadline: deadline || null,
        acceptance_criteria: acceptance_criteria.trim(),
        evidence_required: evidence_required || "text",
    });

    // Link dependencies
    if (Array.isArray(dependencies)) {
        for (const depId of dependencies) {
            if (depId && depId !== task.id) {
                await store.addTaskDependency(task.id, depId);
            }
        }
    }

    // Log creation event
    await store.logTaskEvent({
        task_id: task.id,
        old_status: null,
        new_status: "Assigned",
        reason: `Task created: "${task.title}"`,
        source: "manager",
    });

    // Notify owner on Telegram if assigned and linked
    if (owner_id) {
        const owner = await store.getUserById(owner_id);
        if (owner && owner.telegram_chat_id) {
            const formattedDeadline = deadline ? `due ${deadline}` : "no deadline specified";
            const criteriaText = acceptance_criteria
                ? ` Done means: ${acceptance_criteria}.`
                : "";
            const msg = `📋 New task assigned: "${task.title}", ${formattedDeadline}.${criteriaText} Reply when you start, or let me know if anything blocks you!`;

            try {
                await sendToUser(owner.id, msg);
            } catch (err) {
                console.warn(`Could not send assignment Telegram message: ${err.message}`);
            }
        }
    }

    return task;
}

async function getEnrichedTasks(projectId) {
    const rawTasks = await store.getTasks(projectId);
    const users = await store.getUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = await Promise.all(
        rawTasks.map(async (task) => {
            const owner = task.owner_id ? userMap.get(task.owner_id) : null;
            const blockerOwner = task.blocker_owner_id ? userMap.get(task.blocker_owner_id) : null;
            const dependencies = await store.getDependencies(task.id);
            const dependents = await store.getDependents(task.id);

            return {
                ...task,
                owner_name: owner ? owner.name : "Unassigned",
                owner_telegram: owner ? owner.telegram_username : null,
                blocker_owner_name: blockerOwner ? blockerOwner.name : null,
                dependencies,
                dependents,
            };
        })
    );

    return enriched;
}

module.exports = {
    createTaskWithNotification,
    getEnrichedTasks,
};
