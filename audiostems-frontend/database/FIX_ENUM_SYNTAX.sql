-- Fix the enum syntax error in the profile locking system

-- Add field locking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approval_required_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked';

-- Create change request status enum (fixed syntax)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_request_status') THEN
        CREATE TYPE change_request_status AS ENUM (
            'pending',
            'approved', 
            'rejected',
            'cancelled'
        );
    END IF;
END $$;

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

-- Lock your existing profile
UPDATE public.user_profiles 
SET 
    locked_fields = '{"firstName": true, "lastName": true, "dateOfBirth": true, "nationality": true, "country": true, "city": true}',
    profile_lock_status = 'locked',
    is_basic_info_set = true
WHERE email = 'info@htay.co.uk';

-- Enable RLS on change requests
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own change requests" ON public.profile_change_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own change requests" ON public.profile_change_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Verify success
SELECT 'Profile locking system created successfully!' as status;
SELECT 
    email,
    locked_fields,
    profile_lock_status,
    is_basic_info_set
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk';
