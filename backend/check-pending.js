const { supabaseAdmin } = require('./src/config/supabase');

async function checkPending() {
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('id, title, status, teacher_id')
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Pending Classes:', JSON.stringify(data, null, 2));
  }
}

checkPending();
