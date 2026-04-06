const { Client } = require('pg');
require('dotenv').config();

const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const projectRef = 'ibjdmtosotlfmwzncuqk';

// Common regions for Supabase poolers
const regions = ['ap-southeast-1', 'ap-south-1', 'us-east-1', 'us-west-1', 'eu-central-1'];
const hosts = [
  ...regions.map(r => `aws-0-${r}.pooler.supabase.com`),
  `db.${projectRef}.supabase.co`
];

async function tryHosts() {
  for (const host of hosts) {
    for (const user of ['postgres', `postgres.${projectRef}`]) {
      for (const port of [6543, 5432]) {
        console.log(`Trying host: ${host} with user: ${user} on port: ${port}...`);
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/postgres?sslmode=require`;
        
        const client = new Client({
          connectionString: connectionString,
          connectionTimeoutMillis: 5000
        });

        try {
          await client.connect();
          console.log(`\nSUCCESS! Connected to ${host}:${port} as ${user}`);
          
          const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  schedule TEXT,
  time TEXT,
  duration TEXT,
  mode TEXT CHECK (mode IN ('Online', 'Physical')),
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
`;

          await client.query(sql);
          console.log('Migration executed successfully!');
          await client.end();
          return;
        } catch (err) {
          console.log(`Failed to connect to ${host}:${port}: ${err.message}`);
        }
      }
    }
  }
}

tryHosts();
