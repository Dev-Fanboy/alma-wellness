-- DISABLE RLS TO STOP RECURSIONIMMEDIATELY
-- run this in Supabase SQL Editor

-- 1. Disable security checks completely for now
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;

-- 2. Verify it's disabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('profiles', 'friendships');
