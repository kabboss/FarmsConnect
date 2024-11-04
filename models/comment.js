const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
