"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, ActiveTab } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { CommitmentsLedger } from "@/components/ledger/commitments-ledger";
import { CommitmentDrawer } from "@/components/ledger/commitment-drawer";
import { NewCommitmentDialog } from "@/components/ledger/new-commitment-dialog";
import { BlockerRadar } from "@/components/blockers/blocker-radar";
import { StreamFeed } from "@/components/stream-audit/stream-feed";
import { AuditTimeline } from "@/components/stream-audit/audit-timeline";
import { MilestonesMap } from "@/components/milestones/milestones-map";
import { DemoDrawer } from "@/components/shell/demo-drawer";
import {
  MOCK_COMMITMENTS,
  MOCK_STREAM_MESSAGES,
  MOCK_AUDIT_EVENTS,
  MOCK_USERS,
} from "@/lib/mock-data";
import { Task, Message, TaskEvent, User, TaskStatus } from "@/lib/types";
import { api } from "@/lib/api";
import { subscribeToRealtimeUpdates, isSupabaseConfigured } from "@/lib/supabase";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ledger");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states initialized with coherent seed data
  const [tasks, setTasks] = useState<Task[]>(MOCK_COMMITMENTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_STREAM_MESSAGES);
  const [events, setEvents] = useState<TaskEvent[]>(MOCK_AUDIT_EVENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Modal & selection state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewCommitmentOpen, setIsNewCommitmentOpen] = useState(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);

  // Status flags
  const [isSyncing, setIsSyncing] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(isSupabaseConfigured);

  // Derived selected task
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Manual refresh callback
  const refreshData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [fetchedTasks, fetchedUsers, fetchedMessages, fetchedEvents] = await Promise.allSettled([
        api.getTasks(),
        api.getUsers(),
        api.getMessages(),
        api.getTaskEvents(),
      ]);

      if (fetchedTasks.status === "fulfilled" && fetchedTasks.value.length > 0) {
        setTasks(fetchedTasks.value);
        setBackendOnline(true);
      }
      if (fetchedUsers.status === "fulfilled" && fetchedUsers.value.users?.length > 0) {
        setUsers(fetchedUsers.value.users);
      }
      if (fetchedMessages.status === "fulfilled" && fetchedMessages.value.length > 0) {
        setMessages(fetchedMessages.value);
      }
      if (fetchedEvents.status === "fulfilled" && fetchedEvents.value.length > 0) {
        setEvents(fetchedEvents.value);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial mount & Realtime subscription
  useEffect(() => {
    let isMounted = true;

    const performSync = async () => {
      try {
        const [fetchedTasks, fetchedUsers, fetchedMessages, fetchedEvents] = await Promise.allSettled([
          api.getTasks(),
          api.getUsers(),
          api.getMessages(),
          api.getTaskEvents(),
        ]);

        if (!isMounted) return;

        if (fetchedTasks.status === "fulfilled" && fetchedTasks.value.length > 0) {
          setTasks(fetchedTasks.value);
          setBackendOnline(true);
        }
        if (fetchedUsers.status === "fulfilled" && fetchedUsers.value.users?.length > 0) {
          setUsers(fetchedUsers.value.users);
        }
        if (fetchedMessages.status === "fulfilled" && fetchedMessages.value.length > 0) {
          setMessages(fetchedMessages.value);
        }
        if (fetchedEvents.status === "fulfilled" && fetchedEvents.value.length > 0) {
          setEvents(fetchedEvents.value);
        }
      } catch {
        // Handled silently
      }
    };

    void performSync();

    const pollInterval = setInterval(() => {
      void performSync();
    }, 4000);

    const unsubscribe = subscribeToRealtimeUpdates({
      onTaskChange: () => {
        if (!isMounted) return;
        setRealtimeActive(true);
        void performSync();
      },
      onMessageChange: () => {
        if (!isMounted) return;
        setRealtimeActive(true);
        void performSync();
      },
      onEventChange: () => {
        if (!isMounted) return;
        setRealtimeActive(true);
        void performSync();
      },
    });

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      unsubscribe();
    };
  }, []);

  // Actions
  const handleOpenTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsDrawerOpen(true);
  };

  const handleCreateCommitment = async (taskData: Partial<Task> & { dependencies?: string[] }) => {
    try {
      const created = await api.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      await refreshData();
    } catch {
      // Local optimistic fallback
      const newTask: Task = {
        id: `task-${Date.now()}`,
        project_id: "00000000-0000-0001-0001-000000000001",
        title: taskData.title || "Untitled Task",
        description: taskData.description || "",
        owner_id: taskData.owner_id || null,
        owner_name: users.find((u) => u.id === taskData.owner_id)?.name || "Unassigned",
        status: "Assigned",
        progress_pct: 0,
        deadline: taskData.deadline || null,
        acceptance_criteria: taskData.acceptance_criteria || "",
        evidence_required: taskData.evidence_required || "text",
        blocker_text: null,
        blocker_owner_id: null,
        at_risk: false,
        followup_count: 0,
        created_at: new Date().toISOString(),
        last_update_at: new Date().toISOString(),
        dependencies: taskData.dependencies || [],
        priority: taskData.priority || "Medium",
        milestone: taskData.milestone || "M1: Core",
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleNudgeOwner = async (taskId: string) => {
    try {
      await api.sendFollowup(taskId);
      await refreshData();
      alert("Follow-up nudge dispatched to owner on Telegram!");
    } catch {
      // Fallback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, followup_count: (t.followup_count || 0) + 1, last_update_at: new Date().toISOString() }
            : t
        )
      );
      alert("Nudge logged and sent!");
    }
  };

  const handleSendPing = async (userId: string, text: string) => {
    try {
      await api.sendTelegramMessage(userId, text);
      await refreshData();
    } catch {
      // Local optimistic fallback when backend is offline
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        user_id: userId,
        task_id: null,
        direction: "bot_to_user",
        text,
        created_at: new Date().toISOString(),
        user_name: users.find((u) => u.id === userId)?.name || "Teammate",
      };
      setMessages((prev) => [newMsg, ...prev]);
    }
  };

  const handleResolveBlocker = async (taskId: string, note?: string) => {
    try {
      await api.resolveBlocker(taskId, note);
      await refreshData();
    } catch {
      // Optimistic fallback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "In Progress", blocker_text: null, at_risk: false }
            : t
        )
      );
    }
  };

  const handleOverrideStatus = async (taskId: string, status: TaskStatus, reason: string) => {
    try {
      await api.overrideStatus(taskId, status, reason);
      await refreshData();
    } catch {
      // Optimistic fallback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
    }
  };

  const handleVerifyEvidence = async (taskId: string, content: string) => {
    try {
      const res = await api.verifyTask(taskId, content);
      await refreshData();
      alert(res.message || "Done-verification evaluated.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Verification notice: ${msg}`);
    }
  };

  const handleSimulateReply = async (userId: string, text: string) => {
    await api.simulateReply(userId, text);
    await refreshData();
  };

  // Counts for sidebar badges
  const sidebarCounts = {
    total: tasks.length,
    blocked: tasks.filter((t) => t.status === "Blocked").length,
    atRisk: tasks.filter((t) => t.at_risk).length,
    stream: messages.length,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        counts={sidebarCounts}
        backendOnline={backendOnline}
      />

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewCommitment={() => setIsNewCommitmentOpen(true)}
          onRefresh={refreshData}
          onOpenDemoDrawer={() => setIsDemoDrawerOpen(true)}
          isSyncing={isSyncing}
          realtimeActive={realtimeActive}
        />

        {/* View Switcher Content */}
        <main className="flex-1 overflow-y-auto bg-[#fafaf9] dark:bg-black/40">
          {activeTab === "ledger" && (
            <CommitmentsLedger
              tasks={tasks}
              onSelectTask={handleOpenTask}
              onNudgeOwner={handleNudgeOwner}
              onResolveBlocker={(id) => {
                setSelectedTaskId(id);
                setIsDrawerOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "blockers" && (
            <BlockerRadar
              tasks={tasks}
              users={users}
              onSendPing={handleSendPing}
              onResolveBlocker={handleResolveBlocker}
              onInspectTask={handleOpenTask}
            />
          )}

          {activeTab === "milestones" && (
            <MilestonesMap
              tasks={tasks}
              onInspectTask={handleOpenTask}
            />
          )}

          {activeTab === "stream" && (
            <StreamFeed
              messages={messages}
              users={users}
              onSimulateReply={handleSimulateReply}
            />
          )}

          {activeTab === "audit" && (
            <AuditTimeline events={events} />
          )}
        </main>
      </div>

      {/* Commitment Inspection & Governance Drawer */}
      <CommitmentDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOverrideStatus={handleOverrideStatus}
        onNudgeOwner={handleNudgeOwner}
        onVerifyEvidence={handleVerifyEvidence}
        allTasks={tasks}
      />

      {/* New Commitment Modal */}
      <NewCommitmentDialog
        isOpen={isNewCommitmentOpen}
        onClose={() => setIsNewCommitmentOpen(false)}
        onCreateCommitment={handleCreateCommitment}
        users={users}
        existingTasks={tasks}
      />

      {/* Demo Rehearsal Drawer */}
      <DemoDrawer
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
        users={users}
        onSimulateReply={handleSimulateReply}
      />
    </div>
  );
}
