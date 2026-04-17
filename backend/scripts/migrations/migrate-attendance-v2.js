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
-- Drop existing basic attendance table if it exists
DROP TABLE IF EXISTS public.attendance CASCADE;

-- Create Enhanced Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    session_id UUID, -- Links to class_materials.id for online live sessions
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL CHECK (method IN ('Auto_Join', 'QR_Scan', 'Manual')),
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Absent')),
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Prevent duplicate records for the same student, class, and date
    UNIQUE(student_id, class_id, session_date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies
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

DROP POLICY IF EXISTS "Staff and Admins can manage all attendance" ON attendance;
CREATE POLICY "Staff and Admins can manage all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(session_date);
`;

    console.log('⏳ Running Attendance V2 migration...');
    await client.query(sql);
    console.log('✅ Attendance V2 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
