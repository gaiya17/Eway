const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configure multer for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to verify Admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

// Admin: List all users
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all teachers (Public/Student)
router.get('/teachers', async (req, res) => {
  try {
    // 1. Get all teachers
    const { data: teachers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, email, profile_photo, role, quote, about, experience, subject')
      .eq('role', 'teacher')
      .order('first_name', { ascending: true });

    if (error) throw error;

    // 2. Enhance with class counts
    const enhancedTeachers = await Promise.all(teachers.map(async (teacher) => {
      const { count: classCount } = await supabaseAdmin
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('status', 'approved');

      const { count: studentCount } = await supabaseAdmin
        .from('enrollments')
        .select('*, classes!inner(*)', { count: 'exact', head: true })
        .eq('classes.teacher_id', teacher.id)
        .eq('status', 'active');

      return {
        ...teacher,
        courseCount: classCount || 0,
        studentCount: studentCount || 0,
        rating: 4.8, // Static for now as review system isn't built
        reviewCount: 0
      };
    }));

    res.json(enhancedTeachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher by ID with classes
router.get('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get Teacher Profile
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'teacher')
      .single();

    if (teacherError) throw teacherError;

    // 2. Get Teacher's Approved Classes
    const { data: classes, error: classesError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('teacher_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (classesError) throw classesError;

    res.json({ ...teacher, courses: classes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check enrollment status for a student with a teacher
router.get('/enrollment-check/:teacherId', verifyToken, async (req, res) => {
  const { teacherId } = req.params;
  const studentId = req.user.id;

  try {
    // Check if there is an active enrollment for any class taught by this teacher
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, classes!inner(teacher_id)')
      .eq('student_id', studentId)
      .eq('classes.teacher_id', teacherId)
      .eq('status', 'active')
      .limit(1);

    if (error) throw error;

    res.json({ isEnrolled: data && data.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.patch('/profile', verifyToken, async (req, res) => {
  const { firstName, lastName, phone, gender, birthday, first_name, last_name } = req.body;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: firstName || first_name,
        last_name: lastName || last_name,
        phone,
        gender,
        birthday,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload profile photo
router.post('/profile/photo', verifyToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const photoUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/profiles/${req.file.filename}`;
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        profile_photo: photoUrl,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl,
      profile: profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add Teacher or Staff
router.post('/add', verifyToken, verifyAdmin, async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.body;

  if (!['teacher', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Only teacher and staff can be added.' });
  }

  try {
    // 1. Create user in Supabase Auth with a temporary random password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role
      }
    });

    let userId;
    if (authError) {
      if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
        if (fetchError) throw fetchError;
        const existingUser = userData.users.find(u => u.email === email);
        if (!existingUser) throw new Error('Could not find existing user profile after email_exists error.');
        userId = existingUser.id;
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Ensure profile exists and is verified (Don't rely solely on DB trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
        is_verified: true
      });

    if (profileError) throw profileError;

    // 3. Generate reset token
    const { generateHexToken } = require('../utils/token');
    const { sendEmail } = require('../config/mail');
    
    const token = generateHexToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt
      });

    if (tokenError) throw tokenError;

    // 3. Send password reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Account Created - EWAY LMS</h2>
        <p>Hi ${firstName},</p>
        <p>An account has been created for you as a <strong>${role}</strong> on EWAY LMS.</p>
        <p>Before you can log in, you need to set up your password. Please click the button below to set your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set My Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p>This link will expire in 48 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 EWAY Institute. All rights reserved.</p>
      </div>
    `;

    await sendEmail(email, 'Setup Your Account Password - EWAY LMS', emailHtml);

    res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully! Setup email sent.` });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
