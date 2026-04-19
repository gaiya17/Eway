
const { supabaseAdmin } = require('../src/config/supabase');

async function testInsert() {
  const testId = '00000000-0000-0000-0000-000000000001';
  console.log('Testing insert with supabaseAdmin...');
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: testId,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      role: 'student',
      student_id: 'TEST-123'
    });

  if (error) {
    console.error('Insert failed:', error.message);
    if (error.message.includes('row-level security')) {
        console.error('CONFIRMED: RLS violation even with service role!');
    }
  } else {
    console.log('Insert successful!');
    // Clean up
    await supabaseAdmin.from('profiles').delete().eq('id', testId);
  }
}

testInsert();
