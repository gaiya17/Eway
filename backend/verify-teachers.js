const fetch = require('node-fetch');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function verify() {
  console.log('--- Verifying Teacher Endpoints ---');
  
  try {
    // 1. Test GET /api/users/teachers
    const resTeachers = await fetch(`${API_URL}/api/users/teachers`);
    const teachers = await resTeachers.json();
    console.log(`Fetched ${teachers.length} teachers.`);
    if (teachers.length > 0) {
      console.log('Sample Teacher:', teachers[0].first_name, teachers[0].last_name);
      
      // 2. Test GET /api/users/teachers/:id
      const teacherId = teachers[0].id;
      const resDetail = await fetch(`${API_URL}/api/users/teachers/${teacherId}`);
      const detail = await resDetail.json();
      console.log(`Teacher Detail for ${teacherId}:`, detail.first_name, `with ${detail.courses.length} courses.`);
    }

    console.log('\n--- Verification Completed Successfully ---');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verify();
