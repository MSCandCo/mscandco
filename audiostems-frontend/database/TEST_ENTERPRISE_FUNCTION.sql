-- Test the enterprise function directly

SELECT 'Testing enterprise function:' as test;

-- Test with label admin
SELECT public.update_user_profile(
  'labeladmin@mscandco.com',
  '{"firstName":"Label","lastName":"Admin","labelName":"MSC & Co"}'::JSONB
) as result;
