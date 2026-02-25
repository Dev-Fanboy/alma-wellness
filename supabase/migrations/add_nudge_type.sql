-- Add type column to nudges table for rain vs cheer differentiation
-- This allows the Edge Function to send the correct notification message
ALTER TABLE nudges ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'rain' CHECK (type IN ('rain', 'cheer'));
