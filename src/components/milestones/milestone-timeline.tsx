"use client";

import React from "react";
import {
  Calendar,
  ShieldAlert,
  ChevronRight,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { evaluateMilestoneRisk, CURRENT_MOCK_DATE } from "@/lib/mock-milestones";
import type { Milestone } from "@/types/milestone";

interface MilestoneTimelineProps {
  milestones: Milestone[];
  allMilestones: Milestone[];
  onSelectMilestone: (milestone: Milestone) => void;
  onOpenTaskDrawer: (taskId: string) => void;
}

export function MilestoneTimeline({
  milestones,
  allMilestones,
  onSelectMilestone,
  onOpenTaskDrawer,
}: MilestoneTimelineProps) {
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
    <div className="space-y-4">
      {milestones.map((milestone) => {
        const riskEval = evaluateMilestoneRisk(milestone, CURRENT_MOCK_DATE);
        const totalTasks = milestone.commitments.length;
        const completedTasks = milestone.commitments.filter((c) => c.status === "Complete").length;
        const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const prereqMilestones = allMilestones.filter((m) =>
          milestone.prerequisiteMilestoneIds.includes(m.id)
        );

        return (
          <div
            key={milestone.id}
            className={`p-4 sm:p-5 bg-white rounded-xl border transition-all shadow-xs hover:border-[#0075de]/40 ${
              riskEval.riskLevel === "Critical"
                ? "border-l-4 border-l-red-600 border-[#e6e6e6]"
                : riskEval.riskLevel === "High"
                ? "border-l-4 border-l-[#dd5b00] border-[#e6e6e6]"
                : riskEval.riskLevel === "Medium"
                ? "border-l-4 border-l-[#213183] border-[#e6e6e6]"
                : milestone.status === "Completed"
                ? "border-l-4 border-l-[#1aae39] border-[#e6e6e6]"
                : "border-[#e6e6e6]"
            }`}
          >
            {/* Milestone Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#f6f5f4]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold bg-[#f6f5f4] text-[#000000] px-2 py-0.5 rounded border border-[#e6e6e6]">
                  {milestone.code}
                </span>

                <h3 className="text-sm sm:text-base font-bold text-[#000000]">
                  {milestone.name}
                </h3>

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

                {/* Risk Level Badge */}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBadge(
                    riskEval.riskLevel
                  )}`}
                >
                  {riskEval.riskLevel} Risk
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#615d59]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#0075de]" />
                  <span>Target: {milestone.targetDate}</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectMilestone(milestone)}
                  className="h-7 text-xs border-[#e6e6e6] text-[#0075de] hover:bg-[#f6f5f4] flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Description & Progress Bar */}
            <div className="py-3 space-y-2">
              <p className="text-xs text-[#615d59] leading-relaxed">
                {milestone.description}
              </p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#615d59]">
                  <span className="text-[11px] font-medium">
                    Deliverables: {completedTasks} / {totalTasks} Completed
                  </span>
                  <span className="font-semibold text-[#000000]">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-1.5 bg-[#f6f5f4]" />
              </div>
            </div>

            {/* Prerequisite Milestone Links (if any) */}
            {prereqMilestones.length > 0 && (
              <div className="flex items-center gap-2 pb-2.5 text-xs text-[#615d59] flex-wrap">
                <span className="text-[11px] font-semibold text-[#a39e98] uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Prerequisites:
                </span>
                {prereqMilestones.map((pm) => (
                  <span
                    key={pm.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#f6f5f4] border border-[#e6e6e6] text-[#000000]"
                  >
                    <span className="font-mono text-[10px] text-[#0075de]">{pm.code}</span>
                    <span>{pm.name}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Risk Reason Notice if At Risk */}
            {riskEval.isAtRisk && (
              <div className="mb-3 p-2.5 rounded-lg bg-orange-50/60 border border-[#dd5b00]/20 flex items-start gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-[#dd5b00] shrink-0 mt-0.5" />
                <div className="text-[#31302e] leading-relaxed">
                  <strong className="text-[#dd5b00]">Risk Factor:</strong> {riskEval.primaryReason}
                </div>
              </div>
            )}

            {/* Commitments Task Roster */}
            <div className="space-y-2 pt-2 border-t border-[#f6f5f4]">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Commitment Deliverables ({totalTasks})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {milestone.commitments.map((task) => {
                  const isBlocked = task.status === "Blocked";
                  const isOverdue =
                    task.deadline < CURRENT_MOCK_DATE && task.status !== "Complete";

                  return (
                    <div
                      key={task.taskId}
                      onClick={() => onOpenTaskDrawer(task.taskId)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:border-[#0075de]/40 ${
                        isBlocked
                          ? "bg-orange-50/40 border-[#dd5b00]/30 hover:bg-orange-50/70"
                          : isOverdue
                          ? "bg-amber-50/40 border-amber-200 hover:bg-amber-50/70"
                          : "bg-[#f6f5f4]/60 border-[#e6e6e6] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] font-bold text-[#0075de] bg-white px-1.5 py-0.2 rounded border border-[#e6e6e6]">
                          {task.code}
                        </span>
                        <StatusBadge status={task.status} atRisk={task.atRisk} />
                      </div>

                      <div className="font-medium text-[#000000] truncate" title={task.title}>
                        {task.title}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#615d59] mt-1 pt-1 border-t border-[#e6e6e6]/50">
                        <span>{task.ownerName}</span>
                        <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                          {isOverdue ? `Overdue (${task.deadline})` : `Due ${task.deadline}`}
                        </span>
                      </div>

                      {isBlocked && task.blockerText && (
                        <div className="mt-1 text-[10px] text-[#dd5b00] truncate font-medium">
                          ⚠️ {task.blockerText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
