-- Fix profiles RLS policy to allow friends to view each other's profiles
-- This resolves the issue where friends are not showing in the garden

-- Drop the restrictive SELECT policy that only allows viewing own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Ensure the permissive policy exists for authenticated users
-- This allows users to view friend profiles via invite codes and friend lists
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Keep the UPDATE and INSERT policies restrictive (users can only modify their own profile)
-- These are already correctly defined in schema.sql
