"use client";

import React, { useState } from "react";
import {
  Inbox,
  Bot,
  ShieldAlert,
  AlertTriangle,
  GitCommit,
  CheckCircle2,
} from "lucide-react";
import { StreamFeed } from "./stream-feed";
import { AuditTimeline } from "./audit-timeline";
import { MessageDetailsDialog } from "./message-details-dialog";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { MOCK_STREAM_MESSAGES, MOCK_AUDIT_EVENTS } from "@/lib/mock-stream-audit";
import { MOCK_COMMITMENTS } from "@/lib/mock-tasks";
import type { StreamMessage, AuditEvent } from "@/types/stream-audit";
import type { CommitmentTask } from "@/types/task";

interface StreamAuditViewProps {
  initialView?: "stream" | "audit";
}

export function StreamAuditView({ initialView = "stream" }: StreamAuditViewProps) {
  const [currentTab, setCurrentTab] = useState<"stream" | "audit">(initialView);
  const [messages, setMessages] = useState<StreamMessage[]>(MOCK_STREAM_MESSAGES);
  const [events] = useState<AuditEvent[]>(MOCK_AUDIT_EVENTS);

  // Message inspection dialog state
  const [selectedMessage, setSelectedMessage] = useState<StreamMessage | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  // Commitment Drawer state
  const [selectedTask, setSelectedTask] = useState<CommitmentTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Local interaction feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Summary Metrics calculations
  const totalIngested = messages.length;
  const blockersCount = messages.filter((m) => m.interpretation.blockerDetected).length;
  const needsReviewCount = messages.filter((m) => m.processingStatus === "Needs Review").length;
  const stateMutationsCount = events.filter((e) => e.eventType === "State Changed").length;

  // Open Drawer for a specific task ID
  function handleOpenTaskDrawer(taskId: string) {
    const task = MOCK_COMMITMENTS.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDrawerOpen(true);
    }
  }

  // Open Message Inspection Dialog
  function handleInspectMessage(message: StreamMessage) {
    setSelectedMessage(message);
    setIsMessageDialogOpen(true);
  }

  // Local-only Needs Review toggle
  function handleToggleReviewStatus(messageId: string) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const nextStatus = msg.processingStatus === "Needs Review" ? "Processed" : "Needs Review";
          const feedback =
            nextStatus === "Needs Review"
              ? `Message flagged for human review by manager.`
              : `Review resolved. Message marked as verified.`;

          setToastMessage(feedback);
          setTimeout(() => setToastMessage(null), 3500);

          return {
            ...msg,
            processingStatus: nextStatus,
          };
        }
        return msg;
      })
    );

    // Also update selectedMessage if currently open in dialog
    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              processingStatus:
                prev.processingStatus === "Needs Review" ? "Processed" : "Needs Review",
            }
          : null
      );
    }
  }

  // Handle Blocker resolution inside Drawer
  function handleResolveBlocker(taskId: string) {
    setToastMessage(`Blocker resolved for commitment. Task returned to 'In Progress'.`);
    setTimeout(() => setToastMessage(null), 3500);

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
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e6e6e6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
              Stream Ingestion &amp; Agent Audit
            </h1>
            <span className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de] px-2 py-0.5 rounded-full border border-[#0075de]/30">
              Live Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#615d59] mt-0.5">
            Real-time feed of team communications alongside a deterministic, verifiable audit trail.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#f6f5f4] p-1 rounded-lg border border-[#e6e6e6] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentTab("stream")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              currentTab === "stream"
                ? "bg-white text-[#000000] shadow-xs font-semibold"
                : "text-[#615d59] hover:text-[#000000]"
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-[#0075de]" />
            <span>Stream Ingestion</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                currentTab === "stream"
                  ? "bg-[#0075de]/10 text-[#0075de]"
                  : "bg-white/80 text-[#615d59]"
              }`}
            >
              {totalIngested}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("audit")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              currentTab === "audit"
                ? "bg-white text-[#000000] shadow-xs font-semibold"
                : "text-[#615d59] hover:text-[#000000]"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#6941c6]" />
            <span>Agent Audit</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                currentTab === "audit"
                  ? "bg-[#6941c6]/10 text-[#6941c6]"
                  : "bg-white/80 text-[#615d59]"
              }`}
            >
              {events.length}
            </span>
          </button>
        </div>
      </div>

      {/* Local Feedback Toast/Banner */}
      {toastMessage && (
        <div className="p-3 bg-[#0075de]/10 border border-[#0075de]/30 rounded-xl text-xs text-[#0075de] font-medium flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0075de]" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-[#0075de] hover:underline cursor-pointer ml-3 font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Compact Summary Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Total Messages</span>
            <Inbox className="w-3.5 h-3.5 text-[#0075de]" />
          </div>
          <div className="text-xl font-bold text-[#000000]">{totalIngested}</div>
          <div className="text-[10px] text-[#a39e98]">Telegram &amp; Slack ingest</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Blockers Identified</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#dd5b00]" />
          </div>
          <div className="text-xl font-bold text-[#dd5b00]">{blockersCount}</div>
          <div className="text-[10px] text-[#a39e98]">External impediments</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">Awaiting Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#213183]" />
          </div>
          <div className="text-xl font-bold text-[#213183]">{needsReviewCount}</div>
          <div className="text-[10px] text-[#a39e98]">Requires human approval</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#615d59]">
            <span className="font-medium">State Mutations</span>
            <GitCommit className="w-3.5 h-3.5 text-[#6941c6]" />
          </div>
          <div className="text-xl font-bold text-[#6941c6]">{stateMutationsCount}</div>
          <div className="text-[10px] text-[#a39e98]">Enforced by state machine</div>
        </div>
      </div>

      {/* Main View Area */}
      {currentTab === "stream" ? (
        <StreamFeed
          messages={messages}
          onOpenTaskDrawer={handleOpenTaskDrawer}
          onInspectMessage={handleInspectMessage}
          onToggleReviewStatus={handleToggleReviewStatus}
        />
      ) : (
        <AuditTimeline
          events={events}
          onOpenTaskDrawer={handleOpenTaskDrawer}
        />
      )}

      {/* Message Inspection Dialog */}
      <MessageDetailsDialog
        message={selectedMessage}
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        onOpenTaskDrawer={handleOpenTaskDrawer}
        onToggleReviewStatus={handleToggleReviewStatus}
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
