"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Custom React Hook: useRealtimeCustomers
 * 
 * Subscribes to Postgres database change events (INSERT, UPDATE, DELETE) on the 'public.customers' table.
 * 
 * How Realtime channels work in Supabase:
 * 1. Supabase listens to PostgreSQL Write-Ahead Logs (WAL) via logical replication.
 * 2. When a row changes, the Realtime engine broadcasts payload events to subscribed websocket channels.
 * 3. Cleanup on unmount: We call `supabase.removeChannel(channel)` in the useEffect cleanup function to close the 
 *    websocket connection, prevent memory leaks, and prevent duplicate callback execution.
 * 
 * Why RLS applies to Realtime too:
 * Row Level Security (RLS) is enforced by Supabase Realtime at the publication layer. When a change occurs,
 * Supabase checks the authenticated user's JWT token against the table's SELECT RLS policies.
 * Users only receive change events for rows that their RLS policies explicitly allow them to view.
 * 
 * @param onUpdate - Callback triggered whenever customer rows are inserted, updated, or deleted.
 */
export function useRealtimeCustomers(onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();

    // Create a real-time channel subscription
    const channel = supabase
      .channel("realtime-customers")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "customers",
        },
        (payload) => {
          console.log("[Realtime Customers Change Event Detected]:", payload);
          onUpdate();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime Customers Channel Subscribed]");
        }
      });

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
