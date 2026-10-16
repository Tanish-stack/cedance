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
import { Edit3, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Milestone, MilestoneStatus } from "@/types/milestone";

interface EditMilestoneDialogProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMilestone: (updated: Milestone) => void;
}

export function EditMilestoneDialog({
  milestone,
  isOpen,
  onClose,
  onSaveMilestone,
}: EditMilestoneDialogProps) {
  if (!milestone) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 bg-white border border-[#e6e6e6] rounded-xl shadow-lg">
        <EditMilestoneForm
          key={milestone.id}
          milestone={milestone}
          onClose={onClose}
          onSaveMilestone={onSaveMilestone}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditMilestoneFormProps {
  milestone: Milestone;
  onClose: () => void;
  onSaveMilestone: (updated: Milestone) => void;
}

function EditMilestoneForm({ milestone, onClose, onSaveMilestone }: EditMilestoneFormProps) {
  const [name, setName] = useState(milestone.name);
  const [description, setDescription] = useState(milestone.description);
  const [targetDate, setTargetDate] = useState(milestone.targetDate);
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveMilestone({
      ...milestone,
      name: name.trim(),
      description: description.trim(),
      targetDate,
      status,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader className="space-y-1.5 pb-2 border-b border-[#e6e6e6]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0075de]/10 text-[#0075de]">
            <Edit3 className="w-4 h-4" />
          </div>
          <DialogTitle className="text-sm font-bold text-[#000000]">
            Edit Milestone ({milestone.code})
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-[#615d59]">
          Update milestone title, description, deadline, or delivery status.
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
              Status
            </label>
            <Select
              value={status}
              onValueChange={(val) => val && setStatus(val as MilestoneStatus)}
            >
              <SelectTrigger className="h-8 text-xs bg-[#f6f5f4] border-[#e6e6e6] w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="At Risk" className="text-xs text-[#dd5b00]">
                  At Risk
                </SelectItem>
                <SelectItem value="Completed" className="text-xs text-[#1aae39]">
                  Completed
                </SelectItem>
                <SelectItem value="Upcoming" className="text-xs">
                  Upcoming
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white rounded-md font-medium px-4"
        >
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}
