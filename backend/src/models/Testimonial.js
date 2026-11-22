const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['text', 'video'], default: 'text' },
  quote: String,
  videoSrc: String,
  avatar: String,
  avatarPublicId: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
