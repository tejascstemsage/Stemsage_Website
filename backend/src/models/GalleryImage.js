const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: String,
  image: { type: String, required: true },
  imagePublicId: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
