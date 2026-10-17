const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const { Bot } = require("grammy");
const store = require("./lib/store");
const { attachBot, sendToUser } = require("./lib/telegram");
const { classifyReply } = require("./classifier");
const { transitionTask } = require("./stateMachine");
const { recordBlocker } = require("./blockers");
const { verifyTaskEvidence } = require("./verification");

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

if (token && !token.includes("your-telegram")) {
    try {
        bot = new Bot(token);
        attachBot(bot);
    } catch (err) {
        console.warn("[bot.js] Could not initialize grammy bot:", err.message);
    }
} else {
    console.log("[bot.js] TELEGRAM_BOT_TOKEN not provided; Telegram bot polling disabled. REST API and simulation active.");
}

async function inviteHint() {
    const users = await store.getUsers();
    const tokens = users.map((user) => user.invite_token).join(", ");
    return `Ask your manager for your invite link, then tap Start.\nDemo tokens: ${tokens}`;
}

if (bot) {
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

        // 1. Fetch user's active tasks
        const userTasks = await store.getTasksByOwner(user.id);
        const allUsers = await store.getUsers();
        const teamMemberNames = allUsers.map((u) => u.name);

        // Pick most relevant task (or the first open task)
        let activeTask = userTasks[0] || null;
        if (userTasks.length > 1) {
            // Check if user specifically mentions a task keyword
            for (const t of userTasks) {
                const words = t.title.toLowerCase().split(" ");
                if (words.some((w) => w.length > 3 && text.toLowerCase().includes(w))) {
                    activeTask = t;
                    break;
                }
            }
        }

        // 2. Log inbound message
        await store.logMessage({
            user_id: user.id,
            task_id: activeTask ? activeTask.id : null,
            direction: "user_to_bot",
            text,
            telegram_message_id: ctx.message.message_id,
        });

        // 3. Handle evidence submission if task is in Pending Verification
        if (activeTask && activeTask.status === "Pending Verification") {
            const isSubmission = /http|github|pr|link|fixed|verified|tested/i.test(text);
            if (isSubmission) {
                const verification = await verifyTaskEvidence({
                    taskId: activeTask.id,
                    evidenceType: activeTask.evidence_required || "text",
                    content: text,
                    submittedBy: user.id,
                });

                const replyMsg = await ctx.reply(verification.message);
                await store.logMessage({
                    user_id: user.id,
                    task_id: activeTask.id,
                    direction: "bot_to_user",
                    text: verification.message,
                    telegram_message_id: replyMsg.message_id,
                });
                return;
            }
        }

        // 4. Fetch recent conversation history
        const messages = await store.getMessages();
        const history = messages
            .filter((m) => m.user_id === user.id || (activeTask && m.task_id === activeTask.id))
            .slice(-6)
            .map((m) => ({ direction: m.direction, text: m.text }));

        // 5. Run Gemini Classifier
        const classification = await classifyReply({
            task: activeTask,
            history,
            reply: text,
            teamMembers: teamMemberNames,
        });

        // 6. Execute state transitions
        if (activeTask) {
            if (classification.intent === "blocked") {
                await recordBlocker({
                    taskId: activeTask.id,
                    blockerText: classification.blocker || "Blocked by external issue",
                    blockerOwnerName: classification.blocker_owner,
                    source: "llm",
                });
            } else if (classification.intent === "claims_done") {
                await transitionTask({
                    taskId: activeTask.id,
                    newStatus: "Pending Verification",
                    reason: `Owner claimed completion: "${text}"`,
                    source: "llm",
                    confidence: classification.confidence,
                    progressPct: 100,
                });
            } else if (classification.intent === "progress") {
                const newStatus = activeTask.status === "Assigned" ? "In Progress" : activeTask.status;
                if (newStatus !== activeTask.status) {
                    await transitionTask({
                        taskId: activeTask.id,
                        newStatus: "In Progress",
                        reason: `Owner reported progress: "${text}"`,
                        source: "llm",
                        confidence: classification.confidence,
                        progressPct: classification.progress_pct,
                    });
                } else {
                    await store.updateTask(activeTask.id, {
                        progress_pct: classification.progress_pct,
                    });
                    await store.logTaskEvent({
                        task_id: activeTask.id,
                        old_status: activeTask.status,
                        new_status: activeTask.status,
                        reason: `Progress updated to ${classification.progress_pct}%`,
                        source: "llm",
                        confidence: classification.confidence,
                    });
                }
            }
        }

        // 7. Dispatch reply to user
        const replyText = classification.reply_to_user;
        const sent = await ctx.reply(replyText);

        await store.logMessage({
            user_id: user.id,
            task_id: activeTask ? activeTask.id : null,
            direction: "bot_to_user",
            text: replyText,
            telegram_message_id: sent.message_id,
        });
    });

    bot.catch((err) => {
        console.error("Bot error:", err.error?.message ?? err.message);
    });
}

async function startBot() {
    if (!bot) {
        console.log("[bot.js] Skipping Telegram polling (no bot token provided).");
        return;
    }

    try {
        const me = await bot.api.getMe();
        console.log(`Bot connected: @${me.username}`);

        bot.start({
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
    } catch (err) {
        console.warn(`[bot.js] Could not connect to Telegram: ${err.message}. Backend will continue running.`);
    }
}

module.exports = {
    bot,
    startBot,
    sendToUser,
};
