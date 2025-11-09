-- ================================
-- LABEL TIER COUNTER FUNCTIONS
-- RPC functions for incrementing/decrementing label usage counters
-- ================================

-- Function to increment label artist count
CREATE OR REPLACE FUNCTION increment_label_artist_count(
    p_user_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        label_artist_count = label_artist_count + 1,
        updated_at = NOW()
    WHERE id = p_user_id AND role = 'label_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement label artist count
CREATE OR REPLACE FUNCTION decrement_label_artist_count(
    p_user_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        label_artist_count = GREATEST(0, label_artist_count - 1),
        updated_at = NOW()
    WHERE id = p_user_id AND role = 'label_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment label release counters
CREATE OR REPLACE FUNCTION increment_label_release_counters(
    p_user_id UUID,
    p_track_count INT DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        label_releases_this_year = label_releases_this_year + 1,
        label_tracks_this_year = label_tracks_this_year + p_track_count,
        label_total_releases = label_total_releases + 1,
        updated_at = NOW()
    WHERE id = p_user_id AND role = 'label_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment label Apollo query counter
CREATE OR REPLACE FUNCTION increment_label_apollo_counter(
    p_user_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        label_apollo_queries_this_month = label_apollo_queries_this_month + 1,
        updated_at = NOW()
    WHERE id = p_user_id AND role = 'label_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_label_artist_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_label_artist_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_label_release_counters(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_label_apollo_counter(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION increment_label_artist_count IS 'Increments label_artist_count for a label admin';
COMMENT ON FUNCTION decrement_label_artist_count IS 'Decrements label_artist_count for a label admin (minimum 0)';
COMMENT ON FUNCTION increment_label_release_counters IS 'Increments label release and track counters for a label admin';
COMMENT ON FUNCTION increment_label_apollo_counter IS 'Increments label Apollo query counter for a label admin';
