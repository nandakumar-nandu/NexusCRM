-- SQL Migration: 006_user_preferences.sql
-- Description: Create user_preferences table and email_preferences JSONB column.

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email_preferences JSONB DEFAULT '{
        "welcome_emails": true,
        "task_reminders": true,
        "deal_updates": true,
        "weekly_reports": true
    }'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Architectural Comment on JSONB vs Separate Columns Trade-off:
-- 1. Separate Columns (e.g. welcome_emails BOOLEAN, task_reminders BOOLEAN):
--    Provides explicit type enforcement and simple SQL indexing. However, adding new notification channels 
--    requires altering DB table schemas and running ALTER TABLE migrations across production environments.
-- 2. JSONB Column (email_preferences JSONB):
--    Allows flexible, dynamic schema expansion for user settings without ALTER TABLE database locks.
--    NexusCRM uses JSONB to seamlessly support new notification preference toggles across app updates.

COMMENT ON TABLE public.user_preferences IS 'Stores customizable user notification preferences and workspace settings.';
COMMENT ON COLUMN public.user_preferences.email_preferences IS 'JSONB payload storing notification channel flags (welcome_emails, task_reminders, deal_updates, weekly_reports).';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
