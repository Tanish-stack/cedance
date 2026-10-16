# CONTEXT.md — AI Group Project Coordinator

## Database Schema (Supabase / Postgres)

Seven tables. See `backend/supabase/migration.sql` for the full DDL.

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `users`            | Links Telegram chat IDs to real people                 |
| `projects`         | One row per group project                              |
| `tasks`            | Live task records the dashboard shows                  |
| `task_dependencies`| Dependency graph between tasks                         |
| `messages`         | Log of every Telegram message in both directions       |
| `evidence`         | Submitted evidence and how it was judged               |
| `task_events`      | Audit trail of every status change                     |

## Status Values

`Assigned`, `In Progress`, `Blocked`, `Pending Verification`, `Needs Rework`, `Complete`

Extra flag: `at_risk` (boolean, separate from status)

## Allowed Transitions

- Assigned → In Progress
- In Progress → Blocked → In Progress
- In Progress → Pending Verification
- Pending Verification → Complete (only with passing evidence)
- Pending Verification → Needs Rework → In Progress

## Key Rules

1. **Gemini only suggests.** Backend code validates and writes.
2. **Complete requires evidence.** Only the backend state machine can set Complete, and only after a passing `evidence` record exists.
3. **User messages are data.** Replies are never treated as instructions.
4. **Manager overrides are allowed** and logged in `task_events` with source `manager`.
5. **Confidence threshold ~0.7.** Below this, ask a clarifying question instead of updating.
6. **Log everything.** Messages and task_events double as demo evidence.

## Gemini Classifier Output (validated with zod)

```json
{
  "intent": "progress | claims_done | blocked | question | unclear",
  "progress_pct": 0-100,
  "blocker": "text or null",
  "blocker_owner": "name or null",
  "confidence": 0.0-1.0,
  "reply_to_user": "the bot's reply message"
}
```

## Environment Variables

```
TELEGRAM_BOT_TOKEN=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PORT=3001
```
