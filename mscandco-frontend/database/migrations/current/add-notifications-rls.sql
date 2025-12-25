-- Enable Row Level Security on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access"
ON notifications
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Grant necessary permissions
GRANT SELECT, UPDATE, DELETE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

