-- Create the change request system that both artist and label admin profiles need

-- 1. Create change_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    field_name TEXT NOT NULL,
    current_value TEXT,
    requested_value TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the change request function
CREATE OR REPLACE FUNCTION public.create_change_request(
    p_user_id UUID,
    p_field_name TEXT,
    p_current_value TEXT,
    p_requested_value TEXT,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_id UUID;
BEGIN
    -- Insert the change request
    INSERT INTO public.change_requests (
        user_id,
        field_name,
        current_value,
        requested_value,
        reason,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_field_name,
        p_current_value,
        p_requested_value,
        p_reason,
        'pending',
        NOW(),
        NOW()
    ) RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$;

-- 3. Grant permissions
GRANT ALL PRIVILEGES ON public.change_requests TO postgres;
GRANT ALL PRIVILEGES ON public.change_requests TO service_role;
GRANT ALL PRIVILEGES ON public.change_requests TO authenticated;
GRANT ALL PRIVILEGES ON public.change_requests TO anon;

GRANT EXECUTE ON FUNCTION public.create_change_request(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_change_request(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_change_request(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- 4. Enable RLS on change_requests table
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for change requests
CREATE POLICY "users_can_view_own_requests" ON public.change_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_own_requests" ON public.change_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_requests" ON public.change_requests
FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('company_admin', 'super_admin')
);

CREATE POLICY "admins_can_update_all_requests" ON public.change_requests
FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('company_admin', 'super_admin')
);

CREATE POLICY "service_role_full_access" ON public.change_requests
FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT 'Change request system created successfully!' as status;
