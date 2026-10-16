import { TaskStatus } from "@/lib/design-tokens";
import { BlockerSeverity } from "./task";

export type MilestoneStatus = "Completed" | "Active" | "Upcoming" | "At Risk";

export type MilestoneRiskLevel = "Critical" | "High" | "Medium" | "Low";

export interface MilestoneCommitment {
  taskId: string;
  code: string;
  title: string;
  ownerName: string;
  ownerUsername?: string;
  status: TaskStatus;
  progressPct: number;
  deadline: string;
  isRequired: boolean;
  blockerText?: string | null;
  blockerSeverity?: BlockerSeverity;
  atRisk?: boolean;
  prerequisiteTaskCodes?: string[];
  dependentTaskCodes?: string[];
}

export interface Milestone {
  id: string;
  code: string;
  name: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
  prerequisiteMilestoneIds: string[];
  downstreamMilestoneIds: string[];
  commitments: MilestoneCommitment[];
  suggestedActions?: string[];
}

export interface MilestoneRiskEvaluation {
  riskLevel: MilestoneRiskLevel;
  isAtRisk: boolean;
  reasons: string[];
  primaryReason: string;
}
