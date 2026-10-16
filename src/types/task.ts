import { TaskStatus } from "@/lib/design-tokens";

export type BlockerSeverity = "Critical" | "High" | "Medium" | "Low";

export interface TaskDependency {
  id: string;
  title: string;
  status: TaskStatus;
  ownerName: string;
  atRisk?: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  oldStatus?: TaskStatus;
  newStatus: TaskStatus;
  reason: string;
  source: "llm" | "manager" | "system" | "telegram";
  confidence?: number;
}

export interface AiInterpretation {
  sourceMessage: string;
  intent: "progress" | "claims_done" | "blocked" | "question" | "unclear";
  confidence: number;
  interpretedMeaning: string;
  reasoning: string;
}

export interface CommitmentTask {
  id: string;
  code: string; // e.g. "TSK-01"
  projectId: string;
  projectName: string;
  milestone: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  status: TaskStatus;
  progressPct: number;
  deadline: string;
  acceptanceCriteria: string;
  evidenceRequired: "link" | "file" | "text";
  blockerText?: string | null;
  blockerOwnerName?: string | null;
  blockerDetectedAt?: string | null;
  atRisk: boolean;
  lastUpdateAt: string;
  nextFollowupAt: string;
  followupCount: number;
  aiInterpretation?: AiInterpretation | null;
  dependencies: {
    prerequisites: TaskDependency[];
    dependents: TaskDependency[];
  };
  suggestedActions: string[];
  activityHistory: ActivityEvent[];
}

export interface BlockedTask extends CommitmentTask {
  severity: BlockerSeverity;
  missingDependency: string;
  escalationStatus: string;
  blockerAgeHours: number; // for sorting/filtering
  severityRationale: string;
}
