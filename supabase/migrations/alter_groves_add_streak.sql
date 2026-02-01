-- Add streak tracking to groves table (for Custom Gardens)
ALTER TABLE groves
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_goal_met_date TIMESTAMPTZ;

-- Add streak tracking to profiles table (for Friends Garden)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS friends_garden_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS friends_garden_last_met TIMESTAMPTZ;
