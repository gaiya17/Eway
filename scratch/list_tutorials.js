const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function listTutorials() {
  const { data, error } = await supabase
    .from('free_tutorials')
    .select('id, title, status, teacher_id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Tutorials:', JSON.stringify(data, null, 2));

  // Also get a teacher
  const { data: teacher, error: teacherErr } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('role', 'teacher')
    .limit(1);
    
  if (teacherErr) {
    console.error('Teacher Error:', teacherErr);
  } else {
    console.log('Teacher:', JSON.stringify(teacher, null, 2));
  }
}

listTutorials();
