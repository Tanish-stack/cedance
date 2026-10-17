"use client";

import React from "react";
import {
  ListTodo,
  AlertTriangle,
  GitFork,
  Radio,
  History,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveTab =
  | "ledger"
  | "blockers"
  | "milestones"
  | "stream"
  | "audit";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  counts: {
    total: number;
    blocked: number;
    atRisk: number;
    stream: number;
  };
  backendOnline: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  counts,
  backendOnline,
}: SidebarProps) {
  const navItems = [
    {
      id: "ledger" as ActiveTab,
      label: "Commitments Ledger",
      icon: ListTodo,
      badge: counts.total,
      badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    },
    {
      id: "blockers" as ActiveTab,
      label: "Blocker Radar",
      icon: AlertTriangle,
      badge: counts.blocked,
      badgeColor:
        counts.blocked > 0
          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800",
    },
    {
      id: "milestones" as ActiveTab,
      label: "Milestones & Risk",
      icon: GitFork,
      badge: counts.atRisk > 0 ? `${counts.atRisk} at risk` : undefined,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium",
    },
    {
      id: "stream" as ActiveTab,
      label: "Stream Ingestion",
      icon: Radio,
      badge: counts.stream,
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      id: "audit" as ActiveTab,
      label: "Agent Audit Timeline",
      icon: History,
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#e6e6e6] bg-[#fbfbfa] dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Workspace Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-[#e6e6e6] dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#2383e2] text-white font-bold text-xs shadow-xs">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                Cadance / Core Team
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                AI Coordinator · Spring 26
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-[#2383e2] text-white text-xs font-bold">
            C
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!collapsed && (
          <div className="px-2 pb-1.5 pt-1 text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
            Coordination Core
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                isActive
                  ? "bg-[#efefed] text-zinc-950 font-semibold dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-[#f4f4f2] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-[#2383e2]" : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500"
                )}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-1.5 py-0.2 text-[10px]",
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bot & Service Status Footer */}
      <div className="border-t border-[#e6e6e6] dark:border-zinc-800 p-2.5">
        {!collapsed ? (
          <div className="rounded-lg bg-white p-2.5 border border-[#e6e6e6] dark:bg-zinc-900 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                <Bot className="h-3.5 w-3.5 text-[#2383e2]" />
                <span>Telegram Bot</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>Classifier Engine</span>
              <span className="flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                Gemini 2.5
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5 border-t border-zinc-100 dark:border-zinc-800">
              <span>Backend API</span>
              <span className={cn("font-medium", backendOnline ? "text-emerald-600" : "text-amber-600")}>
                {backendOnline ? ":3001 Live" : "Fallback Mode"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Backend: Online | Bot: Polling">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
}
