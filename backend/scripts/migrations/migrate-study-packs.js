const { Client } = require('pg');
require('dotenv').config();

// Use the database URL from environment variables or the hardcoded one if it's the standard for this project
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

    console.log("Creating study_packs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_packs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL DEFAULT 0,
        cover_image TEXT,
        level TEXT CHECK (level IN ('OL', 'AL')),
        subject TEXT,
        category TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("Creating study_pack_contents table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_pack_contents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID REFERENCES study_packs(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'video', 'link')),
        is_preview BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("Creating study_pack_purchases table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_pack_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        pack_id UUID REFERENCES study_packs(id) ON DELETE CASCADE,
        payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed')),
        payment_slip_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(student_id, pack_id)
      );
    `);

    // Add indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_study_packs_teacher_id ON study_packs(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_study_packs_status ON study_packs(status);
      CREATE INDEX IF NOT EXISTS idx_study_pack_contents_pack_id ON study_pack_contents(pack_id);
      CREATE INDEX IF NOT EXISTS idx_study_pack_purchases_student_id ON study_pack_purchases(student_id);
      CREATE INDEX IF NOT EXISTS idx_study_pack_purchases_pack_id ON study_pack_purchases(pack_id);
    `);

    await client.query('COMMIT');
    console.log("Migration Complete! Study Packs tables created successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
