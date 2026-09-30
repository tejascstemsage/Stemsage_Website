const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const { uploadSingleProfilePicture } = require('../middleware/upload.middleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

/**
 * @route   PUT /api/users/me
 * @desc    Update current authenticated user's profile
 * @access  Private
 */
router.put('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch fresh user from DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, gender, profilePicture } = req.body;

    // Validate and update fields if supplied
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters.'
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Phone must be a valid string.'
        });
      }
      user.phone = phone.trim();
    }

    if (gender !== undefined) {
      const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender value.'
        });
      }
      user.gender = gender;
    }

    if (profilePicture !== undefined) {
      if (typeof profilePicture !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Profile picture must be a valid URL string.'
        });
      }
      user.profilePicture = profilePicture.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          phone: user.phone || '',
          profilePicture: user.profilePicture || '',
          role: user.role,
          authProvider: user.authProvider,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating user profile.'
    });
  }
});

/**
 * @route   POST /api/users/me/profile-picture
 * @desc    Upload user profile photo to Cloudinary and update profilePicture field
 * @access  Private
 */
router.post('/me/profile-picture', protect, uploadSingleProfilePicture, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldProfilePictureUrl = user.profilePicture;

    // Upload new image buffer to Cloudinary first
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'stemsage/profile-pictures');

    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary.'
      });
    }

    const newProfilePictureUrl = uploadResult.secure_url;

    // Save Cloudinary secure_url to user profile in MongoDB
    user.profilePicture = newProfilePictureUrl;
    await user.save();

    // After successful save, clean up old Cloudinary image if it exists and belongs to Cloudinary
    if (oldProfilePictureUrl && oldProfilePictureUrl !== newProfilePictureUrl) {
      deleteFromCloudinary(oldProfilePictureUrl).catch((err) => {
        console.error('Non-blocking error deleting old Cloudinary image:', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          phone: user.phone || '',
          profilePicture: user.profilePicture || '',
          role: user.role,
          authProvider: user.authProvider,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error uploading profile picture.'
    });
  }
});

module.exports = router;
