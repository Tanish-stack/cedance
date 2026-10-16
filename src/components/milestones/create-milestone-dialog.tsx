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
import { Target, Calendar, Info, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Milestone, MilestoneStatus } from "@/types/milestone";

interface CreateMilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingMilestones: Milestone[];
  onCreateMilestone: (newMilestone: Milestone) => void;
}

export function CreateMilestoneDialog({
  isOpen,
  onClose,
  existingMilestones,
  onCreateMilestone,
}: CreateMilestoneDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("2026-11-05");
  const [status, setStatus] = useState<MilestoneStatus>("Upcoming");
  const [selectedPrereq, setSelectedPrereq] = useState<string>("none");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const nextCodeNumber = existingMilestones.length + 1;
    const code = `MLS-0${nextCodeNumber}`;
    const id = `mls-${Date.now()}`;

    const newMilestone: Milestone = {
      id,
      code,
      name: name.trim(),
      description: description.trim() || "Milestone deliverable objectives.",
      targetDate,
      status,
      prerequisiteMilestoneIds: selectedPrereq !== "none" ? [selectedPrereq] : [],
      downstreamMilestoneIds: [],
      commitments: [],
      suggestedActions: ["Assign initial required commitments and link deliverables."],
    };

    onCreateMilestone(newMilestone);
    setName("");
    setDescription("");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-[#e6e6e6]">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1aae39]/10 text-[#1aae39]">
                <Target className="w-4 h-4" />
              </div>
              <DialogTitle className="text-sm font-bold text-[#000000]">
                Create New Milestone
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#615d59]">
              Define a new delivery phase, target deadline, and prerequisite dependency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Milestone Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Performance Optimization & Caching"
                className="w-full h-8 px-2.5 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key goals and scope for this milestone deliverable..."
                rows={2}
                className="w-full p-2 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000] resize-none"
              />
            </div>

            {/* Target Date & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Target Deadline
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98]" />
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 text-xs bg-[#f6f5f4] border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de] text-[#000000]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                  Initial Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => val && setStatus(val as MilestoneStatus)}
                >
                  <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming" className="text-xs">
                      Upcoming
                    </SelectItem>
                    <SelectItem value="Active" className="text-xs">
                      Active
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prerequisite Milestone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#615d59] uppercase tracking-wider block">
                Prerequisite Milestone
              </label>
              <Select
                value={selectedPrereq}
                onValueChange={(val) => val && setSelectedPrereq(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None (Independent)
                  </SelectItem>
                  {existingMilestones.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.code}: {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info notice */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#a39e98] pt-1">
              <Info className="w-3.5 h-3.5 shrink-0 text-[#615d59]" />
              <span>Simulated local creation. Adds milestone to local state.</span>
            </div>
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
              type="submit"
              size="sm"
              className="h-8 text-xs bg-[#000000] hover:bg-[#31302e] text-white rounded-md font-medium px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Milestone</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
