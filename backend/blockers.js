/**
 * Blocker management: records blockers, notifies unblockers on Telegram,
 * marks dependent tasks At Risk, and handles blocker resolution.
 */

const store = require("./lib/store");
const { transitionTask } = require("./stateMachine");
const { sendToUser } = require("./lib/telegram");

async function recordBlocker({ taskId, blockerText, blockerOwnerName = null, source = "llm" }) {
    const task = await store.getTaskById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    let blockerOwnerId = null;
    const users = await store.getUsers();

    if (blockerOwnerName) {
        const found = users.find(
            (u) => u.name.toLowerCase() === blockerOwnerName.toLowerCase()
        );
        if (found) blockerOwnerId = found.id;
    }

    // Default to Aisha if credentials/design/review blocker and owner is not the current task owner
    if (!blockerOwnerId) {
        const candidate = users.find((u) => u.id !== task.owner_id && u.role === "member");
        if (candidate) blockerOwnerId = candidate.id;
    }

    // Transition task to Blocked via stateMachine (this sets at_risk on dependents automatically)
    await transitionTask({
        taskId,
        newStatus: "Blocked",
        reason: `Blocked: ${blockerText}`,
        source,
        blockerText,
        blockerOwnerId,
    });

    // Notify the unblocker if they are linked to Telegram
    if (blockerOwnerId) {
        const unblocker = await store.getUserById(blockerOwnerId);
        const owner = task.owner_id ? await store.getUserById(task.owner_id) : null;
        const ownerName = owner ? owner.name : "A teammate";

        if (unblocker && unblocker.telegram_chat_id) {
            const alertText = `⚠️ Blocker Alert: ${unblocker.name}, ${ownerName} is blocked on "${task.title}" and needs help: "${blockerText}". Can you assist?`;
            try {
                await sendToUser(unblocker.id, alertText);
            } catch (err) {
                console.warn(`Could not ping unblocker on Telegram: ${err.message}`);
            }
        }
    }

    return {
        success: true,
        taskId,
        status: "Blocked",
        blockerText,
        blockerOwnerId,
    };
}

async function resolveBlocker({ taskId, resolutionNote = "Blocker resolved by manager or team", source = "manager" }) {
    const task = await store.getTaskById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    // Transition back to In Progress
    const updated = await transitionTask({
        taskId,
        newStatus: "In Progress",
        reason: resolutionNote,
        source,
    });

    // Notify task owner
    if (task.owner_id) {
        const owner = await store.getUserById(task.owner_id);
        if (owner && owner.telegram_chat_id) {
            const notifyText = `Good news, ${owner.name}! The blocker on "${task.title}" has been cleared: "${resolutionNote}". You're back in progress.`;
            try {
                await sendToUser(owner.id, notifyText);
            } catch (err) {
                console.warn(`Could not notify owner on Telegram: ${err.message}`);
            }
        }
    }

    return updated;
}

module.exports = {
    recordBlocker,
    resolveBlocker,
};
