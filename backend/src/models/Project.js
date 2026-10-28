const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'My room design', maxlength: 120 },
  originalImage: { type: String, required: true },
  previewImage: { type: String, required: true },
  polygon: [{ x: Number, y: Number }],
  color: { name: String, hex: String },
  opacity: { type: Number, min: 0, max: 1, default: 0.65 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Project', projectSchema);
