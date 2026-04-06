const { supabaseAdmin } = require('./src/config/supabase');

async function verify() {
  const email = 'gayanthanirmal15@gmail.com';
  
  console.log(`Checking profile for ${email}...`);
  
  // 1. Check if user exists in auth
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log('User not found in Auth.');
    return;
  }
  
  console.log(`User found in Auth with ID: ${user.id}`);
  console.log('Metadata:', user.user_metadata);

  // 2. Check if profile exists
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.log('Profile NOT found (or error):', profileError.message);
    
    // FIX: Create the profile if it's missing (to help the user)
    console.log('Creating missing profile...');
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        first_name: user.user_metadata.first_name || '',
        last_name: user.user_metadata.last_name || '',
        email: email,
        role: user.user_metadata.role || 'staff',
        is_verified: true
      });
    
    if (insertError) {
      console.error('Failed to create profile:', insertError);
    } else {
      console.log('Profile created successfully and marked as verified.');
    }
  } else {
    console.log('Profile found:', profile);
    if (!profile.is_verified) {
      console.log('Profile is NOT verified. Updating...');
      await supabaseAdmin.from('profiles').update({ is_verified: true }).eq('id', user.id);
      console.log('Profile marked as verified.');
    }
  }
}

verify();
