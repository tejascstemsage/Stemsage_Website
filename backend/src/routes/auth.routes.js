const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user via Google Sign-In / Sign-Up
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    // Step 1: Validate credential existence
    if (!credential || typeof credential !== 'string' || !credential.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required.'
      });
    }

    // Step 2: Verify credential with Google
    let googlePayload;
    try {
      googlePayload = await verifyGoogleToken(credential);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google authentication.'
      });
    }

    // Step 3: Extract verified identity
    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      name,
      picture
    } = googlePayload;

    // Step 4: Require verified email
    if (emailVerified !== true) {
      return res.status(401).json({
        success: false,
        message: 'Google email address is not verified.'
      });
    }

    // Step 5: Account lookup by googleId first, then by email
    let user = await User.findOne({ googleId });
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (user) {
      // Step 10: Inactive user check
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'This account is inactive.'
        });
      }

      // Step 8: Existing user account handling
      if (user.authProvider === 'google') {
        user.googleId = googleId;
        if (name) user.name = name;
        if (!user.profilePicture && picture) user.profilePicture = picture;
        user.isEmailVerified = true;
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Local account conflict
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in using your existing login method.'
        });
      }
    } else {
      // Step 9: New Google user creation
      user = await User.create({
        name: name || 'Google User',
        email: email,
        gender: 'prefer_not_to_say',
        phone: '',
        role: 'user', // Always hardcoded to "user"
        authProvider: 'google',
        googleId: googleId,
        profilePicture: picture || '',
        isEmailVerified: true,
        isActive: true,
        lastLogin: new Date()
      });
    }

    // Generate STEMSAGE JWT
    const token = generateToken({
      userId: user._id,
      role: user.role
    });

    // Step 11: Return success response
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender || 'prefer_not_to_say',
          phone: user.phone || '',
          profilePicture: user.profilePicture || '',
          role: user.role || 'user',
          authProvider: user.authProvider || 'google',
          isEmailVerified: user.isEmailVerified ?? true
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google authentication.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender || 'prefer_not_to_say',
          phone: user.phone || '',
          profilePicture: user.profilePicture || '',
          role: user.role || 'user',
          authProvider: user.authProvider || 'local',
          isEmailVerified: user.isEmailVerified ?? true
        }
      }
    });
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.'
    });
  }
});

module.exports = router;
