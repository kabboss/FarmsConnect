const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    replies: [
        {
            username: String,
            content: String,
        }
    ]
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
