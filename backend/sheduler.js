/**
 * Scheduler for automated periodic task checks and reminders.
 */

const store = require("./lib/store");
const { triggerFollowup } = require("./followups");

let intervalId = null;

async function checkPendingFollowups() {
    try {
        const tasks = await store.getTasks();
        const now = new Date();

        for (const task of tasks) {
            if (task.status === "Complete") continue;
            if (task.next_followup_at && new Date(task.next_followup_at) <= now) {
                console.log(`[Scheduler] Auto follow-up triggered for task: ${task.title}`);
                await triggerFollowup(task.id);
            }
        }
    } catch (err) {
        console.warn("[Scheduler] Check failed:", err.message);
    }
}

function startScheduler(intervalMs = 60000 * 5) {
    if (intervalId) return;
    console.log(`[Scheduler] Started background follow-up check (every ${intervalMs / 1000}s)`);
    intervalId = setInterval(checkPendingFollowups, intervalMs);
}

function stopScheduler() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

module.exports = {
    checkPendingFollowups,
    startScheduler,
    stopScheduler,
};
