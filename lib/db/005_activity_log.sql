-- SQL Migration: 005_activity_log.sql & 006_activity_log.sql
-- Description: Create public.activity_log table for append-only audit trail and entity history timelines.

-- Create Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'lead', 'task', 'system', 'user')),
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'stage_changed', 'assigned', 'mentioned', 'status_changed')),
    diff JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments explaining design decisions, JSONB diff, and retention archiving policy
COMMENT ON TABLE public.activity_log IS 'Append-only immutable audit trail capturing all system data mutations and entity events.';
COMMENT ON COLUMN public.activity_log.actor_id IS 'User ID who initiated the event (null if triggered by background system worker).';
COMMENT ON COLUMN public.activity_log.entity_type IS 'Category of target entity (customer, lead, task, system, user).';
COMMENT ON COLUMN public.activity_log.entity_id IS 'Primary key ID string of target entity.';
COMMENT ON COLUMN public.activity_log.action IS 'Specific action type executed (created, updated, stage_changed, etc.).';
COMMENT ON COLUMN public.activity_log.diff IS 'JSONB object containing before/after property diffs (e.g. {"stage": {"from": "New", "to": "Qualified"}}). Using JSONB allows flexible dynamic field tracking without schema alteration.';
COMMENT ON COLUMN public.activity_log.occurred_at IS 'Precise UTC timestamp of event occurrence.';

-- Retention Policy Note:
-- Activity logs older than 90 days should be automatically archived or purged to cold storage to ensure high query performance.
-- Example pg_cron job: DELETE FROM public.activity_log WHERE occurred_at < NOW() - INTERVAL '90 days';

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_occurred ON public.activity_log(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON public.activity_log(actor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- APPEND-ONLY SECURITY POLICIES:
-- 1. All authenticated users can read activity logs.
-- 2. Authenticated users and webhooks can INSERT logs.
-- 3. NO UPDATE or DELETE policies are granted, ensuring logs are strictly immutable and append-only.

CREATE POLICY "Authenticated users can view activity logs"
ON public.activity_log
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users and webhooks can insert activity logs"
ON public.activity_log
FOR INSERT
TO authenticated
WITH CHECK (true);
