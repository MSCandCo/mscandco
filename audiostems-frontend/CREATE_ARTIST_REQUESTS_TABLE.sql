-- Create artist_requests table for approval workflow
CREATE TABLE IF NOT EXISTS artist_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by_user_id UUID NOT NULL,
    requested_by_email TEXT NOT NULL,
    label_name TEXT NOT NULL,
    artist_first_name TEXT NOT NULL,
    artist_last_name TEXT NOT NULL,
    artist_stage_name TEXT NOT NULL,
    label_royalty_percent DECIMAL(5,2) NOT NULL CHECK (label_royalty_percent >= 0 AND label_royalty_percent <= 100),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_type TEXT NOT NULL DEFAULT 'add_artist',
    approved_by_user_id UUID,
    approved_by_email TEXT,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_requested_by_user FOREIGN KEY (requested_by_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_approved_by_user FOREIGN KEY (approved_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_artist_requests_status ON artist_requests(status);
CREATE INDEX IF NOT EXISTS idx_artist_requests_requested_by ON artist_requests(requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_created_at ON artist_requests(created_at DESC);

-- Enable RLS
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Label admins can only see their own requests
CREATE POLICY "label_admins_own_requests" ON artist_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name = 'label_admin'
            AND artist_requests.requested_by_user_id = auth.uid()
        )
    );

-- Company admins and super admins can see all requests
CREATE POLICY "admins_all_requests" ON artist_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Label admins can insert their own requests
CREATE POLICY "label_admins_insert_requests" ON artist_requests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name = 'label_admin'
            AND artist_requests.requested_by_user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artist_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_artist_requests_updated_at ON artist_requests;
CREATE TRIGGER update_artist_requests_updated_at
    BEFORE UPDATE ON artist_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_artist_requests_updated_at();

-- Function to approve/reject artist requests
CREATE OR REPLACE FUNCTION process_artist_request(
    p_request_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_rejection_reason TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request artist_requests%ROWTYPE;
    v_user_role TEXT;
    v_result JSON;
BEGIN
    -- Check if user has permission (company_admin or super_admin)
    SELECT role INTO v_user_role
    FROM user_role_assignments
    WHERE user_id = auth.uid()
    AND role IN ('company_admin', 'super_admin');
    
    IF v_user_role IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;
    
    -- Get the request
    SELECT * INTO v_request
    FROM artist_requests
    WHERE id = p_request_id;
    
    IF v_request.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;
    
    IF v_request.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed');
    END IF;
    
    -- Update the request
    IF p_action = 'approve' THEN
        UPDATE artist_requests
        SET 
            status = 'approved',
            approved_by_user_id = auth.uid(),
            approved_by_email = (SELECT email FROM auth.users WHERE id = auth.uid()),
            notes = p_notes,
            updated_at = NOW()
        WHERE id = p_request_id;
        
        -- TODO: Create the actual artist user account and profile here
        -- This would involve creating a new user in auth.users and user_profiles
        
        v_result = json_build_object(
            'success', true, 
            'message', 'Artist request approved successfully',
            'action', 'approved'
        );
    ELSIF p_action = 'reject' THEN
        UPDATE artist_requests
        SET 
            status = 'rejected',
            approved_by_user_id = auth.uid(),
            approved_by_email = (SELECT email FROM auth.users WHERE id = auth.uid()),
            rejection_reason = p_rejection_reason,
            notes = p_notes,
            updated_at = NOW()
        WHERE id = p_request_id;
        
        v_result = json_build_object(
            'success', true, 
            'message', 'Artist request rejected',
            'action', 'rejected'
        );
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid action');
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
