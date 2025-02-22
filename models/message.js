<<<<<<< HEAD
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    replies: [
        {
            username: String,
            content: String,
        }
    ],
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }, // Ajout du champ "likes"
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
=======
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
>>>>>>> 84bac2ee8b9f7287469aeddbef280046d0866b48
