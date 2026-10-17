"use client";

import React, { useState } from "react";
import {
  Radio,
  Send,
  Bot,
  User,
  Zap,
} from "lucide-react";
import { Message, User as TeamUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StreamFeedProps {
  messages: Message[];
  users: TeamUser[];
  onSimulateReply: (userId: string, text: string) => Promise<void>;
  onInspectMessage?: (message: Message) => void;
}

export function StreamFeed({
  messages,
  users,
  onSimulateReply,
}: StreamFeedProps) {
  const [selectedUserForSim, setSelectedUserForSim] = useState<string>(
    users.find((u) => u.name === "Kabir")?.id || users[0]?.id || ""
  );
  const [simText, setSimText] = useState("connected, but waiting for test credentials");
  const [isSimulating, setIsSimulating] = useState(false);
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);
  const [inspectedMessage, setInspectedMessage] = useState<Message | null>(null);

  const handleSimulate = async (customText?: string) => {
    const textToSend = customText || simText;
    if (!textToSend.trim() || !selectedUserForSim) return;
    setIsSimulating(true);
    try {
      await onSimulateReply(selectedUserForSim, textToSend.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Simulation failed: ${msg}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const intentColors: Record<string, { bg: string; text: string }> = {
    blocked: { bg: "bg-rose-100 dark:bg-rose-950/70", text: "text-rose-800 dark:text-rose-300 font-semibold" },
    claims_done: { bg: "bg-purple-100 dark:bg-purple-950/70", text: "text-purple-800 dark:text-purple-300 font-semibold" },
    progress: { bg: "bg-blue-100 dark:bg-blue-950/70", text: "text-blue-800 dark:text-blue-300" },
    question: { bg: "bg-amber-100 dark:bg-amber-950/70", text: "text-amber-800 dark:text-amber-300" },
    unclear: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300" },
  };

  const filteredMessages = messages.filter((m) => {
    if (directionFilter !== "all" && m.direction !== directionFilter) return false;
    if (needsReviewOnly && !m.needs_review && (m.confidence || 1) >= 0.7) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1 p-6 space-y-5 max-w-7xl mx-auto w-full">
      {/* Simulation Rehearsal Bar */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 text-white">
              <Zap className="h-3.5 w-3.5 fill-white" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                Live Telegram Interaction Simulator
              </h3>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Simulate inbound member replies to verify Gemini interpretation & state transitions on the spot
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                const kabir = users.find((u) => u.name === "Kabir")?.id || users[0]?.id || "";
                setSelectedUserForSim(kabir);
                setSimText("connected, but waiting for test credentials");
                handleSimulate("connected, but waiting for test credentials");
              }}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100/60 dark:bg-zinc-900 dark:text-amber-200 dark:border-amber-900"
            >
              Test Kabir Blocker
            </button>
            <button
              onClick={() => {
                const aisha = users.find((u) => u.name === "Aisha")?.id || users[0]?.id || "";
                setSelectedUserForSim(aisha);
                setSimText("done, merged the checkout PR https://github.com/org/repo/pull/12");
                handleSimulate("done, merged the checkout PR https://github.com/org/repo/pull/12");
              }}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100/60 dark:bg-zinc-900 dark:text-amber-200 dark:border-amber-900"
            >
              Test Aisha &quot;Claims Done&quot;
            </button>
            <button
              onClick={() => {
                const ravi = users.find((u) => u.name === "Ravi")?.id || users[0]?.id || "";
                setSelectedUserForSim(ravi);
                setSimText("I'm 80% done with CI/CD pipeline");
                handleSimulate("I'm 80% done with CI/CD pipeline");
              }}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100/60 dark:bg-zinc-900 dark:text-amber-200 dark:border-amber-900"
            >
              Test Ravi 80% Progress
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedUserForSim}
            onChange={(e) => setSelectedUserForSim(e.target.value)}
            className="rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-amber-900"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                Simulate: {u.name} ({u.role})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={simText}
            onChange={(e) => setSimText(e.target.value)}
            placeholder="Type simulated Telegram response..."
            className="flex-1 min-w-[200px] rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:border-amber-900"
          />

          <Button
            size="sm"
            onClick={() => handleSimulate()}
            disabled={isSimulating}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium gap-1 shadow-xs"
          >
            <Send className="h-3 w-3" />
            {isSimulating ? "Processing..." : "Send Simulated Inbound"}
          </Button>
        </div>
      </div>

      {/* Stream Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e6e6] pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#2383e2] animate-pulse" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Realtime Ingestion Feed
          </h3>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono">
            {messages.length} messages logged
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={needsReviewOnly}
              onChange={(e) => setNeedsReviewOnly(e.target.checked)}
              className="rounded"
            />
            <span>Low Confidence Only (&lt;0.70)</span>
          </label>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="rounded-md border border-[#e6e6e6] bg-white px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="all">All Traffic</option>
            <option value="user_to_bot">Inbound (Teammates)</option>
            <option value="bot_to_user">Outbound (Bot Prompts)</option>
          </select>
        </div>
      </div>

      {/* Feed Messages */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e6e6e6] p-12 text-center text-zinc-400 dark:border-zinc-800 text-xs">
            No stream messages match the selected filters.
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isOutbound = msg.direction === "bot_to_user";
            const intent = msg.intent;
            const intentStyle = intent ? intentColors[intent] : null;

            return (
              <div
                key={msg.id}
                onClick={() => setInspectedMessage(msg)}
                className="group flex flex-col rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-2xs hover:border-zinc-300 transition-all dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        isOutbound
                          ? "bg-[#2383e2] text-white"
                          : "bg-zinc-800 text-white"
                      )}
                    >
                      {isOutbound ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {isOutbound ? "Cadance Coordinator" : msg.user_name || "Teammate"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {intent && intentStyle && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] uppercase font-bold",
                          intentStyle.bg,
                          intentStyle.text
                        )}
                      >
                        [{intent.replace("_", " ")}]
                      </span>
                    )}

                    {msg.confidence !== undefined && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {Math.round(msg.confidence * 100)}% conf
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-zinc-800 dark:text-zinc-200 pl-8 leading-relaxed font-mono">
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Message Modal */}
      {inspectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[#e6e6e6] bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Message Deep Inspection
              </h3>
              <button
                onClick={() => setInspectedMessage(null)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-zinc-400">Direction:</span>{" "}
                <strong className="font-semibold">{inspectedMessage.direction}</strong>
              </div>
              <div>
                <span className="text-zinc-400">Sender / Recipient:</span>{" "}
                <strong className="font-semibold">{inspectedMessage.user_name || "User"}</strong>
              </div>
              <div>
                <span className="text-zinc-400">Intent:</span>{" "}
                <strong className="font-semibold uppercase">{inspectedMessage.intent || "N/A"}</strong>
              </div>
              <div>
                <span className="text-zinc-400">Payload:</span>
                <p className="mt-1 rounded bg-zinc-50 p-2 font-mono text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border">
                  &quot;{inspectedMessage.text}&quot;
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setInspectedMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
