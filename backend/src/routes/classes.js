const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
require('dotenv').config();

// Multer setup for PDF uploads
const materialsDir = path.join(__dirname, '../../uploads/materials');
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, materialsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
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

// Middleware to verify Teacher role
const verifyTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Teacher role required.' });
  }
};

// Middleware to verify Staff or Admin role
const verifyStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) next();
  else res.status(403).json({ error: 'Access denied. Staff or Admin role required.' });
};

// Multer for bank slip uploads (images + PDFs)
const slipsDir = path.join(__dirname, '../../uploads/slips');
if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir, { recursive: true });
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ──────────────────────────────────────────────
// FILE UPLOAD ROUTES
// ──────────────────────────────────────────────

// Upload a PDF file for a class material
router.post('/upload-pdf', verifyToken, verifyTeacher, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const fileUrl = `${baseUrl}/uploads/materials/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.originalname });
  });
});

// ──────────────────────────────────────────────
// CLASS SCHEDULING & CONFLICT DETECTION
// ──────────────────────────────────────────────

// Determine scheduling rule via exact spec
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
    
    return 'ALLOWED_OVERLAP'; // Default for Arts and unknown
  }
  return 'STRICT_BLOCK'; // Safe fallback
}

// Check time overlap 
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

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
        // Time Overlap Confirmed! Now check Policy Rule.
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

// Create a new class (Teacher)
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
    if (error.code === '42703') {
      console.error('>>> CRITICAL: The "schedules" column is missing from the "classes" table. Please run the supabase_setup.sql migration! <<<');
    }
    res.status(500).json({ error: error.message });
  }
});

// Get my classes (Teacher)
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

// Get pending classes (Admin)
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

// Get approved classes (Public/Student)
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

// --- NOTIFICATION ROUTES ---

// Get my notifications
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
    console.error('Error fetching class notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
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

// Update class status (Admin)
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
        // updated_at is handled by DB trigger
      })
      .eq('id', id)
      .select()
      .single();

    if (classError) {
      if (classError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Class not found' });
      }
      console.error('Database update error:', classError);
      throw classError;
    }

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // 2. Create Notification for Teacher
    const notificationTitle = status === 'approved' ? 'Class Approved!' : 'Class Rejected';
    const notificationMessage = status === 'approved' 
      ? `Your class "${classData.title}" has been approved and is now live.`
      : `Your class "${classData.title}" was rejected. Reason: ${rejection_reason}`;
    const notificationType = status === 'approved' ? 'success' : 'error';

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: classData.teacher_id,
        recipient_role: 'Teacher',
        title: notificationTitle,
        message: notificationMessage,
        type: 'System'
      });

    if (notifError) console.error('Error creating notification:', notifError);

    res.json(classData);
  } catch (error) {
    console.error('Final catch error in status update:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get full class details with sections and materials
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Valid class ID is required' });
  }

  try {
    // 1. Get Class Basic Info
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo)')
      .eq('id', id)
      .single();

    if (classError) throw classError;

    // 2. Get Sections and Materials
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

// Create a new section
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

// Add material to a section
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

// Delete a section
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

// Delete a material
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

// (Moved notifications up)

// Get all classes for Admin
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
// STUDENT CLASS VIEW (gated by enrollment)
// ──────────────────────────────────────────────
router.get('/:id/student-view', verifyToken, async (req, res) => {
  const { id: classId } = req.params;
  try {
    // Check enrollment
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

// ──────────────────────────────────────────────
// TEACHER CLASS ANALYTICS
// ──────────────────────────────────────────────
router.get('/:id/analytics', verifyToken, verifyTeacher, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Verify Teacher owns this class
    const { data: clazz } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('teacher_id', req.user.id)
      .single();

    if (!clazz) return res.status(403).json({ error: 'Unauthorized to view this class analytics.' });

    // 2. Fetch Enrollments
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('created_at, profiles:student_id(id, first_name, last_name, email, profile_photo, student_id)')
      .eq('class_id', id);
    
    if (enrollError) throw enrollError;

    // 3. Map constraints
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
