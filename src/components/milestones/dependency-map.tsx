"use client";

import React from "react";
import {
  ArrowRight,
  ShieldAlert,
  Clock,
  GitBranch,
} from "lucide-react";
import { evaluateMilestoneRisk, CURRENT_MOCK_DATE } from "@/lib/mock-milestones";
import type { Milestone } from "@/types/milestone";

interface DependencyMapProps {
  milestones: Milestone[];
  onSelectMilestone: (milestone: Milestone) => void;
  onOpenTaskDrawer: (taskId: string) => void;
}

export function DependencyMap({
  milestones,
  onSelectMilestone,
  onOpenTaskDrawer,
}: DependencyMapProps) {
  // Find milestones by code
  const mls01 = milestones.find((m) => m.code === "MLS-01");
  const mls02 = milestones.find((m) => m.code === "MLS-02");
  const mls03 = milestones.find((m) => m.code === "MLS-03");
  const mls04 = milestones.find((m) => m.code === "MLS-04");
  const mls05 = milestones.find((m) => m.code === "MLS-05");


  return (
    <div className="space-y-4">
      {/* Visual Legend & Guidance Banner */}
      <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2 text-[#615d59]">
          <GitBranch className="w-4 h-4 text-[#0075de]" />
          <span className="font-semibold text-[#000000]">Dependency Relationship Legend:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1aae39]" />
            <span className="text-[#615d59]">Completed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0075de]" />
            <span className="text-[#615d59]">In Progress</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dd5b00]" />
            <span className="text-[#dd5b00] font-semibold">Blocked Dependency</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6941c6]" />
            <span className="text-[#6941c6] font-semibold">Waiting on Prerequisite</span>
          </div>
        </div>
      </div>

      {/* Critical Blocker Chain Callout */}
      <div className="p-3 bg-orange-50/70 border border-[#dd5b00]/30 rounded-xl space-y-1.5 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-[#dd5b00] font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Active Prerequisite Blocker Chain Detected</span>
        </div>
        <p className="text-[#31302e] leading-relaxed">
          <strong className="text-[#000000]">Chain:</strong> Task{" "}
          <button
            type="button"
            onClick={() => onOpenTaskDrawer("00000000-0000-0000-0002-000000000001")}
            className="font-mono text-[#0075de] font-bold underline hover:text-[#005bab] cursor-pointer"
          >
            TSK-01
          </button>{" "}
          (Blocked: waiting for credentials) directly prevents downstream task{" "}
          <button
            type="button"
            onClick={() => onOpenTaskDrawer("00000000-0000-0000-0002-000000000002")}
            className="font-mono text-[#6941c6] font-bold underline hover:text-[#4a154b] cursor-pointer"
          >
            TSK-02
          </button>{" "}
          from starting, which in turn stalls milestone <strong className="text-[#000000]">MLS-05 (Demo Readiness)</strong>.
        </p>
      </div>

      {/* Horizontally Scrollable Dependency Canvas */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[900px] p-4 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-6">
          <div className="grid grid-cols-4 gap-4 items-start">
            {/* COLUMN 1: Stage 1 (Foundation) */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#615d59] uppercase tracking-wider pb-1 border-b border-[#e6e6e6]">
                Phase 1: Foundation (Oct 15)
              </div>

              {mls01 && (
                <MilestoneNodeCard
                  milestone={mls01}
                  onSelectMilestone={onSelectMilestone}
                  onOpenTaskDrawer={onOpenTaskDrawer}
                />
              )}
            </div>

            {/* COLUMN 2: Stage 2 (Core Integrations & AI) */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-[#615d59] uppercase tracking-wider pb-1 border-b border-[#e6e6e6]">
                Phase 2: Core &amp; AI (Oct 22 - 24)
              </div>

              {mls02 && (
                <MilestoneNodeCard
                  milestone={mls02}
                  onSelectMilestone={onSelectMilestone}
                  onOpenTaskDrawer={onOpenTaskDrawer}
                  prereqLabel="Depends on MLS-01"
                />
              )}

              {mls03 && (
                <MilestoneNodeCard
                  milestone={mls03}
                  onSelectMilestone={onSelectMilestone}
                  onOpenTaskDrawer={onOpenTaskDrawer}
                  prereqLabel="Depends on MLS-01"
                />
              )}
            </div>

            {/* COLUMN 3: Stage 3 (UI & Dashboards) */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#615d59] uppercase tracking-wider pb-1 border-b border-[#e6e6e6]">
                Phase 3: Experience (Oct 25)
              </div>

              {mls04 && (
                <MilestoneNodeCard
                  milestone={mls04}
                  onSelectMilestone={onSelectMilestone}
                  onOpenTaskDrawer={onOpenTaskDrawer}
                  prereqLabel="Depends on MLS-02"
                />
              )}
            </div>

            {/* COLUMN 4: Stage 4 (Demo Readiness) */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#615d59] uppercase tracking-wider pb-1 border-b border-[#e6e6e6]">
                Phase 4: Capstone (Oct 29)
              </div>

              {mls05 && (
                <MilestoneNodeCard
                  milestone={mls05}
                  onSelectMilestone={onSelectMilestone}
                  onOpenTaskDrawer={onOpenTaskDrawer}
                  prereqLabel="Depends on MLS-03 & MLS-04"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MilestoneNodeCardProps {
  milestone: Milestone;
  prereqLabel?: string;
  onSelectMilestone: (milestone: Milestone) => void;
  onOpenTaskDrawer: (taskId: string) => void;
}

function MilestoneNodeCard({
  milestone,
  prereqLabel,
  onSelectMilestone,
  onOpenTaskDrawer,
}: MilestoneNodeCardProps) {
  const riskEval = evaluateMilestoneRisk(milestone, CURRENT_MOCK_DATE);

  return (
    <div
      className={`p-3 bg-[#f6f5f4]/50 rounded-xl border transition-all hover:bg-white hover:border-[#0075de]/40 shadow-xs space-y-2.5 ${
        riskEval.riskLevel === "Critical"
          ? "border-red-300 bg-red-50/20"
          : riskEval.riskLevel === "High"
          ? "border-orange-300 bg-orange-50/20"
          : riskEval.riskLevel === "Medium"
          ? "border-amber-300 bg-amber-50/20"
          : milestone.status === "Completed"
          ? "border-green-300 bg-green-50/20"
          : "border-[#e6e6e6]"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] font-bold bg-white text-[#000000] px-1.5 py-0.5 rounded border border-[#e6e6e6] shrink-0">
            {milestone.code}
          </span>
          <span className="font-bold text-xs text-[#000000] truncate" title={milestone.name}>
            {milestone.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelectMilestone(milestone)}
          className="text-[10px] text-[#0075de] hover:underline cursor-pointer font-medium"
        >
          Details
        </button>
      </div>

      {prereqLabel && (
        <div className="text-[10px] text-[#615d59] flex items-center gap-1 font-mono">
          <ArrowRight className="w-2.5 h-2.5 text-[#a39e98]" />
          <span>{prereqLabel}</span>
        </div>
      )}

      {/* Task Dependency Nodes Inside Milestone */}
      <div className="space-y-1.5 pt-1 border-t border-[#e6e6e6]/60">
        {milestone.commitments.map((task) => {
          const isBlocked = task.status === "Blocked";
          const isWaitingOnPrereq =
            task.prerequisiteTaskCodes && task.prerequisiteTaskCodes.length > 0;

          return (
            <div
              key={task.taskId}
              onClick={() => onOpenTaskDrawer(task.taskId)}
              className={`p-1.5 rounded-md border text-[11px] cursor-pointer transition-all ${
                isBlocked
                  ? "bg-orange-50 border-[#dd5b00]/40 text-[#dd5b00] hover:bg-orange-100/70"
                  : isWaitingOnPrereq
                  ? "bg-purple-50/70 border-purple-200 text-purple-900 hover:bg-purple-100/70"
                  : "bg-white border-[#e6e6e6] text-[#000000] hover:border-[#0075de]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-[10px]">{task.code}</span>
                <span className="text-[10px] text-[#615d59] truncate max-w-[90px]">
                  {task.ownerName}
                </span>
              </div>

              <div className="truncate font-medium text-[#000000]">{task.title}</div>

              {isBlocked && (
                <div className="text-[9px] text-[#dd5b00] font-semibold flex items-center gap-0.5 mt-0.5">
                  <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">Blocked: {task.blockerText || "Impediment"}</span>
                </div>
              )}

              {isWaitingOnPrereq && (
                <div className="text-[9px] text-purple-700 font-semibold flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span>Waiting on {task.prerequisiteTaskCodes?.join(", ")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
