"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockerRow } from "./blocker-row";
import { PingOwnerDialog } from "./ping-owner-dialog";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { MOCK_BLOCKED_TASKS } from "@/lib/mock-blockers";
import type { BlockedTask, BlockerSeverity } from "@/types/task";

export function BlockerRadarView() {
  const [tasks, setTasks] = useState<BlockedTask[]>(MOCK_BLOCKED_TASKS);
  const [selectedTask, setSelectedTask] = useState<BlockedTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Ping Dialog State
  const [pingTask, setPingTask] = useState<BlockedTask | null>(null);
  const [isPingOpen, setIsPingOpen] = useState(false);

  // Notification / Feedback Banner State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedMilestone, setSelectedMilestone] = useState("all");
  const [sortBy, setSortBy] = useState<"severity-desc" | "severity-asc" | "age-desc" | "age-asc">("severity-desc");

  // Summary Metrics
  const totalBlocked = tasks.length;
  const criticalCount = tasks.filter((t) => t.severity === "Critical").length;
  const longestBlockedTask = useMemo(() => {
    if (tasks.length === 0) return null;
    return [...tasks].sort((a, b) => b.blockerAgeHours - a.blockerAgeHours)[0];
  }, [tasks]);
  const needsAttentionCount = tasks.filter(
    (t) => t.severity === "Critical" || t.severity === "High" || t.escalationStatus.includes("Escalated")
  ).length;

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            task.title.toLowerCase().includes(q) ||
            task.code.toLowerCase().includes(q) ||
            task.ownerName.toLowerCase().includes(q) ||
            task.ownerUsername.toLowerCase().includes(q) ||
            (task.blockerText && task.blockerText.toLowerCase().includes(q)) ||
            task.missingDependency.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Owner filter
        if (selectedOwner !== "all" && task.ownerName !== selectedOwner) {
          return false;
        }

        // Severity filter
        if (selectedSeverity !== "all" && task.severity !== selectedSeverity) {
          return false;
        }

        // Milestone filter
        if (selectedMilestone !== "all" && !task.milestone.includes(selectedMilestone)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const severityRank: Record<BlockerSeverity, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        if (sortBy === "severity-desc") {
          return severityRank[b.severity] - severityRank[a.severity];
        }
        if (sortBy === "severity-asc") {
          return severityRank[a.severity] - severityRank[b.severity];
        }
        if (sortBy === "age-desc") {
          return b.blockerAgeHours - a.blockerAgeHours;
        }
        if (sortBy === "age-asc") {
          return a.blockerAgeHours - b.blockerAgeHours;
        }
        return 0;
      });
  }, [tasks, searchQuery, selectedOwner, selectedSeverity, selectedMilestone, sortBy]);

  function handleSelectTask(task: BlockedTask) {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
  }

  function handleOpenPingDialog(task: BlockedTask) {
    setPingTask(task);
    setIsPingOpen(true);
  }

  function handleConfirmPing(task: BlockedTask, message: string) {
    setFeedbackMessage(`Simulated Telegram prompt sent to @${task.ownerUsername}: "${message.slice(0, 60)}..."`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  }

  function handleResolveBlocker(taskId: string) {
    // Semantic Rule: Resolving blocker moves task to 'In Progress', NOT complete!
    // It removes the task from the active blocker list on Blocker Radar
    const resolvedTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsDrawerOpen(false);

    if (resolvedTask) {
      setFeedbackMessage(
        `Blocker on "${resolvedTask.title}" resolved. Task transitioned to 'In Progress' and removed from active radar.`
      );
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedOwner("all");
    setSelectedSeverity("all");
    setSelectedMilestone("all");
    setSortBy("severity-desc");
  }

  const isFiltered =
    searchQuery !== "" ||
    selectedOwner !== "all" ||
    selectedSeverity !== "all" ||
    selectedMilestone !== "all" ||
    sortBy !== "severity-desc";

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6e6e6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Blocker Radar
            </h1>
            <span className="text-[11px] font-semibold bg-[#dd5b00]/15 text-[#dd5b00] px-2 py-0.5 rounded-full border border-[#dd5b00]/30">
              {totalBlocked} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
            Identify what&apos;s preventing your team from moving forward.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs border-[#e6e6e6] text-[#615d59] hover:text-[#000000]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Action / Notification Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3 bg-[#0075de]/10 border border-[#0075de]/30 rounded-lg flex items-center justify-between text-xs text-[#005bab] animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0075de] shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs text-[#0075de] hover:underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. COMPACT SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Blocked */}
        <div className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-[#615d59] block">
            Total Blocked
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#000000]">{totalBlocked}</span>
            <span className="text-[10px] text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded font-mono">
              commitments
            </span>
          </div>
        </div>

        {/* Critical Blockers */}
        <div className="p-3.5 bg-white rounded-lg border border-[#dd5b00]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-[#dd5b00] block">
            Critical Severity
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#dd5b00]">{criticalCount}</span>
            <span className="text-[10px] font-semibold text-[#793400] bg-[#dd5b00]/15 px-1.5 py-0.5 rounded">
              immediate action
            </span>
          </div>
        </div>

        {/* Longest Blocked Task */}
        <div className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-[#615d59] block truncate">
            Longest Stalled
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#000000] truncate">
              {longestBlockedTask ? longestBlockedTask.blockerDetectedAt : "None"}
            </span>
            {longestBlockedTask && (
              <span className="text-[10px] text-[#a39e98] font-mono">
                {longestBlockedTask.code}
              </span>
            )}
          </div>
        </div>

        {/* Blockers Needing Attention */}
        <div className="p-3.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-[#615d59] block">
            Needs Attention
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#000000]">
              {needsAttentionCount}
            </span>
            <span className="text-[10px] text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded font-medium">
              escalated
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR */}
      <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, owner, blocker text, or dependency..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Owner Filter */}
            <Select value={selectedOwner} onValueChange={(val) => setSelectedOwner(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[130px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Owners
                </SelectItem>
                <SelectItem value="Kabir" className="text-xs">
                  Kabir
                </SelectItem>
                <SelectItem value="Ravi" className="text-xs">
                  Ravi
                </SelectItem>
                <SelectItem value="Aisha" className="text-xs">
                  Aisha
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={selectedSeverity} onValueChange={(val) => setSelectedSeverity(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Severities
                </SelectItem>
                <SelectItem value="Critical" className="text-xs text-[#dd5b00] font-semibold">
                  Critical
                </SelectItem>
                <SelectItem value="High" className="text-xs text-[#dd5b00]">
                  High
                </SelectItem>
                <SelectItem value="Medium" className="text-xs text-[#213183]">
                  Medium
                </SelectItem>
                <SelectItem value="Low" className="text-xs text-[#615d59]">
                  Low
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Milestone Filter */}
            <Select value={selectedMilestone} onValueChange={(val) => setSelectedMilestone(val ?? "all")}>
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[140px]">
                <SelectValue placeholder="Milestone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Milestones
                </SelectItem>
                <SelectItem value="Sprint 2" className="text-xs">
                  Sprint 2: UI Foundation
                </SelectItem>
                <SelectItem value="Sprint 3" className="text-xs">
                  Sprint 3: API Integration
                </SelectItem>
                <SelectItem value="Sprint 4" className="text-xs">
                  Sprint 4: Verification &amp; Demo
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val) setSortBy(val as "severity-desc" | "severity-asc" | "age-desc" | "age-asc");
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity-desc" className="text-xs">
                  Highest Severity
                </SelectItem>
                <SelectItem value="severity-asc" className="text-xs">
                  Lowest Severity
                </SelectItem>
                <SelectItem value="age-desc" className="text-xs">
                  Longest Stalled (Oldest)
                </SelectItem>
                <SelectItem value="age-asc" className="text-xs">
                  Newest Detected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. BLOCKER LIST / EMPTY STATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider">
            Blocked Commitments ({filteredTasks.length})
          </span>
          <span className="text-[11px] text-[#a39e98]">
            Click any row to open the details drawer
          </span>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <BlockerRow
                key={task.id}
                task={task}
                onSelect={handleSelectTask}
                onResolve={() => handleResolveBlocker(task.id)}
                onPing={() => handleOpenPingDialog(task)}
              />
            ))}
          </div>
        ) : (
          /* USEFUL EMPTY STATE */
          <div className="p-10 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#1aae39]/10 text-[#1aae39] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#000000]">
                {totalBlocked === 0
                  ? "All Blockers Resolved!"
                  : "No Blockers Match Your Filter"}
              </h3>
              <p className="text-xs text-[#615d59] leading-relaxed">
                {totalBlocked === 0
                  ? "All team commitments are in progress or verified. The critical path is clear."
                  : "Try clearing your search query or loosening the severity and owner filters."}
              </p>
            </div>
            {isFiltered && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-xs border-[#e6e6e6] text-[#0075de]"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ping Owner Dialog */}
      <PingOwnerDialog
        task={pingTask}
        isOpen={isPingOpen}
        onClose={() => setIsPingOpen(false)}
        onConfirmPing={handleConfirmPing}
      />

      {/* Commitment Details Drawer */}
      <CommitmentDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onResolveBlocker={handleResolveBlocker}
        onPingOwner={() => {
          if (selectedTask) handleOpenPingDialog(selectedTask);
        }}
      />
    </div>
  );
}
