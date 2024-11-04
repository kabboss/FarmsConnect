// models/content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  filePath: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'video' or 'audio'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);
