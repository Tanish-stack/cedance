"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Bot,
  GitCommit,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AuditEvent, AuditEventType } from "@/types/stream-audit";

interface AuditTimelineProps {
  events: AuditEvent[];
  onOpenTaskDrawer: (taskId: string) => void;
}

export function AuditTimeline({ events, onOpenTaskDrawer }: AuditTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Event Type Filter
      if (eventTypeFilter !== "all" && evt.eventType !== eventTypeFilter) {
        return false;
      }

      // Task Filter
      if (taskFilter !== "all" && evt.relatedTaskCode !== taskFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTask =
          evt.relatedTaskCode.toLowerCase().includes(query) ||
          evt.relatedTaskTitle.toLowerCase().includes(query);
        const matchesReason = evt.reason.toLowerCase().includes(query);
        const matchesActor = evt.actor.toLowerCase().includes(query);
        const matchesSource = evt.sourceReference.toLowerCase().includes(query);
        const matchesOwner = evt.ownerName.toLowerCase().includes(query);

        if (!matchesTask && !matchesReason && !matchesActor && !matchesSource && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, eventTypeFilter, taskFilter]);

  function handleResetFilters() {
    setSearchQuery("");
    setEventTypeFilter("all");
    setTaskFilter("all");
  }

  // Visual icon & badge config for each event type
  function getEventConfig(type: AuditEventType) {
    switch (type) {
      case "Message Parsed":
        return {
          icon: Bot,
          color: "#0075de",
          bgColor: "bg-[#0075de]/10",
          borderColor: "border-[#0075de]/30",
          textColor: "text-[#0075de]",
          label: "Message Parsed",
          badgeDesc: "Informational (No state mutation)",
        };
      case "State Changed":
        return {
          icon: GitCommit,
          color: "#6941c6",
          bgColor: "bg-[#6941c6]/10",
          borderColor: "border-[#6941c6]/30",
          textColor: "text-[#6941c6]",
          label: "State Changed",
          badgeDesc: "State Machine Mutation",
        };
      case "Blocker Detected":
        return {
          icon: ShieldAlert,
          color: "#dd5b00",
          bgColor: "bg-[#dd5b00]/10",
          borderColor: "border-[#dd5b00]/30",
          textColor: "text-[#dd5b00]",
          label: "Blocker Detected",
          badgeDesc: "Impediment Flagged",
        };
      case "Evidence Added":
        return {
          icon: CheckCircle2,
          color: "#1aae39",
          bgColor: "bg-[#1aae39]/10",
          borderColor: "border-[#1aae39]/30",
          textColor: "text-[#1aae39]",
          label: "Evidence Added",
          badgeDesc: "Proof Submitted",
        };
      case "Human Override":
        return {
          icon: UserCheck,
          color: "#31302e",
          bgColor: "bg-[#f6f5f4]",
          borderColor: "border-[#31302e]/30",
          textColor: "text-[#31302e]",
          label: "Human Override",
          badgeDesc: "Manual Manager Action",
        };
    }
  }

  return (
    <div className="space-y-4">
      {/* Notice Banner: Clearly distinguishing parsed messages from state changes */}
      <div className="p-3 bg-[#f6f5f4] rounded-xl border border-[#e6e6e6] text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#0075de] shrink-0 mt-0.5" />
        <div className="text-[#615d59] leading-relaxed">
          <strong className="text-[#000000]">Deterministic State Separation:</strong> Incoming
          messages are parsed and classified by Gemini, but <span className="underline decoration-dotted font-medium text-[#000000]">parsed messages do not automatically mutate task states</span>. State transitions occur strictly when deterministic validation rules, dependency resolutions, or verified evidence criteria are met.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event reason, actor, source reference, or task..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Event Type Filter */}
            <Select
              value={eventTypeFilter}
              onValueChange={(val) => setEventTypeFilter(val ?? "all")}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[160px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Event Types
                </SelectItem>
                <SelectItem value="Message Parsed" className="text-xs text-[#0075de]">
                  Message Parsed
                </SelectItem>
                <SelectItem value="State Changed" className="text-xs text-[#6941c6]">
                  State Changed
                </SelectItem>
                <SelectItem value="Blocker Detected" className="text-xs text-[#dd5b00]">
                  Blocker Detected
                </SelectItem>
                <SelectItem value="Evidence Added" className="text-xs text-[#1aae39]">
                  Evidence Added
                </SelectItem>
                <SelectItem value="Human Override" className="text-xs text-[#31302e]">
                  Human Override
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Task Filter */}
            <Select
              value={taskFilter}
              onValueChange={(val) => setTaskFilter(val ?? "all")}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[130px]">
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Tasks
                </SelectItem>
                <SelectItem value="TSK-01" className="text-xs">
                  TSK-01
                </SelectItem>
                <SelectItem value="TSK-02" className="text-xs">
                  TSK-02
                </SelectItem>
                <SelectItem value="TSK-03" className="text-xs">
                  TSK-03
                </SelectItem>
                <SelectItem value="TSK-06" className="text-xs">
                  TSK-06
                </SelectItem>
                <SelectItem value="TSK-08" className="text-xs">
                  TSK-08
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#f6f5f4] text-[#a39e98] flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#000000]">No audit events match your filter</h3>
            <p className="text-xs text-[#615d59] mt-1 max-w-sm mx-auto">
              Try choosing another event type or clearing your search keywords.
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
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e6e6e6]">
          {filteredEvents.map((evt) => {
            const config = getEventConfig(evt.eventType);
            const IconComponent = config.icon;
            const hasStateChange = !!(evt.previousState && evt.resultingState);

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Node Point */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${config.borderColor} ${config.textColor}`}
                >
                  <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>

                {/* Event Card */}
                <div className="p-4 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-3 hover:border-[#0075de]/30 transition-all">
                  {/* Event Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Event Type Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{config.label}</span>
                      </span>

                      {/* Actor Badge */}
                      <span className="text-[10px] font-mono text-[#615d59] bg-[#f6f5f4] px-1.5 py-0.5 rounded border border-[#e6e6e6]">
                        {evt.actor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#615d59]">
                      {evt.confidence !== undefined && (
                        <span className="text-[10px] font-semibold text-[#0075de] bg-[#0075de]/10 px-1.5 py-0.5 rounded border border-[#0075de]/20">
                          {Math.round(evt.confidence * 100)}% Confidence
                        </span>
                      )}
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>

                  {/* Related Task Line */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold bg-white text-[#0075de] px-1.5 py-0.5 rounded border border-[#0075de]/30 shrink-0">
                        {evt.relatedTaskCode}
                      </span>
                      <span className="text-xs font-semibold text-[#000000] truncate">
                        {evt.relatedTaskTitle}
                      </span>
                      <span className="text-[10px] text-[#a39e98] hidden sm:inline">
                        (Owner: {evt.ownerName})
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenTaskDrawer(evt.relatedTaskId)}
                      className="h-6 text-[11px] text-[#0075de] hover:bg-white px-2 flex items-center gap-1 shrink-0"
                    >
                      <span>Task Details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Button>
                  </div>

                  {/* State Transition Chip (if applicable) */}
                  {hasStateChange && (
                    <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-lg border border-purple-200/60 text-xs">
                      <span className="text-[11px] font-semibold text-purple-900">
                        Transition:
                      </span>
                      <StatusBadge status={evt.previousState!} />
                      <ArrowRight className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      <StatusBadge status={evt.resultingState!} />
                    </div>
                  )}

                  {/* Explanation Reason */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                      Decision Rationale
                    </span>
                    <p className="text-xs text-[#000000] leading-relaxed font-sans">
                      {evt.reason}
                    </p>
                  </div>

                  {/* Source Message or Evidence Reference */}
                  <div className="p-2.5 bg-[#f6f5f4]/70 rounded-md border border-[#e6e6e6] text-[11px] text-[#615d59] font-mono leading-relaxed break-all">
                    <strong className="text-[#31302e] font-sans">Evidence / Source:</strong>{" "}
                    {evt.sourceReference}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
