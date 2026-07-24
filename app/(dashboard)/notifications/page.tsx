"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCheck, 
  AtSign, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Info, 
  ExternalLink,
  Filter
} from "lucide-react";
import { notificationsService, type NotificationItem } from "@/lib/services/notificationsService";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "mention">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsService.getNotifications(filter, limit);
      setNotifications(data);
      setHasMore(data.length >= limit);
    } catch (err) {
      console.error("Failed to load notifications page data:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const loadMore = () => {
    setLimit((prev) => prev + 15);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "mention":
        return <AtSign className="h-5 w-5 text-sky-400" />;
      case "lead":
        return <Briefcase className="h-5 w-5 text-indigo-400" />;
      case "task":
        return <CheckSquare className="h-5 w-5 text-emerald-400" />;
      case "customer":
        return <Users className="h-5 w-5 text-purple-400" />;
      default:
        return <Info className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Notifications Center</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Stay updated with real-time team mentions, deal updates, and task alerts.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-crm-card hover:-translate-y-0.5"
        >
          <CheckCheck className="h-4 w-4 text-emerald-400" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-crm-border/60 pb-3">
        <button
          onClick={() => { setFilter("all"); setLimit(20); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            filter === "all" ? "bg-crm-primary text-white shadow-md shadow-crm-primary/20" : "text-crm-muted hover:bg-crm-cardHover hover:text-white"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>All Notifications</span>
        </button>

        <button
          onClick={() => { setFilter("unread"); setLimit(20); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            filter === "unread" ? "bg-crm-primary text-white shadow-md shadow-crm-primary/20" : "text-crm-muted hover:bg-crm-cardHover hover:text-white"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Unread</span>
        </button>

        <button
          onClick={() => { setFilter("mention"); setLimit(20); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            filter === "mention" ? "bg-crm-primary text-white shadow-md shadow-crm-primary/20" : "text-crm-muted hover:bg-crm-cardHover hover:text-white"
          }`}
        >
          <AtSign className="h-3.5 w-3.5" />
          <span>Mentions (@)</span>
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="glass-panel overflow-hidden rounded-xl border border-crm-border/60">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-crm-muted animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-crm-muted space-y-2">
            <Bell className="mx-auto h-8 w-8 text-crm-muted/50" />
            <p className="text-sm font-semibold text-white">No notifications found</p>
            <p className="text-xs text-crm-muted">You are all caught up for this filter category.</p>
          </div>
        ) : (
          <div className="divide-y divide-crm-border/40">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 p-5 transition-colors ${
                  !item.is_read ? "bg-indigo-500/10 hover:bg-indigo-500/15" : "hover:bg-crm-cardHover/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-xl bg-crm-cardHover p-2.5 shrink-0 shadow-sm border border-crm-border/30">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${!item.is_read ? "text-white" : "text-slate-200"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-crm-cardHover text-indigo-300">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-crm-muted leading-relaxed max-w-2xl">{item.body}</p>
                    <span className="text-[10px] text-crm-muted/80 block pt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.link && (
                    <Link
                      href={item.link}
                      className="flex items-center gap-1 rounded-lg border border-crm-border/60 bg-crm-card/50 px-3 py-1.5 text-xs font-semibold text-crm-primary hover:text-indigo-400 hover:bg-crm-card transition-all"
                    >
                      <span>Navigate</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="rounded-lg p-1.5 text-crm-muted hover:text-white hover:bg-crm-cardHover transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4 text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll / Load More Bar */}
        {hasMore && notifications.length > 0 && (
          <div className="border-t border-crm-border/50 p-4 text-center bg-crm-cardHover/10">
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-lg border border-crm-border bg-crm-card/50 px-6 py-2 text-xs font-semibold text-white hover:bg-crm-cardHover transition-all disabled:opacity-50"
            >
              {loading ? "Loading more..." : "Load Older Notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
