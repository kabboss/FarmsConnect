const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    level: String,
    filePath: String,
    type: { type: String, enum: ['video', 'audio'] },
    likes: { type: Number, default: 0 },
    uploadedBy: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now },
    newContent: { type: Boolean, default: true }
});

module.exports = mongoose.model('Content', ContentSchema);
