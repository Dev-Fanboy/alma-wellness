-- Create groves tables for community gardens
-- Run this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groves table - stores grove info
CREATE TABLE IF NOT EXISTS groves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grove members junction table
CREATE TABLE IF NOT EXISTS grove_members (
  grove_id UUID NOT NULL REFERENCES groves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (grove_id, user_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_groves_owner ON groves(owner_id);
CREATE INDEX IF NOT EXISTS idx_groves_invite_code ON groves(invite_code);
CREATE INDEX IF NOT EXISTS idx_grove_members_user ON grove_members(user_id);
CREATE INDEX IF NOT EXISTS idx_grove_members_grove ON grove_members(grove_id);

-- Enable RLS
ALTER TABLE groves ENABLE ROW LEVEL SECURITY;
ALTER TABLE grove_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view groves they are members of" ON groves;
DROP POLICY IF EXISTS "Users can create groves" ON groves;
DROP POLICY IF EXISTS "Owners can update their groves" ON groves;
DROP POLICY IF EXISTS "Owners can delete their groves" ON groves;
DROP POLICY IF EXISTS "Anyone can view grove by invite code" ON groves;

DROP POLICY IF EXISTS "Users can view grove members" ON grove_members;
DROP POLICY IF EXISTS "Users can view grove members of their groves" ON grove_members;
DROP POLICY IF EXISTS "Users can join groves" ON grove_members;
DROP POLICY IF EXISTS "Users can leave groves" ON grove_members;
DROP POLICY IF EXISTS "Owners can remove members" ON grove_members;

-- Groves policies
-- Allow viewing any grove (needed for invite code lookup)
CREATE POLICY "Anyone can view groves"
ON groves FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create groves"
ON groves FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their groves"
ON groves FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their groves"
ON groves FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Grove members policies (FIXED: no self-referencing subquery)
-- Allow authenticated users to view all grove members
-- This avoids the infinite recursion issue
CREATE POLICY "Users can view grove members"
ON grove_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join groves"
ON grove_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groves"
ON grove_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Owners can remove members"
ON grove_members FOR DELETE
TO authenticated
USING (
  grove_id IN (SELECT id FROM groves WHERE owner_id = auth.uid())
);

-- Function to generate unique grove invite code
CREATE OR REPLACE FUNCTION generate_grove_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM groves WHERE invite_code = new_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to create a grove and add owner as member
CREATE OR REPLACE FUNCTION create_grove_with_owner(grove_name TEXT, grove_description TEXT DEFAULT NULL)
RETURNS groves AS $$
DECLARE
  new_grove groves;
  new_code TEXT;
BEGIN
  -- Generate unique code
  new_code := generate_grove_code();
  
  -- Create the grove
  INSERT INTO groves (name, invite_code, owner_id, description)
  VALUES (grove_name, new_code, auth.uid(), grove_description)
  RETURNING * INTO new_grove;
  
  -- Add owner as a member with owner role
  INSERT INTO grove_members (grove_id, user_id, role)
  VALUES (new_grove.id, auth.uid(), 'owner');
  
  RETURN new_grove;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
