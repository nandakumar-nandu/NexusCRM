"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Lead } from "@/lib/services/leadsService";

/**
 * Custom React Hook: useRealtimeLeads
 * 
 * Listens for live stage updates and modifications on the 'public.leads' table.
 * Enables automatic Kanban card re-ordering and position animation whenever deal stages change across sessions.
 * 
 * @param onLeadChanged - Callback receiving updated lead payload for optimistic or reactive updates.
 */
export function useRealtimeLeads(onLeadChanged: (updatedLead?: Lead) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("realtime-leads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("[Realtime Leads Stage Event]:", payload);
          onLeadChanged(payload.new as Lead);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onLeadChanged]);
}
