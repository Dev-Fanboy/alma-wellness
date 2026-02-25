-- Alma Wellness Garden Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
  age_range TEXT,
  wellness_focus TEXT,
  plant_level INT DEFAULT 1,
  plant_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  invite_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text), 1, 8)),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships (bidirectional relationship)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Nudges/Rain (encouragement system)
CREATE TABLE IF NOT EXISTS nudges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT DEFAULT 'sent you some rain! 🌧️',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily progress (for weekly XP calculation)
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INT DEFAULT 0,
  goals_completed INT DEFAULT 0,
  total_goals INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_nudges_to_user ON nudges(to_user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Ensure policies are dropped if they already exist, then create them

-- Profiles: Authenticated users can view all profiles (needed for friend lookups)
-- Note: UPDATE and INSERT remain restricted to own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Profiles: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Profiles: Users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Friendships: Users can view own friendships
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);

-- Friendships: Users can create friend requests
DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
CREATE POLICY "Users can create friend requests" ON friendships
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Friendships: Users can update friendships they're part of
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friendships;
CREATE POLICY "Users can update friendships they're part of" ON friendships
  FOR UPDATE USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);

-- Friendships: Users can delete own friendships
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_id);

-- Nudges: Users can view received nudges
DROP POLICY IF EXISTS "Users can view received nudges" ON nudges;
CREATE POLICY "Users can view received nudges" ON nudges
  FOR SELECT USING ((SELECT auth.uid()) = to_user_id);

-- Nudges: Users can send nudges to friends
DROP POLICY IF EXISTS "Users can send nudges to friends" ON nudges;
CREATE POLICY "Users can send nudges to friends" ON nudges
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = from_user_id);

-- Nudges: Users can mark nudges as read
DROP POLICY IF EXISTS "Users can mark nudges as read" ON nudges;
CREATE POLICY "Users can mark nudges as read" ON nudges
  FOR UPDATE USING ((SELECT auth.uid()) = to_user_id);

-- Daily Progress: Users can view own progress
DROP POLICY IF EXISTS "Users can view own progress" ON daily_progress;
CREATE POLICY "Users can view own progress" ON daily_progress
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Daily Progress: Users can insert own progress
DROP POLICY IF EXISTS "Users can insert own progress" ON daily_progress;
CREATE POLICY "Users can insert own progress" ON daily_progress
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Daily Progress: Users can update own progress
DROP POLICY IF EXISTS "Users can update own progress" ON daily_progress;
CREATE POLICY "Users can update own progress" ON daily_progress
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Push Tokens: Users can manage their own tokens (ALL covers SELECT/INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Users can manage own push tokens" ON push_tokens;
CREATE POLICY "Users can manage own push tokens" ON push_tokens
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET last_active_at = NOW(), updated_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_active when progress is logged
DROP TRIGGER IF EXISTS on_progress_logged ON daily_progress;
CREATE TRIGGER on_progress_logged
  AFTER INSERT OR UPDATE ON daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active();
