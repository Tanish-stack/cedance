"use client";

import React from "react";
import {
  Inbox,
  ListTodo,
  ShieldAlert,
  Bot,
  Target,
  Settings,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type NavItemKey =
  | "ingest-stream"
  | "commitments-ledger"
  | "blocker-radar"
  | "agent-audit"
  | "milestones"
  | "settings";

interface SidebarProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "neutral";
}[] = [
  {
    key: "ingest-stream",
    label: "Ingest Stream",
    icon: Inbox,
    badge: "3",
    badgeVariant: "default",
  },
  {
    key: "commitments-ledger",
    label: "Commitments Ledger",
    icon: ListTodo,
  },
  {
    key: "blocker-radar",
    label: "Blocker Radar",
    icon: ShieldAlert,
    badge: "1",
    badgeVariant: "destructive",
  },
  {
    key: "agent-audit",
    label: "Agent Audit",
    icon: Bot,
  },
  {
    key: "milestones",
    label: "Milestones",
    icon: Target,
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({
  activeItem,
  onSelect,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col h-full bg-[#f6f5f4] border-r border-[#e6e6e6] transition-all duration-200 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Workspace / Brand Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#e6e6e6]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0075de] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm leading-none tracking-tight text-[#000000] truncate">
                Cedance
              </span>
              <span className="text-[11px] text-[#615d59] leading-tight mt-0.5 truncate">
                AI Coordinator
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0075de] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}

        {!collapsed && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="h-7 w-7 text-[#615d59] hover:text-[#000000] hover:bg-black/5"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              }
            />
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="p-2 border-b border-[#e6e6e6]">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="w-full h-8 flex items-center justify-center text-[#615d59] hover:text-[#000000] hover:bg-black/5 rounded-md cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-black/10 flex items-center justify-center text-xs font-semibold text-[#000000]">
                    C
                  </span>
                </button>
              }
            />
            <TooltipContent side="right">Capstone Team Alpha</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-left text-xs hover:bg-black/5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded bg-black/10 flex items-center justify-center text-xs font-semibold text-[#000000] shrink-0">
                C
              </span>
              <span className="font-medium text-[#000000] truncate">
                Capstone Team Alpha
              </span>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#a39e98] group-hover:text-[#615d59] shrink-0" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          if (collapsed) {
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => onSelect(item.key)}
                      className={`relative flex items-center justify-center w-full h-9 rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? "bg-white text-[#0075de] shadow-xs font-semibold"
                          : "text-[#615d59] hover:bg-black/5 hover:text-[#000000]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.badge && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                            item.badgeVariant === "destructive"
                              ? "bg-[#dd5b00]"
                              : "bg-[#0075de]"
                          }`}
                        />
                      )}
                    </button>
                  }
                />
                <TooltipContent side="right" className="flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs transition-colors text-left cursor-pointer ${
                isActive
                  ? "bg-white text-[#000000] font-semibold shadow-xs border border-[#e6e6e6]/60"
                  : "text-[#615d59] hover:bg-black/5 hover:text-[#000000]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-[#0075de]" : "text-[#615d59]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    item.badgeVariant === "destructive"
                      ? "bg-[#dd5b00]/15 text-[#dd5b00]"
                      : "bg-[#0075de]/15 text-[#0075de]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer: Connection Status & Uncollapse */}
      <div className="p-2 border-t border-[#e6e6e6] bg-[#f6f5f4]">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1aae39] ring-2 ring-white cursor-pointer" />
                }
              />
              <TooltipContent side="right">Telegram Bot: Active (Long Polling)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-7 w-7 text-[#615d59] hover:text-[#000000]"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                }
              />
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#615d59]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1aae39] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1aae39]" />
              </span>
              <span className="font-mono text-[10px]">Telegram: Active</span>
            </div>
            <span className="text-[10px] text-[#a39e98]">v0.1</span>
          </div>
        )}
      </div>
    </aside>
  );
}
