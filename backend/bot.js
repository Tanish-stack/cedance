const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { Bot } = require("grammy");
const store = require("./lib/store");
const { attachBot, sendToUser } = require("./lib/telegram");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    throw new Error(
        "TELEGRAM_BOT_TOKEN is missing. Check your backend/.env file.",
    );
}

const bot = new Bot(token);
attachBot(bot);

async function inviteHint() {
    const users = await store.getUsers();
    const tokens = users.map((user) => user.invite_token).join(", ");
    return `Ask your manager for your invite link, then tap Start.\nDemo tokens: ${tokens}`;
}

bot.command("start", async (ctx) => {
    const inviteToken = (ctx.match ?? "").trim();
    const chatId = ctx.chat.id;
    const username = ctx.from?.username ?? null;
    const project = await store.getProject();

    if (!inviteToken) {
        const existing = await store.getUserByChatId(chatId);
        if (existing) {
            await ctx.reply(
                `Hi ${existing.name}, you're already linked to ${project.name}.`,
            );
            return;
        }

        await ctx.reply(
            "Hi! I need your invite link to connect you to the project.\n\n" +
                (await inviteHint()),
        );
        return;
    }

    const member = await store.getUserByInviteToken(inviteToken);
    if (!member) {
        await ctx.reply(
            "That invite link is not valid. Ask your project manager for a new one.",
        );
        return;
    }

    const linked = await store.linkTelegramUser(inviteToken, chatId, username);

    const confirmation = `Hi ${linked.name}, you're linked to ${project.name}.`;
    const sent = await ctx.reply(confirmation);

    await store.logMessage({
        user_id: linked.id,
        direction: "bot_to_user",
        text: confirmation,
        telegram_message_id: sent.message_id,
    });
});

bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;

    const text = ctx.message.text;
    const chatId = ctx.chat.id;
    const user = await store.getUserByChatId(chatId);

    if (!user) {
        await ctx.reply(
            "I don't recognize this chat yet.\n\n" + (await inviteHint()),
        );
        return;
    }

    await store.logMessage({
        user_id: user.id,
        direction: "user_to_bot",
        text,
        telegram_message_id: ctx.message.message_id,
    });

    await ctx.reply(
        `Got it, ${user.name}. Your message is logged. Task updates come in the next step.`,
    );
});

bot.catch((err) => {
    console.error("Bot error:", err.error?.message ?? err.message);
});

async function startBot() {
    const me = await bot.api.getMe();
    console.log(`Bot connected: @${me.username}`);

    await bot.start({
        onStart: (botInfo) => {
            console.log(`Bot is running as @${botInfo.username}`);
            console.log("Press Ctrl+C to stop the bot.");
            console.log(
                "Invite example: https://t.me/" +
                    botInfo.username +
                    "?start=kabir",
            );
        },
    });
}

module.exports = {
    bot,
    startBot,
    sendToUser,
};
