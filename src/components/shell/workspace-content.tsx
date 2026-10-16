"use client";

import React, { useState } from "react";
import {
  Settings,
  Plus,
  Filter,
  Search,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommitmentsTable } from "@/components/ledger/commitments-table";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { NewCommitmentDialog } from "@/components/ledger/new-commitment-dialog";
import { MOCK_COMMITMENTS } from "@/lib/mock-tasks";
import { BlockerRadarView } from "@/components/blockers/blocker-radar-view";
import { StreamAuditView } from "@/components/stream-audit/stream-audit-view";
import { MilestonesView } from "@/components/milestones/milestones-view";
import type { CommitmentTask } from "@/types/task";
import type { NavItemKey } from "./sidebar";

interface WorkspaceContentProps {
  activeItem: NavItemKey;
}

export function WorkspaceContent({ activeItem }: WorkspaceContentProps) {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {activeItem === "commitments-ledger" && <CommitmentsLedgerShell />}
      {activeItem === "ingest-stream" && <StreamAuditView initialView="stream" />}
      {activeItem === "blocker-radar" && <BlockerRadarView />}
      {activeItem === "agent-audit" && <StreamAuditView initialView="audit" />}
      {activeItem === "milestones" && <MilestonesView />}
      {activeItem === "settings" && <SettingsShell />}
    </main>
  );
}

/**
 * Interactive Commitments Ledger View with Commitment Details Drawer & New Commitment Dialog
 */
function CommitmentsLedgerShell() {
  const [tasks, setTasks] = useState<CommitmentTask[]>(MOCK_COMMITMENTS);
  const [selectedTask, setSelectedTask] = useState<CommitmentTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewCommitmentOpen, setIsNewCommitmentOpen] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      const matchCriteria = t.acceptanceCriteria.toLowerCase().includes(q);
      const matchOwner =
        t.ownerName.toLowerCase().includes(q) || t.ownerUsername.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchCriteria && !matchOwner) {
        return false;
      }
    }
    return true;
  });

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

  function handleCreateCommitment(newTask: CommitmentTask) {
    setTasks((prev) => [newTask, ...prev]);
    setBannerFeedback(`Commitment "${newTask.code}: ${newTask.title}" added to ledger.`);
    setTimeout(() => setBannerFeedback(null), 3500);
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

  function handleResetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
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
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`h-8 text-xs border-[#e6e6e6] transition-colors cursor-pointer ${
              showFilterBar || statusFilter !== "all" || searchQuery
                ? "bg-[#0075de]/10 border-[#0075de]/30 text-[#0075de]"
                : "bg-white text-[#000000] hover:bg-[#f6f5f4]"
            }`}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5 text-[#615d59]" />
            Filter
            {(statusFilter !== "all" || searchQuery) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0075de] ml-1" />
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsNewCommitmentOpen(true)}
            className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white rounded-full font-medium px-3.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Commitment
          </Button>
        </div>
      </div>

      {/* Creation Feedback Banner */}
      {bannerFeedback && (
        <div className="p-3 bg-[#1aae39]/10 border border-[#1aae39]/30 rounded-xl text-xs text-[#1aae39] font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1aae39]" />
            <span>{bannerFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerFeedback(null)}
            className="text-xs text-[#1aae39] hover:underline cursor-pointer ml-3 font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Optional Search & Filter Bar */}
      {(showFilterBar || statusFilter !== "all" || searchQuery) && (
        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-2.5 transition-all">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by commitment title, ID, owner, or criteria..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val ?? "all")}
              >
                <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="Assigned" className="text-xs">
                    Assigned
                  </SelectItem>
                  <SelectItem value="In Progress" className="text-xs text-[#0075de]">
                    In Progress
                  </SelectItem>
                  <SelectItem value="Blocked" className="text-xs text-[#dd5b00]">
                    Blocked
                  </SelectItem>
                  <SelectItem value="Pending Verification" className="text-xs text-[#213183]">
                    Pending Verification
                  </SelectItem>
                  <SelectItem value="Complete" className="text-xs text-[#1aae39]">
                    Complete
                  </SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-xs text-[#0075de] hover:bg-[#f6f5f4] px-2 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Commitments Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider">
            All Commitments ({filteredTasks.length} of {tasks.length})
          </span>
          <span className="text-[11px] text-[#a39e98]">
            Click row to view details
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-2">
            <p className="text-xs font-semibold text-[#000000]">No commitments match your filter</p>
            <p className="text-xs text-[#615d59]">Try adjusting your search terms or clearing status filters.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs border-[#e6e6e6] text-[#0075de] mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <CommitmentsTable
            tasks={filteredTasks}
            selectedTaskId={selectedTask?.id || null}
            onSelectTask={handleSelectTask}
          />
        )}
      </div>

      {/* Commitment Details Drawer */}
      <CommitmentDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onResolveBlocker={handleResolveBlocker}
      />

      {/* New Commitment Dialog */}
      <NewCommitmentDialog
        isOpen={isNewCommitmentOpen}
        onClose={() => setIsNewCommitmentOpen(false)}
        existingTasks={tasks}
        onCreateCommitment={handleCreateCommitment}
      />
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
