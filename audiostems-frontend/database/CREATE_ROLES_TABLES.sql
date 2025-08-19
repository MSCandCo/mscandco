-- Create the user roles and role assignments tables
-- This creates the foundation for the role-based authentication system

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    role_name TEXT PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_role_assignments table
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT REFERENCES user_roles(role_name) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_name)
);

-- Enable RLS on both tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles (readable by all authenticated users)
CREATE POLICY "user_roles_select" ON user_roles
    FOR SELECT TO authenticated
    USING (true);

-- Create policies for user_role_assignments
CREATE POLICY "user_role_assignments_select" ON user_role_assignments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_role_assignments_insert" ON user_role_assignments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Insert the default roles
INSERT INTO user_roles (role_name, description) VALUES 
('artist', 'Individual artist or performer'),
('label_admin', 'Label administrator managing artists'),
('company_admin', 'Company administrator with broader access'),
('super_admin', 'System administrator with full access')
ON CONFLICT (role_name) DO NOTHING;

-- Show the created tables and roles
SELECT 'Tables created successfully' as status;
SELECT * FROM user_roles ORDER BY role_name;
