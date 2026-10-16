const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const { startBot, sendToUser } = require("./bot");
const store = require("./lib/store");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/health", (_req, res) => {
    res.json({ ok: true });
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

app.get("/tasks", async (_req, res) => {
    try {
        const project = await store.getProject();
        const tasks = await store.getTasks(project.id);
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
        res.json({ task });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const { userId, text } = req.body ?? {};
    if (!userId || !text) {
        res.status(400).json({ error: "userId and text are required" });
        return;
    }

    try {
        const sent = await sendToUser(userId, text);
        res.json({ ok: true, telegram_message_id: sent.message_id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, async () => {
    console.log(`API listening on http://localhost:${PORT}`);
    try {
        await startBot();
    } catch (error) {
        console.error("Could not start Telegram bot:", error.message);
        process.exit(1);
    }
});
