/**
 * Authentication Routes
 * Handles user registration, login, email verification, and password resets.
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { sendEmail } = require('../config/mail');
const { generateHexToken, generateNumericToken } = require('../utils/token');
const jwt = require('jsonwebtoken');

/**
 * @route   GET /api/auth/health
 * @desc    Health check for auth service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth' });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student and send verification email
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, gender, birthday, password } = req.body;

  try {
    // 1. Check if user already exists in profiles
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    let userId;
    // 2. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We handle verification via our own table/token
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'student'
      }
    });

    if (authError) {
      if (authError.code === 'email_exists' || authError.message.includes('already exists')) {
        // Find existing user in auth to get the ID
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingAuthUser = listData.users.find(u => u.email === email);
        if (!existingAuthUser) throw new Error('User conflict in Auth system. Please contact support.');
        
        userId = existingAuthUser.id;
        
        // Update user metadata in case it was missing
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            role: 'student'
          }
        });
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // 3. Generate a patterned Student ID (Max 12 chars: EW26-XXXXX) and ensure profile exists
    const shortYear = new Date().getFullYear().toString().slice(-2);
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 digits
    const newStudentId = `EW${shortYear}-${randomDigits}`;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'student',
        student_id: newStudentId
      });

    if (profileError) throw profileError;

    // 4. Generate verification token
    const token = generateHexToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    const { error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt
      });

    if (tokenError) throw tokenError;

    // 4. Send verification email
    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to EWAY LMS!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 EWAY Institute. All rights reserved.</p>
      </div>
    `;

    await sendEmail(email, 'Verify Your Email - EWAY LMS', emailHtml);

    res.status(201).json({ message: 'Registration successful! Please check your email for verification.' });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    res.status(500).json({ error: error.message || 'Registration failed due to server error.' });
  }
});

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email via token link
 * @access  Public
 */
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // 1. Find token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).send('<h1>Invalid or expired verification link.</h1>');
    }

    // 2. Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).send('<h1>Verification link has expired.</h1>');
    }

    // 3. Update user profile and auth status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', tokenData.user_id);

    if (profileError) throw profileError;

    // Optional: Also confirm email in Supabase Auth directly if using its built-in features
    await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, { email_confirm: true });

    // 4. Delete token
    await supabaseAdmin.from('verification_tokens').delete().eq('id', tokenData.id);

    // 5. Redirect to login page
    res.redirect(`${process.env.FRONTEND_URL}`); // In the real app, this should go to the login page specifically
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('<h1>Internal Server Error during verification.</h1>');
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Get profile and check verification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') { // Case where .single() finds no rows
        return res.status(404).json({ error: 'User profile not found. Please contact support.' });
      }
      throw profileError;
    }

    if (!profile.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // 3. Generate internal JWT (optional, but useful for custom RBAC)
    const token = jwt.sign(
      { id: profile.id, role: profile.role, email: profile.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      supabaseToken: data.session?.access_token,
      user: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        role: profile.role,
        profilePhoto: profile.profile_photo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Request a password reset code via email
 * @access  Public
 */
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists for security, unless it's an admin-only call
      // In this app, we'll just say email sent if we find them
      if (!user) return res.json({ message: 'If this email is registered, a reset link has been sent.' });
      throw userError;
    }

    // 2. Generate reset token (6-digit numeric)
    const token = generateNumericToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry for numeric codes

    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt
      });

    if (tokenError) throw tokenError;

    // 3. Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
        <p>Hi ${user.first_name},</p>
        <p>We received a request to reset your password. Please use the following 6-digit code to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; color: #111827; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">${token}</div>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This code will expire in 15 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 EWAY Institute. All rights reserved.</p>
      </div>
    `;

    await sendEmail(email, 'Reset Your Password - EWAY LMS', emailHtml);
    res.json({ message: 'If this email is registered, a reset code has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify the 6-digit password reset code
 * @access  Public
 */
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    // 1. Get user ID from email
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'Invalid email or code.' });
    }

    // 2. Find and validate token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', code)
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired.' });
    }

    res.json({ message: 'Code verified successfully.' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/reset-password-complete
 * @desc    Complete the password reset process with new password
 * @access  Public
 */
router.post('/reset-password-complete', async (req, res) => {
  const { email, code, token, newPassword } = req.body;
  const resetToken = code || token;

  try {
    let userId;
    let authenticatedTokenData;

    if (email) {
      // 1. Get user ID from email for extra security (manual reset case)
      const { data: user, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(400).json({ error: 'Invalid email or code.' });
      }
      userId = user.id;

      // 2. Find and validate token with user_id
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('*')
        .eq('token', resetToken)
        .eq('user_id', userId)
        .single();

      if (tokenError || !tokenData) {
        return res.status(400).json({ error: 'Invalid or expired reset token.' });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired.' });
      }
      authenticatedTokenData = tokenData;
    } else {
      // 2. Setup link case (Hex token, no email in URL)
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('*')
        .eq('token', resetToken)
        .single();

      if (tokenError || !tokenData) {
        return res.status(400).json({ error: 'Invalid or expired reset token.' });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired.' });
      }
      
      userId = tokenData.user_id;
      authenticatedTokenData = tokenData;
    }

    // 2. Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (authError) throw authError;

    // 3. Ensure profile is verified
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, role')
      .eq('id', userId)
      .single();

    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
        email: userProfile?.email || '',
        role: userProfile?.role || 'student',
        is_verified: true
      });

    // 4. Delete the token
    await supabaseAdmin.from('password_reset_tokens').delete().eq('id', authenticatedTokenData.id);

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    console.error('Password reset completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
