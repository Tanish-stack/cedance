"use client";

import React, { useState } from "react";
import {
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  Share2,
} from "lucide-react";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MilestonesMapProps {
  tasks: Task[];
  onInspectTask: (task: Task) => void;
  onOpenNewCommitment?: () => void;
}

export function MilestonesMap({
  tasks,
  onInspectTask,
}: MilestonesMapProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "dependency">("timeline");

  // Group deliverables by Milestone
  const milestones = [
    {
      id: "m1",
      name: "M1: Payments & Core API Integration",
      targetDate: "Oct 22, 2026",
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes("payment") ||
          (t.milestone && t.milestone.includes("M1"))
      ),
    },
    {
      id: "m2",
      name: "M2: Storefront, UI & Checkout Flow",
      targetDate: "Oct 24, 2026",
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes("checkout") ||
          (t.milestone && t.milestone.includes("M2"))
      ),
    },
    {
      id: "m3",
      name: "M3: Production Infra, CI/CD & Launch",
      targetDate: "Oct 25, 2026",
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes("ci/cd") ||
          t.title.toLowerCase().includes("readme") ||
          (t.milestone && t.milestone.includes("M3"))
      ),
    },
  ];

  // Calculate overall project health score
  const completedTasks = tasks.filter((t) => t.status === "Complete").length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;
  const atRiskTasks = tasks.filter((t) => t.at_risk).length;

  const healthScore = Math.max(
    20,
    100 - blockedTasks * 25 - atRiskTasks * 15 + completedTasks * 10
  );

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Health & Strategy Banner */}
      <div className="rounded-xl border border-[#e6e6e6] bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Project Delivery Health Engine
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                healthScore >= 75
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : healthScore >= 50
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              )}
            >
              Health Score: {healthScore}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {blockedTasks > 0
              ? `${blockedTasks} deliverable is currently blocked, cascading At Risk alerts onto dependent tasks.`
              : "All deliverable dependencies are aligned and within scheduled tolerance."}
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-[#e6e6e6] p-1 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
              viewMode === "timeline"
                ? "bg-white text-zinc-900 shadow-2xs font-semibold dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Timeline Tracks</span>
          </button>
          <button
            onClick={() => setViewMode("dependency")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
              viewMode === "dependency"
                ? "bg-white text-zinc-900 shadow-2xs font-semibold dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Dependency Graph</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "timeline" ? (
        <div className="space-y-6">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-[#e6e6e6] bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2383e2]/10 text-[#2383e2]">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {m.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Target: {m.targetDate}</span>
                </div>
              </div>

              {/* Tasks in Milestone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {m.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onInspectTask(task)}
                    className="flex flex-col justify-between rounded-lg border border-[#e6e6e6] bg-[#fafaf9] p-3 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {task.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          task.status === "Blocked"
                            ? "bg-rose-100 text-rose-800 font-semibold"
                            : task.status === "Complete"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-zinc-200/80 text-zinc-700"
                        )}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Owner: <strong className="text-zinc-800 dark:text-zinc-200">{task.owner_name}</strong>
                    </div>

                    {task.at_risk && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Upstream Blocker Impeding Delivery</span>
                      </div>
                    )}

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          task.status === "Blocked" ? "bg-rose-500" : "bg-[#2383e2]"
                        )}
                        style={{ width: `${task.progress_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dependency Map View */
        <div className="rounded-xl border border-[#e6e6e6] bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Directed Acyclic Graph (DAG) of project tasks showing prerequisite blockers cascading into downstream deliverables:
          </div>

          <div className="space-y-6">
            {/* Dependency Group 1: Payment Module */}
            <div className="rounded-lg border border-zinc-200/80 bg-[#fbfbfa] p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Chain 1: Payment Core Flow
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Node 1 */}
                <div className="flex flex-col rounded-lg border-2 border-rose-400 bg-rose-50/80 p-3 text-xs w-60 dark:bg-rose-950/40">
                  <div className="flex items-center justify-between text-rose-900 dark:text-rose-200 font-semibold mb-1">
                    <span>Connect payment API</span>
                    <span className="text-[10px] bg-rose-200/80 dark:bg-rose-900 px-1.5 py-0.2 rounded font-bold">
                      BLOCKED
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Owner: Kabir</span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 mt-1 font-mono">
                    ⚠️ Waiting for test credentials
                  </span>
                </div>

                <ArrowRight className="h-5 w-5 text-rose-500 animate-pulse" />

                {/* Node 2 */}
                <div className="flex flex-col rounded-lg border-2 border-amber-300 bg-amber-50/70 p-3 text-xs w-60 dark:bg-amber-950/40">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-semibold mb-1">
                    <span>Write payment unit tests</span>
                    <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900 px-1.5 py-0.2 rounded font-bold">
                      AT RISK
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Owner: Kabir</span>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 mt-1">
                    Depends on API endpoint being live
                  </span>
                </div>
              </div>
            </div>

            {/* Dependency Group 2: Checkout Module */}
            <div className="rounded-lg border border-zinc-200/80 bg-[#fbfbfa] p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Chain 2: Checkout Storefront Flow
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Node 1 */}
                <div className="flex flex-col rounded-lg border border-blue-300 bg-blue-50/80 p-3 text-xs w-60 dark:bg-blue-950/40">
                  <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-semibold mb-1">
                    <span>Design checkout page</span>
                    <span className="text-[10px] bg-blue-200/80 dark:bg-blue-900 px-1.5 py-0.2 rounded">
                      In Progress
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Owner: Aisha (70%)</span>
                </div>

                <ArrowRight className="h-5 w-5 text-blue-400" />

                {/* Node 2 */}
                <div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs w-60 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-zinc-800 dark:text-zinc-200 font-semibold mb-1">
                    <span>Build checkout frontend</span>
                    <span className="text-[10px] bg-zinc-200 px-1.5 py-0.2 rounded">
                      Assigned
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Owner: Aisha</span>
                  <span className="text-[10px] text-zinc-400 mt-1">
                    Awaiting approved Figma design
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
