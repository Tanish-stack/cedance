"use client";

import React from "react";
import {
  Menu,
  Search,
  ChevronRight,
  Calendar,
  PanelRightClose,
  PanelRightOpen,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NavItemKey } from "./sidebar";

interface TopBarProps {
  activeItem: NavItemKey;
  onOpenMobileMenu: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

const NAV_LABELS: Record<NavItemKey, string> = {
  "ingest-stream": "Ingest Stream",
  "commitments-ledger": "Commitments Ledger",
  "blocker-radar": "Blocker Radar",
  "agent-audit": "Agent Audit",
  milestones: "Milestones",
  settings: "Settings",
};

export function TopBar({
  activeItem,
  onOpenMobileMenu,
  rightPanelOpen,
  onToggleRightPanel,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-[#e6e6e6] gap-3">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden h-8 w-8 text-[#615d59] hover:text-[#000000]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <span className="text-[#615d59] hover:text-[#000000] cursor-pointer hidden sm:inline truncate max-w-[120px]">
            Capstone Team Alpha
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#a39e98] shrink-0 hidden sm:inline" />
          <span className="font-semibold text-[#000000] truncate">
            {NAV_LABELS[activeItem]}
          </span>
        </nav>
      </div>

      {/* Middle: Sprint Selector & Quick Search */}
      <div className="flex items-center gap-2.5 max-w-md w-full justify-end sm:justify-center">
        {/* Sprint / Milestone Selector */}
        <div className="hidden lg:flex items-center">
          <Select defaultValue="sprint-3">
            <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[210px] gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#615d59] shrink-0" />
              <SelectValue placeholder="Select sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sprint-2" className="text-xs">
                Sprint 2: Architecture (Done)
              </SelectItem>
              <SelectItem value="sprint-3" className="text-xs">
                Sprint 3: API Integration (Oct 25)
              </SelectItem>
              <SelectItem value="sprint-4" className="text-xs">
                Sprint 4: Verification & Demo
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full max-w-[200px] sm:max-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
          <input
            type="text"
            placeholder="Search tasks, replies..."
            className="w-full h-8 pl-8 pr-12 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
          />
          <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1 py-0.5 text-[9px] font-mono text-[#a39e98] bg-white border border-[#e6e6e6] rounded">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </div>

      {/* Right: Right Panel Toggle & User Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleRightPanel}
                className={`h-8 px-2.5 gap-1.5 text-xs rounded-md border-[#e6e6e6] transition-colors ${
                  rightPanelOpen
                    ? "bg-[#0075de]/10 text-[#0075de] border-[#0075de]/30"
                    : "text-[#615d59] hover:text-[#000000]"
                }`}
                aria-label="Toggle Activity & Blocker Panel"
              >
                {rightPanelOpen ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
                <span className="hidden xl:inline">Activity</span>
                <span className="w-2 h-2 rounded-full bg-[#dd5b00]" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {rightPanelOpen ? "Close side panel" : "View Blocker Radar & Agent Activity"}
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2 pl-1 border-l border-[#e6e6e6]">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-[#0075de]/20 transition-all outline-none cursor-pointer"
                >
                  <Avatar className="w-7 h-7 border border-[#e6e6e6]">
                    <AvatarFallback className="text-[11px] font-medium bg-[#0075de]/10 text-[#0075de]">
                      MG
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-semibold">Project Manager</p>
              <p className="text-[11px] text-[#615d59]">@lead_coordinator</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
