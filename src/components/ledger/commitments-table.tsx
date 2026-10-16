"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { CommitmentTask } from "@/types/task";

interface CommitmentsTableProps {
  tasks: CommitmentTask[];
  selectedTaskId: string | null;
  onSelectTask: (task: CommitmentTask) => void;
}

export function CommitmentsTable({
  tasks,
  selectedTaskId,
  onSelectTask,
}: CommitmentsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e6e6e6] shadow-xs overflow-hidden select-none">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 bg-[#f6f5f4] border-b border-[#e6e6e6] text-[11px] font-semibold text-[#615d59] uppercase tracking-wider">
        <div className="col-span-1">ID</div>
        <div className="col-span-4">Commitment & Criteria</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Deadline</div>
        <div className="col-span-1">Progress</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#e6e6e6]">
        {tasks.map((task) => {
          const isSelected = selectedTaskId === task.id;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className={`p-3.5 md:p-3 md:grid md:grid-cols-12 gap-3 items-center cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#0075de]/5 border-l-2 border-l-[#0075de]"
                  : "hover:bg-[#f6f5f4]/80"
              }`}
            >
              {/* ID & Mobile Header */}
              <div className="col-span-1 flex items-center justify-between md:justify-start gap-1.5 mb-2 md:mb-0">
                <span className="font-mono text-[11px] font-semibold text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded border border-[#e6e6e6]">
                  {task.code}
                </span>

                {/* Mobile-only status badge */}
                <div className="md:hidden">
                  <StatusBadge status={task.status} atRisk={task.atRisk} />
                </div>
              </div>

              {/* Title & Description */}
              <div className="col-span-4 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-[#000000] truncate">
                    {task.title}
                  </h3>
                  {task.atRisk && (
                    <span
                      title="At Risk"
                      className="text-[#793400] bg-[#793400]/10 px-1 rounded text-[10px] font-medium shrink-0"
                    >
                      Risk
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#615d59] truncate">
                  {task.acceptanceCriteria}
                </p>

                {task.blockerText && (
                  <div className="flex items-center gap-1 text-[11px] text-[#dd5b00] pt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate italic">
                      Blocker: &ldquo;{task.blockerText}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex items-center gap-2 mt-2 md:mt-0">
                <Avatar className="w-6 h-6 border border-[#e6e6e6]">
                  <AvatarFallback className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                    {task.ownerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#000000] truncate block">
                    {task.ownerName}
                  </span>
                  <span className="text-[10px] text-[#a39e98] block">
                    @{task.ownerUsername}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="col-span-2 text-xs text-[#615d59] mt-1 md:mt-0">
                <span className="font-medium text-[#000000]">{task.deadline}</span>
                <span className="text-[10px] text-[#a39e98] block">
                  {task.milestone.split(":")[0]}
                </span>
              </div>

              {/* Progress */}
              <div className="col-span-1 space-y-1 mt-1 md:mt-0">
                <span className="text-[10px] font-mono text-[#615d59] block">
                  {task.progressPct}%
                </span>
                <Progress value={task.progressPct} className="h-1" />
              </div>

              {/* Status & Desktop Arrow */}
              <div className="col-span-2 hidden md:flex items-center justify-end gap-2">
                <StatusBadge status={task.status} atRisk={task.atRisk} />
                <ChevronRight className="w-3.5 h-3.5 text-[#a39e98]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
