-- Add membership_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS membership_status text DEFAULT 'expired' CHECK (membership_status IN ('active', 'expired'));

-- Comment on column
COMMENT ON COLUMN public.profiles.membership_status IS 'Tracks whether the user has an active paid membership';
