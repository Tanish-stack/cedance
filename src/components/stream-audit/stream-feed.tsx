"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Send,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StreamMessage } from "@/types/stream-audit";

interface StreamFeedProps {
  messages: StreamMessage[];
  onOpenTaskDrawer: (taskId: string) => void;
  onInspectMessage: (message: StreamMessage) => void;
  onToggleReviewStatus: (messageId: string) => void;
}

export function StreamFeed({
  messages,
  onOpenTaskDrawer,
  onInspectMessage,
  onToggleReviewStatus,
}: StreamFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<"all" | "blocked" | "needs-review">("all");

  // Filtering
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Quick filter
      if (quickFilter === "blocked" && !msg.interpretation.blockerDetected) {
        return false;
      }
      if (quickFilter === "needs-review" && msg.processingStatus !== "Needs Review") {
        return false;
      }

      // Source Filter
      if (sourceFilter !== "all" && msg.sourcePlatform !== sourceFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== "all" && msg.processingStatus !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSender =
          msg.senderName.toLowerCase().includes(query) ||
          msg.senderUsername.toLowerCase().includes(query);
        const matchesText = msg.messageText.toLowerCase().includes(query);
        const matchesTask =
          (msg.relatedTaskCode && msg.relatedTaskCode.toLowerCase().includes(query)) ||
          (msg.relatedTaskTitle && msg.relatedTaskTitle.toLowerCase().includes(query));
        const matchesInterpretation =
          msg.interpretation.summary.toLowerCase().includes(query) ||
          (msg.interpretation.blockerDescription &&
            msg.interpretation.blockerDescription.toLowerCase().includes(query));

        if (!matchesSender && !matchesText && !matchesTask && !matchesInterpretation) {
          return false;
        }
      }

      return true;
    });
  }, [messages, searchQuery, sourceFilter, statusFilter, quickFilter]);

  function handleResetFilters() {
    setSearchQuery("");
    setSourceFilter("all");
    setStatusFilter("all");
    setQuickFilter("all");
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#e6e6e6] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search message text, sender, task, or blocker..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#f6f5f4] hover:bg-[#f6f5f4]/80 focus:bg-white border border-[#e6e6e6] focus:border-[#0075de] rounded-md transition-all outline-none placeholder:text-[#a39e98] text-[#000000]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Source Platform Filter */}
            <Select
              value={sourceFilter}
              onValueChange={(val) => setSourceFilter(val ?? "all")}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-[130px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Sources
                </SelectItem>
                <SelectItem value="Telegram" className="text-xs text-[#0075de]">
                  Telegram
                </SelectItem>
                <SelectItem value="Slack" className="text-xs text-[#4a154b]">
                  Slack
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Processing Status Filter */}
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
                <SelectItem value="Received" className="text-xs">
                  Received
                </SelectItem>
                <SelectItem value="Processed" className="text-xs text-[#1aae39]">
                  Processed
                </SelectItem>
                <SelectItem value="Needs Review" className="text-xs text-[#dd5b00]">
                  Needs Review
                </SelectItem>
                <SelectItem value="Failed" className="text-xs text-red-600">
                  Failed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f6f5f4] flex-wrap">
          <span className="text-[11px] font-semibold text-[#615d59]">Quick View:</span>
          <button
            type="button"
            onClick={() => setQuickFilter("all")}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              quickFilter === "all"
                ? "bg-[#000000] text-white border-[#000000]"
                : "bg-white text-[#615d59] border-[#e6e6e6] hover:bg-[#f6f5f4]"
            }`}
          >
            All Ingested ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter("blocked")}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              quickFilter === "blocked"
                ? "bg-[#dd5b00] text-white border-[#dd5b00]"
                : "bg-white text-[#dd5b00] border-[#dd5b00]/30 hover:bg-[#dd5b00]/10"
            }`}
          >
            Blockers Detected ({messages.filter((m) => m.interpretation.blockerDetected).length})
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter("needs-review")}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              quickFilter === "needs-review"
                ? "bg-[#213183] text-white border-[#213183]"
                : "bg-white text-[#213183] border-[#213183]/30 hover:bg-[#213183]/10"
            }`}
          >
            Needs Review ({messages.filter((m) => m.processingStatus === "Needs Review").length})
          </button>
        </div>
      </div>

      {/* Messages List Feed */}
      {filteredMessages.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-[#e6e6e6] shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#f6f5f4] text-[#a39e98] flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#000000]">No messages match your criteria</h3>
            <p className="text-xs text-[#615d59] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the source and status filters.
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
            <span>Reset All Filters</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isTelegram = msg.sourcePlatform === "Telegram";
            const isBlocked = msg.interpretation.blockerDetected;
            const isNeedsReview = msg.processingStatus === "Needs Review";

            return (
              <div
                key={msg.id}
                className={`p-4 bg-white rounded-xl border transition-all shadow-xs hover:border-[#0075de]/40 ${
                  isBlocked
                    ? "border-l-4 border-l-[#dd5b00] border-[#e6e6e6]"
                    : isNeedsReview
                    ? "border-l-4 border-l-[#213183] border-[#e6e6e6]"
                    : "border-[#e6e6e6]"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-[#f6f5f4]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="w-7 h-7 border border-[#e6e6e6]">
                      <AvatarFallback className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                        {msg.senderName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#000000]">{msg.senderName}</span>
                        <span className="text-[10px] text-[#a39e98]">@{msg.senderUsername}</span>
                      </div>
                    </div>

                    {/* Source Platform Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        isTelegram
                          ? "bg-[#0075de]/10 text-[#0075de] border-[#0075de]/20"
                          : "bg-[#4a154b]/10 text-[#4a154b] border-[#4a154b]/20"
                      }`}
                    >
                      {isTelegram ? <Send className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                      <span>{msg.sourcePlatform}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Timestamp */}
                    <span className="text-[11px] text-[#615d59]">{msg.receivedAt}</span>

                    {/* Processing Status Badge */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        msg.processingStatus === "Processed"
                          ? "bg-[#1aae39]/10 text-[#1aae39] border-[#1aae39]/30"
                          : msg.processingStatus === "Needs Review"
                          ? "bg-[#dd5b00]/10 text-[#dd5b00] border-[#dd5b00]/30"
                          : msg.processingStatus === "Failed"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-gray-100 text-[#615d59] border-gray-200"
                      }`}
                    >
                      {msg.processingStatus}
                    </span>
                  </div>
                </div>

                {/* Raw Inbound Message Text */}
                <div className="py-2.5">
                  <p className="text-xs text-[#000000] font-sans leading-relaxed italic bg-[#f6f5f4]/60 p-2.5 rounded-md border border-[#e6e6e6]/60">
                    &ldquo;{msg.messageText}&rdquo;
                  </p>
                </div>

                {/* AI Interpretation Card */}
                <div className="p-3 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] space-y-2 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5 text-[#0075de] font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Interpretation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#e6e6e6] text-[#615d59]">
                        Intent: {msg.interpretation.intent}
                      </span>
                      {msg.confidence !== undefined && (
                        <span className="text-[10px] font-semibold text-[#0075de] bg-[#0075de]/10 px-1.5 py-0.5 rounded border border-[#0075de]/20">
                          {Math.round(msg.confidence * 100)}% Confidence
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#31302e] font-medium leading-relaxed">
                    {msg.interpretation.summary}
                  </p>

                  {/* Blocker Callout if detected */}
                  {isBlocked && (
                    <div className="p-2 bg-orange-50 border border-[#dd5b00]/30 rounded text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#dd5b00] font-semibold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Blocker: {msg.interpretation.blockerDescription}</span>
                      </div>
                      {msg.interpretation.missingDependency && (
                        <p className="text-[11px] text-[#615d59]">
                          <strong className="text-[#000000]">Missing Dependency:</strong>{" "}
                          {msg.interpretation.missingDependency}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Next Action recommendation */}
                  {msg.interpretation.suggestedNextAction && (
                    <div className="flex items-start gap-1.5 text-[11px] text-[#615d59] pt-1">
                      <ArrowRight className="w-3 h-3 text-[#0075de] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#000000]">Next Action:</strong>{" "}
                        {msg.interpretation.suggestedNextAction}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: Related Task & Quick Actions */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#f6f5f4] flex-wrap gap-2">
                  {/* Related Task Chip */}
                  {msg.relatedTaskId ? (
                    <button
                      type="button"
                      onClick={() => onOpenTaskDrawer(msg.relatedTaskId!)}
                      className="group flex items-center gap-1.5 text-xs text-[#0075de] hover:text-[#005bab] transition-colors cursor-pointer text-left"
                    >
                      <span className="font-mono text-[10px] font-bold bg-[#0075de]/10 group-hover:bg-[#0075de]/20 px-1.5 py-0.5 rounded border border-[#0075de]/30">
                        {msg.relatedTaskCode}
                      </span>
                      <span className="font-medium underline-offset-2 group-hover:underline truncate max-w-[200px] sm:max-w-xs">
                        {msg.relatedTaskTitle}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#a39e98] italic">
                      No linked commitment (General Team Chatter)
                    </span>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onInspectMessage(msg)}
                      className="h-7 text-xs border-[#e6e6e6] text-[#615d59] hover:bg-[#f6f5f4] flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleReviewStatus(msg.id)}
                      className={`h-7 text-xs flex items-center gap-1 ${
                        isNeedsReview
                          ? "bg-[#1aae39]/10 text-[#1aae39] hover:bg-[#1aae39]/20 border-[#1aae39]/30"
                          : "border-[#e6e6e6] text-[#615d59] hover:bg-[#f6f5f4]"
                      }`}
                    >
                      {isNeedsReview ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Resolve Review</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-[#dd5b00]" />
                          <span>Needs Review</span>
                        </>
                      )}
                    </Button>
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
