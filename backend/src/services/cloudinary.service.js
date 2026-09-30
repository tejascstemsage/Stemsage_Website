const cloudinary = require('../config/cloudinary');

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} fileBuffer - Image file buffer from multer memory storage.
 * @param {string} [folder='stemsage/profile-pictures'] - Target Cloudinary folder.
 * @returns {Promise<Object>} Resolves with Cloudinary upload result containing secure_url and public_id.
 */
const uploadToCloudinary = (fileBuffer, folder = 'stemsage/profile-pictures') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload_stream error details:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts public_id from a Cloudinary URL and deletes the asset from Cloudinary.
 * Safely ignores non-Cloudinary URLs (e.g., Google OAuth profile URLs).
 * @param {string} imageUrl - Image URL string.
 * @returns {Promise<boolean>} True if deleted or ignored, false if error occurred.
 */
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }

  // Check if URL is hosted on Cloudinary
  if (!imageUrl.includes('res.cloudinary.com')) {
    return false;
  }

  try {
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length < 2) {
      return false;
    }

    let publicIdWithExt = urlParts[1];
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');

    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

    if (!publicId) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error.message);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
