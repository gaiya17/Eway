const { Client } = require('pg');
require('dotenv').config();

const connectionString = 'postgresql://postgres.ibjdmtosotlfmwzncuqk:7227876Wa%40%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function migrate() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    const sql = `
-- Drop existing table if it exists
DROP TABLE IF EXISTS public.chatbot_structure CASCADE;

-- Create Chatbot Structure Table
CREATE TABLE public.chatbot_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.chatbot_structure(id) ON DELETE CASCADE,
    button_text TEXT NOT NULL,
    response_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: No RLS policies since we want anyone (including public landing pages) to query chatbot_structure
-- and admin modifications are done via a route with auth middleware.
-- If we want RLS, we'd enable it and allow open selects, but we'll leave it disabled for ease OR enable with open read.
-- We will enable RLS for safety and explicitly allow read-only access to everyone.
ALTER TABLE public.chatbot_structure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read chatbot structure" ON chatbot_structure;
CREATE POLICY "Public can read chatbot structure" ON chatbot_structure
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage chatbot structure" ON chatbot_structure;
CREATE POLICY "Admins can manage chatbot structure" ON chatbot_structure
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance (frequent lookup by parent_id)
CREATE INDEX IF NOT EXISTS idx_chatbot_parent_id ON public.chatbot_structure(parent_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sort_order ON public.chatbot_structure(sort_order);

-- Seed Initial Root Nodes
INSERT INTO public.chatbot_structure (id, parent_id, button_text, response_text, sort_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', NULL, 'Payments', NULL, 1),
  ('22222222-2222-2222-2222-222222222222', NULL, 'Classes', NULL, 2),
  ('33333333-3333-3333-3333-333333333333', NULL, 'Attendance', NULL, 3);
`;

    console.log('⏳ Running Chatbot Structure migration...');
    await client.query(sql);
    console.log('✅ Chatbot Structure Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
