-- CHECK FRIENDSHIPS DATA
-- Run this in Supabase SQL Editor to see if friendships actually exist

-- 1. Check total number of friendships
SELECT count(*) as total_friendships FROM friendships;

-- 2. Check friendships for your user (replace with your email to find ID, or just check all)
-- This shows top 10 accepted friendships
SELECT 
    f.id,
    f.status,
    u.email as user_email,
    p.name as user_name,
    f_user.email as friend_email,
    fp.name as friend_name
FROM friendships f
JOIN auth.users u ON f.user_id = u.id
JOIN profiles p ON f.user_id = p.id
JOIN auth.users f_user ON f.friend_id = f_user.id
JOIN profiles fp ON f.friend_id = fp.id
WHERE f.status = 'accepted'
LIMIT 10;

-- 3. Check if any friendships are pending
SELECT count(*) as pending_count FROM friendships WHERE status = 'pending';
