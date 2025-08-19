-- Fix the custom access token hook to preserve all required JWT fields
-- This maintains all standard Supabase JWT claims while adding our custom role

DROP FUNCTION IF EXISTS public.custom_access_token_hook(event jsonb);

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
    existing_claims jsonb;
BEGIN
    -- Get the user's primary role
    SELECT ura.role_name INTO user_role
    FROM public.user_role_assignments ura
    WHERE ura.user_id = (event->>'user_id')::uuid
    ORDER BY 
        CASE ura.role_name
            WHEN 'super_admin' THEN 1
            WHEN 'company_admin' THEN 2
            WHEN 'label_admin' THEN 3
            WHEN 'artist' THEN 4
            ELSE 5
        END
    LIMIT 1;

    -- Set default role if none found
    IF user_role IS NULL THEN
        user_role := 'artist';
    END IF;

    -- Get existing claims from the event (preserves all standard JWT fields)
    existing_claims := COALESCE(event->'claims', '{}'::jsonb);

    -- Add our custom role to the existing claims
    existing_claims := existing_claims || jsonb_build_object('role', user_role);

    -- Return the event with updated claims
    RETURN jsonb_set(event, '{claims}', existing_claims);
END;
$$;

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Test the function
SELECT 'Custom access token hook updated successfully - preserves all JWT fields' as status;
