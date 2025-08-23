-- Clean up any remaining artists records
DELETE FROM public.artists;

-- Reset the sequence if needed
SELECT setval('artists_id_seq', 1, false);

-- Verify cleanup
SELECT COUNT(*) as remaining_artists FROM public.artists;
SELECT COUNT(*) as remaining_profiles FROM public.user_profiles;
