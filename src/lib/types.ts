export type TaskStatus =
  | "Assigned"
  | "In Progress"
  | "Blocked"
  | "Pending Verification"
  | "Needs Rework"
  | "Complete";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  owner_id: string | null;
  owner_name?: string;
  owner_telegram?: string | null;
  status: TaskStatus;
  progress_pct: number;
  deadline: string | null;
  acceptance_criteria: string;
  evidence_required: "text" | "link" | "file";
  blocker_text: string | null;
  blocker_owner_id: string | null;
  blocker_owner_name?: string | null;
  at_risk: boolean;
  followup_count: number;
  created_at: string;
  last_update_at: string;
  dependencies?: string[];
  dependents?: string[];
  priority?: Priority;
  milestone?: string;
}

export interface User {
  id: string;
  name: string;
  role: "manager" | "member";
  invite_token: string;
  telegram_chat_id?: string | null;
  telegram_username?: string | null;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  deadline: string | null;
  manager_id: string;
  created_at?: string;
}

export interface Message {
  id: string;
  task_id?: string | null;
  user_id: string;
  user_name?: string;
  direction: "bot_to_user" | "user_to_bot";
  text: string;
  telegram_message_id?: string | null;
  created_at: string;
  intent?: "progress" | "claims_done" | "blocked" | "question" | "unclear";
  confidence?: number;
  needs_review?: boolean;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  task_title?: string;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
  source: "llm" | "manager" | "system";
  confidence?: number | null;
  created_at: string;
}

export interface BlockerItem {
  id: string;
  taskId: string;
  taskTitle: string;
  ownerName: string;
  ownerId: string;
  blockerText: string;
  blockerOwnerName?: string | null;
  blockerOwnerId?: string | null;
  severity: Priority;
  stalledSince: string;
  daysStalled: number;
  dependentTasksCount: number;
  atRisk: boolean;
  milestone?: string;
}
