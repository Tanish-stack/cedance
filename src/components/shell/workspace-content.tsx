"use client";

import React, { useState } from "react";
import {
  Inbox,
  ShieldAlert,
  Bot,
  Target,
  Settings,
  Plus,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CommitmentsTable } from "@/components/ledger/commitments-table";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { MOCK_COMMITMENTS } from "@/lib/mock-tasks";
import type { CommitmentTask } from "@/types/task";
import type { NavItemKey } from "./sidebar";

interface WorkspaceContentProps {
  activeItem: NavItemKey;
}

export function WorkspaceContent({ activeItem }: WorkspaceContentProps) {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {activeItem === "commitments-ledger" && <CommitmentsLedgerShell />}
      {activeItem === "ingest-stream" && <IngestStreamShell />}
      {activeItem === "blocker-radar" && <BlockerRadarShell />}
      {activeItem === "agent-audit" && <AgentAuditShell />}
      {activeItem === "milestones" && <MilestonesShell />}
      {activeItem === "settings" && <SettingsShell />}
    </main>
  );
}

/**
 * Interactive Commitments Ledger View with Commitment Details Drawer
 */
function CommitmentsLedgerShell() {
  const [tasks, setTasks] = useState<CommitmentTask[]>(MOCK_COMMITMENTS);
  const [selectedTask, setSelectedTask] = useState<CommitmentTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Compute live summary from tasks state
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const blockedCount = tasks.filter((t) => t.status === "Blocked").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending Verification").length;
  const completeCount = tasks.filter((t) => t.status === "Complete").length;

  const MOCK_SUMMARY = [
    { label: "Active Commitments", count: tasks.length, status: null },
    { label: "In Progress", count: inProgressCount, status: "In Progress" as const },
    { label: "Blocked", count: blockedCount, status: "Blocked" as const, atRisk: true },
    { label: "Pending Verification", count: pendingCount, status: "Pending Verification" as const },
    { label: "Complete", count: completeCount, status: "Complete" as const },
  ];

  function handleSelectTask(task: CommitmentTask) {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
  }

  function handleResolveBlocker(taskId: string) {
    // Semantic Rule: Resolving blocker does NOT mark task complete, it moves to 'In Progress'
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated: CommitmentTask = {
            ...t,
            status: "In Progress",
            atRisk: false,
            blockerText: null,
            blockerOwnerName: null,
            activityHistory: [
              ...t.activityHistory,
              {
                id: `act-resolve-${Date.now()}`,
                timestamp: "Just now",
                oldStatus: "Blocked",
                newStatus: "In Progress",
                reason: "Blocker resolved by manager. Re-entered 'In Progress' state.",
                source: "manager",
              },
            ],
          };
          // Also update currently selected task in drawer
          setSelectedTask(updated);
          return updated;
        }
        return t;
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6e6e6]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
            Commitments Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
            Click any commitment row to inspect ownership, AI interpretation, dependencies, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-[#e6e6e6] bg-white text-[#000000] hover:bg-[#f6f5f4]"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5 text-[#615d59]" />
            Filter
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white rounded-full font-medium px-3.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Commitment
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_SUMMARY.map((item, i) => (
          <div
            key={i}
            className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-1.5"
          >
            <span className="text-[11px] font-medium text-[#615d59] block truncate">
              {item.label}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#000000]">{item.count}</span>
              {item.status && <StatusBadge status={item.status} atRisk={item.atRisk} />}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Commitments Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider">
            All Commitments ({tasks.length})
          </span>
          <span className="text-[11px] text-[#a39e98]">
            Click row to view details
          </span>
        </div>

        <CommitmentsTable
          tasks={tasks}
          selectedTaskId={selectedTask?.id || null}
          onSelectTask={handleSelectTask}
        />
      </div>

      {/* Commitment Details Drawer */}
      <CommitmentDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onResolveBlocker={handleResolveBlocker}
      />
    </div>
  );
}

/**
 * Shell view for Ingest Stream
 */
function IngestStreamShell() {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-[#e6e6e6]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Ingest Stream
        </h1>
        <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
          Realtime bidirectional feed between Telegram teammates and the Gemini coordinator.
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-2 max-w-lg mx-auto">
        <Inbox className="w-8 h-8 text-[#0075de] mx-auto" />
        <h2 className="text-sm font-semibold text-[#000000]">Telegram Message Pipeline</h2>
        <p className="text-xs text-[#615d59]">
          Captures inbound responses, extracts progress percentage, identifies blockers, and logs proof of real human interactions.
        </p>
      </div>
    </div>
  );
}

/**
 * Shell view for Blocker Radar
 */
function BlockerRadarShell() {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-[#e6e6e6]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Blocker Radar
        </h1>
        <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
          Early detection of dependencies, stalled critical paths, and unblocker routing.
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#dd5b00]/30 shadow-xs text-center space-y-2 max-w-lg mx-auto">
        <ShieldAlert className="w-8 h-8 text-[#dd5b00] mx-auto" />
        <h2 className="text-sm font-semibold text-[#000000]">1 Active Blocker Detected</h2>
        <p className="text-xs text-[#615d59]">
          Task &ldquo;Connect the payment API&rdquo; is blocked waiting for test credentials. Downstream tasks flagged At Risk.
        </p>
      </div>
    </div>
  );
}

/**
 * Shell view for Agent Audit
 */
function AgentAuditShell() {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-[#e6e6e6]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Agent Decision Audit
        </h1>
        <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
          Verifiable audit trail of Gemini classifications, confidence scores, and state transitions.
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-2 max-w-lg mx-auto">
        <Bot className="w-8 h-8 text-[#0075de] mx-auto" />
        <h2 className="text-sm font-semibold text-[#000000]">Deterministic State Machine</h2>
        <p className="text-xs text-[#615d59]">
          Gemini suggests intents; state machine validates in code. Complete requires passing evidence.
        </p>
      </div>
    </div>
  );
}

/**
 * Shell view for Milestones
 */
function MilestonesShell() {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-[#e6e6e6]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Milestones & Sprints
        </h1>
        <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
          Track deadlines, deliverables, and dependency health.
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-2 max-w-lg mx-auto">
        <Target className="w-8 h-8 text-[#1aae39] mx-auto" />
        <h2 className="text-sm font-semibold text-[#000000]">Sprint 3: API Integration</h2>
        <p className="text-xs text-[#615d59]">
          Target deadline: Oct 25, 2026. 6 total deliverables scheduled.
        </p>
      </div>
    </div>
  );
}

/**
 * Shell view for Settings
 */
function SettingsShell() {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-[#e6e6e6]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Project Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
          Configure Telegram bot credentials, Gemini classification threshold, and teammate invites.
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-2 max-w-lg mx-auto">
        <Settings className="w-8 h-8 text-[#615d59] mx-auto" />
        <h2 className="text-sm font-semibold text-[#000000]">Coordination Parameters</h2>
        <p className="text-xs text-[#615d59]">
          Confidence threshold: 0.7 · Long polling active · Supabase Realtime connected.
        </p>
      </div>
    </div>
  );
}
