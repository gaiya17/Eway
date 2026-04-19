
const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const config = {
    connectionString: `postgresql://postgres:${process.env.DATABASE_PASSWORD}@db.ibjdmtosotlfmwzncuqk.supabase.co:5432/postgres`,
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('\n--- RLS Status for profiles ---');
    const rlsRes = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
      WHERE relname = 'profiles' AND nspname = 'public';
    `);
    console.log(rlsRes.rows);

    console.log('\n--- Policies for profiles ---');
    const policiesRes = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'profiles';
    `);
    console.log(policiesRes.rows);

    console.log('\n--- Triggers for profiles ---');
    const triggersRes = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement, action_orientation 
      FROM information_schema.triggers 
      WHERE event_object_table = 'profiles';
    `);
    console.log(triggersRes.rows);

    console.log('\n--- Triggers for auth.users ---');
    // Using a different query for triggers because information_schema might skip auth schema
    const authTriggersRes = await client.query(`
      SELECT tgname, relname 
      FROM pg_trigger 
      JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
      JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid 
      WHERE nspname = 'auth' AND relname = 'users';
    `);
    console.log(authTriggersRes.rows);

    console.log('\n--- Trigger functions ---');
    const triggerFuncsRes = await client.query(`
        SELECT proname, prosecdef, prosrc
        FROM pg_proc
        WHERE proname IN (
            SELECT tgfoid::regproc::text 
            FROM pg_trigger 
            JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
            WHERE relname IN ('profiles', 'users')
        );
    `);
    console.log(triggerFuncsRes.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
