const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:7227876Wa%40%40@db.ibjdmtosotlfmwzncuqk.supabase.co:5432/postgres';

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL");

    // Start Transaction
    await client.query('BEGIN');

    console.log("Creating free_tutorials table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS free_tutorials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        level TEXT CHECK (level IN ('OL', 'AL')),
        subject TEXT,
        category TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("Creating tutorial_contents table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS tutorial_contents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tutorial_id UUID REFERENCES free_tutorials(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'video', 'link')),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Add indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_free_tutorials_teacher_id ON free_tutorials(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_free_tutorials_status ON free_tutorials(status);
      CREATE INDEX IF NOT EXISTS idx_tutorial_contents_tutorial_id ON tutorial_contents(tutorial_id);
    `);

    await client.query('COMMIT');
    console.log("Migration Complete! Free Tutorials tables created successfully.");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
