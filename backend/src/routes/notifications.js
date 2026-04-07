/**
 * Notification Routes
 * Handles retrieval, marking as read, and bulk sending of system notifications.
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the currently logged-in user
 * @access  Private (Authenticated)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${req.user.id},recipient_role.eq.${userRole}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/notifications/sent
 * @desc    Get all notifications sent by the currently logged-in user
 * @access  Private (Authenticated)
 */
router.get('/sent', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*, recipient:recipient_id(first_name, last_name, role, email)')
      .eq('sender_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private (Authenticated)
 */
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    
    // We allow marking as read if either ID matches OR role matches
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .or(`recipient_id.eq.${req.user.id},recipient_role.eq.${userRole}`)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/notifications/read-all
 * @desc    Mark all unread notifications as read for the user
 * @access  Private (Authenticated)
 */
router.post('/read-all', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .or(`recipient_id.eq.${req.user.id},recipient_role.eq.${userRole}`);

    if (error) throw error;
    res.status(200).json({ message: 'All notifications marked as read successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/notifications/send
 * @desc    Send a custom notification to targeted users or roles
 * @access  Private (Admin/Staff/Teacher only)
 */
router.post('/send', verifyToken, async (req, res) => {
  const { recipient_ids, recipient_role, title, message, type } = req.body;
  
  // RBAC Check for sending capabilities
  if (!['admin', 'staff', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized to send broadcast notifications.' });
  }

  try {
    let targets = [];

    // Target by specific IDs
    if (recipient_ids && Array.isArray(recipient_ids)) {
      targets = recipient_ids;
    } 
    // Target all students
    else if (recipient_role === 'All Students') {
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('role', 'student');
      targets = (data || []).map(d => d.id);
    } 
    // Target all teachers (Admin only)
    else if (recipient_role === 'All Teachers' && req.user.role === 'admin') {
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('role', 'teacher');
      targets = (data || []).map(d => d.id);
    }

    if (targets.length === 0) {
      return res.status(400).json({ error: 'No recipients found for this broadcast.' });
    }

    // Prepare notifications entries
    const entries = targets.map(tid => ({
      recipient_id: tid,
      recipient_role: recipient_role.startsWith('All') ? recipient_role.split(' ')[1].slice(0, -1) : 'User',
      sender_id: req.user.id,
      title,
      message,
      type: type || 'Announcement'
    }));

    const { error } = await supabaseAdmin.from('notifications').insert(entries);
    if (error) throw error;

    res.json({ message: `Broadcast sent successfully to ${targets.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
