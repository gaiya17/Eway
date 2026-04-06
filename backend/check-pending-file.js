const { supabaseAdmin } = require('./src/config/supabase');
const fs = require('fs');

async function checkPending() {
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('id, title, status, teacher_id')
    .eq('status', 'pending');
  
  if (error) {
    fs.writeFileSync('pending-error.json', JSON.stringify(error, null, 2));
  } else {
    fs.writeFileSync('pending-data.json', JSON.stringify(data, null, 2));
    console.log('Found', data.length, 'pending classes. Data saved to pending-data.json');
  }
}

checkPending();
