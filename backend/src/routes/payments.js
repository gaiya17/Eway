/**
 * Payment and Enrollment Routes
 * Handles student payment submissions, enrollment status tracking, and administrative payment verification.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyStaff } = require('../middleware/auth');

// File upload configuration
const slipsDir = path.join(__dirname, '../../uploads/slips');
if (!fs.existsSync(slipsDir)) {
  fs.mkdirSync(slipsDir, { recursive: true });
}

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
// STUDENT PAYMENT & ENROLLMENT READ
// ──────────────────────────────────────────────

/**
 * @route   GET /api/payments/my-payments
 * @desc    Get all payment submissions for the currently logged-in student
 * @access  Private (Student)
 */
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, classes(id, title, subject, thumbnail_url, schedules, duration, mode, teacher_id, profiles:teacher_id(first_name, last_name, profile_photo))')
      .eq('student_id', req.user.id)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/payments/my-enrollments
 * @desc    Get all active class enrollments for the logged-in student
 * @access  Private (Student)
 */
router.get('/my-enrollments', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*, classes(id, title, subject, description, thumbnail_url, schedules, duration, mode, teacher_id, profiles:teacher_id(id, first_name, last_name, profile_photo))')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// STUDENT PAYMENT SUBMISSION
// ──────────────────────────────────────────────

/**
 * @route   POST /api/payments/upload-slip
 * @desc    Submit a bank payment slip for a class enrollment
 * @access  Private (Student)
 */
router.post('/upload-slip', verifyToken, (req, res) => {
  uploadSlip.single('slip')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No bank slip uploaded' });

    const { class_id, amount } = req.body;
    if (!class_id) return res.status(400).json({ error: 'Class ID is required' });

    try {
      // 1. Check if the class exists
      const { data: classData, error: classErr } = await supabaseAdmin
        .from('classes')
        .select('title')
        .eq('id', class_id)
        .single();
      
      if (classErr || !classData) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // 2. Check if student already has a PENDING or APPROVED payment for this class
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id, status')
        .eq('student_id', req.user.id)
        .eq('class_id', class_id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (existingPayment) {
        return res.status(409).json({ 
          error: existingPayment.status === 'approved' 
            ? 'You are already enrolled in this class.' 
            : 'You have a pending payment for this class awaiting review.' 
        });
      }

      // 3. Construct File URL
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
      const slipUrl = `${baseUrl}/uploads/slips/${req.file.filename}`;

      // 4. Create Payment Record
      const { data: payment, error: pErr } = await supabaseAdmin
        .from('payments')
        .insert({
          student_id: req.user.id,
          class_id: class_id,
          amount: parseFloat(amount) || 0,
          slip_url: slipUrl,
          payment_method: 'Bank Transfer',
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pErr) throw pErr;

      // 5. Notify Admin of New Payment (Role-based)
      await supabaseAdmin.from('notifications').insert({
        recipient_role: 'Admin',
        sender_id: req.user.id,
        class_id: class_id,
        title: 'New Payment Submitted',
        message: `A new bank slip has been uploaded for "${classData.title}" by student.`,
        type: 'Payment'
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error('PAYMENT SUBMISSION ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ──────────────────────────────────────────────
// STAFF/ADMIN PAYMENT MANAGEMENT
// ──────────────────────────────────────────────

/**
 * @route   GET /api/payments/all
 * @desc    Get all payment submissions globally with status and class filters
 * @access  Private (Staff/Admin)
 */
router.get('/all', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { status, class_id } = req.query;
    let query = supabaseAdmin
      .from('payments')
      .select('*, classes(id, title, subject, price)')
      .order('submitted_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (class_id && class_id !== 'all') {
      query = query.eq('class_id', class_id);
    }

    const { data: payments, error } = await query;
    if (error) throw error;

    // Fetch student profiles for each payment
    const result = await Promise.all((payments || []).map(async (payment) => {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, email, student_id')
        .eq('id', payment.student_id)
        .single();
      return { ...payment, student: profile || null };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/payments/:id/approve
 * @desc    Approve a pending payment, create an enrollment, and notify student
 * @access  Private (Staff/Admin)
 */
router.patch('/:id/approve', verifyToken, verifyStaff, async (req, res) => {
  const { id } = req.params;
  try {
    const { data: payment, error: pErr } = await supabaseAdmin
      .from('payments')
      .select('*, classes(title, teacher_id)')
      .eq('id', id)
      .single();

    if (pErr || !payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be approved.' });
    }

    // 1. Update Payment Status
    await supabaseAdmin.from('payments')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString(), 
        reviewed_by: req.user.id 
      })
      .eq('id', id);

    // 2. Ensure Active Enrollment exists
    const { data: existingEnrollment } = await supabaseAdmin.from('enrollments')
      .select('id')
      .eq('student_id', payment.student_id)
      .eq('class_id', payment.class_id)
      .maybeSingle();

    if (!existingEnrollment) {
      const { error: enrollError } = await supabaseAdmin.from('enrollments').insert({
        student_id: payment.student_id,
        class_id: payment.class_id,
        status: 'active'
      });
      if (enrollError) throw enrollError;
    }

    // 4. Notify Student of Approval (Individual)
    await supabaseAdmin.from('notifications').insert({
      recipient_id: payment.student_id,
      sender_id: req.user.id,
      class_id: payment.class_id,
      title: '✅ Payment Approved!',
      message: `Your payment for "${payment.classes.title}" has been approved. You are now enrolled.`,
      type: 'Enrollment'
    });

    // 5. Notify Admin if finalized by Staff (Role-based)
    if (req.user.role === 'staff') {
      const { data: staff } = await supabaseAdmin
        .from('profiles')
        .select('first_name, last_name, student_id')
        .eq('id', req.user.id)
        .single();
      
      const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Staff Member';

      await supabaseAdmin.from('notifications').insert({
        recipient_role: 'Admin',
        sender_id: req.user.id,
        class_id: payment.class_id,
        title: '✅ Payment Approved by Staff',
        message: `Staff member ${staffName} has approved the payment for "${payment.classes.title}" (Student: ${payment.student_id}).`,
        type: 'Payment_Review'
      });
    }

    res.json({ message: 'Payment approved successfully and student is now enrolled.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/payments/:id/reject
 * @desc    Reject a pending payment and notify student with the rejection reason
 * @access  Private (Staff/Admin)
 */
router.patch('/:id/reject', verifyToken, verifyStaff, async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason?.trim()) {
    return res.status(400).json({ error: 'A rejection reason is required for students to fix their submission.' });
  }
  
  try {
    const { data: payment, error: pErr } = await supabaseAdmin
      .from('payments').select('*, classes(title)').eq('id', id).single();

    if (pErr || !payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be rejected.' });
    }

    // 1. Update Payment Record
    await supabaseAdmin.from('payments')
      .update({ 
        status: 'rejected', 
        rejection_reason, 
        reviewed_at: new Date().toISOString(), 
        reviewed_by: req.user.id 
      })
      .eq('id', id);

    // 2. Notify Student of Rejection (Individual)
    await supabaseAdmin.from('notifications').insert({
      recipient_id: payment.student_id,
      sender_id: req.user.id,
      class_id: payment.class_id,
      title: '❌ Payment Rejected',
      message: `Your payment for "${payment.classes.title}" was rejected. Reason: ${rejection_reason}. Please re-upload your slip.`,
      type: 'Payment'
    });

    // 3. Notify Admin if finalized by Staff (Role-based)
    if (req.user.role === 'staff') {
      const { data: staff } = await supabaseAdmin
        .from('profiles')
        .select('first_name, last_name, student_id')
        .eq('id', req.user.id)
        .single();
      
      const staffName = staff ? `${staff.first_name} ${staff.last_name}` : 'Staff Member';

      await supabaseAdmin.from('notifications').insert({
        recipient_role: 'Admin',
        sender_id: req.user.id,
        class_id: payment.class_id,
        title: '❌ Payment Rejected by Staff',
        message: `Staff member ${staffName} has rejected the payment for "${payment.classes.title}". Reason: ${rejection_reason}`,
        type: 'Payment_Review'
      });
    }

    res.json({ message: 'Payment rejected successfully and student notified.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
