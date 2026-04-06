const { supabaseAdmin } = require('./src/config/supabase');

async function findClass() {
  const id = '4cfc9e37-7ce8-498c-85a7-96fc9e377783';
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Class found:', JSON.stringify(data, null, 2));
  }
}

findClass();
