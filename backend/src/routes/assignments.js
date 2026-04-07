/**
 * Assignment Routes
 * Handles creation, submission, and management of class assignments.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyTeacher, verifyStudent } = require('../middleware/auth');

/**
 * Configure Multer for in-memory file uploads
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * @route   GET /api/assignments/class/:classId
 * @desc    Get all assignments for a specific class including submissions
 * @access  Private (Authenticated)
 */
router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .select('*, submissions(id, student_id, file_url, status, grade, feedback, created_at, profiles:student_id(first_name, last_name, profile_photo))')
      .eq('class_id', req.params.classId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Security & Logic: Students should only see THEIR OWN submissions
    if (req.user.role === 'student') {
      const filteredData = data.map(assignment => ({
        ...assignment,
        submissions: assignment.submissions.filter(sub => sub.student_id === req.user.id)
      }));
      return res.json(filteredData);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/assignments/create
 * @desc    Create a new assignment for a class
 * @access  Private (Teacher/Admin only)
 */
router.post('/create', verifyToken, verifyTeacher, upload.single('file'), async (req, res) => {
  try {
    const { class_id, title, description, deadline } = req.body;
    let fileUrl = null;

    // Handle optional file attachment from teacher
    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('assignments')
        .upload(`teacher_materials/${class_id}/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('assignments')
        .getPublicUrl(`teacher_materials/${class_id}/${fileName}`);
        
      fileUrl = publicUrlData.publicUrl;
    }

    // Create Assignment Record
    const { data: assignment, error: insertError } = await supabaseAdmin
      .from('assignments')
      .insert({
        class_id,
        teacher_id: req.user.id,
        title,
        description,
        deadline,
        attachment_url: fileUrl
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send Notification to all enrolled students
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('student_id')
      .eq('class_id', class_id);

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

/**
 * @route   POST /api/assignments/:id/submit
 * @desc    Submit student homework for an assignment
 * @access  Private (Student/Admin only)
 */
router.post('/:id/submit', verifyToken, verifyStudent, upload.single('file'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: 'Submission file is required.' });
    }

    // Verify assignment exists and check deadline
    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('deadline, teacher_id')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const isLate = new Date() > new Date(assignment.deadline);
    const status = isLate ? 'Late' : 'Submitted';

    // Upload submission file
    const fileName = `${req.user.id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('submissions')
      .upload(`${assignmentId}/${fileName}`, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
      
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('submissions')
      .getPublicUrl(`${assignmentId}/${fileName}`);

    const fileUrl = publicUrlData.publicUrl;

    // Create Submission Record
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

    // Notify Teacher of the submission
    await supabaseAdmin.from('notifications').insert({
       recipient_id: assignment.teacher_id,
       recipient_role: 'Teacher',
       sender_id: req.user.id,
       class_id: null,
       title: 'New Assignment Submission',
       message: `A student has submitted homework for your assignment! Status: ${status}`,
       type: 'Assignment'
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/assignments/submissions/:submissionId/grade
 * @desc    Grade a student's submission
 * @access  Private (Teacher/Admin only)
 */
router.patch('/submissions/:submissionId/grade', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submissionId = req.params.submissionId;

    // 1. Update the submission
    const { data: submission, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({
        grade,
        feedback,
        status: 'Graded'
      })
      .eq('id', submissionId)
      .select('*, assignments(title, teacher_id)')
      .single();

    if (updateError) throw updateError;

    // 2. Notify the student
    await supabaseAdmin.from('notifications').insert({
      recipient_id: submission.student_id,
      recipient_role: 'Student',
      sender_id: req.user.id,
      title: 'Assignment Graded',
      message: `Your assignment "${submission.assignments.title}" has been graded. Grade: ${grade}`,
      type: 'Assignment'
    });

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete an assignment
 * @access  Private (Teacher/Admin only)
 */
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
