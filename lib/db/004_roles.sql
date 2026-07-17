-- SQL Migration: 004_roles.sql
-- Description: Create public.user_roles table, drop and re-create RLS policies for customers, leads, and tasks to check roles (Viewer: read-only, Manager: insert/update, Admin: full control).

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')) NOT NULL
);

-- Comments on user_roles table and columns
COMMENT ON TABLE public.user_roles IS 'Stores security role assignments (admin, manager, viewer) for users.';
COMMENT ON COLUMN public.user_roles.user_id IS 'Primary key referencing auth.users unique identifier.';
COMMENT ON COLUMN public.user_roles.role IS 'Assigned access tier (admin, manager, viewer).';

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Helper function to check user role (makes policies cleaner and avoids recursive selection)
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-securing public.customers
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

-- RLS Comments: check_user_role ensures only managers and admins can insert or update, and only admins can delete. All roles can select.
CREATE POLICY "Select customers: authenticated owner"
ON public.customers FOR SELECT TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Insert customers: owner with admin/manager role"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Update customers: owner with admin/manager role"
ON public.customers FOR UPDATE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']))
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Delete customers: owner with admin role"
ON public.customers FOR DELETE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin']));

-- Re-securing public.leads
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- RLS Comments: check_user_role checks roles for leads writes.
CREATE POLICY "Select leads: authenticated owner"
ON public.leads FOR SELECT TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Insert leads: owner with admin/manager role"
ON public.leads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Update leads: owner with admin/manager role"
ON public.leads FOR UPDATE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']))
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Delete leads: owner with admin role"
ON public.leads FOR DELETE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin']));

-- Re-securing public.tasks
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- RLS Comments: check_user_role checks roles for tasks writes.
CREATE POLICY "Select tasks: authenticated owner"
ON public.tasks FOR SELECT TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Insert tasks: owner with admin/manager role"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Update tasks: owner with admin/manager role"
ON public.tasks FOR UPDATE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']))
WITH CHECK (auth.uid() = created_by AND public.check_user_role(ARRAY['admin', 'manager']));

CREATE POLICY "Delete tasks: owner with admin role"
ON public.tasks FOR DELETE TO authenticated
USING (auth.uid() = created_by AND public.check_user_role(ARRAY['admin']));
