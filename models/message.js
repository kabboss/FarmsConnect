const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    replies: [
      {
        username: String,
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    timestamp: { type: Date, default: Date.now },
});
  
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
