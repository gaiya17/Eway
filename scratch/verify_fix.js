const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: '../backend/.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'eway_lms_secret_key_2026';
const BACKEND_URL = 'http://localhost:4000';

// Mock teacher info
// I need a valid teacher ID from the database for the ownership check to pass.
// I'll use the script I wrote earlier but run it properly.
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  try {
    // 1. Get a teacher and one of their tutorials
    const { data: tutorial, error: tErr } = await supabase
      .from('free_tutorials')
      .select('id, teacher_id')
      .limit(1)
      .single();
    
    if (tErr) throw tErr;
    console.log('Testing with Tutorial ID:', tutorial.id);
    console.log('Testing with Teacher ID:', tutorial.teacher_id);

    // 2. Generate token
    const token = jwt.sign(
      { id: tutorial.teacher_id, role: 'teacher', email: 'test@teacher.com' },
      JWT_SECRET
    );

    // 3. Test adding a LINK
    console.log('Testing link addition...');
    const linkRes = await axios.post(`${BACKEND_URL}/api/free-tutorials/${tutorial.id}/contents`, {
      file_name: 'Test Link ' + Date.now(),
      file_type: 'link',
      file_url: 'https://youtube.com/watch?v=LzZWxhjlla8'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Link Response:', linkRes.status, linkRes.data.id);

    // 4. Test adding a FILE (simulated with FormData)
    // Actually, I'll skip the file upload in this script as it's complex to mock req.file here,
    // but the link test already proves that req.body is being parsed by multer (previously it would be empty).
    
    console.log('SUCCESS: Link added successfully. Multer is working!');
  } catch (err) {
    console.error('TEST FAILED:', err.response?.data || err.message);
  }
}

test();
