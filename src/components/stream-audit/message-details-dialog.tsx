"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StreamMessage } from "@/types/stream-audit";

interface MessageDetailsDialogProps {
  message: StreamMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskDrawer: (taskId: string) => void;
  onToggleReviewStatus: (messageId: string) => void;
}

export function MessageDetailsDialog({
  message,
  isOpen,
  onClose,
  onOpenTaskDrawer,
  onToggleReviewStatus,
}: MessageDetailsDialogProps) {
  if (!message) return null;

  const isTelegram = message.sourcePlatform === "Telegram";
  const isNeedsReview = message.processingStatus === "Needs Review";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-[#e6e6e6]">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-md ${
                  isTelegram
                    ? "bg-[#0075de]/10 text-[#0075de]"
                    : "bg-[#4a154b]/10 text-[#4a154b]"
                }`}
              >
                {isTelegram ? <Send className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              </div>
              <DialogTitle className="text-sm font-bold text-[#000000]">
                Message &amp; AI Analysis Details
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  message.processingStatus === "Processed"
                    ? "bg-[#1aae39]/10 text-[#1aae39] border-[#1aae39]/30"
                    : message.processingStatus === "Needs Review"
                    ? "bg-[#dd5b00]/10 text-[#dd5b00] border-[#dd5b00]/30"
                    : message.processingStatus === "Failed"
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-gray-100 text-[#615d59] border-gray-200"
                }`}
              >
                {message.processingStatus}
              </span>
              <span className="text-[10px] font-mono text-[#a39e98] bg-[#f6f5f4] px-1.5 py-0.5 rounded border border-[#e6e6e6]">
                {message.id}
              </span>
            </div>
          </div>

          <DialogDescription className="text-xs text-[#615d59]">
            Full provenance of inbound team communication, extracted intent, and deterministic policy rule outcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Sender & Source Metadata */}
          <div className="p-3 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 border border-[#e6e6e6]">
                  <AvatarFallback className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                    {message.senderName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-[#000000]">{message.senderName}</span>
                  <span className="text-[10px] text-[#615d59] ml-1.5">@{message.senderUsername}</span>
                </div>
              </div>
              <span className="text-[10px] text-[#615d59]">{message.receivedAt}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#615d59] pt-1 border-t border-[#e6e6e6]/60">
              <span>
                Platform: <strong className="text-[#000000]">{message.sourcePlatform}</strong>
              </span>
              <span>•</span>
              <span>
                Date: <strong className="text-[#000000]">{message.date}</strong>
              </span>
              {message.confidence !== undefined && (
                <>
                  <span>•</span>
                  <span>
                    Model Confidence:{" "}
                    <strong className="text-[#0075de]">
                      {Math.round(message.confidence * 100)}%
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Original Message Text */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
              Inbound Message Content
            </span>
            <div className="p-3 bg-white rounded-lg border border-[#e6e6e6] text-[#000000] text-xs font-sans leading-relaxed italic bg-amber-50/20">
              &ldquo;{message.messageText}&rdquo;
            </div>
          </div>

          {/* AI Extraction & Interpretation */}
          <div className="space-y-2 p-3.5 bg-white rounded-lg border border-[#0075de]/20 bg-[#0075de]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0075de] font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AI Interpretation &amp; Intent Analysis</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white border border-[#0075de]/30 text-[#0075de] font-bold">
                Intent: {message.interpretation.intent}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Extracted Meaning
              </span>
              <p className="text-xs text-[#000000] leading-relaxed">
                {message.interpretation.summary}
              </p>
            </div>

            {/* Blocker Callout if present */}
            {message.interpretation.blockerDetected && (
              <div className="p-2.5 bg-orange-50 border border-[#dd5b00]/30 rounded-md space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#dd5b00] font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Blocker Detected: {message.interpretation.blockerDescription}</span>
                </div>
                {message.interpretation.missingDependency && (
                  <p className="text-[11px] text-[#615d59]">
                    <strong className="text-[#000000]">Missing Dependency:</strong>{" "}
                    {message.interpretation.missingDependency}
                  </p>
                )}
              </div>
            )}

            {/* Suggested Next Action */}
            {message.interpretation.suggestedNextAction && (
              <div className="space-y-0.5 pt-1">
                <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Recommended Action
                </span>
                <p className="text-xs text-[#31302e]">
                  {message.interpretation.suggestedNextAction}
                </p>
              </div>
            )}

            {/* State Machine Policy Reasoning */}
            <div className="space-y-0.5 pt-1 border-t border-[#0075de]/15">
              <span className="text-[10px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Verification &amp; State Policy Rule
              </span>
              <p className="text-[11px] text-[#615d59] leading-relaxed">
                {message.interpretation.reasoning}
              </p>
            </div>
          </div>

          {/* Related Task Association */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
              Associated Commitment Task
            </span>
            {message.relatedTaskId ? (
              <div className="flex items-center justify-between p-2.5 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] font-bold text-[#0075de] bg-[#0075de]/10 px-1.5 py-0.5 rounded border border-[#0075de]/30 shrink-0">
                    {message.relatedTaskCode}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-[#000000] block truncate">
                      {message.relatedTaskTitle}
                    </span>
                    {message.relatedTaskStatus && (
                      <div className="mt-1">
                        <StatusBadge status={message.relatedTaskStatus} />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (message.relatedTaskId) {
                      onOpenTaskDrawer(message.relatedTaskId);
                    }
                  }}
                  className="h-7 text-xs border-[#e6e6e6] hover:bg-white text-[#0075de] flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Open Drawer</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="p-2.5 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] text-[#615d59] text-xs">
                No commitment task associated. Message classified as general team chat.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-[#e6e6e6] flex sm:justify-between items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleReviewStatus(message.id)}
            className={`h-8 text-xs font-medium ${
              isNeedsReview
                ? "bg-[#1aae39]/10 text-[#1aae39] hover:bg-[#1aae39]/20 border-[#1aae39]/30"
                : "border-[#e6e6e6] text-[#615d59] hover:bg-[#f6f5f4]"
            }`}
          >
            {isNeedsReview ? "Mark as Resolved" : "Flag for Human Review"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs bg-[#000000] hover:bg-[#31302e] text-white px-4 rounded-md"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
