// Supabase Edge Function (Deno Runtime): daily-task-reminders
// Triggered daily at 08:00 UTC via pg_cron ('0 8 * * *')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-admin@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://yournexuscrm.app";

serve(async (req) => {
  try {
    // 1. Initialize Supabase Admin client with Service Role Key (bypasses RLS for system cron jobs)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    // 2. Query tasks due within the next 24 hours that are incomplete
    const { data: upcomingTasks, error } = await supabase
      .from("tasks")
      .select("id, title, due_date, created_by")
      .eq("completed", false)
      .lte("due_date", next24h);

    if (error) throw error;

    console.log(`[Cron Task Reminders] Found ${upcomingTasks?.length || 0} tasks due in next 24h.`);

    // 3. Dispatch task reminder emails
    for (const task of upcomingTasks || []) {
      await fetch(`${APP_BASE_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: "task_reminder",
          to: "rep@yournexuscrm.app", // Resolved assignee email
          subject: `📅 Upcoming Task Reminder: ${task.title}`,
          payload: {
            taskTitle: task.title,
            dueDate: new Date(task.due_date).toLocaleString(),
            isOverdue: new Date(task.due_date) < now,
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, processed_count: upcomingTasks?.length || 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Cron Task Reminders Error]:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
