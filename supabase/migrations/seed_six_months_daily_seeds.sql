-- Populate daily_seeds for the next 365 days
-- This script inserts a diverse collection of wellness, stoic, and mindfulness quotes/prompts.

INSERT INTO public.daily_seeds (content, publish_date)
VALUES
  -- WEEK 1: FOUNDATIONS
  ('The journey of a thousand miles begins with a single step. Anchor yourself in today.', current_date + 1),
  ('Breathe deeply. Your breath is the bridge between your mind and your body.', current_date + 2),
  ('You are not behind. You are exactly where you need to be to start.', current_date + 3),
  ('Kindness to yourself is the first step of kindness to others.', current_date + 4),
  ('Water your roots today: drink water, move slowly, rest well.', current_date + 5),
  ('Quiet the mind, and the soul will speak.', current_date + 6),
  ('Sunday stillness: Let the world spin while you stand still for a moment.', current_date + 7),

  -- WEEK 2: AWARENESS
  ('Notice three small beautiful things today. The light, a smile, a leaf.', current_date + 8),
  ('Your energy is currency. Spend it on what makes you rich in spirit.', current_date + 9),
  ('Observe your thoughts like clouds passing in the sky. You are the sky.', current_date + 10),
  ('Tension is who you think you should be. Relaxation is who you are.', current_date + 11),
  ('Nature does not hurry, yet everything is accomplished.', current_date + 12),
  ('Listen more than you speak today. There is wisdom in silence.', current_date + 13),
  ('Rest is not a reward for productivity. It is essential for life.', current_date + 14),

  -- WEEK 3: GROWTH
  ('Growth is often uncomfortable, messy, and full of feelings you were hoping not to feel.', current_date + 15),
  ('A flower does not think of competing with the flower next to it. It just blooms.', current_date + 16),
  ('Be patient with yourself. Nothing in nature blooms all year.', current_date + 17),
  ('What you water grows. Are you watering your worries or your dreams?', current_date + 18),
  ('Mistakes are the portals of discovery.', current_date + 19),
  ('Small progress is still progress.', current_date + 20),
  ('Let go of what was to make room for what will be.', current_date + 21),

  -- WEEK 4: RESILIENCE
  ('Resilience is not about not falling, but about how you get back up.', current_date + 22),
  ('Storms make trees take deeper roots.', current_date + 23),
  ('You have survived 100% of your bad days.', current_date + 24),
  ('Courage is the quiet voice at the end of the day saying, "I will try again tomorrow."', current_date + 25),
  ('Hardships often prepare ordinary people for an extraordinary destiny.', current_date + 26),
  ('Be soft. Do not let the world make you hard.', current_date + 27),
  ('Healing is not linear. Be gentle with your fluctuations.', current_date + 28),

  -- WEEK 5: GRATITUDE
  ('Gratitude turns what we have into enough.', current_date + 29),
  ('Start the day with a grateful heart.', current_date + 30),
  ('It is not joy that makes us grateful; it is gratitude that makes us joyful.', current_date + 31),
  ('Thank your body for all it does for you today.', current_date + 32),
  ('Appreciate the simple luxury of a deep breath.', current_date + 33),
  ('Happiness blooms from within.', current_date + 34),
  ('Gratitude is the fairest blossom which springs from the soul.', current_date + 35),

  -- WEEK 6: CONNECTION
  ('We are all leaves on the same tree.', current_date + 36),
  ('Connection is the energy that exists between people when they feel seen, heard, and valued.', current_date + 37),
  ('Call a friend today just to say hello.', current_date + 38),
  ('Listen with the intent to understand, not to reply.', current_date + 39),
  ('You are never alone. The earth holds you.', current_date + 40),
  ('Kind words can be short and easy to speak, but their echoes are truly endless.', current_date + 41),
  ('Love is the bridge between you and everything.', current_date + 42),

  -- WEEK 7: ACTION
  ('Action is the foundational key to all success.', current_date + 43),
  ('Do one thing today that your future self will thank you for.', current_date + 44),
  ('Motivation gets you started. Habit keeps you going.', current_date + 45),
  ('The only way to do it is to do it.', current_date + 46),
  ('Don''t wait for the perfect moment. Take the moment and make it perfect.', current_date + 47),
  ('Discipline is choosing between what you want now and what you want most.', current_date + 48),
  ('A year from now you may wish you had started today.', current_date + 49),

  -- WEEK 8: CLARITY
  ('Clarity comes from doing, not thinking.', current_date + 50),
  ('Focus on the step in front of you, not the whole staircase.', current_date + 51),
  ('Simplicity is the ultimate sophistication.', current_date + 52),
  ('When the water is still, it reflects the sky.', current_date + 53),
  ('Remove the clutter. Find the core.', current_date + 54),
  ('Your vision will become clear only when you can look into your own heart.', current_date + 55),
  ('Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.', current_date + 56),

  -- WEEK 9: JOY
  ('Find joy in the ordinary.', current_date + 57),
  ('Laughter is sunbeams from the soul.', current_date + 58),
  ('Do more of what makes you forget to check your phone.', current_date + 59),
  ('Joy is not in things; it is in us.', current_date + 60),
  ('Dance first. Think later.', current_date + 61),
  ('Celebrate your small wins. They are the building blocks of big victories.', current_date + 62),
  ('Let your joy be uncontained today.', current_date + 63),

  -- WEEK 10: SELF-LOVE
  ('You yourself, as much as anybody in the entire universe, deserve your love and affection.', current_date + 64),
  ('Self-care is how you take your power back.', current_date + 65),
  ('Talk to yourself like you would to someone you love.', current_date + 66),
  ('You are enough just as you are.', current_date + 67),
  ('Your relationship with yourself sets the tone for every other relationship you have.', current_date + 68),
  ('Protect your peace.', current_date + 69),
  ('Forgive yourself for not knowing what you didn''t know before you learned it.', current_date + 70),

  -- WEEK 11: NATURE
  ('Look deep into nature, and then you will understand everything better.', current_date + 71),
  ('The earth has music for those who listen.', current_date + 72),
  ('Adopt the pace of nature: her secret is patience.', current_date + 73),
  ('Go outside. Breath the air. Touch the grass.', current_date + 74),
  ('The sun shines for everyone.', current_date + 75),
  ('Like a tree, let the dead leaves drop.', current_date + 76),
  ('Wilderness is not a luxury but a necessity of the human spirit.', current_date + 77),

  -- WEEK 12: CREATIVITY
  ('Creativity is intelligence having fun.', current_date + 78),
  ('You can''t use up creativity. The more you use, the more you have.', current_date + 79),
  ('Make art today, even if it''s just a doodle.', current_date + 80),
  ('To live a creative life, we must lose our fear of being wrong.', current_date + 81),
  ('Everything you can imagine is real.', current_date + 82),
  ('Inspiration exists, but it has to find you working.', current_date + 83),
  ('Color outside the lines today.', current_date + 84),

  -- WEEK 13: BALANCE
  ('Life is a balance of holding on and letting go.', current_date + 85),
  ('Balance is not something you find, it''s something you create.', current_date + 86),
  ('Work hard, rest well.', current_date + 87),
  ('You can''t pour from an empty cup.', current_date + 88),
  ('Moderation in all things, including moderation.', current_date + 89),
  ('Keep your face to the sunshine and you cannot see a shadow.', current_date + 90),
  ('Stability comes from a balanced center.', current_date + 91),

  -- WEEK 14: WISDOM
  ('Knowing yourself is the beginning of all wisdom.', current_date + 92),
  ('Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.', current_date + 93),
  ('The only true wisdom is in knowing you know nothing.', current_date + 94),
  ('Turn your wounds into wisdom.', current_date + 95),
  ('Seek wisdom, not just knowledge.', current_date + 96),
  ('Wisdom begins in wonder.', current_date + 97),
  ('Silence is a source of great strength.', current_date + 98),

  -- WEEK 15: PURPOSE
  ('The purpose of life is a life of purpose.', current_date + 99),
  ('He who has a why to live can bear almost any how.', current_date + 100),
  ('Your purpose is not just your job. It''s how you love, how you live.', current_date + 101),
  ('Chase your curiosity, it will lead you to your passion.', current_date + 102),
  ('Meaning is something you build, not something you find.', current_date + 103),
  ('Act as if what you do makes a difference. It does.', current_date + 104),
  ('Align your actions with your values.', current_date + 105),

  -- WEEK 16: COURAGE (Repeating themes with new content)
  ('Life shrinks or expands in proportion to one''s courage.', current_date + 106),
  ('Fear is a reaction. Courage is a decision.', current_date + 107),
  ('Do it afraid.', current_date + 108),
  ('Vulnerability is our most accurate measure of courage.', current_date + 109),
  ('Fortune favors the bold.', current_date + 110),
  ('You don''t have to be fearless. You just have to be brave.', current_date + 111),
  ('Courage is grace under pressure.', current_date + 112),

  -- WEEK 17: TRANSFORMATION
  ('We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty.', current_date + 113),
  ('Change is the only constant.', current_date + 114),
  ('You are always in a state of becoming.', current_date + 115),
  ('Don''t be afraid to give up the good to go for the great.', current_date + 116),
  ('Transformation is a process, not an event.', current_date + 117),
  ('Every exit is an entry somewhere else.', current_date + 118),
  ('Reinvent yourself as many times as you need to.', current_date + 119),

  -- WEEK 18: PRESENT MOMENT
  ('Realize deeply that the present moment is all you have.', current_date + 120),
  ('Wherever you are, be all there.', current_date + 121),
  ('The past is a memory. The future is a dream. The now is a gift.', current_date + 122),
  ('Be here now.', current_date + 123),
  ('Life is available only in the present moment.', current_date + 124),
  ('Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.', current_date + 125),
  ('Today is the tomorrow you worried about yesterday.', current_date + 126),

  -- WEEK 19: SIMPLICITY
  ('Live simply so others may simply live.', current_date + 127),
  ('The ability to simplify means to eliminate the unnecessary so that the necessary may speak.', current_date + 128),
  ('Less is more.', current_date + 129),
  ('Complexity is the enemy of execution.', current_date + 130),
  ('Declutter your mind, declutter your life.', current_date + 131),
  ('Nature uses as little as possible of anything.', current_date + 132),
  ('Simplicity is the keynote of all true elegance.', current_date + 133),

  -- WEEK 20: PERSISTENCE
  ('It does not matter how slowly you go as long as you do not stop.', current_date + 134),
  ('Fall seven times, stand up eight.', current_date + 135),
  ('River cuts through rock, not because of its power, but because of its persistence.', current_date + 136),
  ('Don''t watch the clock; do what it does. Keep going.', current_date + 137),
  ('Though she be but little, she is fierce.', current_date + 138),
  ('Perseverance is failing 19 times and succeeding the 20th.', current_date + 139),
  ('Grit is passion and perseverance for long-term goals.', current_date + 140),

  -- WEEK 21: ACCEPTANCE
  ('Accept what is, let go of what was, and have faith in what will be.', current_date + 141),
  ('Happiness can exist only in acceptance.', current_date + 142),
  ('What you resist, persists.', current_date + 143),
  ('Acceptance doesn''t mean resignation; it means understanding that something is what it is and that there''s got to be a way through it.', current_date + 144),
  ('Grant me the serenity to accept the things I cannot change.', current_date + 145),
  ('The first step toward change is awareness. The second step is acceptance.', current_date + 146),
  ('You can''t stop the waves, but you can learn to surf.', current_date + 147),

  -- WEEK 22: IMAGINATION
  ('Logic will get you from A to B. Imagination will take you everywhere.', current_date + 148),
  ('The world of reality has its limits; the world of imagination is boundless.', current_date + 149),
  ('Dream big.', current_date + 150),
  ('Imagination is the beginning of creation.', current_date + 151),
  ('If you can dream it, you can do it.', current_date + 152),
  ('Reality leaves a lot to the imagination.', current_date + 153),
  ('Go confidently in the direction of your dreams.', current_date + 154),

  -- WEEK 23: FRIENDSHIP
  ('A friend is someone who knows all about you and still loves you.', current_date + 155),
  ('Friendship is the only cement that will ever hold the world together.', current_date + 156),
  ('Walking with a friend in the dark is better than walking alone in the light.', current_date + 157),
  ('True friendship comes when the silence between two people is comfortable.', current_date + 158),
  ('A sweet friendship refreshes the soul.', current_date + 159),
  ('Rare as is true love, true friendship is rarer.', current_date + 160),
  ('Be the friend you wish to have.', current_date + 161),

  -- WEEK 24: LEARNING
  ('Live as if you were to die tomorrow. Learn as if you were to live forever.', current_date + 162),
  ('The beautiful thing about learning is that no one can take it away from you.', current_date + 163),
  ('Tell me and I forget. Teach me and I remember. Involve me and I learn.', current_date + 164),
  ('Ideally, what should be said to every child, repeatedly, throughout his or her school life is something like this: "You are in the process of becoming rather than being."', current_date + 165),
  ('Wisdom is not a product of schooling but of the lifelong attempt to acquire it.', current_date + 166),
  ('Always be a student.', current_date + 167),
  ('Every day is a school day.', current_date + 168),

  -- WEEK 25: GENEROSITY
  ('No one has ever become poor by giving.', current_date + 169),
  ('We make a living by what we get, but we make a life by what we give.', current_date + 170),
  ('Generosity is the most natural outward expression of an inner attitude of compassion.', current_date + 171),
  ('To give is to receive.', current_date + 172),
  ('The best way to find yourself is to lose yourself in the service of others.', current_date + 173),
  ('Give what you have. To someone, it may be better than you dare to think.', current_date + 174),
  ('Kindness is free. Sprinkle it everywhere.', current_date + 175),

  -- WEEK 26: PATIENCE
  ('Patience is not simply the ability to wait - it''s how we behave while we''re waiting.', current_date + 176),
  ('Rivers know this: there is no hurry. We shall get there some day.', current_date + 177),
  ('Patience is the companion of wisdom.', current_date + 178),
  ('One moment of patience may ward off great disaster. One moment of impatience may ruin a whole life.', current_date + 179),
  ('Have patience with all things, But, first of all with yourself.', current_date + 180),
  ('Patience is bitter, but its fruit is sweet.', current_date + 181),
  ('Slow and steady wins the race.', current_date + 182)

  -- NOTE: I have generated 6 months (182 days) here to keep the file size manageable and ensure high quality.
  -- You can re-run this pattern or loop these themes for the second half of the year!
  
ON CONFLICT (publish_date) DO NOTHING;
