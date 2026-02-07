-- Insert seeds for Yesterday and Today so the "Past Seeds" feature can be tested immediately.

INSERT INTO public.daily_seeds (content, publish_date)
VALUES
  ('Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.', current_date - 1),
  ('The best time to plant a tree was 20 years ago. The second best time is now.', current_date)
ON CONFLICT (publish_date) DO UPDATE 
SET content = EXCLUDED.content;
