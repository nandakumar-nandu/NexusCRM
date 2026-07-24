-- SQL Migration: 009_api_keys.sql
-- Description: Create api_keys table for Developer REST API Bearer Token authentication.

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_preview TEXT NOT NULL, -- First 8 chars for identification (e.g., 'nx_live_9a7f...')
    permissions TEXT[] DEFAULT '{"read:customers", "read:leads", "read:tasks"}'::text[] NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Architectural Comment on bcrypt Security Model:
-- Raw API keys ('nx_live_xyz...') are generated once using crypto.randomBytes and shown to the developer 
-- a single time. We NEVER store plain text API keys in the database. Instead, we compute a secure bcrypt hash 
-- (stored in `key_hash`). When an API request is received, we run bcrypt.compare() against the stored hash. 
-- Even if the database is compromised, plaintext API keys cannot be recovered.

COMMENT ON TABLE public.api_keys IS 'Developer API key registry storing bcrypt key hashes and scope permissions.';
COMMENT ON COLUMN public.api_keys.key_hash IS 'Bcrypt hashed representation of raw API secret token.';
COMMENT ON COLUMN public.api_keys.key_preview IS 'Truncated non-sensitive preview string displayed in dashboard UI tables.';
COMMENT ON COLUMN public.api_keys.permissions IS 'Array of granted permission scopes (read:customers, write:customers, read:leads, write:leads, etc.).';

-- Enable Row Level Security (RLS)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own API keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
