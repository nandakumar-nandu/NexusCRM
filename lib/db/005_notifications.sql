-- SQL Migration: 005_notifications.sql (and 004_notifications.sql)
-- Description: Create public.notifications table, configure RLS security policies, and performance indexes.

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'mention', 'lead', 'task', 'customer')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table and columns
COMMENT ON TABLE public.notifications IS 'Stores user-specific real-time system alerts, mentions, and notifications.';
COMMENT ON COLUMN public.notifications.id IS 'Unique identifier for the notification entry.';
COMMENT ON COLUMN public.notifications.user_id IS 'Recipient user ID linked to auth.users.';
COMMENT ON COLUMN public.notifications.type IS 'Notification category (system, mention, lead, task, customer).';
COMMENT ON COLUMN public.notifications.title IS 'Short headline summary.';
COMMENT ON COLUMN public.notifications.body IS 'Detailed notification body description.';
COMMENT ON COLUMN public.notifications.link IS 'Optional navigation route link (e.g. /customers/123 or /leads).';
COMMENT ON COLUMN public.notifications.is_read IS 'Flag indicating whether user has marked notification as read.';

-- Performance index for fast unread count and list queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and update their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System or authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
