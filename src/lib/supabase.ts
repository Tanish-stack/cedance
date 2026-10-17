import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-key")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Subscribes to Realtime updates for tasks, messages, and task_events.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToRealtimeUpdates({
  onTaskChange,
  onMessageChange,
  onEventChange,
}: {
  onTaskChange?: (payload: unknown) => void;
  onMessageChange?: (payload: unknown) => void;
  onEventChange?: (payload: unknown) => void;
}) {
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel("cedance-realtime-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      (payload) => {
        if (onTaskChange) onTaskChange(payload);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload) => {
        if (onMessageChange) onMessageChange(payload);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "task_events" },
      (payload) => {
        if (onEventChange) onEventChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
