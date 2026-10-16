-- ============================================================================
-- AI Group Project Coordinator — Phase 1 Migration
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================================

-- Enable the uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    telegram_chat_id   TEXT UNIQUE,
    telegram_username  TEXT,
    role          TEXT NOT NULL DEFAULT 'member'
                      CHECK (role IN ('manager', 'member')),
    invite_token  TEXT UNIQUE NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    deadline    DATE,
    manager_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT,
    owner_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'Assigned'
                            CHECK (status IN (
                                'Assigned',
                                'In Progress',
                                'Blocked',
                                'Pending Verification',
                                'Needs Rework',
                                'Complete'
                            )),
    progress_pct        INTEGER NOT NULL DEFAULT 0
                            CHECK (progress_pct >= 0 AND progress_pct <= 100),
    deadline            DATE,
    acceptance_criteria TEXT,
    evidence_required   TEXT DEFAULT 'text'
                            CHECK (evidence_required IN ('link', 'file', 'text')),
    blocker_text        TEXT,
    blocker_owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    at_risk             BOOLEAN NOT NULL DEFAULT false,
    last_update_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_followup_at    TIMESTAMPTZ,
    followup_count      INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. task_dependencies
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_dependencies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id  UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- ============================================================================
-- 5. messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id             UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction           TEXT NOT NULL
                            CHECK (direction IN ('bot_to_user', 'user_to_bot')),
    text                TEXT NOT NULL,
    telegram_message_id TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. evidence
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id             UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    type                TEXT NOT NULL DEFAULT 'text'
                            CHECK (type IN ('link', 'file', 'text')),
    content             TEXT,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    verification_result TEXT
                            CHECK (verification_result IN ('pass', 'fail', 'needs_review')
                                   OR verification_result IS NULL),
    llm_reasoning       TEXT
);

-- ============================================================================
-- 7. task_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    old_status  TEXT,
    new_status  TEXT,
    reason      TEXT,
    source      TEXT NOT NULL DEFAULT 'system'
                    CHECK (source IN ('llm', 'manager', 'system')),
    confidence  NUMERIC(3,2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Indexes for common queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_project    ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner      ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_followup   ON tasks(next_followup_at)
    WHERE status NOT IN ('Complete');
CREATE INDEX IF NOT EXISTS idx_messages_task    ON messages(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_user    ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_task      ON task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_evidence_task    ON evidence(task_id);

-- ============================================================================
-- Postgres trigger: block direct Complete without a passing evidence row
-- ============================================================================
CREATE OR REPLACE FUNCTION enforce_completion_evidence()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Complete' AND OLD.status != 'Complete' THEN
        IF NOT EXISTS (
            SELECT 1 FROM evidence
            WHERE task_id = NEW.id
              AND verification_result = 'pass'
        ) THEN
            RAISE EXCEPTION
                'Cannot set task to Complete without a passing evidence record';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_completion ON tasks;
CREATE TRIGGER trg_enforce_completion
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION enforce_completion_evidence();

-- ============================================================================
-- Enable Supabase Realtime on key tables
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE task_events;
