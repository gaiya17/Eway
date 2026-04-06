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

    // Drop the old type CHECK constraint and add new one with pdf, video, live support
    const sql = `
-- Drop old constraint on class_materials.type
ALTER TABLE public.class_materials
  DROP CONSTRAINT IF EXISTS class_materials_type_check;

-- Add new constraint that includes 'pdf' and 'live' alongside legacy types
ALTER TABLE public.class_materials
  ADD CONSTRAINT class_materials_type_check
  CHECK (type IN ('file', 'link', 'video', 'pdf', 'live'));
`;

    console.log('Updating class_materials type constraint...');
    await client.query(sql);
    console.log('Migration completed successfully! New allowed types: file, link, video, pdf, live');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
