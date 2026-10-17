import { Task, User, Message, TaskEvent, Project } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error((errBody as { error?: string }).error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[API] ${endpoint} request failed:`, msg);
    throw err;
  }
}

export const api = {
  async getTasks(): Promise<Task[]> {
    const data = await fetchJson<{ tasks: Task[] }>("/tasks");
    return data.tasks || [];
  },

  async getTask(id: string): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/tasks/${id}`);
    return data.task;
  },

  async getUsers(): Promise<{ project: Project; users: User[] }> {
    return await fetchJson<{ project: Project; users: User[] }>("/users");
  },

  async getMessages(): Promise<Message[]> {
    const data = await fetchJson<{ messages: Message[] }>("/messages");
    return data.messages || [];
  },

  async getTaskEvents(taskId?: string): Promise<TaskEvent[]> {
    const endpoint = taskId ? `/tasks/${taskId}/events` : "/task-events";
    const data = await fetchJson<{ events: TaskEvent[] }>(endpoint);
    return data.events || [];
  },

  async createTask(taskData: Partial<Task> & { dependencies?: string[] }): Promise<Task> {
    const data = await fetchJson<{ ok: boolean; task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
    return data.task;
  },

  async sendFollowup(taskId: string): Promise<{ success: boolean; taskId: string; followupCount: number; text: string }> {
    return await fetchJson(`/tasks/${taskId}/followup`, {
      method: "POST",
    });
  },

  async resolveBlocker(taskId: string, note?: string): Promise<{ ok: boolean; task: Task }> {
    return await fetchJson(`/tasks/${taskId}/resolve-blocker`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async overrideStatus(
    taskId: string,
    status: string,
    reason?: string,
    progress_pct?: number
  ): Promise<{ ok: boolean; task: Task }> {
    return await fetchJson(`/tasks/${taskId}/override`, {
      method: "POST",
      body: JSON.stringify({ status, reason, progress_pct }),
    });
  },

  async verifyTask(
    taskId: string,
    content: string,
    type: "link" | "text" = "text"
  ): Promise<{ passed: boolean; status: string; reasoning: string; message: string }> {
    return await fetchJson(`/tasks/${taskId}/verify`, {
      method: "POST",
      body: JSON.stringify({ content, type }),
    });
  },

  async sendTelegramMessage(
    userId: string,
    text: string,
    taskId?: string
  ): Promise<{ ok: boolean; telegram_message_id: string; delivered_to_live_telegram: boolean }> {
    return await fetchJson("/send", {
      method: "POST",
      body: JSON.stringify({ userId, text, taskId }),
    });
  },

  async simulateReply(
    userId: string,
    text: string,
    taskId?: string
  ): Promise<{ ok: boolean; reply: string; updatedTask: Task | null }> {
    return await fetchJson("/simulate-reply", {
      method: "POST",
      body: JSON.stringify({ userId, text, taskId }),
    });
  },
};
