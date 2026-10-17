"use client";

import React, { useState } from "react";
import { X, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as TeamUser } from "@/lib/types";

interface DemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  users: TeamUser[];
  onSimulateReply: (userId: string, text: string) => Promise<void>;
}

export function DemoDrawer({
  isOpen,
  onClose,
  users,
  onSimulateReply,
}: DemoDrawerProps) {
  const [isRunningStep, setIsRunningStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const demoScenarios = [
    {
      step: 1,
      title: "Anchor Test: Kabir reports blocker",
      user: "Kabir",
      text: "connected, but waiting for test credentials",
      explanation: "Gemini identifies intent: 'blocked'. The task is marked Blocked, blocker is stored, and downstream deliverables are flagged At Risk.",
    },
    {
      step: 2,
      title: "Unblocker Followup: Aisha assists",
      user: "Aisha",
      text: "I shared the Stripe sandbox test API keys with Kabir in DM.",
      explanation: "Classifier notes progress & resolution communication between teammates.",
    },
    {
      step: 3,
      title: "Completion Claim: Kabir finishes API",
      user: "Kabir",
      text: "All done! Stripe API is connected and verified. PR: https://github.com/org/repo/pull/15",
      explanation: "Task moves to 'Pending Verification'. It cannot become Complete without passing evidence.",
    },
    {
      step: 4,
      title: "Ravi CI/CD Kickoff",
      user: "Ravi",
      text: "Started the GitHub actions pipeline, tests are running clean.",
      explanation: "Updates task status to In Progress and logs progress in stream.",
    },
  ];

  const runScenario = async (scenario: typeof demoScenarios[0]) => {
    const userObj = users.find((u) => u.name === scenario.user) || users[0];
    if (!userObj) return;

    setIsRunningStep(scenario.step);
    try {
      await onSimulateReply(userObj.id, scenario.text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Simulation error: ${msg}`);
    } finally {
      setIsRunningStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-[#e6e6e6] bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-white">
              <Zap className="h-3.5 w-3.5 fill-white" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              End-to-End Live Rehearsal Suite
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click any scenario to simulate a real Telegram reply from a teammate and watch the dashboard update live via Realtime:
          </p>

          <div className="space-y-3">
            {demoScenarios.map((sc) => (
              <div
                key={sc.step}
                className="rounded-lg border border-[#e6e6e6] p-3.5 dark:border-zinc-800 bg-[#fbfbfa] dark:bg-zinc-900/60 space-y-2 hover:border-zinc-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {sc.title}
                  </span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Step {sc.step}
                  </span>
                </div>

                <div className="rounded bg-white p-2 font-mono text-[11px] text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="font-semibold text-[#2383e2]">{sc.user}: </span>
                  &quot;{sc.text}&quot;
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {sc.explanation}
                </p>

                <Button
                  size="xs"
                  onClick={() => runScenario(sc)}
                  disabled={isRunningStep !== null}
                  className="w-full bg-[#2383e2] hover:bg-[#1a73cb] text-white text-xs gap-1 shadow-xs"
                >
                  <Play className="h-3 w-3 fill-white" />
                  {isRunningStep === sc.step ? "Executing in Backend..." : "Run Scenario on Live Engine"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
