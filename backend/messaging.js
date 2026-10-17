/**
 * Messaging module: provides centralized messaging utilities and audit formatting.
 */

const store = require("./lib/store");
const { sendToUser } = require("./lib/telegram");

async function dispatchMessage({ userId, text, taskId = null }) {
    if (!userId || !text) throw new Error("userId and text are required");
    return await sendToUser(userId, text, taskId);
}

async function getRecentStream(limit = 50) {
    const raw = await store.getMessages();
    const users = await store.getUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return raw.slice(-limit).map((msg) => {
        const user = userMap.get(msg.user_id);
        return {
            ...msg,
            user_name: user ? user.name : "System",
            channel: msg.direction === "bot_to_user" ? "Telegram Bot Out" : "Telegram Inbound",
        };
    });
}

module.exports = {
    dispatchMessage,
    getRecentStream,
};
