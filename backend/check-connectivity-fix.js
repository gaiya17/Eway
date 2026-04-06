const { supabaseAdmin } = require('./src/config/supabase');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

async function checkConnection() {
  console.log('Testing Supabase connection with IPv4 preference...');
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
