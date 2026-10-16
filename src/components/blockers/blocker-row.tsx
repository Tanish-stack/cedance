"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BlockedTask, BlockerSeverity } from "@/types/task";

interface BlockerRowProps {
  task: BlockedTask;
  onSelect: (task: BlockedTask) => void;
  onResolve: (task: BlockedTask) => void;
  onPing: (task: BlockedTask) => void;
}

const SEVERITY_CONFIG: Record<
  BlockerSeverity,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Critical: {
    label: "Critical",
    badgeClass: "bg-[#dd5b00]/15 text-[#793400] border-[#dd5b00]/40 font-bold",
    dotClass: "bg-[#dd5b00]",
  },
  High: {
    label: "High",
    badgeClass: "bg-[#dd5b00]/10 text-[#dd5b00] border-[#dd5b00]/30 font-semibold",
    dotClass: "bg-[#dd5b00]",
  },
  Medium: {
    label: "Medium",
    badgeClass: "bg-[#213183]/10 text-[#213183] border-[#213183]/30 font-medium",
    dotClass: "bg-[#213183]",
  },
  Low: {
    label: "Low",
    badgeClass: "bg-[#615d59]/10 text-[#31302e] border-[#615d59]/30 font-medium",
    dotClass: "bg-[#615d59]",
  },
};

export function BlockerRow({
  task,
  onSelect,
  onResolve,
  onPing,
}: BlockerRowProps) {
  const sevConfig = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.Medium;

  return (
    <div
      onClick={() => onSelect(task)}
      className="p-4 bg-white rounded-xl border border-[#e6e6e6] hover:border-[#a39e98]/60 shadow-xs transition-all cursor-pointer space-y-3 group select-none"
    >
      {/* Top Header: ID, Title, Severity Badge, Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] font-semibold text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded border border-[#e6e6e6] shrink-0">
            {task.code}
          </span>
          <h3 className="text-sm font-bold text-[#000000] group-hover:text-[#0075de] transition-colors truncate">
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Severity Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${sevConfig.badgeClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${sevConfig.dotClass}`}
            />
            {task.severity}
          </span>

          <StatusBadge status={task.status} atRisk={task.atRisk} />
        </div>
      </div>

      {/* Middle Block: Blocker Description & Missing Dependency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs bg-[#f6f5f4]/80 p-3 rounded-lg border border-[#e6e6e6]">
        {/* Blocker quote */}
        <div className="lg:col-span-7 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dd5b00]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Reported Blocker:</span>
          </div>
          <p className="text-xs text-[#000000] italic font-medium leading-relaxed">
            &ldquo;{task.blockerText}&rdquo;
          </p>
        </div>

        {/* Missing Dependency */}
        <div className="lg:col-span-5 space-y-1 lg:border-l lg:border-[#e6e6e6] lg:pl-3">
          <span className="text-[11px] font-semibold text-[#615d59] block">
            Required Unblock Action:
          </span>
          <p className="text-xs text-[#31302e] leading-snug">
            {task.missingDependency}
          </p>
        </div>
      </div>

      {/* Bottom Row: Metadata (Owner, Age, Escalation, Last Activity) & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        {/* Metadata badges */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#615d59]">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5 border border-[#e6e6e6]">
              <AvatarFallback className="text-[9px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                {task.ownerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-[#000000]">{task.ownerName}</span>
          </div>

          <span className="text-[#e6e6e6]">•</span>

          {/* Blocker Age */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#a39e98]" />
            <span>Age: <strong className="text-[#000000]">{task.blockerDetectedAt}</strong></span>
          </div>

          <span className="text-[#e6e6e6]">•</span>

          {/* Escalation Status */}
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-black/5 text-[#31302e] font-medium text-[10px]">
              {task.escalationStatus}
            </span>
          </div>

          <span className="text-[#e6e6e6] hidden md:inline">•</span>

          {/* Last Activity */}
          <span className="text-[10px] text-[#a39e98] hidden md:inline truncate max-w-[200px]">
            Activity: {task.lastUpdateAt}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPing(task)}
            className="h-7 text-xs border-[#e6e6e6] text-[#31302e] hover:text-[#000000] gap-1 px-2.5"
          >
            <Send className="w-3 h-3 text-[#0075de]" />
            <span>Ping Owner</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onResolve(task)}
            className="h-7 text-xs bg-[#dd5b00] hover:bg-[#dd5b00]/90 text-white font-medium rounded-full px-3 gap-1 shadow-xs"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolve Blocker</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(task)}
            className="h-7 w-7 text-[#a39e98] hover:text-[#000000]"
            aria-label="Inspect task details"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
