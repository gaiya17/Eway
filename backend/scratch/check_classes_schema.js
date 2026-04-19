
const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.DATABASE_PASSWORD}@db.ibjdmtosotlfmwzncuqk.supabase.co:5432/postgres`,
    });

    try {
        await client.connect();
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'classes';");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

checkSchema();
