-- SQL Migration: 007_rpc_weekly_kpi.sql
-- Description: PostgreSQL RPC function get_weekly_kpi_snapshot() and pg_cron schedule setup.

/**
 * ARCHITECTURAL & TECHNICAL DESIGN COMMENTS:
 * 
 * 1. Why RPC Instead of App-Side Aggregation?
 *    Executing SUM(), COUNT(), and AVG() aggregations in Application Code (Node.js/Next.js) requires fetching thousands 
 *    of raw table rows over WAN network sockets. PostgreSQL RPC functions execute directly in C-optimized database memory,
 *    reducing network payload transfer overhead from megabytes to a single compact JSONB payload.
 * 
 * 2. How pg_cron Scheduling Works:
 *    PostgreSQL pg_cron extension allows scheduling recurring SQL commands directly inside the database process.
 *    Example:
 *      SELECT cron.schedule('daily-task-reminders-job', '0 8 * * *', $$
 *        SELECT net.http_post(url:='https://<project-id>.supabase.co/functions/v1/daily-task-reminders')
 *      $$);
 * 
 * 3. Cron Expression Breakdown:
 *    - '0 8 * * *' : 0 = Minute 0, 8 = 8 AM UTC, * = Every Day of Month, * = Every Month, * = Every Day of Week.
 *    - '0 7 * * 1' : 0 = Minute 0, 7 = 7 AM UTC, * = Every Day of Month, * = Every Month, 1 = Monday.
 * 
 * 4. Why Service Role Key is Used in Edge Functions:
 *    Background cron tasks do not have an active user browser JWT session. The Service Role Key allows background workers 
 *    to authenticate securely with elevated admin privileges bypassing Row Level Security.
 */

CREATE OR REPLACE FUNCTION public.get_weekly_kpi_snapshot(target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_customers INT;
    v_open_deals_val NUMERIC;
    v_tasks_completed INT;
    v_win_rate NUMERIC;
    v_result JSONB;
BEGIN
    -- 1. Total Customers Count
    SELECT COUNT(*) INTO v_total_customers FROM public.customers;

    -- 2. Open Deals Total Financial Value
    SELECT COALESCE(SUM(value), 0) INTO v_open_deals_val 
    FROM public.leads 
    WHERE stage NOT IN ('Closed', 'Lost');

    -- 3. Completed Tasks Count
    SELECT COUNT(*) INTO v_tasks_completed 
    FROM public.tasks 
    WHERE completed = true;

    -- 4. Lead Win Rate Percentage Calculation
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE ROUND((COUNT(*) FILTER (WHERE stage = 'Closed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
        END INTO v_win_rate
    FROM public.leads;

    -- Construct JSONB result
    v_result := jsonb_build_object(
        'totalCustomers', v_total_customers,
        'openDealsValue', v_open_deals_val,
        'tasksCompleted', v_tasks_completed,
        'winRatePercent', v_win_rate,
        'generatedAt', NOW()
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_weekly_kpi_snapshot(UUID) IS 'Returns JSONB summary of weekly sales performance metrics (total customers, open pipeline value, completed tasks, win rate).';
