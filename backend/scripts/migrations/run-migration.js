const { Client } = require('pg');

const dbUrl = 'postgresql://postgres:7227876Wa%40%40@db.ibjdmtosotlfmwzncuqk.supabase.co:5432/postgres';

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

    // 1. Create specific ENUMs if needed, or just use string/text constraints. Using TEXT for simplicity and flexibility.
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('OL', 'AL')),
        stream TEXT, 
        ol_category INTEGER,
        is_anchor BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Alter 'classes' table to add the required fields
    // Using IF NOT EXISTS where possible, or just trying and catching
    try {
      await client.query(`
        ALTER TABLE classes
        ADD COLUMN start_date DATE,
        ADD COLUMN schedule_days TEXT[] DEFAULT '{}',
        ADD COLUMN start_time TIME,
        ADD COLUMN end_time TIME,
        ADD COLUMN force_request BOOLEAN DEFAULT false,
        ADD COLUMN conflict_details JSONB;
      `);
      console.log("Added new columns to classes table.");
    } catch (e) {
      if (e.code === '42701') {
        console.log("Columns already exist in classes table, skipping.");
      } else {
        throw e;
      }
    }

    // 3. Clear subjects to reseed cleanly
    await client.query('DELETE FROM subjects');

    // 4. Seeding data
    const subjectsToInsert = [
      // --- OL Core Subjects (Strict Block) ---
      { name: 'Mathematics', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },
      { name: 'English', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },
      { name: 'Science', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },
      { name: 'Sinhala', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },
      { name: 'History', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },
      { name: 'Religion', level: 'OL', stream: 'Core', ol_category: null, is_anchor: true },

      // --- OL Category 1 ---
      { name: 'Business & Accounting Studies', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Commerce', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Geography', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Civic Education', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Entrepreneurship Studies', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Second Language (Sinhala)', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },
      { name: 'Second Language (Tamil)', level: 'OL', stream: 'Elective', ol_category: 1, is_anchor: false },

      // --- OL Category 2 ---
      { name: 'Music', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },
      { name: 'Art', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },
      { name: 'Dance', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },
      { name: 'Sinhala Literary', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },
      { name: 'English Literary', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },
      { name: 'Drama', level: 'OL', stream: 'Elective', ol_category: 2, is_anchor: false },

      // --- OL Category 3 ---
      { name: 'ICT', level: 'OL', stream: 'Elective', ol_category: 3, is_anchor: false },
      { name: 'Agriculture', level: 'OL', stream: 'Elective', ol_category: 3, is_anchor: false },
      { name: 'Health', level: 'OL', stream: 'Elective', ol_category: 3, is_anchor: false },
      { name: 'Communication', level: 'OL', stream: 'Elective', ol_category: 3, is_anchor: false },

      // --- AL Science Stream ---
      { name: 'Biology', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },
      { name: 'Physics', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },
      { name: 'Chemistry', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },
      { name: 'Combined Mathematics', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },
      { name: 'Agriculture', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },
      { name: 'ICT (Information & Communication Technology)', level: 'AL', stream: 'Science', ol_category: null, is_anchor: false },

      // --- AL Commerce Stream ---
      { name: 'Accounting', level: 'AL', stream: 'Commerce', ol_category: null, is_anchor: true }, // ANCHOR
      { name: 'Business Studies', level: 'AL', stream: 'Commerce', ol_category: null, is_anchor: false },
      { name: 'Economics', level: 'AL', stream: 'Commerce', ol_category: null, is_anchor: false },
      { name: 'ICT', level: 'AL', stream: 'Commerce', ol_category: null, is_anchor: false },

      // --- AL Arts Stream (Humanities) ---
      { name: 'History', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Political Science', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Geography', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Logic', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Sinhala / Tamil / English Literature', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Media Studies', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },
      { name: 'Art', level: 'AL', stream: 'Arts', ol_category: null, is_anchor: false },

      // --- AL Technology Stream ---
      { name: 'SFT', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: true }, // ANCHOR
      { name: 'ET / BST', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: true }, // ANCHOR
      { name: 'Agriculture', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'ICT', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Geography', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Economics', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Business studies', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Accounting', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Home economics', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Communication and media studies', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Arts', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'English', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
      { name: 'Maths', level: 'AL', stream: 'Technology', ol_category: null, is_anchor: false },
    ];

    for (const sub of subjectsToInsert) {
      await client.query(`
        INSERT INTO subjects (name, level, stream, ol_category, is_anchor)
        VALUES ($1, $2, $3, $4, $5)
      `, [sub.name, sub.level, sub.stream, sub.ol_category, sub.is_anchor]);
    }

    await client.query('COMMIT');
    console.log(`Migration and Seeding Complete! Inserted ${subjectsToInsert.length} subjects.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
