const { Client } = require('pg');
require('dotenv').config();

const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const projectRef = 'ibjdmtosotlfmwzncuqk';
const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function migrate() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    const sql = `
-- ============================================================
-- PAYMENTS TABLE — bank slip submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES public.classes(id)  ON DELETE CASCADE,
  amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  slip_url   TEXT,
  payment_method TEXT DEFAULT 'bank_transfer',
  transaction_ref TEXT,
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- ENROLLMENTS TABLE — created when payment is approved
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES public.classes(id)  ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- ============================================================
-- CONVERSATIONS TABLE — one per student+teacher+class
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES public.classes(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, teacher_id, class_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: disable for now (supabaseAdmin bypasses RLS anyway)
ALTER TABLE public.payments      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      DISABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_student  ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_class    ON public.payments(class_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class   ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv     ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created  ON public.messages(created_at);
`;

    console.log('⏳ Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed! Tables created: payments, enrollments, conversations, messages');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
