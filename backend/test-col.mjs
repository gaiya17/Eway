import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabaseAdmin.from('classes').select('schedules, start_date').limit(1);
  if (error) {
    console.error('DB Error:', error);
  } else {
    console.log('Success, data:', data);
  }
}
check();
