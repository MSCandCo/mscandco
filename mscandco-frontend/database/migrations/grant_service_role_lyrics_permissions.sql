-- Grant service_role full permissions on lyrics table
-- Service role should be able to bypass RLS completely

GRANT ALL ON public.lyrics TO service_role;
GRANT ALL ON public.lyrics TO postgres;

-- Also ensure authenticated role has permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lyrics TO authenticated;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
