"use client";

import React, { useState, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  GitBranch,
  ListTree,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestoneTimeline } from "./milestone-timeline";
import { DependencyMap } from "./dependency-map";
import { MilestoneDetailsDialog } from "./milestone-details-dialog";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { EditMilestoneDialog } from "./edit-milestone-dialog";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { MOCK_MILESTONES, evaluateMilestoneRisk, CURRENT_MOCK_DATE } from "@/lib/mock-milestones";
import { MOCK_COMMITMENTS } from "@/lib/mock-tasks";
import type { Milestone, MilestoneRiskLevel } from "@/types/milestone";
import type { CommitmentTask } from "@/types/task";

export function MilestonesView() {
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [currentView, setCurrentView] = useState<"timeline" | "map">("timeline");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline-asc" | "deadline-desc" | "risk-desc" | "progress-desc">("deadline-asc");
  const [selectedSprint, setSelectedSprint] = useState<string>("all");

  // Dialog & Drawer states
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<CommitmentTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Dynamic Metrics derived from underlying state
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) =>
      m.status === "Completed" ||
      (m.commitments.length > 0 && m.commitments.every((c) => c.status === "Complete"))
  ).length;
  const upcomingMilestones = milestones.filter((m) => m.status === "Upcoming").length;
  const atRiskMilestones = milestones.filter(
    (m) => evaluateMilestoneRisk(m, CURRENT_MOCK_DATE).isAtRisk
  ).length;

  // Filter and Sort Milestones
  const filteredMilestones = useMemo(() => {
    return milestones
      .filter((m) => {
        const riskEval = evaluateMilestoneRisk(m, CURRENT_MOCK_DATE);

        // Status Filter
        if (statusFilter !== "all" && m.status !== statusFilter) {
          return false;
        }

        // Risk Filter
        if (riskFilter !== "all" && riskEval.riskLevel !== riskFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
          const matchesDesc = m.description.toLowerCase().includes(q);
          const matchesTasks = m.commitments.some(
            (c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
          );

          if (!matchesName && !matchesDesc && !matchesTasks) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline-asc") {
          return a.targetDate.localeCompare(b.targetDate);
        }
        if (sortBy === "deadline-desc") {
          return b.targetDate.localeCompare(a.targetDate);
        }
        if (sortBy === "risk-desc") {
          const riskWeight: Record<MilestoneRiskLevel, number> = {
            Critical: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };
          const rA = riskWeight[evaluateMilestoneRisk(a, CURRENT_MOCK_DATE).riskLevel];
          const rB = riskWeight[evaluateMilestoneRisk(b, CURRENT_MOCK_DATE).riskLevel];
          return rB - rA;
        }
        if (sortBy === "progress-desc") {
          const compA =
            a.commitments.length > 0
              ? a.commitments.filter((c) => c.status === "Complete").length / a.commitments.length
              : 0;
          const compB =
            b.commitments.length > 0
              ? b.commitments.filter((c) => c.status === "Complete").length / b.commitments.length
              : 0;
          return compB - compA;
        }
        return 0;
      });
  }, [milestones, searchQuery, statusFilter, riskFilter, sortBy]);

  // Open Task Drawer for given taskId
  function handleOpenTaskDrawer(taskId: string) {
    const task = MOCK_COMMITMENTS.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDrawerOpen(true);
    } else {
      // Find in milestone commitments if synthetic
      for (const m of milestones) {
        const found = m.commitments.find((c) => c.taskId === taskId);
        if (found) {
          const syntheticTask: CommitmentTask = {
            id: found.taskId,
            code: found.code,
            projectId: "cadence-core",
            projectName: "Cadence / Capstone Alpha",
            milestone: m.name,
            title: found.title,
            description: `Deliverable requirement for milestone ${m.code}.`,
            ownerId: "owner-gen",
            ownerName: found.ownerName,
            ownerUsername: found.ownerUsername || found.ownerName.toLowerCase(),
            status: found.status,
            progressPct: found.progressPct,
            deadline: found.deadline,
            acceptanceCriteria: "Verification tests and signoff submitted.",
            evidenceRequired: "link",
            blockerText: found.blockerText || null,
            atRisk: found.atRisk || false,
            lastUpdateAt: "Today",
            nextFollowupAt: "Scheduled",
            followupCount: 1,
            dependencies: { prerequisites: [], dependents: [] },
            suggestedActions: ["Proceed with implementation and link pull request."],
            activityHistory: [
              {
                id: `act-${Date.now()}`,
                timestamp: "Oct 16, 10:00 AM",
                newStatus: found.status,
                reason: "Deliverable item tracked in milestone schedule.",
                source: "system",
              },
            ],
          };
          setSelectedTask(syntheticTask);
          setIsDrawerOpen(true);
          break;
        }
      }
    }
  }

  // Open Milestone Details
  function handleSelectMilestone(milestone: Milestone) {
    setSelectedMilestone(milestone);
    setIsDetailsOpen(true);
  }

  // Open Edit Milestone
  function handleOpenEditMilestone(milestone: Milestone) {
    setMilestoneToEdit(milestone);
    setIsEditOpen(true);
  }

  // Handle Create Milestone
  function handleCreateMilestone(newMilestone: Milestone) {
    setMilestones((prev) => [...prev, newMilestone]);
    setBannerFeedback(`Milestone "${newMilestone.name}" (${newMilestone.code}) created.`);
    setTimeout(() => setBannerFeedback(null), 3500);
  }

  // Handle Save Edit Milestone
  function handleSaveMilestone(updated: Milestone) {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (selectedMilestone && selectedMilestone.id === updated.id) {
      setSelectedMilestone(updated);
    }
    setBannerFeedback(`Milestone "${updated.name}" updated successfully.`);
    setTimeout(() => setBannerFeedback(null), 3500);
  }

  // Handle Blocker resolve in Drawer
  function handleResolveBlocker(taskId: string) {
    setBannerFeedback(`Blocker resolved for commitment. Task returned to 'In Progress'.`);
    setTimeout(() => setBannerFeedback(null), 3500);

    // Update in drawer
    setSelectedTask((prev) =>
      prev && prev.id === taskId
        ? {
            ...prev,
            status: "In Progress",
            atRisk: false,
            blockerText: null,
          }
        : prev
    );

    // Update in milestone commitments
    setMilestones((prev) =>
      prev.map((m) => ({
        ...m,
        commitments: m.commitments.map((c) =>
          c.taskId === taskId
            ? { ...c, status: "In Progress", atRisk: false, blockerText: null }
            : c
        ),
      }))
    );
  }

  function handleResetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setRiskFilter("all");
    setSortBy("deadline-asc");
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e6e6e6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Milestones &amp; Risk Map
            </h1>
            <span className="text-[10px] font-semibold bg-[#1aae39]/10 text-[#1aae39] px-2 py-0.5 rounded-full border border-[#1aae39]/30">
              Deterministic Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
            Track delivery progress, dependencies, and upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Sprint / Project selector */}
          <Select
            value={selectedSprint}
            onValueChange={(val) => setSelectedSprint(val ?? "all")}
          >
            <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[140px]">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Milestones
              </SelectItem>
              <SelectItem value="sprint-1" className="text-xs">
                Sprint 1: Foundation
              </SelectItem>
              <SelectItem value="sprint-2" className="text-xs">
                Sprint 2: UI Setup
              </SelectItem>
              <SelectItem value="sprint-3" className="text-xs">
                Sprint 3: API Pipeline
              </SelectItem>
              <SelectItem value="sprint-4" className="text-xs">
                Sprint 4: Capstone
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Switcher: Timeline vs Dependency Map */}
          <div className="flex items-center bg-[#f6f5f4] p-0.5 rounded-lg border border-[#e6e6e6]">
            <button
              type="button"
              onClick={() => setCurrentView("timeline")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                currentView === "timeline"
                  ? "bg-white text-[#000000] shadow-xs font-semibold"
                  : "text-[#615d59] hover:text-[#000000]"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("map")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                currentView === "map"
                  ? "bg-white text-[#000000] shadow-xs font-semibold"
                  : "text-[#615d59] hover:text-[#000000]"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Dependency Map</span>
            </button>
          </div>

          {/* New Milestone Action */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs bg-[#000000] hover:bg-[#31302e] text-white px-3 rounded-md font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Milestone</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* 2. Compact Milestone Overview Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Total Milestones</span>
            <Target className="w-3.5 h-3.5 text-[#0075de]" />
          </div>
          <div className="text-xl font-bold text-[#000000]">{totalMilestones}</div>
          <div className="text-[10px] text-[#a39e98]">Project delivery roadmap</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1aae39]" />
          </div>
          <div className="text-xl font-bold text-[#1aae39]">{completedMilestones}</div>
          <div className="text-[10px] text-[#a39e98]">Deliverables verified</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Upcoming</span>
            <Clock className="w-3.5 h-3.5 text-[#615d59]" />
          </div>
          <div className="text-xl font-bold text-[#615d59]">{upcomingMilestones}</div>
          <div className="text-[10px] text-[#a39e98]">Scheduled future phases</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">At-Risk Milestones</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#dd5b00]" />
          </div>
          <div className="text-xl font-bold text-[#dd5b00]">{atRiskMilestones}</div>
          <div className="text-[10px] text-[#dd5b00]">Action required</div>
        </div>
      </div>

      {/* 3. Filter and Search Controls */}
      <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milestone name, description, or task code..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val ?? "all")}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="Active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="At Risk" className="text-xs text-[#dd5b00]">
                  At Risk
                </SelectItem>
                <SelectItem value="Completed" className="text-xs text-[#1aae39]">
                  Completed
                </SelectItem>
                <SelectItem value="Upcoming" className="text-xs">
                  Upcoming
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Risk Level Filter */}
            <Select
              value={riskFilter}
              onValueChange={(val) => setRiskFilter(val ?? "all")}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[140px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Risk Levels
                </SelectItem>
                <SelectItem value="Critical" className="text-xs text-red-600 font-semibold">
                  Critical
                </SelectItem>
                <SelectItem value="High" className="text-xs text-[#dd5b00]">
                  High
                </SelectItem>
                <SelectItem value="Medium" className="text-xs text-[#213183]">
                  Medium
                </SelectItem>
                <SelectItem value="Low" className="text-xs text-[#1aae39]">
                  Low
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val) setSortBy(val as "deadline-asc" | "deadline-desc" | "risk-desc" | "progress-desc");
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline-asc" className="text-xs">
                  Deadline (Earliest First)
                </SelectItem>
                <SelectItem value="deadline-desc" className="text-xs">
                  Deadline (Latest First)
                </SelectItem>
                <SelectItem value="risk-desc" className="text-xs">
                  Risk (Highest First)
                </SelectItem>
                <SelectItem value="progress-desc" className="text-xs">
                  Completion % (Highest)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Main Views: Timeline vs Dependency Map */}
      {filteredMilestones.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#f6f5f4] text-[#a39e98] flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#000000]">No milestones match your criteria</h3>
            <p className="text-xs text-[#615d59] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing your status and risk filters.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs border-[#e6e6e6] text-[#0075de] inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </Button>
        </div>
      ) : currentView === "timeline" ? (
        <MilestoneTimeline
          milestones={filteredMilestones}
          allMilestones={milestones}
          onSelectMilestone={handleSelectMilestone}
          onOpenTaskDrawer={handleOpenTaskDrawer}
        />
      ) : (
        <DependencyMap
          milestones={milestones}
          onSelectMilestone={handleSelectMilestone}
          onOpenTaskDrawer={handleOpenTaskDrawer}
        />
      )}

      {/* Milestone Details Dialog */}
      <MilestoneDetailsDialog
        milestone={selectedMilestone}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        allMilestones={milestones}
        onOpenTaskDrawer={handleOpenTaskDrawer}
        onOpenEditDialog={handleOpenEditMilestone}
      />

      {/* Create Milestone Dialog */}
      <CreateMilestoneDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        existingMilestones={milestones}
        onCreateMilestone={handleCreateMilestone}
      />

      {/* Edit Milestone Dialog */}
      <EditMilestoneDialog
        milestone={milestoneToEdit}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaveMilestone={handleSaveMilestone}
      />

      {/* Commitment Details Drawer */}
      <CommitmentDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onResolveBlocker={handleResolveBlocker}
      />
    </div>
  );
}
