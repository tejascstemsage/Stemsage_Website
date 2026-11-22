const express = require('express');
const { protect, requireAdmin } = require('../middleware/auth.middleware');
const { uploadSingleImage } = require('../middleware/upload.middleware');
const { uploadToCloudinary } = require('../services/cloudinary.service');
const router = express.Router();

// Upload single image with multer (field name: 'file', 5MB limit, image filter)
// This is for admin upload forms
router.post(
  '/',
  protect,
  requireAdmin,
  uploadSingleImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload buffer to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, 'stemsage');

      return res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id
        }
      });
    } catch (error) {
      console.error('Upload image error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;