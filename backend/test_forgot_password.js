const { supabaseAdmin } = require('./src/config/supabase');
const axios = require('axios');

async function testFlow() {
  const email = 'gayanthanirmal15@gmail.com';
  const baseUrl = 'http://localhost:4000/api';
  
  console.log('--- Testing Forgot Password Flow ---');

  // 1. Request reset code
  console.log(`1. Requesting reset code for ${email}...`);
  try {
    const reqResponse = await axios.post(`${baseUrl}/auth/request-password-reset`, { email });
    console.log('Success:', reqResponse.data.message);
  } catch (err) {
    if (err.response) {
      console.error(`Request failed with status ${err.response.status}:`, err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
    return;
  }

  // 2. Look up the code in DB (since we can't check email)
  console.log('2. Looking up code in database...');
  const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('token')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenData) {
    console.error('Could not find token in DB:', tokenError?.message);
    return;
  }
  const code = tokenData.token;
  console.log(`Found code: ${code}`);

  // 3. Verify the code
  console.log('3. Verifying code via API...');
  try {
    const verifyResponse = await axios.post(`${baseUrl}/auth/verify-reset-code`, { email, code });
    console.log('Success:', verifyResponse.data.message);
  } catch (err) {
    console.error('Verification failed:', err.response?.data || err.message);
    return;
  }

  // 4. Complete reset
  console.log('4. Completing password reset...');
  try {
    const resetResponse = await axios.post(`${baseUrl}/auth/reset-password-complete`, {
      email,
      code,
      newPassword: 'NewPassword123!'
    });
    console.log('Success:', resetResponse.data.message);
  } catch (err) {
    console.error('Reset failed:', err.response?.data || err.message);
    return;
  }

  console.log('--- Flow Test Completed Successfully ---');
}

testFlow();
