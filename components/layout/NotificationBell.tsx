"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, AtSign, Briefcase, CheckSquare, Users, Info } from "lucide-react";
import { notificationsService, type NotificationItem } from "@/lib/services/notificationsService";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [count, items] = await Promise.all([
        notificationsService.getUnreadCount(),
        notificationsService.getNotifications("all", 5),
      ]);
      setUnreadCount(count);
      setNotifications(items);
    } catch (err) {
      console.error("Failed to load notifications bell data:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll periodically every 15 seconds to ensure live unread count updates
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await notificationsService.markAsRead(item.id);
      fetchNotifications();
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "mention":
        return <AtSign className="h-4 w-4 text-sky-400" />;
      case "lead":
        return <Briefcase className="h-4 w-4 text-indigo-400" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-emerald-400" />;
      case "customer":
        return <Users className="h-4 w-4 text-purple-400" />;
      default:
        return <Info className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-crm-muted transition-colors duration-200 hover:bg-crm-cardHover hover:text-white focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-crm-accent text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-crm-border bg-crm-card p-4 shadow-2xl z-40 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-crm-accent/20 px-2 py-0.5 text-[10px] font-bold text-crm-accent border border-crm-accent/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="my-2 max-h-80 overflow-y-auto divide-y divide-crm-border/30">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-crm-muted">No notifications yet</div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${
                      !item.is_read ? "bg-indigo-500/10 hover:bg-indigo-500/15" : "hover:bg-crm-cardHover/30"
                    }`}
                  >
                    <div className="mt-0.5 rounded-lg bg-crm-cardHover p-1.5 shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold truncate ${!item.is_read ? "text-white" : "text-crm-text"}`}>
                          {item.title}
                        </span>
                        {!item.is_read && <span className="h-2 w-2 rounded-full bg-crm-accent shrink-0 ml-1" />}
                      </div>
                      <p className="text-[11px] text-crm-muted line-clamp-2 leading-snug">{item.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-crm-border/50 pt-2 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-crm-primary hover:text-indigo-400 transition-colors"
              >
                <span>View all notifications</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
