"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PresenceUser {
  user_id: string;
  name: string;
  avatar_url?: string;
  online_at: string;
}

/**
 * Custom React Hook: usePresence
 * 
 * Manages active presence sessions in Supabase Realtime presence channels.
 * Broadcasts the local user's online state and returns avatar details for all connected team members.
 * 
 * @param roomName - Presence room context (e.g., 'dashboard', 'customers-page')
 * @param currentUser - Active logged-in user profile details
 */
export function usePresence(roomName: string = "workspace", currentUser?: { id: string; name: string; avatar_url?: string }) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const supabase = createClient();
    const channel = supabase.channel(`presence-${roomName}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<PresenceUser>();
        const usersList: PresenceUser[] = [];
        
        Object.keys(newState).forEach((key) => {
          const presences = newState[key];
          if (presences && presences.length > 0) {
            usersList.push(presences[0]);
          }
        });

        setOnlineUsers(usersList);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[Presence User Joined]:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("[Presence User Left]:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.name || "Sales Rep",
            avatar_url: currentUser.avatar_url || "",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomName, currentUser?.id, currentUser?.name, currentUser?.avatar_url]);

  return { onlineUsers };
}
