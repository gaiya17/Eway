const { supabaseAdmin } = require('./src/config/supabase');

async function checkConnection() {
  console.log('Testing Supabase connection...');
  const start = Date.now();
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    const duration = Date.now() - start;
    if (error) {
      console.error('Connection failed (Supabase error):', error);
    } else {
      console.log('Connection successful! Duration:', duration, 'ms');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Connection failed (Catch block):', err);
  }
}

checkConnection();
