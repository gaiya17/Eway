const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/pending-summary
 * @desc    Get counts of pending content across all types
 * @access  Private (Admin)
 */
router.get('/pending-summary', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [classes, packs, tutorials] = await Promise.all([
      supabaseAdmin.from('classes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('study_packs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('free_tutorials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    res.json({
      classes: classes.count || 0,
      studyPacks: packs.count || 0,
      tutorials: tutorials.count || 0,
      total: (classes.count || 0) + (packs.count || 0) + (tutorials.count || 0)
    });
  } catch (error) {
    console.error('PENDING SUMMARY ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Get counts and revenue for Admin Dashboard
 * @access  Private (Admin)
 */
router.get('/dashboard-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [
      { count: users },
      { data: revenueData },
      { count: pendingPayments },
      { count: pendingAttendance },
      { count: systemLogsCount }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments').select('amount').eq('status', 'approved'),
      supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('session_date', new Date().toISOString().split('T')[0]),
      supabaseAdmin.from('system_logs').select('*', { count: 'exact', head: true })
    ]);

    const totalRevenue = (revenueData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Fetch recent logs
    const { data: recentLogs } = await supabaseAdmin
      .from('system_logs')
      .select('*, profiles:user_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      users: users || 0,
      revenue: totalRevenue,
      pendingPayments: pendingPayments || 0,
      attendanceToday: pendingAttendance || 0,
      totalLogs: systemLogsCount || 0,
      recentActivities: (recentLogs || []).map(log => ({
        id: log.id,
        user: log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'System',
        action: log.action_type,
        time: log.created_at
      }))
    });
  } catch (error) {
    console.error('ADMIN DASHBOARD STATS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
