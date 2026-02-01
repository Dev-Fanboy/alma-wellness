-- Supabase SQL Migration for Retreats and Partner Discounts
-- Safe to run multiple times (idempotent)

-- ===================================
-- RETREATS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.retreats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    attendees INTEGER DEFAULT 0,
    max_attendees INTEGER DEFAULT 30,
    image_url TEXT NOT NULL,
    is_past BOOLEAN DEFAULT FALSE,
    is_upcoming BOOLEAN DEFAULT FALSE,
    is_alma_exclusive BOOLEAN DEFAULT TRUE,
    theme TEXT NOT NULL,
    price TEXT NOT NULL,
    includes TEXT[] DEFAULT '{}',
    facilitator TEXT NOT NULL,
    registration_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active retreats" ON public.retreats;
CREATE POLICY "Anyone can read active retreats" ON public.retreats
    FOR SELECT USING (is_active = true);

-- ===================================
-- PARTNER DISCOUNTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS public.partner_discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_name TEXT NOT NULL,
    category TEXT NOT NULL,
    discount_value TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    location TEXT NOT NULL,
    hours TEXT NOT NULL,
    terms TEXT,
    redemption_code TEXT,
    valid_until DATE,
    min_level_required INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add min_level_required column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partner_discounts' 
                   AND column_name = 'min_level_required') THEN
        ALTER TABLE public.partner_discounts ADD COLUMN min_level_required INTEGER DEFAULT 0;
    END IF;
END $$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.partner_discounts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active discounts" ON public.partner_discounts;
CREATE POLICY "Anyone can read active discounts" ON public.partner_discounts
    FOR SELECT USING (is_active = true);

-- ===================================
-- SEED DATA: Only insert if tables are empty
-- ===================================

-- Seed retreats only if empty
INSERT INTO public.retreats (title, description, full_description, date, time, location, attendees, max_attendees, image_url, is_past, is_upcoming, is_alma_exclusive, theme, price, includes, facilitator, registration_url, sort_order)
SELECT * FROM (VALUES
    ('Visionboard Workshop', 
     'Create your 2026 vision board with guided meditation and intention-setting exercises. Materials provided.', 
     'Join us for an immersive half-day workshop where you''ll craft a powerful vision board for 2026. We''ll begin with a grounding meditation to connect with your deepest intentions, followed by guided journaling to clarify your goals across all areas of life—health, relationships, career, and personal growth. All materials including magazines, poster boards, markers, and embellishments are provided. Light refreshments and herbal tea will be served throughout the session.',
     'January 24, 2026', '10:00 AM - 2:00 PM', 'Wellness Studio, Downtown',
     18, 25,
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
     false, true, true, 'Vision & Intention', '$65',
     ARRAY['All craft materials', 'Guided meditation', 'Light refreshments', 'Take-home journal prompts'],
     'Sarah Chen', '', 1),
     
    ('Spring Renewal Retreat', 
     'A full day of yoga, meditation, and nature walks to welcome the spring season.', 
     'Embrace the energy of spring with this transformative full-day retreat. Begin your morning with sunrise yoga overlooking the mountains, followed by a nourishing plant-based brunch. The afternoon includes guided forest bathing, breathwork sessions, and a rejuvenating sound bath. End the day with a community dinner and intention-setting ceremony for the season ahead.',
     'March 15, 2026', '9:00 AM - 5:00 PM', 'Mountain View Retreat Center',
     8, 30,
     'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
     false, false, false, 'Renewal', '$150',
     ARRAY['Yoga & meditation sessions', 'Plant-based meals', 'Forest bathing experience', 'Sound bath healing', 'Retreat gift bag'],
     'Maya Rodriguez', '', 2),
     
    ('Winter Solstice Gathering', 
     'Celebrated the longest night with candlelit meditation, journaling, and community connection.', 
     'We gathered on the longest night of the year for a magical evening of reflection and community. The event featured a candlelit meditation circle, guided journaling to release the old year and welcome the new, and a warming ceremony with hot cacao and shared intentions.',
     'December 21, 2025', '6:00 PM - 9:00 PM', 'Community Garden Pavilion',
     35, 35,
     'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400',
     true, false, true, 'Reflection', '$45',
     ARRAY['Candlelit meditation', 'Hot cacao ceremony', 'Journaling materials', 'Intention card creation'],
     'James Wu', '', 3),
     
    ('Mindfulness in Nature', 
     'An afternoon of forest bathing and outdoor meditation practices in the botanical gardens.', 
     'This sold-out event took participants on a journey through the botanical gardens with guided mindfulness practices at each stop. We explored walking meditation, sensory awareness exercises, and seated meditation among the trees. The afternoon concluded with a tea ceremony in the Japanese garden section.',
     'November 8, 2025', '2:00 PM - 6:00 PM', 'Botanical Gardens',
     20, 20,
     'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
     true, false, false, 'Nature', '$55',
     ARRAY['Garden admission', 'Guided forest bathing', 'Tea ceremony', 'Mindfulness guide booklet'],
     'Elena Park', '', 4),
     
    ('Gratitude Circle', 
     'A Thanksgiving-themed gathering focused on gratitude practices and community sharing.', 
     'In the spirit of Thanksgiving, we came together to explore the science and practice of gratitude. The evening included a gratitude meditation, sharing circle, and collaborative creation of a community gratitude mural. Attendees left with gratitude journals and daily practice cards.',
     'November 23, 2025', '4:00 PM - 7:00 PM', 'Wellness Studio, Downtown',
     25, 25,
     'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
     true, false, true, 'Gratitude', '$35',
     ARRAY['Gratitude journal', 'Guided meditation', 'Light snacks', 'Practice cards'],
     'Sarah Chen', '', 5)
) AS v(title, description, full_description, date, time, location, attendees, max_attendees, image_url, is_past, is_upcoming, is_alma_exclusive, theme, price, includes, facilitator, registration_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.retreats LIMIT 1);

-- Seed partner discounts only if empty
INSERT INTO public.partner_discounts (partner_name, category, discount_value, description, image_url, location, hours, min_level_required, is_featured, sort_order)
SELECT * FROM (VALUES
    ('Serenity Spa', 'Spa & Wellness', '20% OFF', 'Massage, facials & body treatments',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
     'Downtown', '9am - 8pm', 0, true, 1),
     
    ('FitLife Gym', 'Fitness', '15% OFF', 'Full gym access & classes',
     'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
     'Multiple locations', '5am - 11pm', 0, false, 2),
     
    ('Glow Nail Studio', 'Beauty', '25% OFF', 'Manicure, pedicure & nail art',
     'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
     'Midtown', '10am - 7pm', 5, false, 3),
     
    ('The Wellness Hotel', 'Hospitality', '30% OFF', 'Spa rooms & wellness retreats',
     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
     'Beachfront', '24 hours', 10, true, 4),
     
    ('Mindful Yoga', 'Fitness', 'Free Trial', 'Yoga & meditation classes',
     'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
     'Uptown', '6am - 9pm', 0, false, 5)
) AS v(partner_name, category, discount_value, description, image_url, location, hours, min_level_required, is_featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partner_discounts LIMIT 1);

-- Update level requirements for existing data
UPDATE public.partner_discounts SET min_level_required = 5 WHERE partner_name = 'Glow Nail Studio' AND min_level_required = 0;
UPDATE public.partner_discounts SET min_level_required = 10 WHERE partner_name = 'The Wellness Hotel' AND min_level_required = 0;
