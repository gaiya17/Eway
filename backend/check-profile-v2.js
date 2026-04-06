const { supabaseAdmin } = require('./src/config/supabase');

async function checkProfile() {
  // Get the teacher_id from the class record first
  const { data: classData } = await supabaseAdmin
    .from('classes')
    .select('teacher_id')
    .eq('title', 'Maths 2026')
    .single();
    
  if (!classData) {
    console.log('Class not found');
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', classData.teacher_id)
    .single();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Profile:', JSON.stringify(profile, null, 2));
  }
}

checkProfile();
