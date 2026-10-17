"use client";

import React, { useState } from "react";
import { X, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, User as TeamUser, Priority } from "@/lib/types";

interface NewCommitmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCommitment: (taskData: Partial<Task> & { dependencies?: string[] }) => Promise<void>;
  users: TeamUser[];
  existingTasks: Task[];
}

export function NewCommitmentDialog({
  isOpen,
  onClose,
  onCreateCommitment,
  users,
  existingTasks,
}: NewCommitmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [evidenceRequired, setEvidenceRequired] = useState<"link" | "text" | "file">("link");
  const [selectedDependency, setSelectedDependency] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [milestone] = useState("M1: Payments & Core Engine");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateCommitment({
        title: title.trim(),
        description: description.trim(),
        owner_id: ownerId || null,
        deadline: deadline || null,
        acceptance_criteria: acceptanceCriteria.trim(),
        evidence_required: evidenceRequired,
        priority,
        milestone,
        dependencies: selectedDependency ? [selectedDependency] : [],
      });

      // Reset
      setTitle("");
      setDescription("");
      setOwnerId("");
      setDeadline("");
      setAcceptanceCriteria("");
      setSelectedDependency("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to create commitment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl border border-[#e6e6e6] bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2383e2] text-white">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              New Project Commitment
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Commitment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Integrate Stripe Webhooks for Instant Payouts"
              className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#2383e2] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Context & Instructions
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, test mode notes, or repository links..."
              rows={2}
              className="w-full rounded-md border border-[#e6e6e6] bg-white p-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#2383e2] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Assignee & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Assignee
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Acceptance Criteria (Critical for AI Done-verification) */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Acceptance Criteria (What &quot;Done&quot; Means)</span>
            </div>
            <textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="e.g. A payment request succeeds in test mode and the PR link is shared."
              rows={2}
              className="w-full rounded-md border border-blue-200 bg-white p-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#2383e2] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="flex items-center justify-between text-[11px] text-blue-800/80 dark:text-blue-300/80 pt-1">
              <span>Required Evidence Type:</span>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="evidenceType"
                    checked={evidenceRequired === "link"}
                    onChange={() => setEvidenceRequired("link")}
                  />
                  <span>PR / Link</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="evidenceType"
                    checked={evidenceRequired === "text"}
                    onChange={() => setEvidenceRequired("text")}
                  />
                  <span>Text</span>
                </label>
              </div>
            </div>
          </div>

          {/* Prerequisite & Milestone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Prerequisite Dependency
              </label>
              <select
                value={selectedDependency}
                onChange={(e) => setSelectedDependency(e.target.value)}
                className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">No Prerequisite</option>
                {existingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[#e6e6e6] pt-4 dark:border-zinc-800">
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
              disabled={isSubmitting || !title.trim()}
              className="bg-[#2383e2] hover:bg-[#1a73cb] text-white text-xs font-medium shadow-xs"
            >
              {isSubmitting ? "Creating & Notifying..." : "Create & Dispatch to Telegram"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
