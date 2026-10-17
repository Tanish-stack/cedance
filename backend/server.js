const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const express = require("express");
const cors = require("cors");
const { startBot, sendToUser } = require("./bot");
const store = require("./lib/store");
const { getEnrichedTasks, createTaskWithNotification } = require("./task");
const { triggerFollowup } = require("./followups");
const { resolveBlocker } = require("./blockers");
const { transitionTask } = require("./stateMachine");
const { verifyTaskEvidence } = require("./verification");
const { classifyReply } = require("./classifier");
const { startScheduler } = require("./sheduler");

const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── users & project ──────────────────────────────────────────────────────────

app.get("/users", async (_req, res) => {
    try {
        const project = await store.getProject();
        const users = await store.getUsers();
        res.json({ project, users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── messages ─────────────────────────────────────────────────────────────────

app.get("/messages", async (_req, res) => {
    try {
        const messages = await store.getMessages();
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── tasks ────────────────────────────────────────────────────────────────────

app.get("/tasks", async (req, res) => {
    try {
        const project = await store.getProject();
        const tasks = await getEnrichedTasks(req.query.projectId || project?.id);
        res.json({ tasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await store.getTaskById(req.params.id);
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        const dependencies = await store.getDependencies(task.id);
        const dependents = await store.getDependents(task.id);
        const evidence = await store.getEvidence(task.id);
        const events = await store.getTaskEvents(task.id);
        res.json({ task: { ...task, dependencies, dependents, evidence, events } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const task = await createTaskWithNotification(req.body);
        res.status(201).json({ ok: true, task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/tasks/:id/followup", async (req, res) => {
    try {
        const result = await triggerFollowup(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/tasks/:id/resolve-blocker", async (req, res) => {
    try {
        const { note } = req.body ?? {};
        const updated = await resolveBlocker({
            taskId: req.params.id,
            resolutionNote: note || "Blocker resolved by manager",
            source: "manager",
        });
        res.json({ ok: true, task: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/tasks/:id/override", async (req, res) => {
    try {
        const { status, reason, progress_pct } = req.body ?? {};
        if (!status) {
            res.status(400).json({ error: "status is required" });
            return;
        }
        const updated = await transitionTask({
            taskId: req.params.id,
            newStatus: status,
            reason: reason || "Manager manual status override",
            source: "manager",
            progressPct: progress_pct,
        });
        res.json({ ok: true, task: updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/tasks/:id/verify", async (req, res) => {
    try {
        const { content, type } = req.body ?? {};
        const result = await verifyTaskEvidence({
            taskId: req.params.id,
            evidenceType: type || "text",
            content,
            submittedBy: req.body.userId || null,
        });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ── task events ──────────────────────────────────────────────────────────────

app.get("/task-events", async (_req, res) => {
    try {
        const events = await store.getTaskEvents();
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/tasks/:id/events", async (req, res) => {
    try {
        const events = await store.getTaskEvents(req.params.id);
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── send a Telegram message ──────────────────────────────────────────────────

app.post("/send", async (req, res) => {
    const { userId, text, taskId } = req.body ?? {};
    if (!userId || !text) {
        res.status(400).json({ error: "userId and text are required" });
        return;
    }

    try {
        const user = await store.getUserById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        let sent = null;
        if (user.telegram_chat_id) {
            sent = await sendToUser(userId, text, { taskId });
        } else {
            // Log message for demo tracking even if user has not tapped /start on Telegram yet
            await store.logMessage({
                user_id: userId,
                task_id: taskId || null,
                direction: "bot_to_user",
                text,
            });
        }

        res.json({
            ok: true,
            telegram_message_id: sent ? sent.message_id : "logged_local",
            user: user.name,
            delivered_to_live_telegram: Boolean(user.telegram_chat_id),
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ── Simulation endpoint for demo & testing ────────────────────────────────────

app.post("/simulate-reply", async (req, res) => {
    const { userId, taskId, text } = req.body ?? {};
    if (!userId || !text) {
        res.status(400).json({ error: "userId and text are required" });
        return;
    }

    try {
        const user = await store.getUserById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const task = taskId ? await store.getTaskById(taskId) : (await store.getTasksByOwner(userId))[0];
        const allUsers = await store.getUsers();
        const teamMemberNames = allUsers.map((u) => u.name);

        // Log inbound
        await store.logMessage({
            user_id: user.id,
            task_id: task ? task.id : null,
            direction: "user_to_bot",
            text,
        });

        const messages = await store.getMessages();
        const history = messages
            .filter((m) => m.user_id === user.id)
            .slice(-6)
            .map((m) => ({ direction: m.direction, text: m.text }));

        const classification = await classifyReply({
            task,
            history,
            reply: text,
            teamMembers: teamMemberNames,
        });

        if (task) {
            if (classification.intent === "blocked") {
                const { recordBlocker } = require("./blockers");
                await recordBlocker({
                    taskId: task.id,
                    blockerText: classification.blocker || "Blocked by external issue",
                    blockerOwnerName: classification.blocker_owner,
                    source: "llm",
                });
            } else if (classification.intent === "claims_done") {
                await transitionTask({
                    taskId: task.id,
                    newStatus: "Pending Verification",
                    reason: `Owner claimed completion: "${text}"`,
                    source: "llm",
                    confidence: classification.confidence,
                    progressPct: 100,
                });
            } else if (classification.intent === "progress") {
                const newStatus = task.status === "Assigned" ? "In Progress" : task.status;
                await transitionTask({
                    taskId: task.id,
                    newStatus,
                    reason: `Owner reported progress: "${text}"`,
                    source: "llm",
                    confidence: classification.confidence,
                    progressPct: classification.progress_pct,
                });
            }
        }

        // Log bot reply
        await store.logMessage({
            user_id: user.id,
            task_id: task ? task.id : null,
            direction: "bot_to_user",
            text: classification.reply_to_user,
        });

        res.json({
            ok: true,
            classification,
            reply: classification.reply_to_user,
            updatedTask: task ? await store.getTaskById(task.id) : null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, async () => {
    console.log(`API listening on http://localhost:${PORT}`);
    startScheduler();
    try {
        await startBot();
    } catch (error) {
        console.warn("Telegram bot init notice:", error.message);
    }
});
