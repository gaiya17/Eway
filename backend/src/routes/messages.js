/**
 * Messaging Routes
 * Handles real-time chat conversations between students and teachers.
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');
require('dotenv').config();

/**
 * @route   POST /api/messages/conversation
 * @desc    Create or retrieve a conversation between a student and a teacher
 * @access  Private (Authenticated)
 */
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

    // Create new conversation if none exists
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ student_id, teacher_id, class_id: class_id || null })
      .select('*, student:profiles!conversations_student_id_fkey(id, first_name, last_name, profile_photo), teacher:profiles!conversations_teacher_id_fkey(id, first_name, last_name, profile_photo, subject)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/messages/my-conversations
 * @desc    Get all conversations for the logged-in user with unread counts
 * @access  Private (Authenticated)
 */
router.get('/my-conversations', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    let query;
    // Flexible query based on user role (Teacher vs Student)
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

    // Calculate unread message counts per conversation
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

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get all messages within a specific conversation
 * @access  Private (Conversation Participants Only)
 */
router.get('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    // Security Check: Verify user is a participant
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('student_id, teacher_id')
      .eq('id', conversationId)
      .single();

    if (!conv || (conv.student_id !== req.user.id && conv.teacher_id !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied to this conversation.' });
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

/**
 * @route   POST /api/messages/:conversationId
 * @desc    Send a new message in a conversation
 * @access  Private (Conversation Participants Only)
 */
router.post('/:conversationId', verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Security Check: Verify user is a participant
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('student_id, teacher_id')
      .eq('id', conversationId)
      .single();

    if (!conv || (conv.student_id !== req.user.id && conv.teacher_id !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied to this conversation.' });
    }

    // Insert new message
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: req.user.id, content: content.trim() })
      .select('*, sender:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_photo)')
      .single();

    if (error) throw error;

    // Update conversation timestamp for sorting
    await supabaseAdmin.from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/messages/:conversationId/read
 * @desc    Mark all messages in a conversation as read for the current user
 * @access  Private (Conversation Participants Only)
 */
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
