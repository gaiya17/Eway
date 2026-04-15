const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: students, error } = await supabaseAdmin.from('profiles').select('id, student_id').eq('role', 'student');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (const student of students) {
    if (!student.student_id) {
      const shortYear = new Date().getFullYear().toString().slice(-2);
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const newId = `EW${shortYear}-${randomDigits}`;
      
      const { error: updateError } = await supabaseAdmin.from('profiles').update({ student_id: newId }).eq('id', student.id);
      
      if (updateError) {
        console.error('Failed to update student:', student.id, updateError);
      } else {
        count++;
      }
    }
  }
  console.log(`Updated ${count} students successfully within VARCHAR(12) constraint`);
}

run();
