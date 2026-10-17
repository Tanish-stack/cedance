"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";

interface ResolveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onConfirmResolve: (taskId: string, note: string) => Promise<void>;
}

export function ResolveDialog({
  isOpen,
  onClose,
  task,
  onConfirmResolve,
}: ResolveDialogProps) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResolving(true);
    try {
      await onConfirmResolve(
        task.id,
        resolutionNote.trim() || "Blocker resolved by manager or team"
      );
      setResolutionNote("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to resolve blocker: ${msg}`);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-[#e6e6e6] bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Clear Blocker & Resume
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
          <div className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
            <div>
              Resolving blocker on: <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</strong>
            </div>
            {task.blocker_text && (
              <div className="font-mono text-[11px] text-rose-600 dark:text-rose-400">
                Current issue: &quot;{task.blocker_text}&quot;
              </div>
            )}
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1">
              ✓ Status will return to <strong>In Progress</strong> and downstream <strong>At Risk</strong> flags will be cleared.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Resolution Documentation
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Test credentials generated and shared on Telegram; unblocked."
              rows={3}
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
              disabled={isResolving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs"
            >
              {isResolving ? "Clearing Blocker..." : "Confirm & Resume Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
