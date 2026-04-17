/**
 * Reports API Route
 * Provides all live data endpoints for the Report Generation system.
 * Secured by role-based middleware.
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin, verifyTeacher, verifyStaff } = require('../middleware/auth');

// ──────────────────────────────────────────────
// ADMIN REPORT ENDPOINTS
// ──────────────────────────────────────────────

/**
 * @route   GET /api/reports/admin/financial
 * @desc    Financial analytics: revenue, outstanding, class vs pack split
 * @access  Private (Admin)
 * @query   start, end, subject, payment_method
 */
router.get('/admin/financial', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { start, end, subject, payment_method, class_id } = req.query;


    // 1. Approved payments (revenue collected)
    let approvedQuery = supabaseAdmin
      .from('payments')
      .select('amount, submitted_at, class_id, payment_method, classes(title, subject, price)')
      .eq('status', 'approved');

    if (class_id && class_id !== 'all') approvedQuery = approvedQuery.eq('class_id', class_id);


    if (start) approvedQuery = approvedQuery.gte('submitted_at', start);
    if (end) approvedQuery = approvedQuery.lte('submitted_at', end + 'T23:59:59');
    if (payment_method && payment_method !== 'all') approvedQuery = approvedQuery.eq('payment_method', payment_method);

    const { data: approvedPayments, error: approvedErr } = await approvedQuery;
    if (approvedErr) throw approvedErr;

    // Filter by subject if provided
    const filteredPayments = subject && subject !== 'all'
      ? (approvedPayments || []).filter(p => p.classes?.subject === subject)
      : (approvedPayments || []);

    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 2. Study pack revenue
    const { data: packPurchases } = await supabaseAdmin
      .from('study_pack_purchases')
      .select('amount, created_at')
      .eq('status', 'approved')
      .gte('created_at', start || '2020-01-01')
      .lte('created_at', (end || new Date().toISOString().split('T')[0]) + 'T23:59:59');

    const studyPackRevenue = (packPurchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Outstanding (pending payments)
    const { data: pendingPayments } = await supabaseAdmin
      .from('payments')
      .select('amount, classes(subject)')
      .eq('status', 'pending');

    const filteredPending = subject && subject !== 'all'
      ? (pendingPayments || []).filter(p => p.classes?.subject === subject)
      : (pendingPayments || []);

    const outstanding = filteredPending.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 4. Month-over-month revenue trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString().split('T')[0];
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      const monthRevenue = filteredPayments
        .filter(p => p.submitted_at >= monthStart && p.submitted_at <= monthEnd + 'T23:59:59')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      monthlyTrend.push({ month: monthName, revenue: monthRevenue, year: d.getFullYear() });
    }

    res.json({
      totalRevenue,
      studyPackRevenue,
      classFeeRevenue: totalRevenue,
      outstanding,
      monthlyTrend,
      revenueSplit: [
        { name: 'Class Fees', value: totalRevenue, color: '#22D3EE' },
        { name: 'Study Packs', value: studyPackRevenue, color: '#A855F7' },
      ],
    });
  } catch (error) {
    console.error('ADMIN FINANCIAL REPORT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/admin/enrollment-growth
 * @desc    New student enrollments per month (YTD)
 * @access  Private (Admin)
 */
router.get('/admin/enrollment-growth', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthMap[key] = { month: label, students: 0 };
    }

    (enrollments || []).forEach(e => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].students++;
    });

    // Total unique students
    const { count: totalStudents } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    res.json({
      trend: Object.values(monthMap),
      totalStudents: totalStudents || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/admin/revenue-leakage
 * @desc    Students enrolled in classes but with pending/rejected payments
 * @access  Private (Admin)
 */
router.get('/admin/revenue-leakage', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { class_id } = req.query;

    // Find enrollments where the latest payment is NOT approved
    let enrollQuery = supabaseAdmin
      .from('enrollments')
      .select('student_id, class_id, created_at, classes(title, subject, price), profiles!student_id(first_name, last_name, email, student_id)')
      .order('created_at', { ascending: false });

    if (class_id && class_id !== 'all') enrollQuery = enrollQuery.eq('class_id', class_id);

    const { data: enrollments, error: enrollErr } = await enrollQuery;


    if (enrollErr) throw enrollErr;

    // For each enrollment, check payment status
    const leakage = [];
    for (const enr of (enrollments || [])) {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('status, amount, submitted_at')
        .eq('student_id', enr.student_id)
        .eq('class_id', enr.class_id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (payment && (payment.status === 'pending' || payment.status === 'rejected')) {
        leakage.push({
          studentName: `${enr.profiles?.first_name || ''} ${enr.profiles?.last_name || ''}`.trim(),
          studentId: enr.profiles?.student_id || 'N/A',
          email: enr.profiles?.email || '',
          className: enr.classes?.title || 'Unknown',
          subject: enr.classes?.subject || '',
          classPrice: enr.classes?.price || 0,
          paidAmount: payment.amount || 0,
          paymentStatus: payment.status,
          enrolledDate: enr.created_at,
          submittedAt: payment.submitted_at,
        });
      }
    }

    const totalLeakage = leakage.reduce((sum, l) => sum + (l.classPrice - l.paidAmount), 0);

    res.json({ leakage, totalLeakage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/admin/security-logs
 * @desc    Audit log entries for security & compliance
 * @access  Private (Admin)
 * @query   action_type, start, end, user_id
 */
router.get('/admin/security-logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { action_type, start, end } = req.query;

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*, profiles:user_id(first_name, last_name, role, email)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (action_type && action_type !== 'all') query = query.eq('action_type', action_type);
    if (start) query = query.gte('created_at', start);
    if (end) query = query.lte('created_at', end + 'T23:59:59');

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    // If table doesn't exist yet, return empty gracefully
    if (error.message && error.message.includes('does not exist')) {
      return res.json([]);
    }
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// TEACHER REPORT ENDPOINTS
// ──────────────────────────────────────────────

/**
 * @route   GET /api/reports/teacher/class-performance/:classId
 * @desc    Per-student attendance %, assignment scores, weighted grade
 * @access  Private (Teacher)
 */
router.get('/teacher/class-performance/:classId', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify teacher owns this class
    const { data: clazz } = await supabaseAdmin
      .from('classes')
      .select('id, title, subject, teacher_id')
      .eq('id', classId)
      .eq('teacher_id', req.user.id)
      .single();

    if (!clazz) return res.status(403).json({ error: 'Unauthorized to view this class.' });

    // 1. Get enrolled students
    const { data: enrollments, error: enrollErr } = await supabaseAdmin
      .from('enrollments')
      .select('profiles!student_id(id, first_name, last_name, profile_photo, student_id)')
      .eq('class_id', classId);

    if (enrollErr) throw enrollErr;

    // 2. Get all attendance records for this class
    const { data: allAttendance } = await supabaseAdmin
      .from('attendance')
      .select('student_id, session_date, status')
      .eq('class_id', classId);

    // Get unique session dates (total sessions conducted)
    const sessionDates = [...new Set((allAttendance || []).map(a => a.session_date))];
    const totalSessions = sessionDates.length;

    // 3. Get all assignments for this class with submissions
    const { data: assignments } = await supabaseAdmin
      .from('assignments')
      .select('id, title, deadline, submissions(student_id, grade, status, created_at)')
      .eq('class_id', classId);

    const totalAssignments = (assignments || []).length;

    // 4. Build per-student stats
    const students = (enrollments || []).map(e => {
      const student = e.profiles;
      if (!student) return null;

      // Attendance
      const studentAttendance = (allAttendance || []).filter(a => a.student_id === student.id);
      const sessionsAttended = studentAttendance.filter(a =>
        a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late'
      ).length;
      const attendanceRate = totalSessions > 0
        ? Math.round((sessionsAttended / totalSessions) * 100)
        : 0;

      // Assignments
      const studentSubmissions = [];
      let totalGrade = 0;
      let gradedCount = 0;
      let completedCount = 0;

      (assignments || []).forEach(assignment => {
        const submission = (assignment.submissions || []).find(s => s.student_id === student.id);
        if (submission) {
          completedCount++;
          if (submission.grade !== null && submission.grade !== undefined) {
            totalGrade += parseFloat(submission.grade) || 0;
            gradedCount++;
          }
          studentSubmissions.push({
            assignmentTitle: assignment.title,
            deadline: assignment.deadline,
            status: submission.status,
            grade: submission.grade,
            submittedAt: submission.created_at,
          });
        } else {
          studentSubmissions.push({
            assignmentTitle: assignment.title,
            deadline: assignment.deadline,
            status: new Date() > new Date(assignment.deadline) ? 'Missing' : 'Pending',
            grade: null,
            submittedAt: null,
          });
        }
      });

      const avgGrade = gradedCount > 0 ? Math.round(totalGrade / gradedCount) : null;
      const completionRate = totalAssignments > 0
        ? Math.round((completedCount / totalAssignments) * 100)
        : 0;

      // Weighted final grade: 60% assignments + 40% attendance
      const weightedGrade = avgGrade !== null
        ? Math.round((avgGrade * 0.6) + (attendanceRate * 0.4))
        : Math.round(attendanceRate * 0.4);

      const isAtRisk = attendanceRate < 40;

      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        studentId: student.student_id || 'N/A',
        profilePhoto: student.profile_photo,
        attendanceRate,
        sessionsAttended,
        totalSessions,
        avgGrade,
        completionRate,
        completedCount,
        totalAssignments,
        weightedGrade,
        isAtRisk,
        submissions: studentSubmissions,
        attendanceLog: studentAttendance.map(a => ({
          date: a.session_date,
          status: a.status,
        })),
      };
    }).filter(Boolean);

    // Sort by weighted grade descending for ranking
    students.sort((a, b) => (b.weightedGrade || 0) - (a.weightedGrade || 0));
    students.forEach((s, idx) => { s.rank = idx + 1; });

    res.json({
      classTitle: clazz.title,
      subject: clazz.subject,
      totalStudents: students.length,
      totalSessions,
      totalAssignments,
      avgAttendance: students.length > 0
        ? Math.round(students.reduce((s, st) => s + st.attendanceRate, 0) / students.length)
        : 0,
      avgGrade: students.length > 0
        ? Math.round(students.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) /
            Math.max(students.filter(s => s.avgGrade !== null).length, 1))
        : 0,
      atRiskCount: students.filter(s => s.isAtRisk).length,
      students,
    });
  } catch (error) {
    console.error('TEACHER CLASS PERFORMANCE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/teacher/at-risk/:classId
 * @desc    Students with <40% attendance — also triggers notifications for 3+ consecutive absences
 * @access  Private (Teacher)
 */
router.get('/teacher/at-risk/:classId', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { classId } = req.params;

    const { data: attendance, error: attErr } = await supabaseAdmin
      .from('attendance')
      .select('student_id, session_date, status')
      .eq('class_id', classId)
      .order('session_date', { ascending: false });

    if (attErr) throw attErr;

    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('profiles!student_id(id, first_name, last_name, student_id)')
      .eq('class_id', classId);

    const sessionDates = [...new Set((attendance || []).map(a => a.session_date))].sort();
    const totalSessions = sessionDates.length;

    const atRisk = [];

    for (const enr of (enrollments || [])) {
      const student = enr.profiles;
      if (!student) continue;

      const studentAtt = (attendance || []).filter(a => a.student_id === student.id);
      const attended = studentAtt.filter(a =>
        a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late'
      ).length;
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

      if (rate < 40) {
        // Check consecutive absences (last 3 sessions)
        const lastThree = sessionDates.slice(-3);
        const consecutiveAbsences = lastThree.filter(date => {
          const rec = studentAtt.find(a => a.session_date === date);
          return !rec || rec.status?.toLowerCase() === 'absent';
        }).length;

        // Auto-trigger notification if 3 consecutive absences
        if (consecutiveAbsences >= 3) {
          await supabaseAdmin.from('notifications').insert({
            recipient_id: req.user.id,
            sender_id: null,
            title: '⚠️ At-Risk Student Alert',
            message: `Action Required: Student ${student.first_name} ${student.last_name} (${student.student_id || 'N/A'}) has missed 3+ consecutive classes. Attendance: ${rate}%`,
            type: 'System',
          }).then(() => {/* fire and forget */});
        }

        const lastSeen = studentAtt.length > 0
          ? studentAtt.sort((a, b) => b.session_date.localeCompare(a.session_date))[0].session_date
          : null;

        atRisk.push({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          studentId: student.student_id || 'N/A',
          attendanceRate: rate,
          sessionsAttended: attended,
          consecutiveAbsences,
          lastSeen,
        });
      }
    }

    res.json({ atRisk, totalSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/teacher/dashboard-stats
 * @desc    Aggregate stats for Teacher Dashboard: KPIs, Upcoming classes, Recent Activity, Trends
 * @access  Private (Teacher)
 */
router.get('/teacher/dashboard-stats', verifyToken, verifyTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const today = days[todayIndex];
    const tomorrow = days[(todayIndex + 1) % 7];

    // 1. Get all teacher's approved classes
    const { data: myClasses, error: classErr } = await supabaseAdmin
      .from('classes')
      .select('id, title, subject, schedules')
      .eq('teacher_id', teacherId)
      .eq('status', 'approved');

    if (classErr) throw classErr;
    const classIds = (myClasses || []).map(c => c.id);

    if (classIds.length === 0) {
      return res.json({
        stats: { totalClasses: 0, totalStudents: 0, assignments: 0, attendanceRate: '0%' },
        upcomingSessions: [],
        recentActivity: [],
        attendanceTrend: days.map(d => ({ day: d.substring(0, 3), rate: 0 }))
      });
    }

    // 2. KPIs
    // Total Students (unique enrollments)
    const { count: studentCount } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds);

    // Total Assignments
    const { count: assignmentCount } = await supabaseAdmin
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds);

    // Overall Attendance Rate (fetch status and date for trend chart)
    const { data: allAtt } = await supabaseAdmin
      .from('attendance')
      .select('status, session_date')
      .in('class_id', classIds);
    
    const attendedCount = (allAtt || []).filter(a => ['Present', 'Late'].includes(a.status)).length;
    const attendanceRate = allAtt?.length > 0 ? Math.round((attendedCount / allAtt.length) * 100) : 0;

    // 3. Upcoming Sessions (Today & Tomorrow)
    const upcoming = [];
    (myClasses || []).forEach(cls => {
      const schedules = cls.schedules || [];
      schedules.forEach(s => {
        if ((s.day === today || s.day === tomorrow) && s.start_time) {
          try {
            const timeParts = s.start_time.split(':');
            const sessionDate = new Date();
            if (s.day === tomorrow) sessionDate.setDate(sessionDate.getDate() + 1);
            sessionDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

            upcoming.push({
              title: cls.title,
              className: cls.subject,
              time: `${s.day}, ${s.start_time}`,
              rawTime: sessionDate.toISOString(),
              isToday: s.day === today
            });
          } catch (e) {
            console.error('Invalid schedule time for class:', cls.id, s.start_time);
          }
        }
      });
    });
    // Sort by time
    upcoming.sort((a, b) => a.rawTime.localeCompare(b.rawTime));

    // 4. Recent Activity (Consolidated)
    // - Latest 3 submissions (explicitly map student_id to profiles)
    const { data: recentSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('*, assignments(title), profiles:student_id(first_name, last_name)')
      .in('assignment_id', (await supabaseAdmin.from('assignments').select('id').in('class_id', classIds)).data?.map(a => a.id) || [])
      .order('created_at', { ascending: false })
      .limit(3);

    // - Latest 3 attendance logs (explicitly map student_id to profiles)
    const { data: recentAttendance } = await supabaseAdmin
      .from('attendance')
      .select('*, classes(title), profiles:student_id(first_name, last_name, profile_photo)')
      .in('class_id', classIds)
      .order('created_at', { ascending: false })
      .limit(3);

    const activity = [
      ...(recentSubmissions || []).map(s => ({
        title: 'New assignment submission',
        description: `${s.profiles?.first_name || 'Student'} submitted ${s.assignments?.title}`,
        time: new Date(s.created_at).toLocaleString(),
        type: 'submission'
      })),
      ...(recentAttendance || []).map(a => ({
        title: 'Student attendance scan',
        description: `${a.profiles?.first_name || 'Student'} scanned for ${a.classes?.title}`,
        time: new Date(a.created_at).toLocaleString(),
        type: 'attendance'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    // 5. Attendance Trend (Last 7 Days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()].substring(0, 3);

      const dayAtt = (allAtt || []).filter(a => a.session_date === dateStr);
      const dayPresent = dayAtt.filter(a => ['Present', 'Late'].includes(a.status)).length;
      const rate = dayAtt.length > 0 ? Math.round((dayPresent / dayAtt.length) * 100) : 0;
      
      trend.push({ id: dateStr, day: dayName, rate });
    }

    res.json({
      stats: {
        totalClasses: myClasses.length,
        totalStudents: studentCount || 0,
        assignments: assignmentCount || 0,
        attendanceRate: `${attendanceRate}%`
      },
      upcomingSessions: upcoming,
      recentActivity: activity,
      attendanceTrend: trend,
      weeklyAvg: attendanceRate // using overall for now
    });

  } catch (error) {
    console.error('TEACHER DASHBOARD STATS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────
// STAFF REPORT ENDPOINTS
// ──────────────────────────────────────────────

/**
 * @route   GET /api/reports/staff/daily-recon
 * @desc    Daily operations: QR scans, payment approve/reject counts
 * @access  Private (Staff/Admin)
 * @query   date (YYYY-MM-DD, default today)
 */
router.get('/staff/daily-recon', verifyToken, verifyStaff, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    // QR scans (attendance with method QR_Scan)
    const { data: qrScans, error: qrErr } = await supabaseAdmin
      .from('attendance')
      .select('id, student_id, class_id, session_date, status, is_late, classes(title, subject), profiles!student_id(first_name, last_name, student_id)')
      .eq('method', 'QR_Scan')
      .eq('session_date', date);

    if (qrErr) throw qrErr;

    // Payments approved today
    const { data: approvedPayments } = await supabaseAdmin
      .from('payments')
      .select('id, student_id, class_id, amount, reviewed_at, classes(title, subject), profiles!student_id(first_name, last_name)')
      .eq('status', 'approved')
      .gte('reviewed_at', dayStart)
      .lte('reviewed_at', dayEnd);

    // Payments rejected today
    const { data: rejectedPayments } = await supabaseAdmin
      .from('payments')
      .select('id, student_id, class_id, amount, reviewed_at, rejection_reason, classes(title, subject), profiles!student_id(first_name, last_name)')
      .eq('status', 'rejected')
      .gte('reviewed_at', dayStart)
      .lte('reviewed_at', dayEnd);

    // Pending payments (total outstanding, not just today)
    const { count: pendingCount } = await supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const totalAmount = (approvedPayments || []).reduce((s, p) => s + (p.amount || 0), 0);

    res.json({
      date,
      qrScans: qrScans || [],
      qrScanCount: (qrScans || []).length,
      approvedCount: (approvedPayments || []).length,
      rejectedCount: (rejectedPayments || []).length,
      pendingCount: pendingCount || 0,
      totalApprovedAmount: totalAmount,
      approvedPayments: approvedPayments || [],
      rejectedPayments: rejectedPayments || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/staff/illegal-attendees
 * @desc    Students who scanned in (QR) but payment is pending/rejected
 * @access  Private (Staff/Admin)
 * @query   date (YYYY-MM-DD, default today)
 */
router.get('/staff/illegal-attendees', verifyToken, verifyStaff, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Students who physically attended today
    const { data: scans, error: scanErr } = await supabaseAdmin
      .from('attendance')
      .select('student_id, class_id, session_date, status, classes(id, title, subject), profiles!student_id(id, first_name, last_name, student_id)')
      .eq('method', 'QR_Scan')
      .eq('session_date', date);

    if (scanErr) throw scanErr;

    const illegal = [];

    for (const scan of (scans || [])) {
      // Check if their payment for this class is approved
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('status')
        .eq('student_id', scan.student_id)
        .eq('class_id', scan.class_id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!payment || payment.status !== 'approved') {
        illegal.push({
          studentName: `${scan.profiles?.first_name || ''} ${scan.profiles?.last_name || ''}`.trim(),
          studentId: scan.profiles?.student_id || 'N/A',
          className: scan.classes?.title || 'Unknown',
          subject: scan.classes?.subject || '',
          scanTime: scan.session_date,
          attendanceStatus: scan.status,
          paymentStatus: payment ? payment.status : 'No Payment',
        });
      }
    }

    res.json(illegal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/reports/staff/card-issuance
 * @desc    Student card issuance stats: digital vs physical
 * @access  Private (Staff/Admin)
 */
router.get('/staff/card-issuance', verifyToken, verifyStaff, async (req, res) => {
  try {
    // Total students
    const { count: totalStudents } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    // Students with student_id (digital card)
    const { count: digitalCards } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .not('student_id', 'is', null);

    // Students with physical card issued flag (if column exists)
    // Graceful fallback if column doesn't exist
    let physicalCards = 0;
    let pendingPrint = [];
    try {
      const { count: physical } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('physical_card_issued', true);
      physicalCards = physical || 0;

      const { data: pending } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, student_id, profile_photo')
        .eq('role', 'student')
        .not('student_id', 'is', null)
        .eq('physical_card_issued', false);
      pendingPrint = (pending || []).map(s => ({
        name: `${s.first_name} ${s.last_name}`,
        studentId: s.student_id,
        photo: s.profile_photo,
      }));
    } catch (_) {
      // Column may not exist — that's OK
      physicalCards = 0;
    }

    res.json({
      totalStudents: totalStudents || 0,
      digitalCards: digitalCards || 0,
      physicalCards,
      pendingPrint: pendingPrint || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
