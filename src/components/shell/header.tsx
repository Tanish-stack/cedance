"use client";

import React from "react";
import {
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveTab } from "./sidebar";

interface HeaderProps {
  activeTab: ActiveTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewCommitment: () => void;
  onRefresh: () => void;
  onOpenDemoDrawer: () => void;
  isSyncing: boolean;
  realtimeActive: boolean;
}

export function Header({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenNewCommitment,
  onRefresh,
  onOpenDemoDrawer,
  isSyncing,
  realtimeActive,
}: HeaderProps) {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    ledger: {
      title: "Commitments Ledger",
      subtitle: "Deterministic deliverables, ownership boundaries, and verified criteria",
    },
    blockers: {
      title: "Blocker Radar",
      subtitle: "Automated impediment isolation, unblocker nudging, and ripple mitigation",
    },
    milestones: {
      title: "Milestones & Risk Map",
      subtitle: "Critical path analysis, precedence validation, and forward forecast",
    },
    stream: {
      title: "Stream Ingestion Feed",
      subtitle: "Raw Telegram chat parsing, LLM intent extraction, and confidence metrics",
    },
    audit: {
      title: "Agent Audit Timeline",
      subtitle: "Tamper-evident log distinguishing raw member statements from validated state mutations",
    },
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#e6e6e6] bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Left: Module Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {titles[activeTab].title}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Verified Loop
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 truncate max-w-sm hidden md:inline">
            {titles[activeTab].subtitle}
          </span>
        </div>
      </div>

      {/* Right: Search, Realtime status, Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative hidden lg:block w-48">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, owners..."
            className="h-8 w-full rounded-md border border-[#e6e6e6] bg-[#fbfbfa] pl-8 pr-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-[#2383e2] focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>

        {/* Realtime Subscription Indicator */}
        <div
          className="flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          title={realtimeActive ? "Supabase Realtime feed connected" : "Polling sync active (every 4s)"}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              realtimeActive ? "bg-emerald-500 animate-pulse" : "bg-sky-500"
            }`}
          />
          <span className="font-mono text-[10px]">
            {realtimeActive ? "Realtime" : "Sync Active"}
          </span>
        </div>

        {/* Sync / Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e6e6e6] bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Refresh data from server"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-[#2383e2]" : ""}`} />
        </button>

        {/* Quick Demo Rehearsal Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDemoDrawer}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium border-amber-200 bg-amber-50/60 text-amber-900 hover:bg-amber-100/70 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <Zap className="h-3 w-3 text-amber-600 fill-amber-500" />
          <span>Simulate Telegram</span>
        </Button>

        {/* New Commitment Button */}
        <Button
          size="sm"
          onClick={onOpenNewCommitment}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#2383e2] hover:bg-[#1a73cb] text-white shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Commitment</span>
        </Button>

        {/* Manager User Avatar */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-white shadow-2xs"
          title="Adii (Project Manager)"
        >
          A
        </div>
      </div>
    </header>
  );
}
