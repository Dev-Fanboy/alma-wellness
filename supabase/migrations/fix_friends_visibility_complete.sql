-- COMPLETE FIX for Friends Visibility
-- Run this in Supabase SQL Editor

-- 1. FIX PROFILES VISIBILITY
-- Allow authenticated users to view ALL profiles (needed for friend discovery)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 2. FIX FRIENDSHIPS VISIBILITY
-- Allow users to view their own friendships
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;

CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
TO authenticated
USING (
    ((SELECT auth.uid()) = user_id) OR 
    ((SELECT auth.uid()) = friend_id)
);

-- 3. ENSURE INSERT/UPDATE ARE STILL PROTECTED (Safety)
-- Profiles: Only owner can update
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Friendships: Users can insert requests
DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
CREATE POLICY "Users can create friend requests"
ON friendships FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Friendships: Users can update status (accept/block) if they are involved
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friendships;
CREATE POLICY "Users can update friendships they're part of"
ON friendships FOR UPDATE
TO authenticated
USING (
    ((SELECT auth.uid()) = user_id) OR 
    ((SELECT auth.uid()) = friend_id)
);
