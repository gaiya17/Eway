const axios = require('axios');
require('dotenv').config();

async function checkWithAxios() {
  const url = process.env.SUPABASE_URL + '/rest/v1/profiles?limit=1';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing Supabase with Axios...');
  console.log('URL:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      timeout: 10000
    });
    console.log('Axios Success! Status:', response.status);
    console.log('Data:', response.data);
  } catch (err) {
    console.error('Axios Failed:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else if (err.code) {
      console.error('Code:', err.code);
    }
  }
}

checkWithAxios();
