const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
require('dotenv').config();

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

// Create or retrieve conversation between student and a teacher for a class
router.post('/conversation', verifyToken, async (req, res) => {
  const { teacher_id, class_id } = req.body;
  if (!teacher_id) return res.status(400).json({ error: 'teacher_id is required' });

  const student_id = req.user.id;
  try {
    // Find existing conversation
    let query = supabaseAdmin
      .from('conversations')
      .select('*, student:profiles!conversations_student_id_fkey(id, first_name, last_name, profile_photo), teacher:profiles!conversations_teacher_id_fkey(id, first_name, last_name, profile_photo, subject)')
      .eq('student_id', student_id)
      .eq('teacher_id', teacher_id);

    if (class_id) query = query.eq('class_id', class_id);

    const { data: existing } = await query.maybeSingle();

    if (existing) return res.json(existing);

    // Create new conversation
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ student_id, teacher_id, class_id: class_id || null })
      .select('*, student:profiles!conversations_student_id_fkey(id, first_name, last_name, profile_photo), teacher:profiles!conversations_teacher_id_fkey(id, first_name, last_name, profile_photo, subject)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all conversations for the logged-in user (student sees theirs, teacher sees theirs)
router.get('/my-conversations', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    let query;
    if (role === 'teacher') {
      query = supabaseAdmin
        .from('conversations')
        .select('*, student:profiles!conversations_student_id_fkey(id, first_name, last_name, profile_photo), teacher:profiles!conversations_teacher_id_fkey(id, first_name, last_name, profile_photo), classes(id, title)')
        .eq('teacher_id', userId)
        .order('last_message_at', { ascending: false });
    } else {
      query = supabaseAdmin
        .from('conversations')
        .select('*, student:profiles!conversations_student_id_fkey(id, first_name, last_name, profile_photo), teacher:profiles!conversations_teacher_id_fkey(id, first_name, last_name, profile_photo, subject), classes(id, title)')
        .eq('student_id', userId)
        .order('last_message_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get unread count per conversation
    const convIds = (data || []).map(c => c.id);
    let unreadMap = {};
    if (convIds.length > 0) {
      const { data: unread } = await supabaseAdmin
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .eq('is_read', false)
        .neq('sender_id', userId);
      (unread || []).forEach(m => {
        unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
      });
    }

    const result = (data || []).map(c => ({ ...c, unread_count: unreadMap[c.id] || 0 }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages in a conversation
router.get('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    // Verify user is part of this conversation
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('student_id, teacher_id')
      .eq('id', conversationId)
      .single();

    if (!conv || (conv.student_id !== req.user.id && conv.teacher_id !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_photo)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message in a conversation
router.post('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });

  try {
    // Verify user is part of this conversation
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('student_id, teacher_id')
      .eq('id', conversationId)
      .single();

    if (!conv || (conv.student_id !== req.user.id && conv.teacher_id !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: req.user.id, content: content.trim() })
      .select('*, sender:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_photo)')
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabaseAdmin.from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all messages in a conversation as read (for the current user)
router.patch('/:conversationId/read', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', req.user.id);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
