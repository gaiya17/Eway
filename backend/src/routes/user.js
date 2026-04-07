/**
 * User and Profile Routes
 * Handles profile management, teacher listings, and administrative user creation (Staff/Teachers).
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Configure Multer for profile photo uploads
 */
const profileUploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileUploadDir),
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
    const isExtAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimeAllowed = allowedTypes.test(file.mimetype);
    if (isExtAllowed && isMimeAllowed) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

// ──────────────────────────────────────────────
// ADMIN USER MANAGEMENT
// ──────────────────────────────────────────────

/**
 * @route   GET /api/users
 * @desc    List all registered users in the system
 * @access  Private (Admin only)
 */
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

/**
 * @route   POST /api/users/add
 * @desc    Create a new Staff or Teacher account and send onboarding email
 * @access  Private (Admin only)
 */
router.post('/add', verifyToken, verifyAdmin, async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.body;

  if (!['teacher', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Only teacher and staff can be added.' });
  }

  try {
    // 1. Create entry in Supabase Auth (Admin level)
    const tempPassword = Math.random().toString(36).slice(-1).toUpperCase() + Math.random().toString(36).slice(-10) + '1!';
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, role: role }
    });

    let userId;
    if (authError) {
      // Handle existing users by just updating their profile
      if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        userId = users.users.find(u => u.email === email)?.id;
        if (!userId) throw new Error('Existing user email detected but record not found.');
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Ensure Profile record exists and is verified
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        role: role,
        is_verified: true
      });

    if (profileError) throw profileError;

    // 3. Generate Password Setup Token
    const { generateHexToken } = require('../utils/token');
    const { sendEmail } = require('../config/mail');
    
    const token = generateHexToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48h validity

    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({ user_id: userId, token: token, expires_at: expiresAt });

    if (tokenError) throw tokenError;

    // 4. Send Onboarding Email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to EWAY LMS</h2>
        <p>Hi ${firstName},</p>
        <p>An account has been created for you as a <strong>${role}</strong>.</p>
        <p>Please use the link below to set up your account password and get started:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set My Password</a>
        </div>
        <p style="font-size: 12px; color: #999;">This link will expire in 48 hours.</p>
      </div>
    `;

    await sendEmail(email, 'Setup Your Account Password - EWAY LMS', emailHtml);
    res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} invited successfully.` });
  } catch (error) {
    console.error('User addition error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// TEACHER PUBLIC DIRECTORY
// ──────────────────────────────────────────────

/**
 * @route   GET /api/users/teachers
 * @desc    List all teachers with their course and student statistics
 * @access  Public
 */
router.get('/teachers', async (req, res) => {
  try {
    const { data: teachers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, email, profile_photo, role, quote, about, experience, subject')
      .eq('role', 'teacher')
      .order('first_name', { ascending: true });

    if (error) throw error;

    // Enhance teacher profiles with live stats from other tables
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
        rating: 4.8, // Placeholder until review system implemented
        reviewCount: 0
      };
    }));

    res.json(enhancedTeachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/teachers/:id
 * @desc    Get detailed profile for a specific teacher including their courses
 * @access  Public
 */
router.get('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'teacher')
      .single();

    if (teacherError) throw teacherError;

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

// ──────────────────────────────────────────────
// PROFILE MANAGEMENT
// ──────────────────────────────────────────────

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile information
 * @access  Private (Authenticated)
 */
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

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user's profile details
 * @access  Private (Authenticated)
 */
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

/**
 * @route   POST /api/users/profile/photo
 * @desc    Upload and update user profile picture
 * @access  Private (Authenticated)
 */
router.post('/profile/photo', verifyToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
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
      message: 'Profile photo updated successfully',
      photoUrl: photoUrl,
      profile: profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/enrollment-check/:teacherId
 * @desc    Check if the student is currently enrolled with a specific teacher
 * @access  Private (Student)
 */
router.get('/enrollment-check/:teacherId', verifyToken, async (req, res) => {
  const { teacherId } = req.params;
  const studentId = req.user.id;

  try {
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

/**
 * @route   GET /api/users/student/dashboard
 * @desc    Get aggregated dashboard data for students (Stats, Upcoming Classes, Recent Activity)
 * @access  Private (Student)
 */
router.get('/student/dashboard', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get Enrolled Class IDs
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('class_id')
      .eq('student_id', studentId)
      .eq('status', 'active');

    const classIds = (enrollments || []).map(e => e.class_id);

    // 2. Fetch Upcoming Live Classes
    let upcomingClasses = [];
    if (classIds.length > 0) {
      const { data: liveMaterials } = await supabaseAdmin
        .from('class_materials')
        .select(`
          id, title, url, type, scheduled_at,
          class_sections!inner(
            class_id,
            classes!inner(title, profiles:teacher_id(first_name, last_name))
          )
        `)
        .eq('type', 'live')
        .in('class_sections.class_id', classIds)
        .gt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      upcomingClasses = (liveMaterials || []).map(m => ({
        id: m.id,
        name: m.class_sections.classes.title,
        teacher: `Prof. ${m.class_sections.classes.profiles.first_name} ${m.class_sections.classes.profiles.last_name}`,
        time: new Date(m.scheduled_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        rawTime: m.scheduled_at,
        url: m.url,
        status: new Date(m.scheduled_at).getTime() - new Date().getTime() < 30 * 60 * 1000 ? 'Starting Soon' : 'Upcoming'
      }));
    }

    // 3. Fetch Recent Activity (Merge Notifications, Submissions, Payments)
    const [
      { data: recentNotifications },
      { data: recentSubmissions },
      { data: recentPayments }
    ] = await Promise.all([
      supabaseAdmin.from('notifications').select('*').eq('recipient_id', studentId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('submissions').select('*, assignments(title)').eq('student_id', studentId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('payments').select('*, classes(title)').eq('student_id', studentId).order('submitted_at', { ascending: false }).limit(5)
    ]);

    const activity = [
      ...(recentNotifications || []).map(n => ({
        title: n.title,
        description: n.message,
        time: n.created_at,
        type: 'notification',
        category: n.type
      })),
      ...(recentSubmissions || []).map(s => ({
        title: 'Assignment Submitted',
        description: s.assignments?.title || 'Class Assignment',
        time: s.created_at,
        type: 'submission'
      })),
      ...(recentPayments || []).map(p => ({
        title: `Payment ${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`,
        description: `For ${p.classes?.title || 'Class'}`,
        time: p.submitted_at,
        type: 'payment',
        status: p.status
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    // 4. Calculate Stats
    const [{ count: completedAssignments }, { data: grades }, { data: attendance }] = await Promise.all([
      supabaseAdmin.from('submissions').select('*', { count: 'exact', head: true }).eq('student_id', studentId),
      supabaseAdmin.from('submissions').select('grade').eq('student_id', studentId).not('grade', 'is', null),
      supabaseAdmin.from('attendance').select('status').eq('student_id', studentId)
    ]);

    const avgScore = grades && grades.length > 0 
      ? Math.round(grades.reduce((acc, curr) => acc + (parseFloat(curr.grade) || 0), 0) / grades.length) 
      : 0;

    const attendanceRate = attendance && attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
      : 0;

    res.json({
      stats: {
        attendanceRate: attendanceRate || 92, // Fallback to baseline if no records
        upcomingCount: upcomingClasses.length,
        completedAssignments: completedAssignments || 0,
        overallScore: avgScore || 0
      },
      upcomingClasses,
      recentActivity: activity
    });
  } catch (error) {
    console.error('STU DASHBOARD ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
