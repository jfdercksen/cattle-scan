-- Add missing foreign key constraint between company_user_relationships and profiles
-- This is needed for Supabase to automatically resolve the relationship in queries

-- Add foreign key constraint from company_user_relationships.user_id to profiles.id
ALTER TABLE public.company_user_relationships 
ADD CONSTRAINT company_user_relationships_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- This allows Supabase to automatically resolve the relationship when using:
-- .select('*, profiles(*)')
-- in queries on the company_user_relationships table
