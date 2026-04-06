const { supabaseAdmin } = require('./src/config/supabase');

async function checkDetails() {
  console.log('--- Profiling Supabase ---');
  
  // 1. Check Profiles
  const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('id, role').limit(5);
  if (pError) console.log('Profile error:', pError.message);
  else console.log('Profiles:', profiles);

  // 2. Check Classes Table again but catch full error
  const { error: cError } = await supabaseAdmin.from('classes').select('*').limit(1);
  if (cError) {
    console.log('Classes Table Error:', cError);
  } else {
    console.log('Classes Table is OK!');
  }
}

checkDetails();
