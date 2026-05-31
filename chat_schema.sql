-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable real-time subscriptions for the messages table
-- Note: You might need to drop the publication first if it exists, or alter it
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Only Student or Listener of the session can read messages
CREATE POLICY "Participants can read messages" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = messages.session_id
    AND (sessions.student_id = auth.uid() OR sessions.listener_id = auth.uid())
  )
);

-- 2. Insert Policy: Only participants can send messages, and they can only set themselves as sender
CREATE POLICY "Participants can send messages" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_id
    AND (sessions.student_id = auth.uid() OR sessions.listener_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- 3. Update Policy: Participants can update messages (used for setting read_at receipts)
CREATE POLICY "Participants can update message read status" ON messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = messages.session_id
    AND (sessions.student_id = auth.uid() OR sessions.listener_id = auth.uid())
  )
);

-- Create an index for faster queries since we load by session_id and order by created_at
CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages(session_id, created_at DESC);

-- 4. Admin Read Policy: Admins can view all chat messages
CREATE POLICY "Admins can read all messages" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
