-- Add health-specific columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_conditions TEXT[];

-- Update the existing handle_new_user function to use first_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create food_logs table for tracking meals
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for food_logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for food_logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can view their own food logs') THEN
    CREATE POLICY "Users can view their own food logs" 
    ON public.food_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can create their own food logs') THEN
    CREATE POLICY "Users can create their own food logs" 
    ON public.food_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can update their own food logs') THEN
    CREATE POLICY "Users can update their own food logs" 
    ON public.food_logs 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can delete their own food logs') THEN
    CREATE POLICY "Users can delete their own food logs" 
    ON public.food_logs 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;