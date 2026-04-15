const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin, verifyTeacher, verifyStaff } = require('../middleware/auth');

// Multer configuration for memory storage (for streaming to Supabase)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

/**
 * @route   POST /api/study-packs
 * @desc    Create a new study pack metadata
 * @access  Private (Teacher)
 */
router.post('/', verifyToken, verifyTeacher, async (req, res) => {
  const { title, description, price, level, subject, category, cover_image, contents } = req.body;

  try {
    // 1. Create Study Pack
    const { data: pack, error: packError } = await supabaseAdmin
      .from('study_packs')
      .insert({
        teacher_id: req.user.id,
        title,
        description,
        price: parseFloat(price) || 0,
        level,
        subject,
        category,
        cover_image,
        status: 'pending'
      })
      .select()
      .single();

    if (packError) throw packError;

    // 2. Insert Initial Contents (if provided)
    if (contents && Array.isArray(contents) && contents.length > 0) {
      const contentsToInsert = contents.map((item, index) => ({
        pack_id: pack.id,
        file_name: item.file_name,
        file_url: item.file_url,
        file_type: item.file_type || 'link',
        is_preview: item.is_preview || false,
        order_index: index
      }));

      const { error: contentsError } = await supabaseAdmin
        .from('study_pack_contents')
        .insert(contentsToInsert);

      if (contentsError) {
        console.error('INITIAL CONTENTS INSERT ERROR:', contentsError);
        // We don't fail the whole request because the pack is already created
      }
    }

    // 3. Notify Admin of New Study Pack Request
    await supabaseAdmin.from('notifications').insert({
      recipient_role: 'Admin',
      sender_id: req.user.id,
      title: '📦 New Study Pack Submitted',
      message: `Teacher has submitted a new study pack: "${title}" for approval.`,
      type: 'System'
    });

    res.status(201).json(pack);
  } catch (error) {
    console.error('CREATE STUDY PACK ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/study-packs/my-packs
 * @desc    Get all study packs owned by the teacher
 * @access  Private (Teacher)
 */
router.get('/my-packs', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_packs')
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
 * @route   PATCH /api/study-packs/:id
 * @desc    Update study pack metadata (Teacher)
 * @access  Private (Teacher Owner)
 */
router.patch('/:id', verifyToken, verifyTeacher, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, level, subject, cover_image } = req.body;

  try {
    // 1. Verify Ownership
    const { data: pack, error: fetchErr } = await supabaseAdmin
      .from('study_packs')
      .select('teacher_id, status')
      .eq('id', id)
      .single();

    if (fetchErr || !pack) return res.status(404).json({ error: 'Study pack not found.' });
    if (pack.teacher_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' });

    // 2. Prepare Update (Reset to pending if it was approved)
    const updateData = {
      title,
      description,
      price: parseFloat(price),
      level,
      subject,
      cover_image,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('study_packs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;


    res.json(data);
  } catch (error) {
    console.error('UPDATE STUDY PACK ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/study-packs/:id/contents
 * @desc    Upload contents for a study pack
 * @access  Private (Teacher Owner)
 */
router.post('/:id/contents', verifyToken, verifyTeacher, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { file_name, file_type, is_preview } = req.body;

  if (!req.file && file_type !== 'link') {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // 1. Verify Ownership
    const { data: pack, error: fetchErr } = await supabaseAdmin
      .from('study_packs')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (fetchErr || !pack) return res.status(404).json({ error: 'Study pack not found.' });
    if (pack.teacher_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' });

    let fileUrl = req.body.file_url; // For links

    // 2. Upload to Supabase Storage if file exists
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${id}/${Date.now()}-${req.file.originalname}`;
      const filePath = `contents/${fileName}`;

      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from('study-packs')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      // Get Public URL (or use signed URL logic later)
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('study-packs')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrlData.publicUrl;
    }

    // 3. Save to Database
    const { data, error } = await supabaseAdmin
      .from('study_pack_contents')
      .insert({
        pack_id: id,
        file_name,
        file_url: fileUrl,
        file_type,
        is_preview: is_preview === 'true' || is_preview === true
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('UPLOAD CONTENT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_packs')
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
 * @route   GET /api/study-packs/admin/all
 * @desc    Get absolutely all study packs in the system
 * @access  Private (Admin only)
 */
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_packs')
      .select('*, profiles:teacher_id(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/study-packs/:id/status
 * @desc    Approve or reject a study pack
 * @access  Private (Admin)
 */
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  try {
    const { data: pack, error: updateErr } = await supabaseAdmin
      .from('study_packs')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Notify Teacher
    const notificationTitle = status === 'approved' ? '✅ Study Pack Approved!' : '❌ Study Pack Rejected';
    const notificationMessage = status === 'approved' 
      ? `Your study pack "${pack.title}" has been approved and is now live.`
      : `Your study pack "${pack.title}" was rejected. Reason: ${rejection_reason}`;

    await supabaseAdmin.from('notifications').insert({
      recipient_id: pack.teacher_id,
      sender_id: req.user.id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'System'
    });

    res.json(pack);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/study-packs/approved
 * @desc    Get all approved study packs for marketplace
 * @access  Public
 */
router.get('/approved', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_packs')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo, about)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/study-packs/:id
 * @desc    Get study pack details and content list (preview logic)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: pack, error: packErr } = await supabaseAdmin
      .from('study_packs')
      .select('*, profiles:teacher_id(first_name, last_name, profile_photo, about)')
      .eq('id', id)
      .single();

    if (packErr) throw packErr;

    const { data: contents, error: contErr } = await supabaseAdmin
      .from('study_pack_contents')
      .select('id, file_name, file_type, is_preview, file_url, created_at')
      .eq('pack_id', id)
      .order('order_index', { ascending: true });

    if (contErr) throw contErr;

    // Sanitize: Hide file_url for all users in this public route.
    // Full content (with URLs) is only available via the /access route for purchased users.
    const sanitizedContents = contents.map(item => ({
      ...item,
      file_url: null
    }));

    res.json({ ...pack, contents: sanitizedContents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/study-packs/:id/access
 * @desc    Get full content details (including URLs) for purchased users
 * @access  Private (Purchased User)
 */
router.get('/:id/access', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Check Purchase status
    const { data: purchase, error: purErr } = await supabaseAdmin
      .from('study_pack_purchases')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('pack_id', id)
      .eq('payment_status', 'completed')
      .maybeSingle();

    if (!purchase) {
      return res.status(403).json({ error: 'Purchase required to access this content.' });
    }

    // 2. Fetch full contents
    const { data: contents, error: contErr } = await supabaseAdmin
      .from('study_pack_contents')
      .select('*')
      .eq('pack_id', id)
      .order('order_index', { ascending: true });

    if (contErr) throw contErr;

    // 3. Optional: Convert Storage URLs to Signed URLs for extra security
    const securedContents = await Promise.all(contents.map(async (item) => {
      if (item.file_type !== 'link' && item.file_url.includes('storage.googleapis.com')) {
        // Extract relative path from URL (simplified logic)
        const pathPart = item.file_url.split('/study-packs/')[1];
        const { data: signedData } = await supabaseAdmin.storage
          .from('study-packs')
          .createSignedUrl(pathPart, 60 * 60); // 1 hour access
        
        return { ...item, file_url: signedData.signedUrl };
      }
      return item;
    }));

    res.json(securedContents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/study-packs/:id/purchase
 * @desc    Submit a purchase request (bank slip)
 * @access  Private (Student)
 */
router.post('/:id/purchase', verifyToken, upload.single('slip'), async (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No bank slip uploaded' });
  }

  try {
    const { data: pack } = await supabaseAdmin.from('study_packs').select('title').eq('id', id).single();
    if (!pack) return res.status(404).json({ error: 'Pack not found' });

    // 1. Upload Slip
    const filePath = `slips/${id}/${req.user.id}-${Date.now()}-${req.file.originalname}`;
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('study-packs')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadErr) throw uploadErr;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('study-packs')
      .getPublicUrl(filePath);

    // 2. Create Purchase Record
    const { data, error } = await supabaseAdmin
      .from('study_pack_purchases')
      .insert({
        student_id: req.user.id,
        pack_id: id,
        payment_status: 'pending',
        payment_slip_url: publicUrlData.publicUrl
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Notify Admin
    await supabaseAdmin.from('notifications').insert({
      recipient_role: 'Admin',
      sender_id: req.user.id,
      title: '💰 New Study Pack Purchase',
      message: `A student has submitted a bank slip for pack: "${pack.title}".`,
      type: 'Payment'
    });

    res.status(201).json(data);
  } catch (error) {
    console.error('PURCHASE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// ADMIN: PURCHASE VERIFICATION
// ──────────────────────────────────────────────

/**
 * @route   GET /api/study-packs/purchases/pending
 * @desc    Get all pending study pack purchases for admin review
 */
router.get('/purchases/pending', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_pack_purchases')
      .select('*, study_packs(title, price), profiles:student_id(first_name, last_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/study-packs/purchases/:id/status
 * @desc    Approve or reject a study pack purchase
 */
router.patch('/purchases/:id/status', verifyToken, verifyStaff, async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const { data: purchase, error: fetchErr } = await supabaseAdmin
      .from('study_pack_purchases')
      .select('*, study_packs(title)')
      .eq('id', id)
      .single();

    if (fetchErr || !purchase) {
      return res.status(404).json({ error: 'Purchase record not found' });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('study_pack_purchases')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Notify Student
    await supabaseAdmin.from('notifications').insert({
      recipient_id: purchase.student_id,
      title: status === 'approved' ? 'Study Pack Access Granted' : 'Study Pack Payment Rejected',
      message: status === 'approved' 
        ? `Your payment for "${purchase.study_packs.title}" has been approved. You can now access the full content.`
        : `Your payment for "${purchase.study_packs.title}" was rejected. Reason: ${rejection_reason}`,
      type: 'Payment'
    });

    res.json({ message: `Purchase ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
