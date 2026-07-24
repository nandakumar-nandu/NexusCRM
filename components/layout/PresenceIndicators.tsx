"use client";

import React from "react";
import { usePresence } from "@/hooks/usePresence";

export default function PresenceIndicators({ currentUser }: { currentUser?: { id: string; name: string; avatar_url?: string } }) {
  const { onlineUsers } = usePresence("dashboard", currentUser || { id: "demo-user", name: "Sales Rep" });

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2 overflow-hidden">
        {onlineUsers.slice(0, 4).map((user, idx) => (
          <div
            key={user.user_id || idx}
            title={`${user.name} (Online)`}
            className="relative inline-block h-7 w-7 rounded-full ring-2 ring-crm-bg bg-crm-primary flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm"
          >
            {user.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span>{user.name.slice(0, 2)}</span>
            )}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-crm-bg" />
          </div>
        ))}
      </div>
      {onlineUsers.length > 4 && (
        <span className="text-[10px] font-semibold text-crm-muted pl-1">
          +{onlineUsers.length - 4} online
        </span>
      )}
    </div>
  );
}
