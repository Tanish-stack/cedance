"use client";

import React, { useState } from "react";
import {
  Filter,
  AlertTriangle,
  Send,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CommitmentsLedgerProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNudgeOwner: (taskId: string) => Promise<void>;
  onResolveBlocker: (taskId: string) => void;
  searchQuery: string;
}

export function CommitmentsLedger({
  tasks,
  onSelectTask,
  onNudgeOwner,
  onResolveBlocker,
  searchQuery,
}: CommitmentsLedgerProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const statuses: TaskStatus[] = [
    "Assigned",
    "In Progress",
    "Blocked",
    "Pending Verification",
    "Needs Rework",
    "Complete",
  ];

  // Count metrics
  const counts = {
    all: tasks.length,
    Assigned: tasks.filter((t) => t.status === "Assigned").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Blocked: tasks.filter((t) => t.status === "Blocked").length,
    "Pending Verification": tasks.filter((t) => t.status === "Pending Verification").length,
    "Needs Rework": tasks.filter((t) => t.status === "Needs Rework").length,
    Complete: tasks.filter((t) => t.status === "Complete").length,
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesOwner = ownerFilter === "all" || task.owner_name === ownerFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.owner_name && task.owner_name.toLowerCase().includes(q)) ||
      (task.blocker_text && task.blocker_text.toLowerCase().includes(q));

    return matchesStatus && matchesOwner && matchesSearch;
  });

  const uniqueOwners = Array.from(new Set(tasks.map((t) => t.owner_name).filter(Boolean)));

  const statusStyles: Record<TaskStatus, { badge: string; dot: string }> = {
    "Assigned": { badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", dot: "bg-zinc-400" },
    "In Progress": { badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", dot: "bg-blue-500" },
    "Blocked": { badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-semibold", dot: "bg-rose-500" },
    "Pending Verification": { badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", dot: "bg-purple-500" },
    "Needs Rework": { badge: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300", dot: "bg-amber-500" },
    "Complete": { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", dot: "bg-emerald-500" },
  };

  return (
    <div className="flex flex-col flex-1 p-6 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e6e6] pb-3.5 dark:border-zinc-800">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-400"
            )}
          >
            All <span className="ml-1 opacity-70">({counts.all})</span>
          </button>

          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5",
                statusFilter === st
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-400"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", statusStyles[st].dot)} />
              <span>{st}</span>
              <span className="opacity-70 text-xs">({counts[st] || 0})</span>
            </button>
          ))}
        </div>

        {/* Owner Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="all">All Assignees</option>
            {uniqueOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-lg border border-[#e6e6e6] bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#e6e6e6] bg-[#fafaf9] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="py-3 pl-4 pr-2 text-xs font-semibold uppercase tracking-wider w-36">Status</th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider">Deliverable & Acceptance</th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider w-32">Owner</th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider w-40">Progress</th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider w-28">Deadline</th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider w-24">Risk</th>
              <th className="py-3 pl-2 pr-4 text-xs font-semibold uppercase tracking-wider text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e6e6] dark:divide-zinc-800">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400 text-sm">
                  No commitments match your current filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const style = statusStyles[task.status] || statusStyles["Assigned"];

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group hover:bg-[#fbfbfa] dark:hover:bg-zinc-900/60 cursor-pointer transition-colors"
                  >
                    {/* Status Badge */}
                    <td className="py-3.5 pl-4 pr-2 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          style.badge
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                        {task.status}
                      </span>
                    </td>

                    {/* Title & Criteria */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {task.title}
                          </span>
                          {(task.dependencies || []).length > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 text-xs text-zinc-400"
                              title="Has upstream prerequisites"
                            >
                              <GitBranch className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        {task.status === "Blocked" && task.blocker_text ? (
                          <span className="text-xs text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                            ⛔ Blocker: {task.blocker_text}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            Done means: {task.acceptance_criteria || "Standard review"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">
                        {task.owner_name || "Unassigned"}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              task.status === "Complete"
                                ? "bg-emerald-500"
                                : task.status === "Blocked"
                                ? "bg-rose-500"
                                : "bg-[#2383e2]"
                            )}
                            style={{ width: `${task.progress_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {task.progress_pct}%
                        </span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {task.deadline ? task.deadline.slice(5) : "—"}
                    </td>

                    {/* Risk Tag */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {task.at_risk ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <AlertTriangle className="h-3 w-3" />
                          At Risk
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">On Track</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-2 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                        {task.status === "Blocked" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onResolveBlocker(task.id);
                            }}
                            className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNudgeOwner(task.id);
                            }}
                            title="Nudge owner on Telegram"
                          >
                            <Send className="h-3.5 w-3.5 text-zinc-500 hover:text-[#2383e2]" />
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
