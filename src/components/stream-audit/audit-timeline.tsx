"use client";

import React from "react";
import {
  History,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Cpu,
  Clock,
} from "lucide-react";
import { TaskEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AuditTimelineProps {
  events: TaskEvent[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  const sourceIcons: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
    llm: {
      icon: <Sparkles className="h-3.5 w-3.5 text-purple-600" />,
      label: "Gemini LLM Classifier",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    },
    manager: {
      icon: <UserCheck className="h-3.5 w-3.5 text-amber-600" />,
      label: "Manager Governance",
      badge: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
    },
    system: {
      icon: <Cpu className="h-3.5 w-3.5 text-blue-600" />,
      label: "State Machine Engine",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    },
  };

  const statusColors: Record<string, string> = {
    "Assigned": "bg-zinc-100 text-zinc-700",
    "In Progress": "bg-blue-50 text-blue-700",
    "Blocked": "bg-rose-100 text-rose-800 font-semibold",
    "Pending Verification": "bg-purple-50 text-purple-700",
    "Needs Rework": "bg-amber-100 text-amber-800",
    "Complete": "bg-emerald-50 text-emerald-700 font-semibold",
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col flex-1 p-6 space-y-5 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#2383e2]" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Agent State Mutation Audit Trail
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Immutable ledger strictly separating teammate statements from verified database state mutations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Audit Integrity Enforced</span>
        </div>
      </div>

      {/* Timeline items */}
      <div className="relative border-l-2 border-[#e6e6e6] ml-4 pl-6 space-y-6 dark:border-zinc-800">
        {sortedEvents.length === 0 ? (
          <div className="text-xs text-zinc-400 py-6">No mutation events recorded yet.</div>
        ) : (
          sortedEvents.map((evt, idx) => {
            const sourceInfo = sourceIcons[evt.source] || sourceIcons.system;

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#2383e2] dark:bg-zinc-950" />

                <div className="rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950 space-y-2 hover:border-zinc-300 transition-all">
                  {/* Top metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          sourceInfo.badge
                        )}
                      >
                        {sourceInfo.icon}
                        <span>{sourceInfo.label}</span>
                      </span>

                      {evt.task_title && (
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {evt.task_title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(evt.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Transition display */}
                  {(evt.old_status || evt.new_status) && (
                    <div className="flex items-center gap-2 text-xs pt-1">
                      {evt.old_status && (
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[11px] font-medium",
                            statusColors[evt.old_status] || "bg-zinc-100"
                          )}
                        >
                          {evt.old_status}
                        </span>
                      )}

                      {evt.old_status && evt.new_status && (
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      )}

                      {evt.new_status && (
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[11px] font-medium",
                            statusColors[evt.new_status] || "bg-zinc-100"
                          )}
                        >
                          {evt.new_status}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reason text */}
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono bg-[#fafaf9] dark:bg-zinc-900/60 p-2.5 rounded border border-zinc-200/60 dark:border-zinc-800">
                    &quot;{evt.reason || "Status mutation executed"}&quot;
                  </p>

                  {/* Confidence metrics */}
                  {evt.confidence !== null && evt.confidence !== undefined && (
                    <div className="flex items-center justify-end text-[10px] text-zinc-400 font-mono">
                      Confidence metric: {(evt.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
