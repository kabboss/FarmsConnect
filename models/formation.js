const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    audioUrl: { type: String },
    category: { type: String },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Formation = mongoose.model('Formation', formationSchema);
module.exports = Formation;
