const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { verifyToken, verifyTeacher, verifyStudent } = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// GET assignments for a specific class
router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .select('*, submissions(id, student_id, file_url, status, created_at, profiles:student_id(first_name, last_name, profile_photo))')
      .eq('class_id', req.params.classId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Assignment (Teacher only)
router.post('/create', verifyToken, verifyTeacher, upload.single('file'), async (req, res) => {
  try {
    const { class_id, title, description, deadline } = req.body;
    let fileUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('assignments')
        .upload(`teacher_materials/${class_id}/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
      
      if (uploadError) {
          throw uploadError;
      }
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('assignments')
        .getPublicUrl(`teacher_materials/${class_id}/${fileName}`);
        
      fileUrl = publicUrlData.publicUrl;
    }

    // Insert Assignment
    const { data: assignment, error: insertError } = await supabaseAdmin
      .from('assignments')
      .insert({
        class_id,
        teacher_id: req.user.id,
        title,
        description,
        deadline,
        file_url: fileUrl
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send Realtime Notification to all enrolled students
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('student_id').eq('class_id', class_id);
    if (enrollments && enrollments.length > 0) {
       const notificationsToInsert = enrollments.map(e => ({
          recipient_id: e.student_id,
          recipient_role: 'Student',
          sender_id: req.user.id,
          class_id: class_id,
          title: `New Assignment Published`,
          message: `Your teacher has uploaded a new assignment: ${title}. Due: ${new Date(deadline).toLocaleString()}`,
          type: 'Assignment'
       }));
       await supabaseAdmin.from('notifications').insert(notificationsToInsert);
    }

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Submit Homework (Student only)
router.post('/:id/submit', verifyToken, verifyStudent, upload.single('file'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    if (!req.file) return res.status(400).json({ error: 'File is required.' });

    // Verify assignment exists and get deadline
    const { data: assignment } = await supabaseAdmin.from('assignments').select('deadline, teacher_id').eq('id', assignmentId).single();
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

    const isLate = new Date() > new Date(assignment.deadline);
    const status = isLate ? 'Late' : 'Submitted';

    const fileName = `${req.user.id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assignments')
      .upload(`student_submissions/${assignmentId}/${fileName}`, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
      
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('assignments')
      .getPublicUrl(`student_submissions/${assignmentId}/${fileName}`);

    const fileUrl = publicUrlData.publicUrl;

    const { data: submission, error: submitError } = await supabaseAdmin
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: req.user.id,
        file_url: fileUrl,
        status: status
      })
      .select('*, profiles:student_id(first_name, last_name, profile_photo)')
      .single();

    if (submitError) throw submitError;

    // Notify Teacher
    await supabaseAdmin.from('notifications').insert({
       recipient_id: assignment.teacher_id,
       recipient_role: 'Teacher',
       sender_id: req.user.id,
       title: 'Assignment Submitted',
       message: `A student has submitted homework for assignment! Status: ${status}`,
       type: 'Assignment'
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Assignment (Teacher only)
router.delete('/:id', verifyToken, verifyTeacher, async (req, res) => {
  try {
     const { error } = await supabaseAdmin.from('assignments').delete().eq('id', req.params.id);
     if (error) throw error;
     res.status(204).send();
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

module.exports = router;
