-- SQL Migration: 003_tasks.sql
-- Description: Create public.tasks and public.customer_notes tables, establish relationships, performance indexes, and configure Row Level Security (RLS) policies.

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    completed BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table and columns for tasks
COMMENT ON TABLE public.tasks IS 'Stores follow-up tasks, deadlined operations, and check-in items.';
COMMENT ON COLUMN public.tasks.id IS 'Unique identifier for the task record.';
COMMENT ON COLUMN public.tasks.title IS 'Task detail text or summary description.';
COMMENT ON COLUMN public.tasks.customer_id IS 'Foreign key reference linking the task to a customer.';
COMMENT ON COLUMN public.tasks.lead_id IS 'Optional foreign key reference linking the task to an active sales opportunity.';
COMMENT ON COLUMN public.tasks.due_date IS 'Deadline target date for task completion.';
COMMENT ON COLUMN public.tasks.priority IS 'Criticality of task (Low, Medium, High).';
COMMENT ON COLUMN public.tasks.completed IS 'Boolean flag representing task completion state.';
COMMENT ON COLUMN public.tasks.created_by IS 'Reference to the auth.users record that created this task.';

-- Create Customer Notes Table for Activity Timeline
CREATE TABLE IF NOT EXISTS public.customer_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table and columns for customer_notes
COMMENT ON TABLE public.customer_notes IS 'Stores user-authored interaction history and discussion notes.';
COMMENT ON COLUMN public.customer_notes.id IS 'Unique identifier for the customer note record.';
COMMENT ON COLUMN public.customer_notes.customer_id IS 'Foreign key linking the note to a customer profile.';
COMMENT ON COLUMN public.customer_notes.content IS 'Text content of the customer note.';
COMMENT ON COLUMN public.customer_notes.created_by IS 'Reference to the auth.users record that authored the note.';

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON public.tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON public.customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_by ON public.customer_notes(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.tasks FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own tasks" 
ON public.tasks FOR SELECT TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks FOR UPDATE TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks FOR DELETE TO authenticated 
USING (auth.uid() = created_by);

-- RLS Policies for Customer Notes
CREATE POLICY "Users can insert their own customer notes" 
ON public.customer_notes FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own customer notes" 
ON public.customer_notes FOR SELECT TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own customer notes" 
ON public.customer_notes FOR UPDATE TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customer notes" 
ON public.customer_notes FOR DELETE TO authenticated 
USING (auth.uid() = created_by);
