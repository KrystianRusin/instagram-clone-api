const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  username: String,
  password: String,
  profilePic: String,
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", UserSchema);
