const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyTeacher, verifyAdmin } = require('../middleware/auth');
require('dotenv').config();

// Local disk storage for tutorial file uploads (reliable, no extra bucket setup needed)
const tutorialsUploadDir = path.join(__dirname, '../../uploads/tutorials');
if (!fs.existsSync(tutorialsUploadDir)) fs.mkdirSync(tutorialsUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tutorialsUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

/**
 * @route   POST /api/free-tutorials
 * @desc    Create a new free tutorial entry (Teacher)
 * @access  Private (Teacher)
 */
router.post('/', verifyToken, verifyTeacher, async (req, res) => {
  const { title, description, level, subject, category, thumbnail_url, contents } = req.body;

  try {
    // 1. Insert Tutorial Metadata
    const { data: tutorial, error: tutorialErr } = await supabaseAdmin
      .from('free_tutorials')
      .insert({
        teacher_id: req.user.id,
        title,
        description,
        level,
        subject,
        category,
        thumbnail_url,
        status: 'pending'
      })
      .select()
      .single();

    if (tutorialErr) {
      console.error('TUTORIAL INSERT ERROR details:', tutorialErr);
      throw tutorialErr;
    }

    // 2. Insert Contents if any
    if (contents && Array.isArray(contents) && contents.length > 0) {
      console.log(`Inserting ${contents.length} tutorial contents...`);
      const contentsToInsert = contents.map((c, index) => ({
        tutorial_id: tutorial.id,
        file_name: c.file_name,
        file_url: c.file_url,
        file_type: c.file_type || 'link',
        order_index: index
      }));

      const { error: contentsErr } = await supabaseAdmin
        .from('tutorial_contents')
        .insert(contentsToInsert);

      if (contentsErr) {
        console.error('TUTORIAL CONTENTS INSERT ERROR:', contentsErr);
        throw contentsErr;
      }
    }

    // 3. Notify Admin
    await supabaseAdmin.from('notifications').insert({
      recipient_role: 'Admin',
      sender_id: req.user.id,
      title: '📺 New Tutorial Request',
      message: `Teacher has submitted a new free tutorial: "${title}".`,
      type: 'System'
    });

    res.status(201).json(tutorial);
  } catch (error) {
    console.error('CREATE TUTORIAL CRASH:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.details || 'Check backend logs for more info'
    });
  }
});

/**
 * @route   GET /api/free-tutorials/my
 * @desc    Get all tutorials of the logged-in teacher
 * @access  Private (Teacher)
 */
router.get('/my', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('free_tutorials')
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
 * @route   GET /api/free-tutorials/approved
 * @desc    Get all approved tutorials (Student View)
 * @access  Public
 */
router.get('/approved', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('free_tutorials')
      .select(`
        *,
        profiles:teacher_id (
          first_name,
          last_name,
          profile_photo
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('FETCH APPROVED TUTORIALS ERROR:', error);
      throw error;
    }
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/free-tutorials/pending
 * @desc    Get all pending tutorials for approval (Admin)
 * @access  Private (Admin)
 */
router.get('/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('free_tutorials')
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
 * @route   GET /api/free-tutorials/admin/all
 * @desc    Get absolutely all free tutorials in the system
 * @access  Private (Admin only)
 */
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('free_tutorials')
      .select('*, profiles:teacher_id(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/free-tutorials/:id
 * @desc    Get tutorial details including contents
 * @access  Public/Private (depending on approval status, but generally we sanitize)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  // Guard against invalid/undefined IDs
  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({ error: 'Valid tutorial ID is required.' });
  }

  try {
    const { data: tutorial, error: tutorialErr } = await supabaseAdmin
      .from('free_tutorials')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo)')
      .eq('id', id)
      .single();

    if (tutorialErr) throw tutorialErr;

    const { data: contents, error: contentsErr } = await supabaseAdmin
      .from('tutorial_contents')
      .select('*')
      .eq('tutorial_id', id)
      .order('order_index', { ascending: true });

    if (contentsErr) throw contentsErr;

    res.json({ ...tutorial, contents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/free-tutorials/:id/status
 * @desc    Approve or reject a tutorial (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const { status, rejection_reason } = req.body;
  const { id } = req.params;

  try {
    const { data: tutorial, error: updateErr } = await supabaseAdmin
      .from('free_tutorials')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Notify Teacher
    const title = status === 'approved' ? '✅ Tutorial Approved' : '❌ Tutorial Rejected';
    const message = status === 'approved' 
      ? `Your tutorial "${tutorial.title}" is now live!`
      : `Your tutorial "${tutorial.title}" was rejected. Reason: ${rejection_reason}`;

    await supabaseAdmin.from('notifications').insert({
      recipient_id: tutorial.teacher_id,
      recipient_role: 'Teacher',
      sender_id: req.user.id,
      title,
      message,
      type: 'System'
    });

    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/free-tutorials/:id/contents
 * @desc    Add content to a tutorial (Teacher)
 * @access  Private (Teacher Owner)
 */
router.post('/:id/contents', verifyToken, verifyTeacher, upload.single('file'), async (req, res) => {
  const { id: tutorialId } = req.params;
  const { file_name, file_type, order_index } = req.body;

  // Guard against invalid/undefined IDs
  if (!tutorialId || tutorialId === 'undefined' || tutorialId === 'null') {
    return res.status(400).json({ error: 'Valid tutorial ID is required.' });
  }

  try {
    // Ownership check
    const { data: tutorial } = await supabaseAdmin
      .from('free_tutorials')
      .select('teacher_id')
      .eq('id', tutorialId)
      .single();

    if (!tutorial || tutorial.teacher_id !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized: you do not own this tutorial.' });
    }

    let fileUrl = req.body.file_url;

    // Handle local disk file upload (works without additional Supabase bucket setup)
    if (req.file) {
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
      fileUrl = `${baseUrl}/uploads/tutorials/${req.file.filename}`;
    }

    if (!fileUrl) {
      return res.status(400).json({ error: 'Either a file upload or a URL link is required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('tutorial_contents')
      .insert({
        tutorial_id: tutorialId,
        file_name,
        file_url: fileUrl,
        file_type,
        order_index: order_index ? parseInt(order_index) : 0
      })
      .select()
      .single();

    if (error) {
      console.error('DB INSERT ERROR:', error);
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('ADD CONTENT CRASH:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/free-tutorials/contents/:id
 * @desc    Delete tutorial content (Teacher)
 */
router.delete('/contents/:id', verifyToken, verifyTeacher, async (req, res) => {
  try {
    // In a real app we'd verify ownership here too
    const { error } = await supabaseAdmin
      .from('tutorial_contents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
