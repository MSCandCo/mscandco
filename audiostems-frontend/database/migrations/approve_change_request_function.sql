-- Approve Change Request RPC Function
-- This function approves a profile change request and applies the change to the user's profile

CREATE OR REPLACE FUNCTION approve_change_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_update_query TEXT;
  v_result JSON;
BEGIN
  -- Get the pending request
  SELECT * INTO v_request
  FROM profile_change_requests
  WHERE id = p_request_id
  AND status = 'pending';

  -- Check if request exists and is pending
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Request not found or already processed'
    );
  END IF;

  -- Build dynamic UPDATE query for user_profiles
  -- This allows us to update any field based on field_name
  v_update_query := format(
    'UPDATE user_profiles SET %I = $1, updated_at = NOW() WHERE id = $2',
    v_request.field_name
  );

  -- Execute the update on user_profiles
  EXECUTE v_update_query
  USING v_request.requested_value, v_request.user_id;

  -- Mark the request as approved
  UPDATE profile_change_requests
  SET
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Return success with details
  v_result := json_build_object(
    'success', true,
    'message', 'Profile change request approved and applied',
    'request_id', p_request_id,
    'field_name', v_request.field_name,
    'new_value', v_request.requested_value
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
-- Note: Additional RBAC checks are performed in the API layer
GRANT EXECUTE ON FUNCTION approve_change_request(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_change_request(UUID, UUID, TEXT) TO service_role;

-- Test the function (commented out - uncomment to test)
-- SELECT approve_change_request(
--   'test-request-id'::UUID,
--   'admin-user-id'::UUID,
--   'Approved by admin'
-- );
