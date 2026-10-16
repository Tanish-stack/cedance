"use client";

import React, { useState } from "react";
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
import { Send, Info } from "lucide-react";
import type { BlockedTask } from "@/types/task";

interface PingOwnerDialogProps {
  task: BlockedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPing: (task: BlockedTask, customMessage: string) => void;
}

export function PingOwnerDialog({
  task,
  isOpen,
  onClose,
  onConfirmPing,
}: PingOwnerDialogProps) {
  const [customNote, setCustomNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!task) return null;

  const defaultMessage = `Hi ${task.ownerName}, checking in on "${task.title}". It's currently flagged as Blocked ("${task.blockerText}"). Can we unblock this today?`;

  function handleSend() {
    if (!task) return;
    const currentTask = task;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onConfirmPing(currentTask, customNote || defaultMessage);
      onClose();
    }, 600);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0075de]/10 text-[#0075de]">
              <Send className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-[#000000]">
              Ping Commitment Owner
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#615d59]">
            Simulate dispatching a targeted follow-up prompt to the task owner on Telegram.
          </DialogDescription>
        </DialogHeader>

        {/* Recipient info */}
        <div className="flex items-center justify-between p-2.5 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 border border-[#e6e6e6]">
              <AvatarFallback className="text-[10px] font-semibold bg-[#0075de]/10 text-[#0075de]">
                {task.ownerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="font-semibold text-[#000000] block truncate">
                {task.ownerName}
              </span>
              <span className="text-[10px] text-[#a39e98] block">
                @{task.ownerUsername} · {task.code}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#e6e6e6] text-[#615d59]">
            Telegram Bot
          </span>
        </div>

        {/* Message preview */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
            Message Preview (Simulated Telegram Bot text)
          </label>
          <div className="p-3 bg-white rounded-lg border border-[#e6e6e6] text-xs text-[#31302e] font-sans leading-relaxed">
            <p className="italic text-[#000000]">&ldquo;{defaultMessage}&rdquo;</p>
            {customNote && (
              <p className="mt-2 pt-2 border-t border-[#f6f5f4] text-[#0075de] font-medium">
                Note from Manager: &ldquo;{customNote}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Optional manager note input */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#615d59] font-medium block">
            Add custom manager note (optional)
          </label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Aisha has the keys ready, please coordinate."
            className="w-full h-8 px-2.5 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000]"
          />
        </div>

        {/* Notice */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#a39e98]">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#615d59]" />
          <span>Simulated local interaction. No real Telegram network call will be executed.</span>
        </div>

        <DialogFooter className="pt-2 border-t border-[#e6e6e6] flex sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs border-[#e6e6e6]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white rounded-full font-medium px-4 shadow-xs"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Simulated Ping</span>
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
