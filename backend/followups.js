/**
 * Follow-up engine: generates contextual, escalating nudges to task owners.
 */

const store = require("./lib/store");
const { sendToUser } = require("./lib/telegram");

function generateFollowupText(task, ownerName, followupCount = 0) {
    const title = task.title;
    const deadline = task.deadline ? ` (due ${task.deadline})` : "";

    if (task.status === "Blocked") {
        return `Hi ${ownerName}, checking in on the blocker for "${title}": "${task.blocker_text || "unresolved"}". Has there been any progress getting unblocked?`;
    }

    if (followupCount === 0) {
        return `Hi ${ownerName}, how is "${title}" coming along? Let me know your progress or if you need any help!`;
    } else if (followupCount === 1) {
        return `Hey ${ownerName}, quick reminder about "${title}"${deadline}. Could you share a quick status update?`;
    } else {
        return `⚠️ Important: ${ownerName}, "${title}"${deadline} has had no recent updates. Please reply with your status or let the project manager know if you are stuck.`;
    }
}

async function triggerFollowup(taskId) {
    const task = await store.getTaskById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    if (!task.owner_id) {
        throw new Error("Task has no assigned owner to follow up with");
    }

    const owner = await store.getUserById(task.owner_id);
    if (!owner) throw new Error("Task owner not found");

    const newCount = (task.followup_count || 0) + 1;
    const text = generateFollowupText(task, owner.name, task.followup_count || 0);

    let sent = null;
    if (owner.telegram_chat_id) {
        try {
            sent = await sendToUser(owner.id, text);
        } catch (err) {
            console.warn(`Could not send Telegram message to ${owner.name}: ${err.message}`);
        }
    } else {
        // Log locally even if owner hasn't linked telegram yet
        await store.logMessage({
            user_id: owner.id,
            task_id: taskId,
            direction: "bot_to_user",
            text,
        });
    }

    // Update followup count and timestamp
    await store.updateTask(taskId, {
        followup_count: newCount,
        next_followup_at: new Date(Date.now() + 86400000).toISOString(),
    });

    await store.logTaskEvent({
        task_id: taskId,
        old_status: task.status,
        new_status: task.status,
        reason: `Dispatched follow-up nudge #${newCount} to ${owner.name}`,
        source: "system",
    });

    return {
        success: true,
        taskId,
        followupCount: newCount,
        text,
        sentToTelegram: Boolean(sent),
    };
}

module.exports = {
    triggerFollowup,
    generateFollowupText,
};
