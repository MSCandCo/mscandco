-- Add conversation history to onboarding_progress table for intelligent Apollo conversations

-- Add conversation_history column to store full chat history
ALTER TABLE onboarding_progress
ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN onboarding_progress.conversation_history IS 'Stores the full conversation history between user and Apollo for context-aware responses';
