import { createClient as createBrowserClient } from "@/lib/supabase/client";

export interface ActivityLogEntry {
  id: string;
  actor_id?: string;
  entity_type: "customer" | "lead" | "task" | "system" | "user";
  entity_id: string;
  action: "created" | "updated" | "deleted" | "stage_changed" | "assigned" | "mentioned" | "status_changed";
  diff?: Record<string, unknown>;
  occurred_at: string;
  actor_name?: string;
}

const DEFAULT_MOCK_ACTIVITIES: ActivityLogEntry[] = [
  {
    id: "a1",
    actor_id: "u1",
    actor_name: "Sarah Jenkins",
    entity_type: "lead",
    entity_id: "l3",
    action: "stage_changed",
    diff: { stage: { from: "Qualified", to: "Proposal" } },
    occurred_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    actor_id: "u2",
    actor_name: "David Miller",
    entity_type: "customer",
    entity_id: "1",
    action: "updated",
    diff: { company: { from: "Acme Inc", to: "Acme Corp" } },
    occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    actor_id: "u1",
    actor_name: "Sarah Jenkins",
    entity_type: "task",
    entity_id: "t1",
    action: "created",
    diff: { title: "Schedule system integration review" },
    occurred_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const isBrowser = typeof window !== "undefined";

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes("nexus-demo-session=true");
}

function getMockActivities(): ActivityLogEntry[] {
  if (!isBrowser) return DEFAULT_MOCK_ACTIVITIES;
  const cached = localStorage.getItem("nexus-mock-activity-log");
  if (!cached) {
    localStorage.setItem("nexus-mock-activity-log", JSON.stringify(DEFAULT_MOCK_ACTIVITIES));
    return DEFAULT_MOCK_ACTIVITIES;
  }
  return JSON.parse(cached);
}

/**
 * Activity Log Database Service
 * 
 * Why Reads and Writes are Separated in Architecture:
 * 1. Reads (Queries): Activity log reads are heavily cached and indexed by (entity_type, entity_id) and occurred_at.
 *    They are consumed directly by UI timeline components.
 * 2. Writes (Logging): Activity log writes are append-only. In production, writes are produced by Database Webhooks 
 *    or server background workers rather than user client components. Decoupling reads from writes ensures
 *    data integrity, prevents client-side tampering with audit logs, and maintains append-only immutability.
 */
export const activityLogService = {
  /**
   * Fetches historical activity log events for a specific entity (e.g., Customer Detail timeline).
   * 
   * @param entityType - Type category of entity ('customer' | 'lead' | 'task')
   * @param entityId - Target entity identifier
   */
  async getActivityForEntity(entityType: string, entityId: string): Promise<ActivityLogEntry[]> {
    if (isDemoSandbox()) {
      const list = getMockActivities();
      return list.filter((a) => a.entity_type === entityType && a.entity_id === entityId);
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return (data as ActivityLogEntry[]) || [];
  },

  /**
   * Fetches the global activity stream for the dashboard overview feed.
   * 
   * @param limit - Maximum items to retrieve (defaults to 15)
   */
  async getRecentGlobalActivity(limit: number = 15): Promise<ActivityLogEntry[]> {
    if (isDemoSandbox()) {
      const list = getMockActivities();
      return list.slice(0, limit);
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as ActivityLogEntry[]) || [];
  },
};
