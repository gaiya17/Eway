const { supabaseAdmin } = require('./src/config/supabase');

async function testDB() {
  console.log('Testing Supabase Connection...');
  
  try {
    // 1. Check if classes table exists
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('Error selecting from classes:', tableError.message);
    } else {
      console.log('Success: "classes" table exists.');
    }

    // 2. Try to insert a dummy class to see what fails
    console.log('Attempting dummy insert...');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('classes')
      .insert({
        title: 'Test Class',
        subject: 'Test',
        price: 1000,
        mode: 'Online',
        status: 'pending',
        teacher_id: '8031e405-3e2b-4277-a36c-2f9a764724b9' // Need a valid teacher ID from profiles
      })
      .select();

    if (insertError) {
      console.log('Insert failed:', insertError.message);
      console.log('Full error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('Insert success!', insertData);
    }

  } catch (err) {
    console.log('Unexpected error:', err.message);
  }
}

testDB();
