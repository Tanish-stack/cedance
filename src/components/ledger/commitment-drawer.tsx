"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Bot,
  ArrowRight,
  Send,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Link2,
  FileText,
  History,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CommitmentTask } from "@/types/task";

interface CommitmentDrawerProps {
  task: CommitmentTask | null;
  isOpen: boolean;
  onClose: () => void;
  onResolveBlocker?: (taskId: string) => void;
  onPingOwner?: (taskId: string, ownerName: string) => void;
}

export function CommitmentDrawer({
  task,
  isOpen,
  onClose,
  onResolveBlocker,
  onPingOwner,
}: CommitmentDrawerProps) {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  function handlePing() {
    setActionFeedback(`Nudge dispatched to ${task?.ownerName} via Telegram.`);
    if (onPingOwner && task) {
      onPingOwner(task.id, task.ownerName);
    }
    setTimeout(() => setActionFeedback(null), 3500);
  }

  function handleResolve() {
    // Semantic rule: Resolving blocker does NOT mark task complete, it moves to In Progress
    setActionFeedback("Blocker marked resolved. Task transitioned to 'In Progress'.");
    if (onResolveBlocker && task) {
      onResolveBlocker(task.id);
    }
    setTimeout(() => setActionFeedback(null), 3500);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="relative flex flex-col w-full sm:w-[500px] md:w-[560px] h-full bg-[#f6f5f4] shadow-2xl border-l border-[#e6e6e6] z-10 animate-in slide-in-from-right duration-250 select-none overflow-hidden"
        aria-label="Commitment Details"
      >
        {/* 1. HEADER SECTION */}
        <div className="flex items-start justify-between p-4 bg-white border-b border-[#e6e6e6] gap-3 shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-semibold text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded border border-[#e6e6e6]">
                {task.code}
              </span>
              <StatusBadge status={task.status} atRisk={task.atRisk} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#000000] tracking-tight leading-snug">
              {task.title}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[#615d59] hover:text-[#000000] hover:bg-black/5 rounded-md shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="px-4 py-2 bg-[#0075de]/10 border-b border-[#0075de]/20 flex items-center justify-between text-xs text-[#0075de] animate-in fade-in-0">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-[#0075de] hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-[#000000]">
          {/* 2. OWNERSHIP & METADATA SECTION */}
          <section className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-3">
            <div className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">
              Ownership & Timeline
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Assignee */}
              <div className="flex items-center gap-2.5">
                <Avatar className="w-7 h-7 border border-[#e6e6e6]">
                  <AvatarFallback className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                    {task.ownerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#615d59] block">Assignee</span>
                  <span className="font-semibold text-[#000000] truncate block">
                    {task.ownerName}
                  </span>
                  <span className="text-[10px] text-[#a39e98] block">
                    @{task.ownerUsername}
                  </span>
                </div>
              </div>

              {/* Milestone & Sprint */}
              <div className="min-w-0">
                <span className="text-[11px] text-[#615d59] block">Milestone</span>
                <span className="font-semibold text-[#000000] truncate block">
                  {task.milestone}
                </span>
                <span className="text-[10px] text-[#a39e98] truncate block">
                  {task.projectName}
                </span>
              </div>

              {/* Due Date */}
              <div>
                <span className="text-[11px] text-[#615d59] block">Due Date</span>
                <span className="font-semibold text-[#000000] block">
                  {task.deadline}
                </span>
              </div>

              {/* Next Scheduled Check */}
              <div>
                <span className="text-[11px] text-[#615d59] block">Next Follow-up</span>
                <span className="font-medium text-[#615d59] block truncate">
                  {task.nextFollowupAt}
                </span>
              </div>
            </div>
          </section>

          {/* 3. PROGRESS & ACCEPTANCE CRITERIA */}
          <section className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">
                Progress & Criteria
              </span>
              <span className="font-mono text-xs font-semibold text-[#0075de]">
                {task.progressPct}% complete
              </span>
            </div>

            <Progress value={task.progressPct} className="h-1.5" />

            {/* Acceptance Criteria Box */}
            <div className="p-2.5 rounded bg-[#f6f5f4] border border-[#e6e6e6] space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#31302e]">
                <span>Acceptance Criteria</span>
                <span className="text-[10px] font-normal text-[#615d59] flex items-center gap-1">
                  {task.evidenceRequired === "link" ? (
                    <Link2 className="w-3 h-3 text-[#0075de]" />
                  ) : (
                    <FileText className="w-3 h-3 text-[#0075de]" />
                  )}
                  Evidence: {task.evidenceRequired}
                </span>
              </div>
              <p className="text-[11px] text-[#615d59] leading-relaxed">
                {task.acceptanceCriteria}
              </p>
            </div>
          </section>

          {/* 4. BLOCKER DETAILS (Critical for anchor example) */}
          {task.status === "Blocked" || task.blockerText ? (
            <section className="p-3.5 bg-white rounded-lg border border-[#dd5b00]/40 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-[#dd5b00]">
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Active Blocker Analysis</span>
                </div>
                {task.blockerDetectedAt && (
                  <span className="text-[10px] text-[#a39e98] font-mono">
                    Detected {task.blockerDetectedAt}
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-[#dd5b00]/10 border border-[#dd5b00]/25 rounded text-xs text-[#793400] space-y-1">
                <span className="font-semibold block">Blocker Description:</span>
                <p className="italic">&ldquo;{task.blockerText}&rdquo;</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[#615d59] block">Missing Dependency:</span>
                  <span className="font-medium text-[#000000]">
                    Test sandbox credentials
                  </span>
                </div>
                <div>
                  <span className="text-[#615d59] block">Responsible Unblocker:</span>
                  <span className="font-medium text-[#000000]">
                    @{task.blockerOwnerName || "Aisha"}
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <div className="p-2.5 bg-white rounded-lg border border-[#e6e6e6] flex items-center gap-2 text-xs text-[#615d59]">
              <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
              <span>No active blockers recorded on this commitment.</span>
            </div>
          )}

          {/* 5. AI CLASSIFIER INTERPRETATION */}
          {task.aiInterpretation && (
            <section className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-[#615d59] uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5 text-[#0075de]" />
                  <span>Gemini Classifier Interpretation</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1aae39]/10 text-[#1aae39] font-semibold">
                  Confidence: {Math.round(task.aiInterpretation.confidence * 100)}%
                </span>
              </div>

              {/* Source Message Quote */}
              <div className="p-2 bg-[#f6f5f4] rounded border border-[#e6e6e6] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wide">
                  Source Telegram Message:
                </span>
                <p className="text-xs text-[#000000] italic">
                  &ldquo;{task.aiInterpretation.sourceMessage}&rdquo;
                </p>
              </div>

              {/* Meaning and Rule Application */}
              <div className="space-y-1.5 text-xs text-[#615d59] leading-relaxed">
                <div>
                  <span className="font-semibold text-[#000000]">Interpreted Meaning: </span>
                  {task.aiInterpretation.interpretedMeaning}
                </div>
                <div className="p-2 bg-[#0075de]/5 rounded border border-[#0075de]/20 text-[11px] text-[#005bab] leading-relaxed">
                  <span className="font-semibold block text-[#0075de]">
                    State Machine Deterministic Rule:
                  </span>
                  {task.aiInterpretation.reasoning}
                </div>
              </div>
            </section>
          )}

          {/* 6. SUGGESTED NEXT ACTIONS */}
          <section className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-2.5">
            <div className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0075de]" />
              <span>Suggested Next Actions</span>
            </div>

            <ul className="space-y-1.5">
              {task.suggestedActions.map((action, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-[#31302e] leading-snug p-1.5 rounded hover:bg-[#f6f5f4] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#0075de] shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. DEPENDENCIES GRAPH */}
          <section className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-3">
            <div className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider">
              Dependency Graph
            </div>

            {/* Prerequisites */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#615d59] block">
                Prerequisites (Must complete before starting):
              </span>
              {task.dependencies.prerequisites.length > 0 ? (
                <div className="space-y-1">
                  {task.dependencies.prerequisites.map((prereq) => (
                    <div
                      key={prereq.id}
                      className="flex items-center justify-between p-2 rounded bg-[#f6f5f4] border border-[#e6e6e6] text-xs"
                    >
                      <span className="font-medium text-[#000000]">{prereq.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#615d59]">@{prereq.ownerName}</span>
                        <StatusBadge status={prereq.status} atRisk={prereq.atRisk} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#a39e98] italic block">
                  None (no prerequisite dependencies)
                </span>
              )}
            </div>

            {/* Dependents */}
            <div className="space-y-1.5 pt-1 border-t border-[#f6f5f4]">
              <span className="text-[11px] font-medium text-[#615d59] block">
                Downstream Dependents (Stalled if this task is blocked):
              </span>
              {task.dependencies.dependents.length > 0 ? (
                <div className="space-y-1">
                  {task.dependencies.dependents.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between p-2 rounded bg-[#f6f5f4] border border-[#e6e6e6] text-xs"
                    >
                      <span className="font-medium text-[#000000]">{dep.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#615d59]">@{dep.ownerName}</span>
                        <StatusBadge status={dep.status} atRisk={dep.atRisk} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#a39e98] italic block">
                  No downstream dependent tasks
                </span>
              )}
            </div>
          </section>

          {/* 8. ACTIVITY HISTORY */}
          <section
            id="audit-history-section"
            className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#615d59] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#0075de]" />
                <span>Audit & Activity History</span>
              </span>
              <span className="text-[10px] text-[#a39e98]">
                {task.activityHistory.length} events logged
              </span>
            </div>

            <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e6e6e6]">
              {task.activityHistory.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3 pl-6 text-xs">
                  {/* Timeline dot */}
                  <span className="absolute left-2.5 top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0075de] ring-2 ring-white" />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-semibold text-[#000000] capitalize">
                        Source: {act.source}
                      </span>
                      <span className="font-mono text-[10px] text-[#a39e98]">
                        {act.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#615d59] leading-relaxed">
                      {act.reason}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      <StatusBadge status={act.newStatus} />
                      {act.confidence && (
                        <span className="text-[10px] text-[#1aae39] font-mono">
                          conf: {act.confidence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 9. BOTTOM ACTIONS BAR */}
        <div className="p-3.5 bg-white border-t border-[#e6e6e6] shrink-0 flex items-center justify-between gap-2">
          {/* Action 1: Ping Owner */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePing}
            className="h-8 text-xs border-[#e6e6e6] text-[#31302e] hover:text-[#000000] gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#0075de]" />
            <span>Ping Owner</span>
          </Button>

          {/* Action 2: Resolve Blocker (Only if Blocked) */}
          {task.status === "Blocked" && (
            <Button
              size="sm"
              onClick={handleResolve}
              className="h-8 text-xs bg-[#dd5b00] hover:bg-[#dd5b00]/90 text-white font-medium rounded-full px-3 gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve Blocker</span>
            </Button>
          )}

          {/* Action 3: View Audit History */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const el = document.getElementById("audit-history-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-8 text-xs text-[#615d59] hover:text-[#000000] gap-1"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit Trail</span>
          </Button>
        </div>
      </aside>
    </div>
  );
}
