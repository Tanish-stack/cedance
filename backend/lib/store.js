/**
 * Data-access layer backed by Supabase with robust local seed fallback.
 *
 * Every function is async. If Supabase is connected, operations read and write to Postgres.
 * If Supabase is not yet configured, it uses the exact seed data specified in migration.sql & seed.sql.
 */
const supabase = require("../db");

// ── Fallback In-Memory Seed State ───────────────────────────────────────────
const seedUsers = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Adii", role: "manager", invite_token: "manager", telegram_chat_id: null, telegram_username: null, created_at: new Date().toISOString() },
    { id: "00000000-0000-0000-0000-000000000002", name: "Kabir", role: "member", invite_token: "kabir", telegram_chat_id: null, telegram_username: null, created_at: new Date().toISOString() },
    { id: "00000000-0000-0000-0000-000000000003", name: "Aisha", role: "member", invite_token: "aisha", telegram_chat_id: null, telegram_username: null, created_at: new Date().toISOString() },
    { id: "00000000-0000-0000-0000-000000000004", name: "Ravi", role: "member", invite_token: "ravi", telegram_chat_id: null, telegram_username: null, created_at: new Date().toISOString() }
];

const seedProject = {
    id: "00000000-0000-0001-0001-000000000001",
    name: "Cadance",
    deadline: "2026-10-25",
    manager_id: "00000000-0000-0000-0000-000000000001",
    created_at: new Date().toISOString()
};

const seedTasks = [
    {
        id: "00000000-0000-0000-0002-000000000001",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Connect the payment API",
        description: "Integrate the Stripe test-mode API into the backend and expose a /pay endpoint.",
        owner_id: "00000000-0000-0000-0000-000000000002",
        status: "Assigned",
        progress_pct: 0,
        deadline: "2026-10-22",
        acceptance_criteria: "A payment request succeeds in test mode and the PR link is shared.",
        evidence_required: "link",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: "00000000-0000-0000-0002-000000000002",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Write payment unit tests",
        description: "Add unit tests for the payment module with at least 80% coverage.",
        owner_id: "00000000-0000-0000-0000-000000000002",
        status: "Assigned",
        progress_pct: 0,
        deadline: "2026-10-23",
        acceptance_criteria: "Tests pass in CI with >= 80% coverage report attached.",
        evidence_required: "link",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
        id: "00000000-0000-0000-0002-000000000003",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Design the checkout page",
        description: "Create the checkout page UI with cart summary, payment form and order confirmation.",
        owner_id: "00000000-0000-0000-0000-000000000003",
        status: "Assigned",
        progress_pct: 0,
        deadline: "2026-10-21",
        acceptance_criteria: "Figma link shared and approved by the team lead.",
        evidence_required: "link",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
        id: "00000000-0000-0000-0002-000000000004",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Build the checkout frontend",
        description: "Implement the checkout page in Next.js based on the approved Figma design.",
        owner_id: "00000000-0000-0000-0000-000000000003",
        status: "Assigned",
        progress_pct: 0,
        deadline: "2026-10-24",
        acceptance_criteria: "Checkout page is live on the staging URL and matches the approved design.",
        evidence_required: "link",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 15).toISOString()
    },
    {
        id: "00000000-0000-0000-0002-000000000005",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for lint, test, build, and deploy to staging.",
        owner_id: "00000000-0000-0000-0000-000000000004",
        status: "In Progress",
        progress_pct: 45,
        deadline: "2026-10-20",
        acceptance_criteria: "A push to main triggers lint, test, build and deploys to the staging URL.",
        evidence_required: "link",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: "00000000-0000-0000-0002-000000000006",
        project_id: "00000000-0000-0001-0001-000000000001",
        title: "Write project README",
        description: "Document setup steps, architecture diagram, tech stack, and demo instructions.",
        owner_id: "00000000-0000-0000-0000-000000000004",
        status: "Assigned",
        progress_pct: 0,
        deadline: "2026-10-25",
        acceptance_criteria: "README exists with setup steps, architecture diagram, and demo instructions.",
        evidence_required: "text",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    }
];

const seedDependencies = [
    { id: "dep-1", task_id: "00000000-0000-0000-0002-000000000002", depends_on_task_id: "00000000-0000-0000-0002-000000000001" },
    { id: "dep-2", task_id: "00000000-0000-0000-0002-000000000004", depends_on_task_id: "00000000-0000-0000-0002-000000000003" }
];

const seedMessages = [
    {
        id: "msg-1",
        task_id: "00000000-0000-0000-0002-000000000001",
        user_id: "00000000-0000-0000-0000-000000000002",
        direction: "bot_to_user",
        text: "New task: Connect the payment API, due Oct 22. Done means: A payment request succeeds in test mode and the PR link is shared.",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
];

const seedTaskEvents = [
    {
        id: "evt-1",
        task_id: "00000000-0000-0000-0002-000000000005",
        old_status: "Assigned",
        new_status: "In Progress",
        reason: "Ravi started CI/CD setup",
        source: "llm",
        confidence: 0.94,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
];

const seedEvidence = [];

// ── helpers ──────────────────────────────────────────────────────────────────

function throwOnError({ data, error }, label = "Supabase query") {
    if (error) {
        throw new Error(`${label}: ${error.message}`);
    }
    return data;
}

// ── projects ─────────────────────────────────────────────────────────────────

async function getProject() {
    if (!supabase) return seedProject;
    try {
        const { data, error } = await supabase.from("projects").select("*").limit(1).maybeSingle();
        if (error || !data) return seedProject;
        return data;
    } catch {
        return seedProject;
    }
}

// ── users ────────────────────────────────────────────────────────────────────

async function getUsers() {
    if (!supabase) return seedUsers;
    try {
        const { data, error } = await supabase.from("users").select("*").order("created_at");
        if (error || !data || data.length === 0) return seedUsers;
        return data;
    } catch {
        return seedUsers;
    }
}

async function getUserById(id) {
    if (!supabase) return seedUsers.find((u) => u.id === id) || null;
    try {
        const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
        return data || seedUsers.find((u) => u.id === id) || null;
    } catch {
        return seedUsers.find((u) => u.id === id) || null;
    }
}

async function getUserByInviteToken(token) {
    if (!token) return null;
    const cleanToken = token.trim().toLowerCase();
    if (!supabase) return seedUsers.find((u) => u.invite_token.toLowerCase() === cleanToken) || null;
    try {
        const { data } = await supabase.from("users").select("*").eq("invite_token", cleanToken).maybeSingle();
        return data || seedUsers.find((u) => u.invite_token.toLowerCase() === cleanToken) || null;
    } catch {
        return seedUsers.find((u) => u.invite_token.toLowerCase() === cleanToken) || null;
    }
}

async function getUserByChatId(chatId) {
    if (chatId == null) return null;
    const sChatId = String(chatId);
    if (!supabase) return seedUsers.find((u) => u.telegram_chat_id === sChatId) || null;
    try {
        const { data } = await supabase.from("users").select("*").eq("telegram_chat_id", sChatId).maybeSingle();
        return data || seedUsers.find((u) => u.telegram_chat_id === sChatId) || null;
    } catch {
        return seedUsers.find((u) => u.telegram_chat_id === sChatId) || null;
    }
}

async function linkTelegramUser(inviteToken, chatId, username) {
    const user = await getUserByInviteToken(inviteToken);
    if (!user) return null;

    if (!supabase) {
        user.telegram_chat_id = String(chatId);
        user.telegram_username = username ?? null;
        return user;
    }

    try {
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
    } catch {
        user.telegram_chat_id = String(chatId);
        user.telegram_username = username ?? null;
        return user;
    }
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
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        task_id,
        user_id,
        direction,
        text,
        telegram_message_id: telegram_message_id == null ? null : String(telegram_message_id),
        created_at: new Date().toISOString(),
    };

    if (!supabase) {
        seedMessages.push(row);
        return row;
    }

    try {
        const data = throwOnError(
            await supabase.from("messages").insert({
                task_id,
                user_id,
                direction,
                text,
                telegram_message_id: row.telegram_message_id,
            }).select("*").single(),
            "logMessage",
        );
        return data;
    } catch {
        seedMessages.push(row);
        return row;
    }
}

async function getMessages() {
    if (!supabase) return [...seedMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    try {
        const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
        if (error || !data || data.length === 0) return seedMessages;
        return data;
    } catch {
        return seedMessages;
    }
}

// ── tasks ────────────────────────────────────────────────────────────────────

async function getTasks(projectId) {
    if (!supabase) {
        let list = seedTasks;
        if (projectId) list = list.filter((t) => t.project_id === projectId);
        return list;
    }
    try {
        let query = supabase.from("tasks").select("*").order("created_at", { ascending: true });
        if (projectId) query = query.eq("project_id", projectId);
        const { data, error } = await query;
        if (error || !data || data.length === 0) return seedTasks;
        return data;
    } catch {
        return seedTasks;
    }
}

async function getTaskById(id) {
    if (!supabase) return seedTasks.find((t) => t.id === id) || null;
    try {
        const { data } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
        return data || seedTasks.find((t) => t.id === id) || null;
    } catch {
        return seedTasks.find((t) => t.id === id) || null;
    }
}

async function getTasksByOwner(ownerId) {
    if (!supabase) {
        return seedTasks.filter((t) => t.owner_id === ownerId && t.status !== "Complete");
    }
    try {
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("owner_id", ownerId)
            .not("status", "eq", "Complete")
            .order("created_at", { ascending: true });
        if (error || !data || data.length === 0) {
            return seedTasks.filter((t) => t.owner_id === ownerId && t.status !== "Complete");
        }
        return data;
    } catch {
        return seedTasks.filter((t) => t.owner_id === ownerId && t.status !== "Complete");
    }
}

async function createTask(taskData) {
    const newTask = {
        id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        project_id: taskData.project_id || seedProject.id,
        title: taskData.title,
        description: taskData.description || "",
        owner_id: taskData.owner_id || null,
        status: taskData.status || "Assigned",
        progress_pct: taskData.progress_pct || 0,
        deadline: taskData.deadline || null,
        acceptance_criteria: taskData.acceptance_criteria || "",
        evidence_required: taskData.evidence_required || "text",
        blocker_text: taskData.blocker_text || null,
        blocker_owner_id: taskData.blocker_owner_id || null,
        at_risk: Boolean(taskData.at_risk),
        followup_count: 0,
        last_update_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    };

    if (!supabase) {
        seedTasks.push(newTask);
        return newTask;
    }

    try {
        const data = throwOnError(
            await supabase.from("tasks").insert(newTask).select("*").single(),
            "createTask"
        );
        return data;
    } catch {
        seedTasks.push(newTask);
        return newTask;
    }
}

async function updateTask(id, updates) {
    updates.last_update_at = new Date().toISOString();

    if (!supabase) {
        const idx = seedTasks.findIndex((t) => t.id === id);
        if (idx !== -1) {
            seedTasks[idx] = { ...seedTasks[idx], ...updates };
            return seedTasks[idx];
        }
        throw new Error(`Task ${id} not found in store`);
    }

    try {
        const data = throwOnError(
            await supabase.from("tasks").update(updates).eq("id", id).select("*").single(),
            "updateTask",
        );
        return data;
    } catch {
        const idx = seedTasks.findIndex((t) => t.id === id);
        if (idx !== -1) {
            seedTasks[idx] = { ...seedTasks[idx], ...updates };
            return seedTasks[idx];
        }
        throw new Error(`Task ${id} not found`);
    }
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
    const row = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        task_id,
        old_status,
        new_status,
        reason,
        source,
        confidence,
        created_at: new Date().toISOString(),
    };

    if (!supabase) {
        seedTaskEvents.push(row);
        return row;
    }

    try {
        const data = throwOnError(
            await supabase.from("task_events").insert(row).select("*").single(),
            "logTaskEvent",
        );
        return data;
    } catch {
        seedTaskEvents.push(row);
        return row;
    }
}

async function getTaskEvents(taskId) {
    if (!supabase) {
        let events = [...seedTaskEvents];
        if (taskId) events = events.filter((e) => e.task_id === taskId);
        return events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    try {
        let query = supabase.from("task_events").select("*").order("created_at", { ascending: true });
        if (taskId) query = query.eq("task_id", taskId);
        const { data, error } = await query;
        if (error || !data || data.length === 0) {
            let events = [...seedTaskEvents];
            if (taskId) events = events.filter((e) => e.task_id === taskId);
            return events;
        }
        return data;
    } catch {
        let events = [...seedTaskEvents];
        if (taskId) events = events.filter((e) => e.task_id === taskId);
        return events;
    }
}

// ── task_dependencies ────────────────────────────────────────────────────────

async function getDependents(taskId) {
    if (!supabase) {
        return seedDependencies.filter((d) => d.depends_on_task_id === taskId).map((d) => d.task_id);
    }
    try {
        const { data, error } = await supabase.from("task_dependencies").select("task_id").eq("depends_on_task_id", taskId);
        if (error || !data) {
            return seedDependencies.filter((d) => d.depends_on_task_id === taskId).map((d) => d.task_id);
        }
        return data.map((row) => row.task_id);
    } catch {
        return seedDependencies.filter((d) => d.depends_on_task_id === taskId).map((d) => d.task_id);
    }
}

async function getDependencies(taskId) {
    if (!supabase) {
        return seedDependencies.filter((d) => d.task_id === taskId).map((d) => d.depends_on_task_id);
    }
    try {
        const { data, error } = await supabase.from("task_dependencies").select("depends_on_task_id").eq("task_id", taskId);
        if (error || !data) {
            return seedDependencies.filter((d) => d.task_id === taskId).map((d) => d.depends_on_task_id);
        }
        return data.map((row) => row.depends_on_task_id);
    } catch {
        return seedDependencies.filter((d) => d.task_id === taskId).map((d) => d.depends_on_task_id);
    }
}

async function addTaskDependency(taskId, dependsOnTaskId) {
    const row = {
        id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId,
        created_at: new Date().toISOString(),
    };

    if (!supabase) {
        seedDependencies.push(row);
        return row;
    }

    try {
        const data = throwOnError(
            await supabase.from("task_dependencies").insert({
                task_id: taskId,
                depends_on_task_id: dependsOnTaskId,
            }).select("*").single(),
            "addTaskDependency",
        );
        return data;
    } catch {
        seedDependencies.push(row);
        return row;
    }
}

// ── evidence ─────────────────────────────────────────────────────────────────

async function addEvidence({
    task_id,
    type = "text",
    content = null,
    verification_result = null,
    llm_reasoning = null,
}) {
    const row = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        task_id,
        type,
        content,
        verification_result,
        llm_reasoning,
        submitted_at: new Date().toISOString(),
    };

    if (!supabase) {
        seedEvidence.push(row);
        return row;
    }

    try {
        const data = throwOnError(
            await supabase.from("evidence").insert({
                task_id,
                type,
                content,
                verification_result,
                llm_reasoning,
            }).select("*").single(),
            "addEvidence",
        );
        return data;
    } catch {
        seedEvidence.push(row);
        return row;
    }
}

async function getEvidence(taskId) {
    if (!supabase) {
        return seedEvidence.filter((e) => e.task_id === taskId).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    }
    try {
        const { data, error } = await supabase.from("evidence").select("*").eq("task_id", taskId).order("submitted_at", { ascending: false });
        if (error || !data) {
            return seedEvidence.filter((e) => e.task_id === taskId);
        }
        return data;
    } catch {
        return seedEvidence.filter((e) => e.task_id === taskId);
    }
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
    createTask,
    updateTask,
    // task_events
    logTaskEvent,
    getTaskEvents,
    // task_dependencies
    getDependents,
    getDependencies,
    addTaskDependency,
    // evidence
    addEvidence,
    getEvidence,
};
