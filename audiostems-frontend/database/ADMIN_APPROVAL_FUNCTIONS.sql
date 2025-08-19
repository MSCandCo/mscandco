-- Admin approval functions for change requests

-- Function to approve a change request and update the profile
CREATE OR REPLACE FUNCTION public.approve_change_request(
    p_request_id UUID,
    p_admin_id UUID,
    p_admin_notes TEXT DEFAULT ''
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_data RECORD;
    update_query TEXT;
BEGIN
    -- Get the change request
    SELECT * INTO request_data
    FROM public.profile_change_requests
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update the user profile with the new value
    IF request_data.field_name = 'firstName' THEN
        UPDATE public.user_profiles SET first_name = request_data.requested_value, updated_at = now() WHERE id = request_data.user_id;
    ELSIF request_data.field_name = 'lastName' THEN
        UPDATE public.user_profiles SET last_name = request_data.requested_value, updated_at = now() WHERE id = request_data.user_id;
    ELSIF request_data.field_name = 'dateOfBirth' THEN
        UPDATE public.user_profiles SET date_of_birth = request_data.requested_value::date, updated_at = now() WHERE id = request_data.user_id;
    ELSIF request_data.field_name = 'nationality' THEN
        UPDATE public.user_profiles SET nationality = request_data.requested_value, updated_at = now() WHERE id = request_data.user_id;
    ELSIF request_data.field_name = 'country' THEN
        UPDATE public.user_profiles SET country = request_data.requested_value, updated_at = now() WHERE id = request_data.user_id;
    ELSIF request_data.field_name = 'city' THEN
        UPDATE public.user_profiles SET city = request_data.requested_value, updated_at = now() WHERE id = request_data.user_id;
    END IF;
    
    -- Mark request as approved
    UPDATE public.profile_change_requests
    SET 
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = p_admin_id,
        admin_notes = p_admin_notes,
        updated_at = now()
    WHERE id = p_request_id;
    
    RETURN TRUE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.approve_change_request TO authenticated;

-- Test function exists
SELECT 'Admin approval functions created successfully!' as status;
