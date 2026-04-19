
const { Client } = require('pg');
require('dotenv').config();

async function runFix() {
  const client = new Client({
    connectionString: `postgresql://postgres:${process.env.DATABASE_PASSWORD}@db.ibjdmtosotlfmwzncuqk.supabase.co:5432/postgres`,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Adding INSERT and UPDATE policies for profiles...');
    // Drop existing if we want to be clean, but let's just add new ones if they don't exist
    // Actually, I'll just create a permissive policy for the service_role specifically if it helps
    
    await client.query(`
      -- Ensure RLS is enabled
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Allow service role to do everything (usually default but let's be explicit)
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role all' AND tablename = 'profiles') THEN
          CREATE POLICY "Allow service role all" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow registration' AND tablename = 'profiles') THEN
          CREATE POLICY "Allow registration" ON public.profiles FOR INSERT WITH CHECK (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow individual update' AND tablename = 'profiles') THEN
          CREATE POLICY "Allow individual update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
        END IF;
      END $$;
    `);

    console.log('Update successful');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runFix();
