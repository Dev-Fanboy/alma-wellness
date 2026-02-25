-- EMERGENCY FIX FOR RECURSION
-- Run this in Supabase SQL Editor

-- 1. Disable RLS temporarily to break the loop (safety measure)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies we know of (add any others you might have created)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can see friends" ON profiles;
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;

-- 3. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply the SAFE policies

-- Profiles: VIEW ALL (Prevents recursion because it has no conditions)
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Profiles: UPDATE OWN
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Profiles: INSERT OWN
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

-- Friendships: VIEW OWN (Simple ID check, no joins)
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);

-- Friendships: INSERT OWN
CREATE POLICY "Users can create friend requests"
ON friendships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Friendships: UPDATE OWN
CREATE POLICY "Users can update friendships they're part of"
ON friendships FOR UPDATE
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);

-- Friendships: DELETE OWN
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
TO authenticated
USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = friend_id)
);
