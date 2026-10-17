"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  GitBranch,
  Filter,
  Bot,
} from "lucide-react";
import { Task, User as TeamUser, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PingDialog } from "./ping-dialog";
import { ResolveDialog } from "./resolve-dialog";

interface BlockerRadarProps {
  tasks: Task[];
  users: TeamUser[];
  onSendPing: (userId: string, text: string) => Promise<void>;
  onResolveBlocker: (taskId: string, note?: string) => Promise<void>;
  onInspectTask: (task: Task) => void;
}

export function BlockerRadar({
  tasks,
  onSendPing,
  onResolveBlocker,
  onInspectTask,
}: BlockerRadarProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedTaskForPing, setSelectedTaskForPing] = useState<Task | null>(null);
  const [selectedTaskForResolve, setSelectedTaskForResolve] = useState<Task | null>(null);

  // Extract all blocked tasks
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");

  // Calculate downstream tasks affected by blockers
  const downstreamAtRisk = tasks.filter(
    (t) => t.at_risk && t.status !== "Blocked"
  );

  const severityColors: Record<Priority, { bg: string; text: string; border: string }> = {
    Critical: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
    High: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
    Medium: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    Low: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  };

  const filteredBlockers = blockedTasks.filter((t) => {
    if (severityFilter === "all") return true;
    return (t.priority || "Critical") === severityFilter;
  });

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Stalls</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-950 dark:text-rose-100">
              {blockedTasks.length}
            </span>
            <span className="text-xs text-rose-700/80 dark:text-rose-400">
              critical bottleneck{blockedTasks.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Impeded Downstream</span>
            <GitBranch className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-950 dark:text-amber-100">
              {downstreamAtRisk.length}
            </span>
            <span className="text-xs text-amber-700/80 dark:text-amber-400">
              deliverables at risk
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-800 dark:text-blue-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Automated Nudges</span>
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-950 dark:text-blue-100">
              {blockedTasks.reduce((acc, t) => acc + (t.followup_count || 0), 0) + 1}
            </span>
            <span className="text-xs text-blue-700/80 dark:text-blue-400">
              pings sent to unblockers
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Longest Stalled</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-100">
              {blockedTasks.length > 0 ? "48h" : "0h"}
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400">
              payment API bottleneck
            </span>
          </div>
        </div>
      </div>

      {/* Filter header */}
      <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Active Impediment Radar
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Isolates blockers identified by Gemini from teammate chat and orchestrates resolution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-md border border-[#e6e6e6] bg-white px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Blocker Cards List */}
      <div className="space-y-4">
        {filteredBlockers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e6e6e6] p-12 text-center dark:border-zinc-800">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              No active blockers!
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              All deliverables are moving smoothly. If a teammate mentions a blocker on Telegram, it will appear here instantly.
            </p>
          </div>
        ) : (
          filteredBlockers.map((task) => {
            const priority = task.priority || "Critical";
            const colors = severityColors[priority] || severityColors.Critical;
            const dependentDeliverables = (task.dependents || [])
              .map((id) => tasks.find((t) => t.id === id))
              .filter(Boolean) as Task[];

            return (
              <div
                key={task.id}
                className="rounded-xl border border-[#e6e6e6] bg-white p-5 shadow-xs hover:border-zinc-300 transition-all dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        colors.bg,
                        colors.text,
                        colors.border
                      )}
                    >
                      {priority} Severity
                    </span>
                    <h4
                      onClick={() => onInspectTask(task)}
                      className="text-sm font-semibold text-zinc-900 hover:text-[#2383e2] dark:text-zinc-100 cursor-pointer"
                    >
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Assigned to:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {task.owner_name}
                    </span>
                  </div>
                </div>

                {/* Impediment content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Blocker Description */}
                  <div className="rounded-lg bg-rose-50/70 p-3.5 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-300 font-semibold text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Identified Blocker</span>
                    </div>
                    <p className="font-mono text-rose-800 dark:text-rose-200 text-xs">
                      &quot;{task.blocker_text}&quot;
                    </p>
                    <div className="text-[11px] text-rose-700/80 dark:text-rose-400 pt-1">
                      Reported via Telegram by <strong>{task.owner_name}</strong>
                    </div>
                  </div>

                  {/* Impact & Unblocker Routing */}
                  <div className="rounded-lg bg-[#fafaf9] p-3.5 border border-[#e6e6e6] dark:bg-zinc-900/60 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                      <GitBranch className="h-3.5 w-3.5 text-[#2383e2]" />
                      <span>Ripple Impact & Mitigation</span>
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-xs">
                      {dependentDeliverables.length > 0 ? (
                        <div>
                          Stalling downstream:{" "}
                          <strong className="text-amber-800 dark:text-amber-300 font-medium">
                            {dependentDeliverables.map((d) => `${d.title} (${d.owner_name})`).join(", ")}
                          </strong>
                        </div>
                      ) : (
                        <span>No immediate downstream tasks stalled.</span>
                      )}
                    </div>
                    {task.blocker_owner_name && (
                      <div className="text-[11px] text-[#2383e2] pt-1 font-medium">
                        Bot routed notification to: <strong>{task.blocker_owner_name}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>Next scheduled follow-up: in 4 hours</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ping Unblocker Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTaskForPing(task)}
                      className="text-xs gap-1.5 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    >
                      <Send className="h-3 w-3 text-[#2383e2]" />
                      Ping Owner / Unblocker
                    </Button>

                    {/* Resolve Blocker Button */}
                    <Button
                      size="sm"
                      onClick={() => setSelectedTaskForResolve(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve Blocker
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ping Modal */}
      {selectedTaskForPing && (
        <PingDialog
          isOpen={Boolean(selectedTaskForPing)}
          onClose={() => setSelectedTaskForPing(null)}
          targetUser={{
            id: selectedTaskForPing.owner_id || "",
            name: selectedTaskForPing.owner_name || "Teammate",
          }}
          taskTitle={selectedTaskForPing.title}
          defaultText={
            selectedTaskForPing.blocker_text
              ? `Hi ${selectedTaskForPing.owner_name}, checking on your blocker: "${selectedTaskForPing.blocker_text}". Has this been resolved?`
              : undefined
          }
          onSendPing={onSendPing}
        />
      )}

      {/* Resolve Modal */}
      {selectedTaskForResolve && (
        <ResolveDialog
          isOpen={Boolean(selectedTaskForResolve)}
          onClose={() => setSelectedTaskForResolve(null)}
          task={selectedTaskForResolve}
          onConfirmResolve={onResolveBlocker}
        />
      )}
    </div>
  );
}
