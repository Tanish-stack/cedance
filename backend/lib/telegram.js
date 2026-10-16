const store = require("./store");

let bot = null;

function attachBot(instance) {
    bot = instance;
}

function requireBot() {
    if (!bot) {
        throw new Error("Telegram bot is not attached yet.");
    }
    return bot;
}

async function sendToUser(userId, text, { taskId = null } = {}) {
    const user = await store.getUserById(userId);
    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }
    if (!user.telegram_chat_id) {
        throw new Error(`${user.name} has not linked Telegram yet.`);
    }

    const sent = await requireBot().api.sendMessage(user.telegram_chat_id, text);

    await store.logMessage({
        task_id: taskId,
        user_id: user.id,
        direction: "bot_to_user",
        text,
        telegram_message_id: sent.message_id,
    });

    return sent;
}

module.exports = {
    attachBot,
    sendToUser,
};
