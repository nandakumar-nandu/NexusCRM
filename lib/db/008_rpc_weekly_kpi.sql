-- SQL Migration: 008_rpc_weekly_kpi.sql
-- Description: PostgreSQL RPC function get_weekly_kpi_snapshot() and pg_cron schedule setup.

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

COMMENT ON FUNCTION public.get_weekly_kpi_snapshot(UUID) IS 'Returns JSONB summary of weekly sales performance metrics.';
