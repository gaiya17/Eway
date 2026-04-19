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
-- 1. Add Commission Percentage to Classes
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL DEFAULT 20.0;

-- 2. Create Payouts Tracking Table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- Null implies "All Classes"
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_revenue DECIMAL NOT NULL,
    institute_commission DECIMAL NOT NULL,
    other_deductions DECIMAL DEFAULT 0,
    net_payout DECIMAL NOT NULL,
    notes TEXT,
    payout_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Paid'
);

-- Enable RLS logic for payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage payouts" ON public.payouts;
CREATE POLICY "Admins can manage payouts" ON public.payouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Teachers can view own payouts" ON public.payouts;
CREATE POLICY "Teachers can view own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE INDEX IF NOT EXISTS idx_payouts_teacher ON public.payouts(teacher_id);
`;

    console.log('⏳ Running Payout Engine migration...');
    await client.query(sql);
    console.log('✅ Payout Engine Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
