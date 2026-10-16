"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Bot,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface RightPanelProps {
  open: boolean;
  onClose: () => void;
}

// Mock active blocker for the anchor example (Kabir & Aisha)
const MOCK_BLOCKER = {
  id: "task-payment-api",
  title: "Connect the payment API",
  owner: "Kabir",
  blockerText: "connected, but waiting for test credentials",
  blockerOwner: "Aisha",
  dependentTasks: ["Checkout UX Flow", "Webhook Handlers"],
  detectedAt: "14m ago",
  confidence: 0.94,
};

// Mock agent events representing Gemini classifier and Telegram coordination
const MOCK_AGENT_EVENTS = [
  {
    id: "ev-1",
    time: "14m ago",
    type: "classification",
    title: "Classifier detected Blocker",
    description: "Interpreted reply from Kabir as 'blocked' rather than 'complete'.",
    actor: "Gemini 2.5 Flash",
    confidence: "0.94",
    statusBadge: "Blocked" as const,
  },
  {
    id: "ev-2",
    time: "12m ago",
    type: "routing",
    title: "Unblocker Dispatched",
    description: "Bot routed message to Aisha requesting test credentials.",
    actor: "Telegram Bot",
  },
  {
    id: "ev-3",
    time: "48m ago",
    type: "evidence",
    title: "Evidence Claim Submitted",
    description: "Rohit submitted PR #42 for 'Database Schema'. Moved to Pending Verification.",
    actor: "State Machine",
    statusBadge: "Pending Verification" as const,
  },
  {
    id: "ev-4",
    time: "2h ago",
    type: "nudge",
    title: "Scheduled Follow-up Sent",
    description: "Gentle reminder sent to Dev regarding 'Auth Middleware' due in 2 days.",
    actor: "Scheduler",
  },
];

export function RightPanel({ open, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "blockers" | "audit">("all");

  if (!open) return null;

  return (
    <aside
      className="flex flex-col w-full sm:w-80 md:w-88 xl:w-96 h-full bg-[#f6f5f4] border-l border-[#e6e6e6] transition-all select-none overflow-hidden shrink-0 z-20"
      aria-label="Activity and Blocker Radar"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-[#e6e6e6] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#dd5b00]/10 text-[#dd5b00]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-[#000000]">Radar & Activity</h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-[#dd5b00]/15 text-[#dd5b00]">
              1 blocker
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-[#615d59] hover:text-[#000000] rounded-md"
          aria-label="Close activity panel"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center p-2 bg-white border-b border-[#e6e6e6] gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1 px-2 text-[11px] rounded font-medium transition-colors ${
            activeTab === "all"
              ? "bg-[#f6f5f4] text-[#000000] font-semibold"
              : "text-[#615d59] hover:text-[#000000]"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveTab("blockers")}
          className={`flex-1 py-1 px-2 text-[11px] rounded font-medium transition-colors ${
            activeTab === "blockers"
              ? "bg-[#f6f5f4] text-[#000000] font-semibold"
              : "text-[#615d59] hover:text-[#000000]"
          }`}
        >
          Blockers (1)
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex-1 py-1 px-2 text-[11px] rounded font-medium transition-colors ${
            activeTab === "audit"
              ? "bg-[#f6f5f4] text-[#000000] font-semibold"
              : "text-[#615d59] hover:text-[#000000]"
          }`}
        >
          AI Audit (4)
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Active Blocker Card (Anchor Example) */}
        {(activeTab === "all" || activeTab === "blockers") && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold tracking-wider text-[#615d59] uppercase">
                Critical Blocker
              </span>
              <span className="text-[11px] text-[#a39e98]">{MOCK_BLOCKER.detectedAt}</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#dd5b00]/30 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-[#000000] leading-snug">
                    {MOCK_BLOCKER.title}
                  </h3>
                  <p className="text-[11px] text-[#615d59] mt-0.5">
                    Owner: <span className="font-medium text-[#000000]">{MOCK_BLOCKER.owner}</span>
                  </p>
                </div>
                <StatusBadge status="Blocked" atRisk={true} />
              </div>

              {/* Blocker Quote Box */}
              <div className="p-2 rounded bg-[#f6f5f4] border border-[#e6e6e6] text-[11px] text-[#31302e]">
                <span className="font-medium text-[#dd5b00]">Blocker: </span>
                <span className="italic">&ldquo;{MOCK_BLOCKER.blockerText}&rdquo;</span>
              </div>

              {/* Blocker Routing Info */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-[#615d59]">
                  <span>Waiting on:</span>
                  <span className="font-medium text-[#000000] bg-black/5 px-1.5 py-0.5 rounded">
                    @{MOCK_BLOCKER.blockerOwner}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#615d59]">
                  <span>Dependent tasks at risk:</span>
                  <span className="text-[#dd5b00] font-medium">2 tasks</span>
                </div>
                <div className="flex items-center justify-between text-[#615d59]">
                  <span>Gemini Confidence:</span>
                  <span className="font-mono text-[#1aae39] font-medium">
                    {MOCK_BLOCKER.confidence * 100}%
                  </span>
                </div>
              </div>

              {/* Quick Action Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs font-medium rounded-md text-[#0075de] hover:bg-[#0075de]/5 border-[#0075de]/30 gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Nudge Unblocker (@{MOCK_BLOCKER.blockerOwner})</span>
              </Button>
            </div>
          </div>
        )}

        {/* Agent Audit Feed */}
        {(activeTab === "all" || activeTab === "audit") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold tracking-wider text-[#615d59] uppercase">
                Agent Decision Log
              </span>
              <span className="text-[10px] text-[#a39e98]">Realtime</span>
            </div>

            <div className="space-y-2">
              {MOCK_AGENT_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="p-2.5 bg-white rounded-lg border border-[#e6e6e6] shadow-xs space-y-1.5 hover:border-[#a39e98]/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-medium text-[#000000] truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-[#a39e98] shrink-0 font-mono">
                      {event.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#615d59] leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f6f5f4] text-[10px]">
                    <div className="flex items-center gap-1.5 text-[#615d59]">
                      <Bot className="w-3 h-3 text-[#0075de]" />
                      <span>{event.actor}</span>
                    </div>

                    {event.statusBadge && (
                      <StatusBadge status={event.statusBadge} />
                    )}

                    {event.confidence && (
                      <span className="font-mono text-[#1aae39]">
                        conf: {event.confidence}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Telegram Channel Status */}
      <div className="p-3 bg-white border-t border-[#e6e6e6] shrink-0">
        <div className="flex items-center justify-between text-[11px] text-[#615d59]">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#0075de]" />
            <span>Telegram Webhook: Live</span>
          </div>
          <span className="text-[10px] text-[#a39e98]">Polling active</span>
        </div>
      </div>
    </aside>
  );
}
