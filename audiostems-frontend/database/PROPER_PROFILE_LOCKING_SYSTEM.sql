-- ENTERPRISE PROFILE LOCKING & CHANGE REQUEST SYSTEM
-- This implements proper field-level locking with database persistence

-- ========================================
-- 1. CREATE FIELD LOCKING SYSTEM
-- ========================================

-- Add field locking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approval_required_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked';

-- ========================================
-- 2. CREATE CHANGE REQUEST SYSTEM
-- ========================================

-- Change request status enum
CREATE TYPE IF NOT EXISTS change_request_status AS ENUM (
    'pending',
    'approved', 
    'rejected',
    'cancelled'
);

-- Profile change requests table
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL DEFAULT 'profile_field_change',
    
    -- Field changes
    field_name TEXT NOT NULL,
    current_value TEXT,
    requested_value TEXT NOT NULL,
    
    -- Request metadata
    reason TEXT,
    supporting_documents JSONB DEFAULT '[]',
    status change_request_status DEFAULT 'pending',
    
    -- Approval workflow
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- 3. LOCK YOUR EXISTING PROFILE
-- ========================================

-- Lock the basic profile fields for your user
UPDATE public.user_profiles 
SET 
    locked_fields = '{"firstName": true, "lastName": true, "dateOfBirth": true, "nationality": true, "country": true, "city": true}',
    profile_lock_status = 'locked',
    is_basic_info_set = true
WHERE email = 'info@htay.co.uk';

-- ========================================
-- 4. CREATE RLS POLICIES FOR CHANGE REQUESTS
-- ========================================

-- Enable RLS
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own change requests
CREATE POLICY "Users can view own change requests" ON public.profile_change_requests
    FOR SELECT USING (user_id = auth.uid());

-- Users can create change requests for themselves
CREATE POLICY "Users can create own change requests" ON public.profile_change_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests (to cancel)
CREATE POLICY "Users can update own pending requests" ON public.profile_change_requests
    FOR UPDATE USING (
        user_id = auth.uid() 
        AND status = 'pending'
    );

-- Admins can view and manage all change requests
CREATE POLICY "Admins can manage all change requests" ON public.profile_change_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_role_assignments ura
            WHERE ura.user_id = auth.uid() 
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- ========================================
-- 5. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to check if a field is locked for a user
CREATE OR REPLACE FUNCTION public.is_field_locked(user_profile_id UUID, field_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    locked_fields_data JSONB;
BEGIN
    SELECT locked_fields INTO locked_fields_data
    FROM public.user_profiles 
    WHERE id = user_profile_id;
    
    -- Return true if field is explicitly locked
    RETURN COALESCE((locked_fields_data ->> field_name)::BOOLEAN, false);
END;
$$;

-- Function to create a change request
CREATE OR REPLACE FUNCTION public.create_change_request(
    p_user_id UUID,
    p_field_name TEXT,
    p_current_value TEXT,
    p_requested_value TEXT,
    p_reason TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_id UUID;
BEGIN
    INSERT INTO public.profile_change_requests (
        user_id,
        field_name,
        current_value,
        requested_value,
        reason,
        status
    ) VALUES (
        p_user_id,
        p_field_name,
        p_current_value,
        p_requested_value,
        p_reason,
        'pending'
    ) RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$;

-- Function to approve a change request
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
    field_update_query TEXT;
BEGIN
    -- Get the change request
    SELECT * INTO request_data
    FROM public.profile_change_requests
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update the user profile with the new value
    EXECUTE format('UPDATE public.user_profiles SET %I = %L, updated_at = now() WHERE id = %L',
                   request_data.field_name, 
                   request_data.requested_value, 
                   request_data.user_id);
    
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

-- ========================================
-- 6. CREATE TRIGGERS FOR CHANGE REQUESTS
-- ========================================

-- Trigger to update timestamps
CREATE TRIGGER update_change_requests_updated_at
    BEFORE UPDATE ON public.profile_change_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 7. VERIFICATION
-- ========================================

SELECT 'Profile locking system created successfully!' as status;

-- Check your profile lock status
SELECT 
    email,
    locked_fields,
    profile_lock_status,
    is_basic_info_set
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk';

-- Check if helper functions work
SELECT public.is_field_locked(
    (SELECT id FROM public.user_profiles WHERE email = 'info@htay.co.uk'),
    'firstName'
) as is_first_name_locked;
