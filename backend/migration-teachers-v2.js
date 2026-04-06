const { Client } = require('pg');
require('dotenv').config();

const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const projectRef = 'ibjdmtosotlfmwzncuqk';
const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function migrate() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    const sql = `
-- 1. Expand Profiles table for Teacher Metadata
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quote TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT;

-- 2. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'rejected')),
  payment_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- 3. Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view enrollments in own classes" ON public.enrollments;
CREATE POLICY "Teachers can view enrollments in own classes" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = enrollments.class_id AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Students can insert own enrollments" ON public.enrollments;
CREATE POLICY "Students can insert own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 5. Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_enrollments_updated_at
      BEFORE UPDATE ON public.enrollments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
`;

    console.log('Executing migration-teachers-v2 SQL...');
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
