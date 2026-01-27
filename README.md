# Alma Wellness

A gamified wellness app where completing daily health goals grows your personal plant. Track your progress locally and get inspired by demo friends in the community garden.

## Features

### Local-First Design
- **No Account Required**: Start using the app immediately after onboarding
- **On-Device Storage**: All data stored locally using AsyncStorage
- **Privacy-Focused**: Your wellness data stays on your device
- **Reset Option**: Clear all data and start fresh from Profile settings

### Onboarding
- **Welcome Flow**: Beautiful 5-step introduction with Alma logo and animated plant
- **Goal Selection**: Choose from 8 suggested wellness goals during onboarding
- **Daily Steps**: Default 10,000 steps goal (editable in Goals tab)
- **Personalization**: Set your name during onboarding
- **Swipe Navigation**: Gesture-based navigation through screens

### Feature Tour
- **Quick App Tour**: 7-slide guided tour showing key app features after onboarding
- **Visual Highlights**: Each slide focuses on a specific feature with icons and descriptions
- **Plant Previews**: See your plant at different growth stages
- **Helpful Tips**: Each slide includes a tip on where to find the feature
- **Skippable**: Users can skip the tour anytime or swipe through at their pace
- **One-time Display**: Tour only shows once after completing onboarding

### Home Screen
- **Animated Plant**: Watch your plant grow from seed to bloom as you complete goals
- **Daily Goals**: Track walking, hydration, meditation, journaling, and custom goals
- **Smart Goal Input**:
  - Small goals (≤10): Tap + to increment by 1
  - Large goals (steps, etc.): Tap to open quick-add modal with preset buttons (+100, +1000, +5000)
  - Manual input: Type exact values for any goal
  - Long-press: Hold any goal to instantly complete it
- **Streak Badge**: Tap to share your streak on social media
- **Personalized Greeting**: Time-based greeting with your name
- **Quick Journal Access**: One-tap access to daily journaling
- **Points Progress**: See points earned and progress to next level

### Streaks
- **Daily Tracking**: Streak increments when you complete at least one goal
- **Automatic Reset**: Streak resets to 0 if no goals completed the previous day
- **Longest Streak**: Your personal best is always tracked
- **Share Streaks**: Tap streak badge to share a beautiful image card
- **Achievement Integration**: Week Warrior achievement tracks 7-day streaks

### Social Sharing
- **Share Cards**: Beautiful image cards for streaks and achievements
- **Streak Card**: Shows streak count, user name, personal best, and motivational message
- **Achievement Card**: Displays unlocked achievement with description and user name
- **Branded Design**: Cards feature the Alma Wellness logo and app color theme
- **Native Sharing**: Share to Instagram, Messages, save to photos, or any other app

### Goals Screen
- **Preset Goals**: Quick-add common wellness goals (Steps, Water, Meditation, Gratitude)
- **Custom Goals**: Create personalized goals with custom targets and units
- **Daily Steps Slider**: Slider interface for step goals (100-20,000 range)
- **Expanded Goal Types**: Sleep, Nutrition, Exercise, Focus Time, and more
- **Edit Goals**: Update goal names, targets, and units
- **Manage Goals**: Remove goals you don't need
- **Goal Notifications**: Set up reminders for each goal with 33 time options (6 AM - 10 PM, every 30 minutes)
- **Interval Reminders**: Set repeating reminders throughout the day (every 2, 3, 4, 6, or 8 hours) with customizable start and end times - perfect for goals like vitamins that need multiple daily reminders

### Retreats
- **Expandable Cards**: Tap to see full retreat details
- **Full Descriptions**: Comprehensive information about each event
- **What's Included**: List of amenities and activities
- **Facilitator Info**: See who's leading each retreat
- **Register Button**: Direct link to register for upcoming retreats (when available)
- **Registration Coming Soon**: Shows status for retreats pending registration setup
- **Past Events**: See history of attended community events
- **Event Details**: Date, time, location, price, and attendee count

### Journaling
- **Daily Prompts**: Rotating reflection prompts to inspire writing
- **Mood Tracking**: Select how you're feeling (Great, Good, Okay, Low)
- **Auto-Complete Goal**: Writing completes your journaling goal automatically
- **Journal History**: Access past entries

### Cooperative Grove
- **Visual Grove**: See plants in a shared space with demo friends for inspiration
- **Demo Friends**: Example friends to show how the feature works (real connections coming soon)
- **Grove Vitality Card**: Collective progress bar showing team goal (2,500 XP weekly target)
- **Wilting Plants**: Plants of inactive friends (>48 hours) appear faded with a water drop badge
- **Grove Care List**: Friends sorted by who needs help most (inactive at top), tap any friend card to view details
- **Send Rain**: Tap the CloudRain button to send encouragement to wilting friends (+10 XP)
- **Toast Notifications**: Visual feedback when sending rain to friends
- **Friend Profiles**: Tap any friend card or plant to see their detailed stats, achievements, and streaks
- **Online Status**: See who's currently active with green indicators
- **Invite System**: Share codes and invite functionality (ready for future cloud features)

### Profile
- **Stats Overview**: Total points, current streak, and goals completed
- **Longest Streak**: Track your personal best streak
- **Wellness Membership Card**: Premium VIP card for partner discounts at spas, gyms, nail salons, and hotels
- **Achievements**: 6 unlockable badges with progress tracking
- **Share Achievements**: Tap unlocked achievements to share on social media
- **Weekly Progress**: Visual calendar showing daily activity
- **Edit Profile**: Update your name and avatar
- **Profile Picture Upload**: Upload from photo library or take a new photo
- **Preset Avatars**: Choose from curated avatar options
- **Fallback Avatar**: Shows user initial if image fails to load
- **Settings Menu**: Notifications, help & support, reset onboarding, sound effects toggle
- **Reset All Data**: Clear all progress and start fresh

### Membership Card
- **Premium Design**: Dark sage gradient card with shimmer animation
- **Member Tier**: Bronze, Silver, or Gold based on plant level
- **Partner Network**: Exclusive discounts at wellness businesses
- **Partner Categories**: Spa, fitness, beauty, hospitality
- **Discount Badges**: Each partner shows their exclusive member discount
- **Partner Details Modal**: Tap any partner to see full details, location, hours, and get directions

### Notifications
- **Daily Reminders**: Configurable morning wellness reminders
- **Retreat Reminders**: Get notified before upcoming events
- **Goal Reminders**: Nudges to complete daily goals
- **Customizable Settings**: Control notification preferences

### Celebrations
- **Level Up Confetti**: Colorful celebration animation when leveling up
- **Haptic Feedback**: Tactile feedback throughout the app
- **Spa-Like Sounds**: Calming sound effects for a wellness experience

### Sound Effects
- **Gentle Chimes**: Step transitions in onboarding
- **Celebration Sounds**: Level ups and onboarding completion
- **Water Drop**: Hydration tracking and sending rain to friends
- **Success Tones**: Goal completion and journal saves
- **Toggle Control**: Enable/disable sounds in Profile settings

## Points & Plant Growth

Complete goals to earn points and grow your plant:
- **Points Per Level**: 100 points to level up
- **Goal Points**: Each goal awards 15-30 points when completed
- **Daily Reset**: Goals reset at midnight, points persist

### Plant Growth Stages

1. **Seed** (Level 1-2): Your journey begins
2. **Sprout** (Level 3-5): First leaves appear
3. **Growing** (Level 6-9): Healthy green plant
4. **Budding** (Level 10-14): Flower bud forming
5. **Blooming** (Level 15+): Full flower bloom with gentle swaying animation

## Achievements

- **First Bloom**: Reach level 15
- **Hydration Hero**: Complete water goal 7 days
- **Mindful Master**: 30 meditation sessions
- **Step Champion**: Complete step goal 10 times
- **Week Warrior**: 7 day streak
- **Journaling Journey**: Write 14 journal entries

## User Flow

1. **New Users**: Onboarding → Feature Tour → Home
2. **Returning Users**: Home (or Onboarding if not completed)
3. **Daily Usage**: Complete goals → Earn points → Watch plant grow → Level up

## Tech Stack

- Expo SDK 53 with React Native
- NativeWind (TailwindCSS) for styling
- Zustand for state management with AsyncStorage persistence
- React Native Reanimated for animations
- React Native SVG for plant graphics
- React Native Gesture Handler for swipe interactions
- Expo Notifications for push notifications

## Color Palette

The app uses a sage green theme reflecting wellness and nature:
- Primary: `#778b5f` (Sage 500)
- Background: `#fdfbf7` (Cream)
- Accents: Various sage tones from 50-950
