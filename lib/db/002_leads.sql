-- SQL Migration: 002_leads.sql
-- Description: Create public.leads table, establish foreign keys to customers, indexes, and configure Row Level Security (RLS) policies.

-- Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    value NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    stage TEXT DEFAULT 'New' CHECK (stage IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Closed')),
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table and columns for documentation integrity
COMMENT ON TABLE public.leads IS 'Stores sales deals and opportunities mapped to customers.';
COMMENT ON COLUMN public.leads.id IS 'Unique identifier for the sales lead record.';
COMMENT ON COLUMN public.leads.title IS 'Name or description of the deal.';
COMMENT ON COLUMN public.leads.customer_id IS 'Foreign key referencing the associated customer.';
COMMENT ON COLUMN public.leads.value IS 'Estimated financial value of the sales lead.';
COMMENT ON COLUMN public.leads.stage IS 'Pipeline funnel stage (New, Contacted, Qualified, Proposal, Closed).';
COMMENT ON COLUMN public.leads.probability IS 'Percentage chance of successfully closing the deal (0-100).';
COMMENT ON COLUMN public.leads.expected_close_date IS 'Target close date.';
COMMENT ON COLUMN public.leads.notes IS 'Freeform deal notes.';
COMMENT ON COLUMN public.leads.created_by IS 'Reference to the auth.users record that created this lead.';

-- Indexes for search performance optimization
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own leads" 
ON public.leads FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own leads" 
ON public.leads FOR SELECT TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own leads" 
ON public.leads FOR UPDATE TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own leads" 
ON public.leads FOR DELETE TO authenticated 
USING (auth.uid() = created_by);
