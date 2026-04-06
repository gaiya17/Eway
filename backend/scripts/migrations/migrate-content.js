const { Client } = require('pg');
require('dotenv').config();

const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const projectRef = 'ibjdmtosotlfmwzncuqk';
const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function migrate() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    const sql = `
-- 1. Class Sections Table
CREATE TABLE IF NOT EXISTS public.class_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Class Materials Table
CREATE TABLE IF NOT EXISTS public.class_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES public.class_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'link', 'video')),
  url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_materials ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Sections: Teachers of the class can manage, students of the class can view (Public for now if approved)
DROP POLICY IF EXISTS "Public can view sections" ON public.class_sections;
CREATE POLICY "Public can view sections" ON public.class_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can manage sections" ON public.class_sections;
CREATE POLICY "Teachers can manage sections" ON public.class_sections FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.classes c 
        WHERE c.id = class_sections.class_id AND c.teacher_id = auth.uid()
    )
);

-- Materials: Same as sections
DROP POLICY IF EXISTS "Public can view materials" ON public.class_materials;
CREATE POLICY "Public can view materials" ON public.class_materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can manage materials" ON public.class_materials;
CREATE POLICY "Teachers can manage materials" ON public.class_materials FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.class_sections s
        JOIN public.classes c ON c.id = s.class_id
        WHERE s.id = class_materials.section_id AND c.teacher_id = auth.uid()
    )
);
`;

    console.log('Executing migration SQL...');
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
