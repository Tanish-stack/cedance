"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, AlertCircle, Link2 } from "lucide-react";
import type { CommitmentTask } from "@/types/task";
import type { TaskStatus } from "@/lib/design-tokens";

interface NewCommitmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingTasks: CommitmentTask[];
  onCreateCommitment: (newTask: CommitmentTask) => void;
}

const MOCK_TEAM_MEMBERS = [
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Kabir",
    username: "kabir_dev",
    role: "Backend & Payments",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Aisha",
    username: "aisha_ui",
    role: "UI & Design System",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Ravi",
    username: "ravi_ops",
    role: "DevOps & Compliance",
  },
];

const MOCK_MILESTONES_LIST = [
  "Sprint 1: Architecture & DB",
  "Sprint 2: UI Foundation",
  "Sprint 3: API Integration",
  "Sprint 4: Verification & Demo",
];

export function NewCommitmentDialog({
  isOpen,
  onClose,
  existingTasks,
  onCreateCommitment,
}: NewCommitmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(MOCK_TEAM_MEMBERS[0].id);
  const [milestone, setMilestone] = useState(MOCK_MILESTONES_LIST[2]); // Default Sprint 3
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [deadline, setDeadline] = useState("2026-10-25");
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("Assigned");
  const [selectedPrereqId, setSelectedPrereqId] = useState<string>("none");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");

  const [titleError, setTitleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setAssigneeId(MOCK_TEAM_MEMBERS[0].id);
    setMilestone(MOCK_MILESTONES_LIST[2]);
    setPriority("Medium");
    setDeadline("2026-10-25");
    setInitialStatus("Assigned");
    setSelectedPrereqId("none");
    setAcceptanceCriteria("");
    setTitleError(null);
    setIsSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function getNextTaskCode(): string {
    const numbers = existingTasks
      .map((t) => {
        const match = t.code.match(/TSK-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : existingTasks.length;
    return `TSK-${(maxNum + 1).toString().padStart(2, "0")}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Inline validation
    if (!title.trim()) {
      setTitleError("Commitment title is required.");
      return;
    }

    setIsSubmitting(true);

    const owner = MOCK_TEAM_MEMBERS.find((m) => m.id === assigneeId) || MOCK_TEAM_MEMBERS[0];
    const prereqTask = existingTasks.find((t) => t.id === selectedPrereqId);
    const nextCode = getNextTaskCode();

    const isAtRisk =
      priority === "Critical" || priority === "High" || initialStatus === "Blocked";

    const newTask: CommitmentTask = {
      id: `task-${Date.now()}`,
      code: nextCode,
      projectId: "00000000-0000-0000-0001-000000000001",
      projectName: "Cadence / Capstone Alpha",
      milestone,
      title: title.trim(),
      description: description.trim() || `Deliverable commitment for ${milestone}.`,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerUsername: owner.username,
      status: initialStatus,
      progressPct:
        initialStatus === "Complete" ? 100 : initialStatus === "In Progress" ? 25 : 0,
      deadline: deadline || "2026-10-30",
      acceptanceCriteria:
        acceptanceCriteria.trim() || "Implementation completed and approved by team lead.",
      evidenceRequired: "link",
      blockerText:
        initialStatus === "Blocked"
          ? "Initial blocker reported during commitment creation."
          : null,
      blockerOwnerName: null,
      blockerDetectedAt: initialStatus === "Blocked" ? "Just now" : null,
      atRisk: isAtRisk,
      lastUpdateAt: "Today",
      nextFollowupAt: "Tomorrow at 10:00 AM",
      followupCount: 0,
      aiInterpretation: null,
      dependencies: {
        prerequisites: prereqTask
          ? [
              {
                id: prereqTask.id,
                title: prereqTask.title,
                status: prereqTask.status,
                ownerName: prereqTask.ownerName,
                atRisk: prereqTask.atRisk,
              },
            ]
          : [],
        dependents: [],
      },
      suggestedActions: [
        `Align with @${owner.username} on acceptance criteria and delivery date.`,
        "Check prerequisite dependencies before testing.",
      ],
      activityHistory: [
        {
          id: `act-create-${Date.now()}`,
          timestamp: "Just now",
          newStatus: initialStatus,
          reason: `Commitment created with priority ${priority} assigned to ${owner.name}.`,
          source: "manager",
        },
      ],
    };

    // Simulated short delay to prevent multi-click races
    setTimeout(() => {
      onCreateCommitment(newTask);
      handleClose();
    }, 200);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1 pb-2 border-b border-[#e6e6e6]">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0075de]/10 text-[#0075de]">
                <Plus className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-[#000000]">
                New Commitment
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#615d59]">
              Define a new deliverable, assign an owner, set a deadline, and link dependencies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 text-xs">
            {/* 1. Title (Required) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Commitment Title <span className="text-red-500">*</span>
                </label>
                {titleError && (
                  <span className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {titleError}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError && e.target.value.trim()) {
                    setTitleError(null);
                  }
                }}
                placeholder="e.g. Implement Webhook Signature Verification"
                className={`w-full h-8 px-2.5 text-xs bg-[#f6f5f4] border rounded-md outline-none transition-all text-[#000000] ${
                  titleError
                    ? "border-red-500 focus:border-red-600 bg-red-50/20"
                    : "border-[#e6e6e6] focus:border-[#0075de]"
                }`}
              />
            </div>

            {/* 2. Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief technical scope or context for this commitment..."
                rows={2}
                className="w-full p-2 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000] resize-none"
              />
            </div>

            {/* 3. Assignee & Milestone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Assignee */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Assignee
                </label>
                <Select
                  value={assigneeId}
                  onValueChange={(val) => val && setAssigneeId(val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                    <SelectValue placeholder="Select Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.id} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#000000]">{member.name}</span>
                          <span className="text-[10px] text-[#a39e98]">(@{member.username})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Milestone */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Milestone
                </label>
                <Select
                  value={milestone}
                  onValueChange={(val) => val && setMilestone(val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                    <SelectValue placeholder="Select Milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_MILESTONES_LIST.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 4. Priority & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Priority
                </label>
                <Select
                  value={priority}
                  onValueChange={(val) =>
                    val && setPriority(val as "Low" | "Medium" | "High" | "Critical")
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low" className="text-xs text-[#1aae39]">
                      Low
                    </SelectItem>
                    <SelectItem value="Medium" className="text-xs text-[#213183]">
                      Medium
                    </SelectItem>
                    <SelectItem value="High" className="text-xs text-[#dd5b00]">
                      High
                    </SelectItem>
                    <SelectItem value="Critical" className="text-xs text-red-600 font-semibold">
                      Critical
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Initial Status
                </label>
                <Select
                  value={initialStatus}
                  onValueChange={(val) => val && setInitialStatus(val as TaskStatus)}
                >
                  <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                    <SelectValue placeholder="Initial Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assigned" className="text-xs">
                      Assigned (Default)
                    </SelectItem>
                    <SelectItem value="In Progress" className="text-xs text-[#0075de]">
                      In Progress
                    </SelectItem>
                    <SelectItem value="Blocked" className="text-xs text-[#dd5b00]">
                      Blocked
                    </SelectItem>
                    <SelectItem value="Pending Verification" className="text-xs text-[#213183]">
                      Pending Verification
                    </SelectItem>
                    <SelectItem value="Complete" className="text-xs text-[#1aae39]">
                      Complete
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 5. Due Date & Acceptance Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Due Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Acceptance Criteria
                </label>
                <input
                  type="text"
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  placeholder="e.g. Unit tests pass & PR approved"
                  className="w-full h-8 px-2.5 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000]"
                />
              </div>
            </div>

            {/* 6. Dependencies (Prerequisite Task) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block flex items-center gap-1">
                <Link2 className="w-3 h-3 text-[#615d59]" />
                <span>Prerequisite Dependency (Optional)</span>
              </label>
              <Select
                value={selectedPrereqId}
                onValueChange={(val) => val && setSelectedPrereqId(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None (No Prerequisite)
                  </SelectItem>
                  {existingTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.code}: {t.title} ({t.ownerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-[#e6e6e6] flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 text-xs border-[#e6e6e6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white rounded-md font-medium px-4 shadow-xs"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Commitment</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
