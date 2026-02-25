-- RESTORE SECURITY SAFELY
-- Run this in Supabase SQL Editor

-- 1. Enable RLS (It must be on for policies to work)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies dynamically (PL/pgSQL)
-- This ensures we delete even the policies with names we guessed wrong!
DO $$
DECLARE
    pol record;
BEGIN
    -- Drop all policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;

    -- Drop all policies on friendships
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'friendships' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON friendships', pol.policyname);
    END LOOP;
END $$;

-- 3. Create SAFE policies (Non-recursive)

-- Profiles: Allow reading ALL profiles (Verified safe, prevents recursion)
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Profiles: Update own only
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Profiles: Insert own only
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

-- Friendships: View own (Verified safe)
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);

-- Friendships: Insert own
CREATE POLICY "Users can create friend requests"
ON friendships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Friendships: Update own
CREATE POLICY "Users can update friendships they're part of"
ON friendships FOR UPDATE
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);

-- Friendships: Delete own
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);
