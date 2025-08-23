-- Permanent solution: Auto-create user profiles when users register
-- This sets up a database trigger to automatically create user_profiles entries

-- Step 1: Create the function that will auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'superadmin@mscandco.com' THEN 'super_admin'
      WHEN NEW.email = 'companyadmin@mscandco.com' THEN 'company_admin'
      WHEN NEW.email LIKE '%label%' OR NEW.email LIKE '%labeladmin%' THEN 'label_admin'
      WHEN NEW.email LIKE '%distribution%' OR NEW.email LIKE '%partner%' THEN 'distribution_partner'
      ELSE 'artist'
    END,
    'inactive',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Enable RLS (Row Level Security) on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for user_profiles
-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Service role can do everything (for admin functions)
CREATE POLICY "Service role full access" ON public.user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Test the setup
SELECT 'Auto-profile creation setup complete!' as status;
