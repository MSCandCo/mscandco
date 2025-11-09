-- RPC Function for Incrementing Release Counters
-- This function atomically increments releases_this_year and tracks_this_year
-- Used by the tier enforcement middleware

CREATE OR REPLACE FUNCTION increment_release_counters(
    p_user_id BIGINT,
    p_track_count INT DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        releases_this_year = releases_this_year + 1,
        tracks_this_year = tracks_this_year + p_track_count,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_release_counters(BIGINT, INT) TO authenticated;

COMMENT ON FUNCTION increment_release_counters IS 'Atomically increments release and track counters for tier enforcement';

