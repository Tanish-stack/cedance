/**
 * Assignment module: manages task-to-user mappings and reassignments.
 */

const store = require("./lib/store");
const { sendToUser } = require("./lib/telegram");

async function assignTaskToUser(taskId, userId) {
    const task = await store.getTaskById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const user = await store.getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const updated = await store.updateTask(taskId, { owner_id: userId });

    await store.logTaskEvent({
        task_id: taskId,
        old_status: task.status,
        new_status: task.status,
        reason: `Reassigned task to ${user.name}`,
        source: "manager",
    });

    if (user.telegram_chat_id) {
        const text = `📋 Task Assignment: You have been assigned "${task.title}". Reply when you start or let us know if anything is blocking you.`;
        try {
            await sendToUser(user.id, text);
        } catch (err) {
            console.warn(`Could not ping user on Telegram: ${err.message}`);
        }
    }

    return updated;
}

module.exports = {
    assignTaskToUser,
};
