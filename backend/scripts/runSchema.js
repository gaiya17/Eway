const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runSchema = async () => {
  const connectionString = `postgresql://postgres.ibjdmtosotlfmwzncuqk:${process.env.DATABASE_PASSWORD}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema SQL...');
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
};

runSchema();
