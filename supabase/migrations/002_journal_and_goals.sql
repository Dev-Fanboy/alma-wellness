-- Journal Entries Cloud Sync
-- Run this in Supabase SQL Editor to enable journal cloud sync

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low')),
  prompt TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only view their own journal entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Users can create their own journal entries
DROP POLICY IF EXISTS "Users can create own journal entries" ON journal_entries;
CREATE POLICY "Users can create own journal entries" ON journal_entries
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own journal entries
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own journal entries
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Goals table for cloud sync
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('walking', 'hydration', 'meditation', 'journaling', 'custom')),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  target INT NOT NULL,
  unit TEXT NOT NULL,
  current INT DEFAULT 0,
  points INT DEFAULT 10,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Create index for goals
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- Enable Row Level Security for goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own goals
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
