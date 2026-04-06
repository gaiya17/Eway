const { supabaseAdmin } = require('../src/config/supabase');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const setupAdmin = async () => {
  const email = 'admin@eway.com';
  const password = 'AdminPassword123!';
  const firstName = 'EWAY';
  const lastName = 'Admin';

  console.log(`Setting up admin user: ${email}...`);

  try {
    // 1. Check if already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // 2. Create in Auth or get existing
    let userId;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'admin'
      }
    });
    
    if (authError) {
      if (authError.code === 'email_exists' || authError.message.includes('already exists')) {
        console.log('User already exists in Auth, fetching ID...');
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        const user = listData.users.find(u => u.email === email);
        if (!user) throw new Error('Could not find user in Auth list');
        userId = user.id;
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // 3. Upsert profile to be verified and admin
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'admin',
        is_verified: true
      });

    if (profileError) throw profileError;

    const token = jwt.sign(
      { id: userId, role: 'admin', email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Admin user created successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Admin Token: ${token}`);
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
