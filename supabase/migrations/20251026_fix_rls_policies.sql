-- Fix RLS policies for signup
-- Add missing INSERT policy for profiles table

-- Allow authenticated users to insert their own profile (for trigger)
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for trigger function)
-- This is needed because the trigger runs with SECURITY DEFINER
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
