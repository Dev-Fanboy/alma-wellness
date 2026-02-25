-- Fix membership_status schema mismatch
-- Current state: Allowed values are ('Guest', 'Member', 'Premium')
-- Desired state: Allowed values are ('active', 'expired')

-- 1. Drop the existing constraint that enforces ('Guest', 'Member', 'Premium')
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_membership_status_check;

-- 2. Migrate existing data to the new format
-- Map 'Member' and 'Premium' to 'active'
UPDATE public.profiles 
SET membership_status = 'active' 
WHERE membership_status IN ('Member', 'Premium');

-- Map 'Guest' and anything else to 'expired'
UPDATE public.profiles 
SET membership_status = 'expired' 
WHERE membership_status NOT IN ('active');

-- 3. Add the new constraint enforcing ('active', 'expired')
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_membership_status_check 
CHECK (membership_status IN ('active', 'expired'));

-- 4. Set the new default
ALTER TABLE public.profiles 
ALTER COLUMN membership_status SET DEFAULT 'expired';

-- 5. Ensure the column is not null
ALTER TABLE public.profiles 
ALTER COLUMN membership_status SET NOT NULL;
