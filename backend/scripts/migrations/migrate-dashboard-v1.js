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
-- 1. Add scheduled_at to class_materials
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_materials' AND column_name='scheduled_at') THEN
        ALTER TABLE class_materials ADD COLUMN scheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('present', 'late', 'absent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 4. Attendance Policies
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
CREATE POLICY "Students can view own attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can manage class attendance" ON attendance;
CREATE POLICY "Teachers can manage class attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes WHERE id = attendance.class_id AND teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
CREATE POLICY "Admins can view all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
`;

    console.log('Executing Dashboard Migration SQL (Simple)...');
    await client.query(sql);
    console.log('Dashboard Migration completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
