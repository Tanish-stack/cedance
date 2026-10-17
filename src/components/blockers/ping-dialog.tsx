"use client";

import React, { useState } from "react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; name: string } | null;
  taskTitle?: string;
  defaultText?: string;
  onSendPing: (userId: string, text: string) => Promise<void>;
}

export function PingDialog({
  isOpen,
  onClose,
  targetUser,
  taskTitle,
  defaultText,
  onSendPing,
}: PingDialogProps) {
  const initialText =
    defaultText ||
    (targetUser
      ? `Hi ${targetUser.name}, quick reminder from the team regarding "${taskTitle || "your deliverable"}". Can you provide a status update?`
      : "");

  const [text, setText] = useState(initialText);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);
    try {
      await onSendPing(targetUser.id, text.trim());
      setSuccessMsg(`Message successfully dispatched to ${targetUser.name} on Telegram!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to send Telegram ping: ${msg}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-[#e6e6e6] bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2383e2] text-white">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Ping Teammate on Telegram
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {successMsg ? (
            <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 font-medium border border-emerald-200">
              ✓ {successMsg}
            </div>
          ) : (
            <>
              <div className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800">
                <span>Sending Telegram message to </span>
                <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{targetUser.name}</strong>
                {taskTitle && (
                  <span> regarding <strong className="text-zinc-800 dark:text-zinc-200 font-medium">&quot;{taskTitle}&quot;</strong></span>
                )}
                .
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Message Payload
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-[#e6e6e6] bg-white p-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#2383e2] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e6e6e6] dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSending || !text.trim()}
                  className="bg-[#2383e2] hover:bg-[#1a73cb] text-white text-xs font-medium gap-1.5 shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  {isSending ? "Dispatching..." : "Send Live Telegram Message"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
