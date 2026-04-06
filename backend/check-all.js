const { supabaseAdmin } = require('./src/config/supabase');

async function checkAll() {
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('id, title, status');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('All Classes:', JSON.stringify(data, null, 2));
  }
}

checkAll();
