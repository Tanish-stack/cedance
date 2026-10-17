"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommitmentDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onOverrideStatus: (taskId: string, status: TaskStatus, reason: string) => Promise<void>;
  onNudgeOwner: (taskId: string) => Promise<void>;
  onVerifyEvidence: (taskId: string, content: string) => Promise<void>;
  allTasks: Task[];
}

export function CommitmentDrawer({
  task,
  isOpen,
  onClose,
  onOverrideStatus,
  onNudgeOwner,
  onVerifyEvidence,
  allTasks,
}: CommitmentDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "">("");
  const [overrideReason, setOverrideReason] = useState("");
  const [evidenceInput, setEvidenceInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "override" | "evidence">("details");

  if (!isOpen || !task) return null;

  const statusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    "Assigned": { bg: "bg-zinc-100", text: "text-zinc-700", border: "border-zinc-200" },
    "In Progress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "Blocked": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    "Pending Verification": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "Needs Rework": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    "Complete": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  };

  const currentColors = statusColors[task.status] || statusColors["Assigned"];

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      await onOverrideStatus(
        task.id,
        selectedStatus as TaskStatus,
        overrideReason || `Manager manual override to ${selectedStatus}`
      );
      setSelectedStatus("");
      setOverrideReason("");
      setActiveTab("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onVerifyEvidence(task.id, evidenceInput.trim());
      setEvidenceInput("");
      setActiveTab("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dependencyTasks = (task.dependencies || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as Task[];

  const dependentTasks = (task.dependents || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as Task[];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150">
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:border-l dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                currentColors.bg,
                currentColors.text,
                currentColors.border
              )}
            >
              {task.status}
            </span>
            {task.at_risk && (
              <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                At Risk
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNudgeOwner(task.id)}
              className="text-[11px] gap-1"
            >
              <Send className="h-3 w-3 text-[#2383e2]" />
              Nudge Telegram
            </Button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#e6e6e6] px-5 text-xs font-medium dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "border-b-2 py-2.5 px-3 transition-colors",
              activeTab === "details"
                ? "border-[#2383e2] text-[#2383e2] font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("override")}
            className={cn(
              "border-b-2 py-2.5 px-3 transition-colors",
              activeTab === "override"
                ? "border-[#2383e2] text-[#2383e2] font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            )}
          >
            Manager Override
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={cn(
              "border-b-2 py-2.5 px-3 transition-colors",
              activeTab === "evidence"
                ? "border-[#2383e2] text-[#2383e2] font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            )}
          >
            Verify Evidence
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "details" && (
            <>
              {/* Title & Description */}
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {task.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {task.description || "No extended description provided."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="rounded-lg border border-[#e6e6e6] bg-[#fafaf9] p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Completion</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {task.progress_pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full bg-[#2383e2] transition-all duration-300"
                    style={{ width: `${task.progress_pct}%` }}
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-[#e6e6e6] p-2.5 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                    <User className="h-3.5 w-3.5" />
                    <span>Owner</span>
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {task.owner_name || "Unassigned"}
                  </span>
                </div>

                <div className="rounded-lg border border-[#e6e6e6] p-2.5 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Deadline</span>
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {task.deadline || "None"}
                  </span>
                </div>
              </div>

              {/* Blocker Banner */}
              {task.status === "Blocked" && task.blocker_text && (
                <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Active Blocker Detected</span>
                  </div>
                  <p className="text-rose-700 dark:text-rose-300 font-mono text-[11px]">
                    &quot;{task.blocker_text}&quot;
                  </p>
                  {task.blocker_owner_name && (
                    <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
                      Unblocker assigned: <strong className="font-semibold">{task.blocker_owner_name}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Acceptance Criteria */}
              <div className="rounded-lg border border-[#e6e6e6] p-3.5 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Acceptance Criteria</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-[#fbfbfa] dark:bg-zinc-900 p-2 rounded border border-zinc-200/60 dark:border-zinc-800">
                  {task.acceptance_criteria || "No acceptance criteria defined."}
                </p>
                <div className="text-[10px] text-zinc-400">
                  Evidence type expected: <span className="font-mono font-medium text-zinc-600 dark:text-zinc-300">{task.evidence_required}</span>
                </div>
              </div>

              {/* Dependency Relations */}
              <div className="rounded-lg border border-[#e6e6e6] p-3.5 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <GitBranch className="h-3.5 w-3.5 text-[#2383e2]" />
                  <span>Dependency Graph</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-medium text-zinc-500">Prerequisites (Must finish first):</div>
                  {dependencyTasks.length > 0 ? (
                    dependencyTasks.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-[11px] dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800"
                      >
                        <span className="truncate">{dep.title}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.2 text-[9px] font-medium",
                            dep.status === "Complete"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {dep.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">No prerequisites</span>
                  )}

                  <div className="text-[11px] font-medium text-zinc-500 pt-1">Downstream Deliverables Impeded:</div>
                  {dependentTasks.length > 0 ? (
                    dependentTasks.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-[11px] dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800"
                      >
                        <span className="truncate">{dep.title}</span>
                        <span className="text-[10px] text-zinc-500">{dep.owner_name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">No downstream dependencies</span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "override" && (
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
                <strong className="font-semibold">Manager Governance Override:</strong> Manual overrides are recorded in the immutable audit log with source `manager`.
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  required
                >
                  <option value="">Select new status...</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Needs Rework">Needs Rework</option>
                  <option value="Complete">Complete (Manual Sign-off)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason for Override
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the manager override was triggered..."
                  rows={3}
                  className="w-full rounded-md border border-[#e6e6e6] bg-white p-2.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedStatus}
                className="w-full bg-[#2383e2] text-xs font-medium text-white hover:bg-[#1a73cb]"
              >
                {isSubmitting ? "Executing Transition..." : "Commit Status Override"}
              </Button>
            </form>
          )}

          {activeTab === "evidence" && (
            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 border border-blue-200 dark:border-blue-900/60">
                <strong className="font-semibold">Automated Verification:</strong> Claims of &quot;done&quot; must pass criteria check. Submitting verified evidence transitions the task to Complete.
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evidence Payload (PR URL, Staging Link, or Summary)
                </label>
                <textarea
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder="https://github.com/org/repo/pull/42 or test run logs..."
                  rows={4}
                  className="w-full rounded-md border border-[#e6e6e6] bg-white p-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !evidenceInput.trim()}
                className="w-full bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
              >
                {isSubmitting ? "Verifying..." : "Run Done-Verification Check"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
