/**
 * Payment and Enrollment Routes
 * Handles student payment submissions, enrollment status tracking, and administrative payment verification.
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyStaff } = require('../middleware/auth');

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

    // 3. Notify Student of Success
    await supabaseAdmin.from('notifications').insert({
      recipient_id: payment.student_id,
      recipient_role: 'Student',
      sender_id: req.user.id,
      title: '🎉 Enrollment Confirmed!',
      message: `Your payment for "${payment.classes.title}" has been approved. You are now enrolled and can access the course!`,
      type: 'Enrollment'
    });

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

    // 2. Notify Student of the Rejection
    await supabaseAdmin.from('notifications').insert({
      recipient_id: payment.student_id,
      recipient_role: 'Student',
      sender_id: req.user.id,
      title: '❌ Payment Rejected',
      message: `Your payment for "${payment.classes.title}" was rejected. Reason: ${rejection_reason}.`,
      type: 'Payment'
    });

    res.json({ message: 'Payment rejected successfully and student notified.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
