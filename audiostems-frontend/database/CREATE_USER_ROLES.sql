-- Create user roles for the authentication system
-- This script creates the necessary roles that users can be assigned

-- Create the roles
INSERT INTO user_roles (role_name, description) VALUES 
('artist', 'Individual artist or performer'),
('label_admin', 'Label administrator managing artists'),
('company_admin', 'Company administrator with broader access'),
('super_admin', 'System administrator with full access')
ON CONFLICT (role_name) DO NOTHING;

-- Verify roles were created
SELECT * FROM user_roles ORDER BY role_name;
