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

module.exports = router;
