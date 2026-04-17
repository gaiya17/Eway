const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin, verifyTeacher, verifyStaff } = require('../middleware/auth');

/**
 * @route   POST /api/attendance/auto
 * @desc    Record attendance when a student joins an online live session
 * @access  Private (Student)
 */
router.post('/auto', verifyToken, async (req, res) => {
  const { class_id, session_id } = req.body;
  const student_id = req.user.id;

  if (!class_id) return res.status(400).json({ error: 'Class ID is required' });

  try {
    // 1. Verify Enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('class_id', class_id)
      .maybeSingle();

    if (enrollError || !enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this class.' });
    }

    // 2. Check if already marked for today
    const session_date = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', student_id)
      .eq('class_id', class_id)
      .eq('session_date', session_date)
      .maybeSingle();

    if (existing) {
      return res.json({ message: 'Attendance already recorded.', alreadyMarked: true });
    }

    // 3. Mark Attendance
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id,
        class_id,
        session_id: session_id || null,
        session_date,
        method: 'Auto_Join',
        status: 'Present'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/attendance/scan
 * @desc    Staff marks attendance by scanning a student's QR code (student_id code)
 * @access  Private (Staff/Admin/Teacher)
 */
router.post('/scan', verifyToken, async (req, res) => {
  const { student_id_code, class_id } = req.body;
  const marker_id = req.user.id;

  if (!student_id_code || !class_id) {
    return res.status(400).json({ error: 'Student ID Code and Class ID are required.' });
  }

  try {
    // 1. Resolve student_id_code to UUID
    const { data: student, error: studentError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, profile_photo')
      .eq('student_id', student_id_code)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Invalid Student ID Card.' });
    }

    // 2. Verify Enrollment
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('class_id', class_id)
      .maybeSingle();

    if (!enrollment) {
      return res.status(403).json({ 
        error: 'Student NOT enrolled in this class.',
        student: { name: `${student.first_name} ${student.last_name}` }
      });
    }

    // 3. Timing Logic (1 hour before to class end)
    const { data: clazz } = await supabaseAdmin
      .from('classes')
      .select('schedules, duration')
      .eq('id', class_id)
      .single();

    const now = new Date();
    const session_date = now.toISOString().split('T')[0];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'Long' });
    
    // Find today's schedule slot
    const todaySchedule = (clazz.schedules || []).find(s => s.day === currentDay);
    
    let isLate = false;
    if (todaySchedule) {
      const [h, m] = todaySchedule.start_time.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(h, m, 0, 0);

      const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
      
      if (now < oneHourBefore) {
        return res.status(400).json({ 
          error: 'Scanning not allowed yet. Too early.',
          startTime: todaySchedule.start_time
        });
      }

      // Late threshold: 20 mins after start
      const lateThreshold = new Date(startTime.getTime() + 20 * 60 * 1000);
      if (now > lateThreshold) {
        isLate = true;
      }
    }

    // 4. Check Duplicate
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', student.id)
      .eq('class_id', class_id)
      .eq('session_date', session_date)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ 
        error: 'Attendance ALREADY marked for today.',
        student: { id: student.id, name: `${student.first_name} ${student.last_name}` }
      });
    }

    // 5. Mark Attendance
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id: student.id,
        class_id,
        session_date,
        method: 'QR_Scan',
        marked_by: marker_id,
        status: isLate ? 'Late' : 'Present',
        is_late: isLate
      })
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json({
      ...data,
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        photo: student.profile_photo
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/attendance/roster/:classId
 * @desc    Fetch student roster for a class with attendance status for a specific date
 * @access  Private (Teacher/Staff/Admin)
 */
router.get('/roster/:classId', verifyToken, async (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;
  const session_date = date || new Date().toISOString().split('T')[0];

  try {
    // 1. Get all enrolled students
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('profiles!student_id(id, first_name, last_name, profile_photo, student_id)')
      .eq('class_id', classId);

    if (enrollError) throw enrollError;

    // 2. Get attendance for this date
    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('class_id', classId)
      .eq('session_date', session_date);

    const attendanceMap = {};
    (attendance || []).forEach(a => {
      attendanceMap[a.student_id] = a;
    });

    const roster = (enrollments || []).map(e => {
      const student = e.profiles;
      const rec = attendanceMap[student.id];
      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        studentId: student.student_id,
        profilePhoto: student.profile_photo,
        status: rec ? rec.status.toLowerCase() : 'absent',
        time: rec ? new Date(rec.marked_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
        method: rec ? rec.method : null
      };
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/attendance/manual
 * @desc    Bulk mark attendance for students
 * @access  Private (Teacher/Staff/Admin)
 */
router.post('/manual', verifyToken, async (req, res) => {
  const { class_id, records, date } = req.body; // records: [{student_id, status}]
  const marker_id = req.user.id;
  const session_date = date || new Date().toISOString().split('T')[0];

  if (!class_id || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const results = [];
    for (const rec of records) {
      const { student_id, status } = rec;
      
      const { data, error } = await supabaseAdmin
        .from('attendance')
        .upsert({
          student_id,
          class_id,
          session_date,
          status,
          is_late: status.toLowerCase() === 'late',
          method: 'Manual',
          marked_by: marker_id,
          marked_at: new Date()
        }, { onConflict: 'student_id, class_id, session_date' })
        .select()
        .single();

      if (error) console.error('Upsert failed for student', student_id, error);
      else results.push(data);
    }

    res.json({ message: 'Attendance updated.', count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/attendance/student/history
 * @desc    Get current student's attendance history
 * @access  Private (Student)
 */
router.get('/student/history', verifyToken, async (req, res) => {
  const student_id = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, classes(title, subject)')
      .eq('student_id', student_id)
      .order('session_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
