const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyStaff, verifyAdmin, verifyTeacher } = require('../middleware/auth');

// GET all notifications for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark all as read
router.post('/read-all', verifyToken, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send custom notification (Admin/Staff/Teacher only)
router.post('/send', verifyToken, async (req, res) => {
  const { recipient_ids, recipient_role, title, message, type } = req.body;
  
  // Basic role check: must be staff, admin, or teacher
  if (!['admin', 'staff', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized to send notifications.' });
  }

  try {
    let targets = [];

    if (recipient_ids && Array.isArray(recipient_ids)) {
      // Direct list of IDs
      targets = recipient_ids;
    } else if (recipient_role === 'All Students') {
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('role', 'student');
      targets = (data || []).map(d => d.id);
    } else if (recipient_role === 'All Teachers' && req.user.role === 'admin') {
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('role', 'teacher');
      targets = (data || []).map(d => d.id);
    }

    if (targets.length === 0) return res.status(400).json({ error: 'No recipients found.' });

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

    res.json({ message: `Notification sent to ${targets.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
