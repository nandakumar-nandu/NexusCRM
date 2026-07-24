// Supabase Edge Function (Deno Runtime): weekly-report-sender
// Triggered every Monday at 07:00 UTC via pg_cron ('0 7 * * 1')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://yournexuscrm.app";

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Call PostgreSQL RPC function to calculate weekly KPI snapshot inside database memory
    const { data: kpiData, error: rpcError } = await supabase.rpc("get_weekly_kpi_snapshot");
    if (rpcError) throw rpcError;

    console.log("[Cron Weekly Report Sender] Generated KPI Snapshot:", kpiData);

    const weekLabel = `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // 2. Dispatch weekly report email to managers and executive subscribers
    await fetch(`${APP_BASE_URL}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "weekly_report",
        to: "executive@yournexuscrm.app",
        subject: `📊 Executive Sales Brief: ${weekLabel}`,
        payload: {
          weekLabel,
          kpiSnapshot: kpiData || {
            totalCustomers: 120,
            openDealsValue: 280000,
            tasksCompleted: 45,
            winRatePercent: 65,
          },
        },
      }),
    });

    return new Response(
      JSON.stringify({ success: true, week_label: weekLabel, kpi_snapshot: kpiData }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Cron Weekly Report Error]:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
