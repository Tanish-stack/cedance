"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Calendar,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { evaluateMilestoneRisk, CURRENT_MOCK_DATE } from "@/lib/mock-milestones";
import type { Milestone } from "@/types/milestone";

interface MilestoneDetailsDialogProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  allMilestones: Milestone[];
  onOpenTaskDrawer: (taskId: string) => void;
  onOpenEditDialog: (milestone: Milestone) => void;
}

export function MilestoneDetailsDialog({
  milestone,
  isOpen,
  onClose,
  allMilestones,
  onOpenTaskDrawer,
  onOpenEditDialog,
}: MilestoneDetailsDialogProps) {
  if (!milestone) return null;

  const riskEval = evaluateMilestoneRisk(milestone, CURRENT_MOCK_DATE);

  // Computations
  const totalTasks = milestone.commitments.length;
  const completedTasks = milestone.commitments.filter((c) => c.status === "Complete").length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const requiredTasks = milestone.commitments.filter((c) => c.isRequired);
  const optionalTasks = milestone.commitments.filter((c) => !c.isRequired);

  const blockedTasks = milestone.commitments.filter((c) => c.status === "Blocked");
  const overdueTasks = milestone.commitments.filter(
    (c) => c.deadline < CURRENT_MOCK_DATE && c.status !== "Complete"
  );

  // Lookup prerequisite and downstream milestone objects
  const prereqMilestones = allMilestones.filter((m) =>
    milestone.prerequisiteMilestoneIds.includes(m.id)
  );
  const downstreamMilestones = allMilestones.filter((m) =>
    milestone.downstreamMilestoneIds.includes(m.id)
  );

  function getRiskBadge(level: string) {
    switch (level) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "High":
        return "bg-orange-50 text-[#dd5b00] border-[#dd5b00]/30";
      case "Medium":
        return "bg-amber-50 text-[#213183] border-[#213183]/30";
      default:
        return "bg-green-50 text-[#1aae39] border-[#1aae39]/30";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-3 border-b border-[#e6e6e6]">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-[#1aae39]/10 text-[#1aae39] px-2 py-0.5 rounded border border-[#1aae39]/30">
                {milestone.code}
              </span>
              <DialogTitle className="text-base font-bold text-[#000000]">
                {milestone.name}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2">
              {/* Risk Level Badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBadge(
                  riskEval.riskLevel
                )}`}
              >
                Risk: {riskEval.riskLevel}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  milestone.status === "Completed"
                    ? "bg-[#1aae39]/10 text-[#1aae39] border-[#1aae39]/30"
                    : milestone.status === "At Risk"
                    ? "bg-[#dd5b00]/10 text-[#dd5b00] border-[#dd5b00]/30"
                    : milestone.status === "Active"
                    ? "bg-[#0075de]/10 text-[#0075de] border-[#0075de]/30"
                    : "bg-gray-100 text-[#615d59] border-gray-200"
                }`}
              >
                {milestone.status}
              </span>
            </div>
          </div>

          <DialogDescription className="text-xs text-[#615d59] leading-relaxed">
            {milestone.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Milestone Metrics & Progress */}
          <div className="p-3 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#0075de]" />
                <span className="text-[#615d59]">
                  Target Date: <strong className="text-[#000000]">{milestone.targetDate}</strong>
                </span>
              </div>
              <span className="font-semibold text-[#000000]">
                {completedTasks} of {totalTasks} Commitments Complete ({progressPct}%)
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-[#e6e6e6]" />
          </div>

          {/* Risk Evaluation Callout */}
          <div
            className={`p-3 rounded-lg border space-y-1.5 ${
              riskEval.riskLevel === "Critical"
                ? "bg-red-50/70 border-red-200"
                : riskEval.riskLevel === "High"
                ? "bg-orange-50/70 border-[#dd5b00]/30"
                : riskEval.riskLevel === "Medium"
                ? "bg-amber-50/70 border-amber-200"
                : "bg-green-50/50 border-[#1aae39]/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold">
                {riskEval.isAtRisk ? (
                  <ShieldAlert className="w-4 h-4 text-[#dd5b00]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                )}
                <span className="text-xs text-[#000000]">
                  Deterministic Risk Assessment ({riskEval.riskLevel} Risk)
                </span>
              </div>
              <span className="text-[10px] text-[#615d59]">As of Oct 17, 2026</span>
            </div>

            <ul className="space-y-1 pl-4 list-disc text-xs text-[#31302e]">
              {riskEval.reasons.map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Blocked or Overdue Alerts if applicable */}
          {(blockedTasks.length > 0 || overdueTasks.length > 0) && (
            <div className="p-3 bg-white rounded-lg border border-[#dd5b00]/30 space-y-2">
              <span className="text-[11px] font-semibold text-[#dd5b00] uppercase tracking-wider block">
                Deliverables Requiring Attention ({blockedTasks.length + overdueTasks.length})
              </span>
              <div className="space-y-1.5">
                {blockedTasks.map((t) => (
                  <div
                    key={t.taskId}
                    className="flex items-center justify-between p-2 bg-orange-50/60 rounded border border-[#dd5b00]/20"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-[#dd5b00] bg-white px-1.5 py-0.5 rounded border border-[#dd5b00]/30 shrink-0">
                        {t.code}
                      </span>
                      <div className="min-w-0">
                        <span className="font-medium text-[#000000] truncate block">{t.title}</span>
                        <span className="text-[10px] text-[#615d59]">
                          Blocker: {t.blockerText || "Impediment reported"}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenTaskDrawer(t.taskId)}
                      className="h-6 text-[11px] text-[#0075de] hover:bg-white px-2 shrink-0 ml-2"
                    >
                      <span>Drawer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                ))}

                {overdueTasks
                  .filter((t) => !blockedTasks.some((b) => b.taskId === t.taskId))
                  .map((t) => (
                    <div
                      key={t.taskId}
                      className="flex items-center justify-between p-2 bg-amber-50/60 rounded border border-amber-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-white px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                          {t.code}
                        </span>
                        <span className="font-medium text-[#000000] truncate">{t.title}</span>
                        <span className="text-[10px] text-red-600 font-semibold">
                          (Overdue: {t.deadline})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenTaskDrawer(t.taskId)}
                        className="h-6 text-[11px] text-[#0075de] hover:bg-white px-2 shrink-0 ml-2"
                      >
                        <span>Drawer</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Associated Commitments: Required vs Optional */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
              Associated Commitments ({totalTasks})
            </span>

            {/* Required Commitments */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-[#000000] uppercase tracking-wider flex items-center justify-between">
                <span>Required Deliverables ({requiredTasks.length})</span>
                <span className="text-[#a39e98] font-normal normal-case">Must be completed</span>
              </div>
              {requiredTasks.map((task) => (
                <div
                  key={task.taskId}
                  onClick={() => onOpenTaskDrawer(task.taskId)}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#e6e6e6] hover:border-[#0075de]/40 hover:bg-[#f6f5f4]/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] font-bold bg-[#0075de]/10 text-[#0075de] px-1.5 py-0.5 rounded border border-[#0075de]/20 shrink-0">
                      {task.code}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-[#000000] truncate block">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-[#615d59]">
                        Owner: {task.ownerName} · Due {task.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <StatusBadge status={task.status} atRisk={task.atRisk} />
                    <ExternalLink className="w-3 h-3 text-[#a39e98]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Commitments */}
            {optionalTasks.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider flex items-center justify-between">
                  <span>Optional / Nice-to-have ({optionalTasks.length})</span>
                  <span className="text-[#a39e98] font-normal normal-case">Non-blocking</span>
                </div>
                {optionalTasks.map((task) => (
                  <div
                    key={task.taskId}
                    onClick={() => onOpenTaskDrawer(task.taskId)}
                    className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-[#e6e6e6] hover:border-[#0075de]/40 hover:bg-[#f6f5f4]/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold bg-[#f6f5f4] text-[#615d59] px-1.5 py-0.5 rounded border border-[#e6e6e6] shrink-0">
                        {task.code}
                      </span>
                      <div className="min-w-0">
                        <span className="font-medium text-[#000000] truncate block text-xs">
                          {task.title}
                        </span>
                        <span className="text-[10px] text-[#a39e98]">
                          Owner: {task.ownerName} · Due {task.deadline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <StatusBadge status={task.status} atRisk={task.atRisk} />
                      <ExternalLink className="w-3 h-3 text-[#a39e98]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dependency Connections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Prerequisites */}
            <div className="p-2.5 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] space-y-1">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Prerequisite Milestones
              </span>
              {prereqMilestones.length > 0 ? (
                <div className="space-y-1">
                  {prereqMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="text-xs text-[#000000] flex items-center gap-1.5 font-medium"
                    >
                      <Link2 className="w-3 h-3 text-[#0075de]" />
                      <span>{m.code}: {m.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#a39e98] italic">No prerequisite dependencies.</span>
              )}
            </div>

            {/* Downstream */}
            <div className="p-2.5 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] space-y-1">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Downstream Milestones
              </span>
              {downstreamMilestones.length > 0 ? (
                <div className="space-y-1">
                  {downstreamMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="text-xs text-[#000000] flex items-center gap-1.5 font-medium"
                    >
                      <ArrowRight className="w-3 h-3 text-[#1aae39]" />
                      <span>{m.code}: {m.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#a39e98] italic">No downstream dependencies.</span>
              )}
            </div>
          </div>

          {/* Suggested Actions */}
          {milestone.suggestedActions && milestone.suggestedActions.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-[#e6e6e6]">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Recommended Actions
              </span>
              <ul className="space-y-1 pl-4 list-disc text-xs text-[#31302e]">
                {milestone.suggestedActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-[#e6e6e6] flex sm:justify-between items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenEditDialog(milestone);
            }}
            className="h-8 text-xs border-[#e6e6e6] text-[#0075de] hover:bg-white flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Milestone</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs bg-[#000000] hover:bg-[#31302e] text-white px-4 rounded-md"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
