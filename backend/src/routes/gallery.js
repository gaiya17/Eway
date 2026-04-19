/**
 * Gallery Management Routes
 * Handles CRUD operations for public gallery images.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
require('dotenv').config();

// We will use Multer to securely parse the memory buffer then upload to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const isExtAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimeAllowed = allowedTypes.test(file.mimetype);
    if (isExtAllowed && isMimeAllowed) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed'));
  }
});

/**
 * @route   GET /api/gallery
 * @desc    Get all gallery images (Public)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Gallery Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/gallery/upload
 * @desc    Upload an image to Supabase and add a record to the gallery table
 * @access  Private (Admin only)
 */
router.post('/upload', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  const { title, category } = req.body;

  try {
    // 1. Upload to Supabase Storage Bucket
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('gallery_images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('gallery_images')
      .getPublicUrl(filePath);

    // 3. Insert record into database
    const { data: record, error: dbError } = await supabaseAdmin
      .from('gallery')
      .insert({
        title: title || 'Untitled',
        category: category || 'All',
        url: publicUrl,
        storage_path: filePath
      })
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json(record);
  } catch (error) {
    console.error('Gallery Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/gallery/:id
 * @desc    Delete a gallery image from storage and DB
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch record to get storage_path
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('gallery')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!record) return res.status(404).json({ error: 'Image not found' });

    // 2. Delete from Supabase Storage
    if (record.storage_path) {
      const { error: deleteStorageError } = await supabaseAdmin.storage
        .from('gallery_images')
        .remove([record.storage_path]);
      
      if (deleteStorageError) console.error('Storage Delete Warning:', deleteStorageError);
    }

    // 3. Delete from Database
    const { error: dbError } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    res.status(204).send();
  } catch (error) {
    console.error('Gallery Delete Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
