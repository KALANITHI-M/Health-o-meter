-- Add additional profile columns for health goals and preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dietary_goals TEXT,
ADD COLUMN IF NOT EXISTS weekly_target INTEGER DEFAULT 70 CHECK (weekly_target >= 0 AND weekly_target <= 100),
ADD COLUMN IF NOT EXISTS daily_meal_target INTEGER DEFAULT 3 CHECK (daily_meal_target >= 1 AND daily_meal_target <= 6);