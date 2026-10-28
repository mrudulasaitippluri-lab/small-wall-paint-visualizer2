const mongoose = require('mongoose');
const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  hex: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
  category: { type: String, default: 'Neutral' },
  finish: { type: String, default: 'Matte' },
  brand: { type: String, default: 'Custom' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Color', colorSchema);
