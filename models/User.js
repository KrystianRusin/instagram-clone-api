const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  username: String,
  password: String,
  profilePic: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/instagram-clone-af213.appspot.com/o/Default.png?alt=media",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  bio: { type: String, default: "" },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", UserSchema);
