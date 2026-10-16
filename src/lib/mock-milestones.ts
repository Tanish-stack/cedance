import { Milestone, MilestoneRiskEvaluation, MilestoneRiskLevel } from "@/types/milestone";

export const CURRENT_MOCK_DATE = "2026-10-17";

/**
 * Deterministic Risk Assessment Rule Engine
 * Follows exact precedence:
 * 1. Completed work is never marked at risk.
 * 2. Critical: Required commitment is overdue AND blocked, OR has explicitly critical severity.
 * 3. High: Required commitment is blocked.
 * 4. Medium: Required commitment is overdue OR deadline is within 3 calendar days with incomplete work.
 * 5. Low: No current risk rule triggered.
 */
export function evaluateMilestoneRisk(
  milestone: Milestone,
  currentDate: string = CURRENT_MOCK_DATE
): MilestoneRiskEvaluation {
  const requiredCommitments = milestone.commitments.filter((c) => c.isRequired);
  const incompleteRequired = requiredCommitments.filter((c) => c.status !== "Complete");

  // Rule: Completed work is never treated as incomplete or at risk
  if (requiredCommitments.length > 0 && incompleteRequired.length === 0) {
    return {
      riskLevel: "Low",
      isAtRisk: false,
      reasons: ["All required commitments for this milestone are fully completed."],
      primaryReason: "All required commitments completed.",
    };
  }

  const reasons: string[] = [];
  let calculatedRisk: MilestoneRiskLevel = "Low";

  // Check 1: Critical Risk
  // (a) Required commitment is overdue AND blocked
  const overdueAndBlocked = incompleteRequired.filter(
    (c) => c.deadline < currentDate && c.status === "Blocked"
  );
  if (overdueAndBlocked.length > 0) {
    calculatedRisk = "Critical";
    reasons.push(
      `Critical: Commitment ${overdueAndBlocked[0].code} is BOTH overdue (due ${overdueAndBlocked[0].deadline}) and blocked.`
    );
  }

  // (b) Explicitly critical dependency/severity
  const criticalSeverityBlocked = incompleteRequired.filter(
    (c) => c.status === "Blocked" && c.blockerSeverity === "Critical"
  );
  if (criticalSeverityBlocked.length > 0) {
    calculatedRisk = "Critical";
    reasons.push(
      `Critical: Required task ${criticalSeverityBlocked[0].code} has a Critical blocker: "${criticalSeverityBlocked[0].blockerText || "External blocker"}"`
    );
  }

  // Check 2: High Risk (if not already Critical)
  if (calculatedRisk !== "Critical") {
    const blockedTasks = incompleteRequired.filter((c) => c.status === "Blocked");
    if (blockedTasks.length > 0) {
      calculatedRisk = "High";
      reasons.push(
        `High: Required commitment ${blockedTasks[0].code} is blocked ("${blockedTasks[0].blockerText || "Impediment detected"}") and threatens target date.`
      );
    }
  }

  // Check 3: Medium Risk (if not already Critical or High)
  if (calculatedRisk === "Low") {
    // (a) Required commitment is overdue
    const overdueTasks = incompleteRequired.filter((c) => c.deadline < currentDate);
    if (overdueTasks.length > 0) {
      calculatedRisk = "Medium";
      reasons.push(
        `Medium: Required commitment ${overdueTasks[0].code} is overdue past deadline (${overdueTasks[0].deadline}).`
      );
    }

    // (b) Target date within next 3 calendar days with incomplete work
    const currentTimestamp = new Date(currentDate).getTime();
    const targetTimestamp = new Date(milestone.targetDate).getTime();
    const diffDays = Math.ceil((targetTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 3 && incompleteRequired.length > 0) {
      calculatedRisk = "Medium";
      reasons.push(
        `Medium: Milestone target date (${milestone.targetDate}) is within ${diffDays === 0 ? "today" : `${diffDays} days`} and ${incompleteRequired.length} required commitment(s) remain incomplete.`
      );
    }
  }

  if (reasons.length === 0) {
    reasons.push("No active blockers or overdue commitments. Progress aligns with schedule.");
  }

  return {
    riskLevel: calculatedRisk,
    isAtRisk: calculatedRisk !== "Low",
    reasons,
    primaryReason: reasons[0],
  };
}

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "mls-01",
    code: "MLS-01",
    name: "Infrastructure & Database Setup",
    description: "PostgreSQL schema initialization, Supabase connection pool, and GitHub Actions CI/CD pipeline.",
    targetDate: "2026-10-15",
    status: "Completed",
    prerequisiteMilestoneIds: [],
    downstreamMilestoneIds: ["mls-02", "mls-03"],
    commitments: [
      {
        taskId: "00000000-0000-0000-0002-000000000005",
        code: "TSK-05",
        title: "Set up CI/CD pipeline",
        ownerName: "Ravi",
        ownerUsername: "ravi_ops",
        status: "Complete",
        progressPct: 100,
        deadline: "2026-10-15",
        isRequired: true,
      },
      {
        taskId: "db-schema-001",
        code: "DB-01",
        title: "Initialize Supabase PostgreSQL schema & RLS",
        ownerName: "Aisha",
        ownerUsername: "aisha_ui",
        status: "Complete",
        progressPct: 100,
        deadline: "2026-10-14",
        isRequired: true,
      },
    ],
    suggestedActions: [
      "Baseline completed. Milestone unlocked downstream integration pipelines MLS-02 and MLS-03.",
    ],
  },
  {
    id: "mls-02",
    code: "MLS-02",
    name: "Authentication & Core Integrations",
    description: "Stripe test payment webhooks, Supabase auth token rotation, and private cloud storage buckets.",
    targetDate: "2026-10-22",
    status: "At Risk",
    prerequisiteMilestoneIds: ["mls-01"],
    downstreamMilestoneIds: ["mls-04"],
    commitments: [
      {
        taskId: "00000000-0000-0000-0002-000000000001",
        code: "TSK-01",
        title: "Connect the payment API",
        ownerName: "Kabir",
        ownerUsername: "kabir_dev",
        status: "Blocked",
        progressPct: 60,
        deadline: "2026-10-22",
        isRequired: true,
        blockerText: "Connected, but waiting for test credentials.",
        blockerSeverity: "Critical",
        atRisk: true,
        dependentTaskCodes: ["TSK-02"],
      },
      {
        taskId: "00000000-0000-0000-0002-000000000007",
        code: "TSK-07",
        title: "Configure Supabase Storage Bucket Policies",
        ownerName: "Aisha",
        ownerUsername: "aisha_ui",
        status: "Blocked",
        progressPct: 40,
        deadline: "2026-10-19",
        isRequired: true,
        blockerText: "Docker build failed: repository access denied for private registry.",
        blockerSeverity: "High",
        atRisk: true,
      },
      {
        taskId: "00000000-0000-0000-0002-000000000006",
        code: "TSK-06-AUTH",
        title: "Integrate auth with Supabase",
        ownerName: "Ravi",
        ownerUsername: "ravi_ops",
        status: "In Progress",
        progressPct: 70,
        deadline: "2026-10-21",
        isRequired: false,
      },
    ],
    suggestedActions: [
      "Send sandbox credential ping to @aisha to unblock TSK-01.",
      "Escalate private Docker registry IAM permission with DevOps lead for TSK-07.",
    ],
  },
  {
    id: "mls-03",
    code: "MLS-03",
    name: "AI Classification Pipeline",
    description: "Telegram bot webhook listener, Gemini coordinator intent parsing, and compliance data governance.",
    targetDate: "2026-10-24",
    status: "At Risk",
    prerequisiteMilestoneIds: ["mls-01"],
    downstreamMilestoneIds: ["mls-05"],
    commitments: [
      {
        taskId: "00000000-0000-0000-0002-000000000008",
        code: "TSK-08",
        title: "Review GDPR Compliance for Audit Stream",
        ownerName: "Ravi",
        ownerUsername: "ravi_ops",
        status: "Blocked",
        progressPct: 50,
        deadline: "2026-10-16", // OVERDUE relative to 2026-10-17!
        isRequired: true,
        blockerText: "Legal Counsel Data Retention Addendum signoff pending.",
        blockerSeverity: "Medium",
        atRisk: true,
      },
      {
        taskId: "ai-pipe-001",
        code: "BOT-01",
        title: "Telegram Inbound Webhook Listener",
        ownerName: "Kabir",
        ownerUsername: "kabir_dev",
        status: "In Progress",
        progressPct: 80,
        deadline: "2026-10-23",
        isRequired: true,
      },
      {
        taskId: "00000000-0000-0000-0002-000000000009",
        code: "TSK-09",
        title: "Optimize SQLite WAL Checkpointing for Vector Index",
        ownerName: "Kabir",
        ownerUsername: "kabir_dev",
        status: "Blocked",
        progressPct: 20,
        deadline: "2026-10-26",
        isRequired: false,
        blockerText: "Benchmark dataset dump from staging DB pending.",
        blockerSeverity: "Low",
      },
    ],
    suggestedActions: [
      "Request expedited legal signoff on GDPR retention addendum for TSK-08.",
      "Complete webhook listener verification with test payloads.",
    ],
  },
  {
    id: "mls-04",
    code: "MLS-04",
    name: "Dashboard & Reporting",
    description: "Commitment ledger UI, live blocker radar view, and responsive commitment drawer interaction.",
    targetDate: "2026-10-25",
    status: "Active",
    prerequisiteMilestoneIds: ["mls-02"],
    downstreamMilestoneIds: ["mls-05"],
    commitments: [
      {
        taskId: "00000000-0000-0000-0002-000000000003",
        code: "TSK-03",
        title: "Design the checkout page",
        ownerName: "Aisha",
        ownerUsername: "aisha_ui",
        status: "Complete",
        progressPct: 100,
        deadline: "2026-10-21",
        isRequired: true,
        dependentTaskCodes: ["TSK-04"],
      },
      {
        taskId: "00000000-0000-0000-0002-000000000004",
        code: "TSK-04",
        title: "Build the checkout frontend",
        ownerName: "Aisha",
        ownerUsername: "aisha_ui",
        status: "In Progress",
        progressPct: 40,
        deadline: "2026-10-24",
        isRequired: true,
        prerequisiteTaskCodes: ["TSK-03"],
      },
      {
        taskId: "ui-radar-001",
        code: "UI-01",
        title: "Blocker Radar filter and ping dialogs",
        ownerName: "Kabir",
        ownerUsername: "kabir_dev",
        status: "In Progress",
        progressPct: 75,
        deadline: "2026-10-25",
        isRequired: true,
      },
    ],
    suggestedActions: [
      "Continue checkout frontend implementation against approved Figma link.",
      "Wire up Blocker Radar interaction tests in staging environment.",
    ],
  },
  {
    id: "mls-05",
    code: "MLS-05",
    name: "Demo Readiness",
    description: "End-to-end integration tests, project documentation, and capstone presentation walkthrough demo.",
    targetDate: "2026-10-29",
    status: "Upcoming",
    prerequisiteMilestoneIds: ["mls-03", "mls-04"],
    downstreamMilestoneIds: [],
    commitments: [
      {
        taskId: "00000000-0000-0000-0002-000000000002",
        code: "TSK-02",
        title: "Write payment unit tests",
        ownerName: "Kabir",
        ownerUsername: "kabir_dev",
        status: "Assigned",
        progressPct: 0,
        deadline: "2026-10-23",
        isRequired: true,
        prerequisiteTaskCodes: ["TSK-01"],
        atRisk: true,
      },
      {
        taskId: "00000000-0000-0000-0002-000000000006",
        code: "TSK-06",
        title: "Write project README",
        ownerName: "Ravi",
        ownerUsername: "ravi_ops",
        status: "Assigned",
        progressPct: 0,
        deadline: "2026-10-28",
        isRequired: true,
      },
      {
        taskId: "demo-rehearsal-001",
        code: "DEMO-01",
        title: "Full Capstone Demo Rehearsal",
        ownerName: "Aisha",
        ownerUsername: "aisha_ui",
        status: "Assigned",
        progressPct: 0,
        deadline: "2026-10-29",
        isRequired: false,
      },
    ],
    suggestedActions: [
      "Awaiting prerequisite completion on TSK-01 before beginning payment unit tests.",
      "Draft presentation slide deck outline.",
    ],
  },
];
