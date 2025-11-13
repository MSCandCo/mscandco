-- Fix RBAC table permissions for service role
-- This should be run in Supabase SQL Editor

-- Grant permissions to authenticated users (includes service role)
GRANT ALL ON permissions TO authenticated;
GRANT ALL ON roles TO authenticated;
GRANT ALL ON role_permissions TO authenticated;
GRANT ALL ON user_permissions TO authenticated;
GRANT ALL ON permission_audit_log TO authenticated;

-- Grant permissions to service_role specifically
GRANT ALL ON permissions TO service_role;
GRANT ALL ON roles TO service_role;
GRANT ALL ON role_permissions TO service_role;
GRANT ALL ON user_permissions TO service_role;
GRANT ALL ON permission_audit_log TO service_role;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO service_role;

-- Enable RLS but allow service_role to bypass
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies that allow service_role full access
CREATE POLICY "Service role can manage permissions" ON permissions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage roles" ON roles FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage role_permissions" ON role_permissions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage user_permissions" ON user_permissions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage audit_log" ON permission_audit_log FOR ALL TO service_role USING (true);

-- Create policies for authenticated users (more restrictive)
CREATE POLICY "Users can read permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their role_permissions" ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their user_permissions" ON user_permissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can read audit_log" ON permission_audit_log FOR SELECT TO authenticated USING (true);

