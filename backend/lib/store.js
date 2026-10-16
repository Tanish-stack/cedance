/**
 * Data-access layer backed by Supabase.
 *
 * Every function is async and talks to Postgres through the Supabase client.
 * Replaces the old in-memory JSON store while keeping the same API surface
 * so that bot.js, telegram.js and server.js need only minor async tweaks.
 */
const supabase = require("../db");

// ── helpers ──────────────────────────────────────────────────────────────────

function throwOnError({ data, error }, label = "Supabase query") {
    if (error) {
        throw new Error(`${label}: ${error.message}`);
    }
    return data;
}

// ── projects ─────────────────────────────────────────────────────────────────

async function getProject() {
    const data = throwOnError(
        await supabase.from("projects").select("*").limit(1).single(),
        "getProject",
    );
    return data;
}

// ── users ────────────────────────────────────────────────────────────────────

async function getUsers() {
    const data = throwOnError(
        await supabase.from("users").select("*").order("created_at"),
        "getUsers",
    );
    return data;
}

async function getUserById(id) {
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    return data ?? null;
}

async function getUserByInviteToken(token) {
    if (!token) return null;
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("invite_token", token.trim())
        .maybeSingle();
    return data ?? null;
}

async function getUserByChatId(chatId) {
    if (chatId == null) return null;
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_chat_id", String(chatId))
        .maybeSingle();
    return data ?? null;
}

async function linkTelegramUser(inviteToken, chatId, username) {
    const user = await getUserByInviteToken(inviteToken);
    if (!user) return null;

    const updated = throwOnError(
        await supabase
            .from("users")
            .update({
                telegram_chat_id: String(chatId),
                telegram_username: username ?? null,
            })
            .eq("id", user.id)
            .select("*")
            .single(),
        "linkTelegramUser",
    );
    return updated;
}

// ── messages ─────────────────────────────────────────────────────────────────

async function logMessage({
    task_id = null,
    user_id,
    direction,
    text,
    telegram_message_id = null,
}) {
    const row = {
        task_id,
        user_id,
        direction,
        text,
        telegram_message_id:
            telegram_message_id == null ? null : String(telegram_message_id),
    };

    const data = throwOnError(
        await supabase.from("messages").insert(row).select("*").single(),
        "logMessage",
    );
    return data;
}

async function getMessages() {
    const data = throwOnError(
        await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: true }),
        "getMessages",
    );
    return data;
}

// ── tasks ────────────────────────────────────────────────────────────────────

async function getTasks(projectId) {
    let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

    if (projectId) {
        query = query.eq("project_id", projectId);
    }

    const data = throwOnError(await query, "getTasks");
    return data;
}

async function getTaskById(id) {
    const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    return data ?? null;
}

async function getTasksByOwner(ownerId) {
    const data = throwOnError(
        await supabase
            .from("tasks")
            .select("*")
            .eq("owner_id", ownerId)
            .not("status", "eq", "Complete")
            .order("created_at", { ascending: true }),
        "getTasksByOwner",
    );
    return data;
}

async function updateTask(id, updates) {
    updates.last_update_at = new Date().toISOString();
    const data = throwOnError(
        await supabase
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single(),
        "updateTask",
    );
    return data;
}

// ── task_events ──────────────────────────────────────────────────────────────

async function logTaskEvent({
    task_id,
    old_status = null,
    new_status = null,
    reason = null,
    source = "system",
    confidence = null,
}) {
    const row = { task_id, old_status, new_status, reason, source, confidence };
    const data = throwOnError(
        await supabase.from("task_events").insert(row).select("*").single(),
        "logTaskEvent",
    );
    return data;
}

async function getTaskEvents(taskId) {
    let query = supabase
        .from("task_events")
        .select("*")
        .order("created_at", { ascending: true });

    if (taskId) {
        query = query.eq("task_id", taskId);
    }

    const data = throwOnError(await query, "getTaskEvents");
    return data;
}

// ── task_dependencies ────────────────────────────────────────────────────────

async function getDependents(taskId) {
    const data = throwOnError(
        await supabase
            .from("task_dependencies")
            .select("task_id")
            .eq("depends_on_task_id", taskId),
        "getDependents",
    );
    return data.map((row) => row.task_id);
}

async function getDependencies(taskId) {
    const data = throwOnError(
        await supabase
            .from("task_dependencies")
            .select("depends_on_task_id")
            .eq("task_id", taskId),
        "getDependencies",
    );
    return data.map((row) => row.depends_on_task_id);
}

// ── evidence ─────────────────────────────────────────────────────────────────

async function addEvidence({
    task_id,
    type = "text",
    content = null,
    verification_result = null,
    llm_reasoning = null,
}) {
    const row = { task_id, type, content, verification_result, llm_reasoning };
    const data = throwOnError(
        await supabase.from("evidence").insert(row).select("*").single(),
        "addEvidence",
    );
    return data;
}

async function getEvidence(taskId) {
    const data = throwOnError(
        await supabase
            .from("evidence")
            .select("*")
            .eq("task_id", taskId)
            .order("submitted_at", { ascending: false }),
        "getEvidence",
    );
    return data;
}

module.exports = {
    // projects
    getProject,
    // users
    getUsers,
    getUserById,
    getUserByInviteToken,
    getUserByChatId,
    linkTelegramUser,
    // messages
    logMessage,
    getMessages,
    // tasks
    getTasks,
    getTaskById,
    getTasksByOwner,
    updateTask,
    // task_events
    logTaskEvent,
    getTaskEvents,
    // task_dependencies
    getDependents,
    getDependencies,
    // evidence
    addEvidence,
    getEvidence,
};
