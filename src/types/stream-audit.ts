import { TaskStatus } from "@/lib/design-tokens";

export type MessagePlatform = "Telegram" | "Slack";

export type ProcessingStatus = "Received" | "Processed" | "Needs Review" | "Failed";

export type AuditEventType =
  | "Message Parsed"
  | "State Changed"
  | "Blocker Detected"
  | "Evidence Added"
  | "Human Override";

export interface StreamMessage {
  id: string;
  senderName: string;
  senderUsername: string;
  senderAvatar?: string;
  sourcePlatform: MessagePlatform;
  messageText: string;
  receivedAt: string;
  date: string;
  relatedTaskId?: string;
  relatedTaskCode?: string;
  relatedTaskTitle?: string;
  relatedTaskStatus?: TaskStatus;
  interpretation: {
    summary: string;
    intent: "progress" | "claims_done" | "blocked" | "question" | "chatter";
    blockerDetected: boolean;
    blockerDescription?: string;
    missingDependency?: string;
    suggestedNextAction?: string;
    reasoning: string;
    stateImpact: "mutated_state" | "maintained_state" | "flagged_review" | "no_task_impact";
  };
  confidence?: number; // Only provided when available from mock data
  processingStatus: ProcessingStatus;
  evidenceReference?: string;
}

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  timestamp: string;
  date: string;
  relatedTaskId: string;
  relatedTaskCode: string;
  relatedTaskTitle: string;
  ownerName: string;
  previousState?: TaskStatus;
  resultingState?: TaskStatus;
  reason: string;
  sourceReference: string;
  confidence?: number;
  actor: string;
}
