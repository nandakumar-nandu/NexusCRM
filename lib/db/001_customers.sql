-- SQL Migration: 001_customers.sql
-- Description: Create public.customers table, define parameters, and configure Row Level Security (RLS) policies.

-- Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'Lead' CHECK (status IN ('Active', 'Inactive', 'Lead')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table and columns for documentation integrity
COMMENT ON TABLE public.customers IS 'Stores B2B enterprise customer profile data.';
COMMENT ON COLUMN public.customers.id IS 'Unique identifier for the customer record.';
COMMENT ON COLUMN public.customers.name IS 'Display or legal name of the individual customer contact.';
COMMENT ON COLUMN public.customers.email IS 'Contact email address for communications.';
COMMENT ON COLUMN public.customers.phone IS 'Contact telephone number.';
COMMENT ON COLUMN public.customers.company IS 'Corporate account or company name.';
COMMENT ON COLUMN public.customers.status IS 'Active sales pipeline state (Active, Inactive, Lead).';
COMMENT ON COLUMN public.customers.tags IS 'Array of custom tags or category groupings.';
COMMENT ON COLUMN public.customers.notes IS 'Freeform comments or summary notes about interactions.';
COMMENT ON COLUMN public.customers.created_by IS 'Reference to the auth.users record that created this customer.';
COMMENT ON COLUMN public.customers.created_at IS 'Record creation timestamp.';
COMMENT ON COLUMN public.customers.updated_at IS 'Record modification timestamp.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own customers
CREATE POLICY "Users can insert their own customers" 
ON public.customers 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- RLS Policy: Users can select their own customers
CREATE POLICY "Users can view their own customers" 
ON public.customers 
FOR SELECT 
TO authenticated 
USING (auth.uid() = created_by);

-- RLS Policy: Users can update their own customers
CREATE POLICY "Users can update their own customers" 
ON public.customers 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

-- RLS Policy: Users can delete their own customers
CREATE POLICY "Users can delete their own customers" 
ON public.customers 
FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);
