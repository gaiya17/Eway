const { supabaseAdmin } = require('./src/config/supabase');

async function checkProfile() {
  const teacherId = '2fadfa9d-647d-4952-ba15-ed3916f745e5'; // Truncated ID from my check-pending.js
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', teacherId)
    .single();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Profile:', JSON.stringify(data, null, 2));
  }
}

checkProfile();
