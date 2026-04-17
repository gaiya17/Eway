const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * GET /api/chatbot/nodes
 * Fetch chatbot nodes. 
 * Query params:
 * - all: true/false (Fetch all nodes, mostly for admin tree rendering)
 * - parentId: UUID or 'null' (Fetch specific branch children)
 */
router.get('/nodes', async (req, res) => {
  try {
    const { parentId, all } = req.query;

    let query = supabase.from('chatbot_structure').select('*').order('sort_order', { ascending: true });

    if (all === 'true') {
      // fetch all without filtering by parent
    } else if (parentId && parentId !== 'null' && parentId !== 'undefined') {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching chatbot nodes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chatbot/nodes
 * Create a new node. Admin only.
 */
router.post('/nodes', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { parent_id, button_text, response_text, sort_order } = req.body;
    
    // Validate
    if (!button_text) {
      return res.status(400).json({ error: 'button_text is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('chatbot_structure')
      .insert([{ 
        parent_id: parent_id || null, 
        button_text, 
        response_text: response_text || null, 
        sort_order: sort_order || 0 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating chatbot node:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/chatbot/nodes/:id
 * Update an existing node. Admin only.
 */
router.put('/nodes/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { button_text, response_text, sort_order, parent_id } = req.body;

    const updates = {};
    if (button_text !== undefined) updates.button_text = button_text;
    if (response_text !== undefined) updates.response_text = response_text;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (parent_id !== undefined) updates.parent_id = parent_id || null;

    const { data, error } = await supabaseAdmin
      .from('chatbot_structure')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating chatbot node:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chatbot/nodes/:id
 * Delete a node (CASCADE handles children). Admin only.
 */
router.delete('/nodes/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('chatbot_structure')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Node deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot node:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
