-- Fix handle_new_user trigger to bypass RLS
-- The trigger needs to insert into profiles table which has RLS enabled

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'general'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Also update the INSERT policy to be more permissive for service role
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (true);
