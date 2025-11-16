-- Fix permissions for lyrics table

-- First, ensure the table exists and RLS is enabled
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them fresh)
DROP POLICY IF EXISTS "Users can view own lyrics" ON public.lyrics;
DROP POLICY IF EXISTS "Users can insert own lyrics" ON public.lyrics;
DROP POLICY IF EXISTS "Users can update own lyrics" ON public.lyrics;
DROP POLICY IF EXISTS "Users can delete own lyrics" ON public.lyrics;

-- Recreate policies
CREATE POLICY "Users can view own lyrics" ON public.lyrics
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own lyrics" ON public.lyrics
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own lyrics" ON public.lyrics
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own lyrics" ON public.lyrics
  FOR DELETE
  USING (auth.uid() = created_by);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lyrics TO authenticated;

-- Also grant to anon role in case needed
GRANT SELECT ON public.lyrics TO anon;
