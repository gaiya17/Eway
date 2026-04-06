/**
 * Class Management Routes
 * Handles scheduling, material uploads, enrollments, and status updates for LMS courses.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin, verifyTeacher, verifyStaff } = require('../middleware/auth');
require('dotenv').config();

// File upload configuration
const materialsDir = path.join(__dirname, '../../uploads/materials');
const slipsDir = path.join(__dirname, '../../uploads/slips');

// Ensure upload directories exist
[materialsDir, slipsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Multer storage for class PDF materials
 */
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, materialsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

/**
 * Multer storage for bank payment slips
 */
const slipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, slipsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `slip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const uploadSlip = multer({
  storage: slipStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, or PDF files are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ──────────────────────────────────────────────
// FILE UPLOAD ROUTES
// ──────────────────────────────────────────────

/**
 * @route   POST /api/classes/upload-pdf
 * @desc    Upload a PDF material for a class
 * @access  Private (Teacher/Admin)
 */
router.post('/upload-pdf', verifyToken, verifyTeacher, (req, res) => {
  uploadMaterial.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const fileUrl = `${baseUrl}/uploads/materials/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.originalname });
  });
});

// ──────────────────────────────────────────────
// CLASS SCHEDULING & CONFLICT DETECTION logic
// ──────────────────────────────────────────────

/**
 * Internal logic to determine if two subjects can overlap in scheduling
 * @param {string} newSubName - Name of the new subject
 * @param {string} actSubName - Name of the active subject
 * @returns {string} - Conflict rule: WARNING, STRICT_BLOCK, or ALLOWED_OVERLAP
 */
async function determineRule(newSubName, actSubName) {
  const { data: newSub } = await supabaseAdmin.from('subjects').select('*').eq('name', newSubName).single();
  const { data: actSub } = await supabaseAdmin.from('subjects').select('*').eq('name', actSubName).single();

  if (!newSub || !actSub) return 'ALLOWED_OVERLAP'; 
  if (newSub.level !== actSub.level) return 'ALLOWED_OVERLAP';

  if (newSub.level === 'OL') {
    if (newSub.stream === 'Core' || actSub.stream === 'Core') return 'WARNING';
    if (newSub.ol_category !== actSub.ol_category) return 'WARNING';
    return 'ALLOWED_OVERLAP'; 
  }

  if (newSub.level === 'AL') {
    if (newSub.stream !== actSub.stream) return 'ALLOWED_OVERLAP';
    
    if (newSub.stream === 'Science') {
       const pairs = [
         ['Biology', 'Combined Mathematics'], 
         ['Chemistry', 'ICT (Information & Communication Technology)'], 
         ['Physics', 'Agriculture']
       ];
       for (const pair of pairs) {
         if (pair.includes(newSub.name) && pair.includes(actSub.name)) return 'ALLOWED_OVERLAP';
       }
       return 'STRICT_BLOCK';
    }
    
    if (newSub.stream === 'Commerce' || newSub.stream === 'Technology') {
       if (newSub.is_anchor || actSub.is_anchor) return 'STRICT_BLOCK';
       return 'ALLOWED_OVERLAP';
    }
    
    return 'ALLOWED_OVERLAP';
  }
  return 'STRICT_BLOCK';
}

/**
 * Parses time string (HH:mm) to minutes from midnight
 * @param {string} timeStr 
 * @returns {number}
 */
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * @route   POST /api/classes/check-conflict
 * @desc    Check for scheduling conflicts with existing approved classes
 * @access  Private (Teacher/Admin)
 */
router.post('/check-conflict', verifyToken, verifyTeacher, async (req, res) => {
  const { subject, schedules } = req.body;
  if (!subject || !Array.isArray(schedules) || schedules.length === 0) {
    return res.status(400).json({ error: 'Missing scheduling fields.' });
  }

  try {
    const { data: activeClasses, error } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name)')
      .eq('status', 'approved');

    if (error) throw error;

    for (const act of activeClasses || []) {
      const actSchedules = act.schedules || [];
      if (!Array.isArray(actSchedules)) continue;

      let isOverlap = false;

      for (const newSlot of schedules) {
        for (const actSlot of actSchedules) {
          if (newSlot.day === actSlot.day) {
            const nS = parseTime(newSlot.start_time);
            const nE = parseTime(newSlot.end_time);
            const aS = parseTime(actSlot.start_time);
            const aE = parseTime(actSlot.end_time);

            if (nS < aE && nE > aS) {
              isOverlap = true;
              break;
            }
          }
        }
        if (isOverlap) break;
      }

      if (isOverlap) {
        const rule = await determineRule(subject, act.subject);
        return res.json({
          conflict: true,
          type: rule === 'STRICT_BLOCK' ? 'BLOCK' : 'WARNING',
          with: act
        });
      }
    }

    res.json({ conflict: false });
  } catch (error) {
    console.error('Check Conflict Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// CLASS CRUD ROUTES
// ──────────────────────────────────────────────

/**
 * @route   POST /api/classes
 * @desc    Create a new class request
 * @access  Private (Teacher/Admin)
 */
router.post('/', verifyToken, verifyTeacher, async (req, res) => {
  const { 
    title, description, subject, price, mode, thumbnail_url,
    start_date, schedules, duration,
    force_request, conflict_details 
  } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        teacher_id: req.user.id,
        title,
        description,
        subject,
        price,
        mode,
        thumbnail_url,
        status: 'pending',
        start_date,
        schedules: schedules || [],
        duration,
        force_request: force_request || false,
        conflict_details: conflict_details || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('CREATE CLASS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/classes/my-classes
 * @desc    Get all classes created by the logged-in teacher
 * @access  Private (Teacher/Admin)
 */
router.get('/my-classes', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('teacher_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/classes/pending
 * @desc    Get all pending classes for approval
 * @access  Private (Admin only)
 */
router.get('/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/classes/approved
 * @desc    Get all approved classes (for public browsing)
 * @access  Public
 */
router.get('/approved', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// NOTIFICATION ROUTES
// ──────────────────────────────────────────────

/**
 * @route   GET /api/classes/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/classes/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('recipient_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// ADMIN CLASS MANAGEMENT
// ──────────────────────────────────────────────

/**
 * @route   PATCH /api/classes/:id/status
 * @desc    Approve or reject a class request
 * @access  Private (Admin only)
 */
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const { status, rejection_reason } = req.body;
  const { id } = req.params;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
  }

  try {
    // 1. Update Class Status
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null
      })
      .eq('id', id)
      .select()
      .single();

    if (classError) throw classError;

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // 2. Create Notification for Teacher
    const notificationTitle = status === 'approved' ? 'Class Approved!' : 'Class Rejected';
    const notificationMessage = status === 'approved' 
      ? `Your class "${classData.title}" has been approved and is now live.`
      : `Your class "${classData.title}" was rejected. Reason: ${rejection_reason}`;

    await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: classData.teacher_id,
        recipient_role: 'Teacher',
        title: notificationTitle,
        message: notificationMessage,
        type: 'System'
      });

    res.json(classData);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @route   GET /api/classes/admin/all
 * @desc    Get absolutely all classes in the system
 * @access  Private (Admin only)
 */
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// CLASS DETAILS & CONTENT ROUTES
// ──────────────────────────────────────────────

/**
 * @route   GET /api/classes/:id
 * @desc    Get detailed class info including curriculum (sections/materials)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Valid class ID is required' });
  }

  try {
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo)')
      .eq('id', id)
      .single();

    if (classError) throw classError;

    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('class_sections')
      .select('*, class_materials(*)')
      .eq('class_id', id)
      .order('order_index', { ascending: true });

    if (sectionsError) throw sectionsError;

    res.json({ ...classData, sections });
  } catch (error) {
    console.error(`Error fetching class ${id}:`, error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @route   POST /api/classes/:id/sections
 * @desc    Create a new curriculum section for a class
 * @access  Private
 */
router.post('/:id/sections', verifyToken, async (req, res) => {
  const { id: classId } = req.params;
  const { title, order_index } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('class_sections')
      .insert({ class_id: classId, title, order_index: order_index || 0 })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/classes/sections/:sectionId/materials
 * @desc    Add a material (video, file, etc.) to a section
 * @access  Private
 */
router.post('/sections/:sectionId/materials', verifyToken, async (req, res) => {
  const { sectionId } = req.params;
  const { title, type, url, order_index } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('class_materials')
      .insert({ section_id: sectionId, title, type, url, order_index: order_index || 0 })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/classes/sections/:id
 * @desc    Delete a curriculum section
 * @access  Private
 */
router.delete('/sections/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('class_sections')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/classes/materials/:id
 * @desc    Delete a class material
 * @access  Private
 */
router.delete('/materials/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('class_materials')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/classes/:id/student-view
 * @desc    Detailed class view for enrolled students only
 * @access  Private (Enrolled Students)
 */
router.get('/:id/student-view', verifyToken, async (req, res) => {
  const { id: classId } = req.params;
  try {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('class_id', classId)
      .maybeSingle();

    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this class.' });
    }

    const { data: classData, error: cErr } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(id, first_name, last_name, profile_photo, subject)')
      .eq('id', classId)
      .single();
    if (cErr) throw cErr;

    const { data: sections, error: sErr } = await supabaseAdmin
      .from('class_sections')
      .select('*, class_materials(*)')
      .eq('class_id', classId)
      .order('order_index', { ascending: true });
    if (sErr) throw sErr;

    res.json({ ...classData, sections: sections || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/classes/:id/analytics
 * @desc    Get enrollment analytics and roster for a class
 * @access  Private (Teacher Owner)
 */
router.get('/:id/analytics', verifyToken, verifyTeacher, async (req, res) => {
  const { id } = req.params;
  try {
    const { data: clazz } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('teacher_id', req.user.id)
      .single();

    if (!clazz) return res.status(403).json({ error: 'Unauthorized to view this class analytics.' });

    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('created_at, profiles:student_id(id, first_name, last_name, email, profile_photo, student_id)')
      .eq('class_id', id);
    
    if (enrollError) throw enrollError;

    const students = (enrollments || []).map(e => ({
      id: e.profiles?.id,
      first_name: e.profiles?.first_name || 'Unknown',
      last_name: e.profiles?.last_name || 'Student',
      email: e.profiles?.email,
      student_id_code: e.profiles?.student_id,
      profile_photo: e.profiles?.profile_photo,
      enrolled_at: e.created_at,
      payment_status: 'Approved',
      attendance: 100
    }));

    res.json({
      total_students: students.length,
      roster: students
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
