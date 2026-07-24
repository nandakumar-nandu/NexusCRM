import { createClient as createBrowserClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  user_id: string;
  type: "system" | "mention" | "lead" | "task" | "customer";
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const DEFAULT_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    user_id: "demo-user",
    type: "mention",
    title: "Mentioned by David Miller",
    body: "David mentioned you in @sarah Acme Corp consulting contract notes.",
    link: "/customers",
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "n2",
    user_id: "demo-user",
    type: "lead",
    title: "Lead Stage Updated",
    body: "Enterprise Cloud Integration moved to Proposal stage ($45,000).",
    link: "/leads",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n3",
    user_id: "demo-user",
    type: "task",
    title: "Task Deadline Reminder",
    body: "Follow up with Starlight Media is due today at 5:00 PM.",
    link: "/tasks",
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const isBrowser = typeof window !== "undefined";

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes("nexus-demo-session=true");
}

function getMockNotifications(): NotificationItem[] {
  if (!isBrowser) return DEFAULT_MOCK_NOTIFICATIONS;
  const cached = localStorage.getItem("nexus-mock-notifications");
  if (!cached) {
    localStorage.setItem("nexus-mock-notifications", JSON.stringify(DEFAULT_MOCK_NOTIFICATIONS));
    return DEFAULT_MOCK_NOTIFICATIONS;
  }
  return JSON.parse(cached);
}

function saveMockNotifications(items: NotificationItem[]) {
  if (isBrowser) {
    localStorage.setItem("nexus-mock-notifications", JSON.stringify(items));
  }
}

/**
 * Notifications Database Service
 * 
 * Provides unified API operations for system notifications, unread counts,
 * and status updates across live Supabase sessions and offline sandbox fallbacks.
 */
export const notificationsService = {
  /**
   * Retrieves the current count of unread notifications for the active user.
   */
  async getUnreadCount(): Promise<number> {
    if (isDemoSandbox()) {
      const list = getMockNotifications();
      return list.filter((n) => !n.is_read).length;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Fetches paginated or filtered list of notifications for the user.
   * 
   * @param filter - Tab filter criteria ('all' | 'unread' | 'mention')
   * @param limit - Max item count to return
   */
  async getNotifications(filter: "all" | "unread" | "mention" = "all", limit: number = 20): Promise<NotificationItem[]> {
    if (isDemoSandbox()) {
      let list = getMockNotifications();
      if (filter === "unread") {
        list = list.filter((n) => !n.is_read);
      } else if (filter === "mention") {
        list = list.filter((n) => n.type === "mention");
      }
      return list.slice(0, limit);
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filter === "unread") {
      query = query.eq("is_read", false);
    } else if (filter === "mention") {
      query = query.eq("type", "mention");
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as NotificationItem[]) || [];
  },

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(id: string): Promise<void> {
    if (isDemoSandbox()) {
      const list = getMockNotifications();
      const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      saveMockNotifications(updated);
      return;
    }

    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Marks all unread notifications as read for the active user.
   */
  async markAllAsRead(): Promise<void> {
    if (isDemoSandbox()) {
      const list = getMockNotifications();
      const updated = list.map((n) => ({ ...n, is_read: true }));
      saveMockNotifications(updated);
      return;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;
  },

  /**
   * Creates a new notification entry.
   */
  async createNotification(item: Omit<NotificationItem, "id" | "created_at" | "is_read">): Promise<NotificationItem> {
    if (isDemoSandbox()) {
      const list = getMockNotifications();
      const newNotification: NotificationItem = {
        ...item,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      saveMockNotifications([newNotification, ...list]);
      return newNotification;
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          ...item,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as NotificationItem;
  },
};
