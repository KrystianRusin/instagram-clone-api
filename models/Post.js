const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  image: String,
  Date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);