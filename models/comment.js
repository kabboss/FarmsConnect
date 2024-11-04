const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    user: String,
    text: String,
    likes: { type: Number, default: 0 },
    datePosted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
