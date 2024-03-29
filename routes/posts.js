const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const admin = require("firebase-admin");
const sharp = require("sharp");
const Comment = require("../models/Comment");
const User = require("../models/User");
require("dotenv").config();

const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

router.post("/create", upload.single("image"), async (req, res) => {
  const { user, caption } = req.body;
  const file = req.file; // this is the uploaded image file

  const compressedImage = await sharp(file.path)
    .resize(800, 800, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Create a new blob in the bucket and upload the file data
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    console.error("Error uploading to Firebase:", err);
    return res.status(500).json({ error: "Error uploading to Firebase" });
  });

  blobStream.on("finish", async () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(blob.name)}?alt=media`;

    const post = new Post({
      user,
      caption,
      image: publicUrl, // store the image URL in the database
      Date: new Date(),
    });

    await post.save();

    //save post id to user posts array
    const userRecord = await User.findById(user);
    userRecord.posts.push(post._id);
    await userRecord.save();

    console.log("Successfully connected to Firebase");
    res.json({ post, firebaseConnection: "successful" });
  });

  blobStream.end(compressedImage); // Write the compressed image buffer to the blob stream
});

router.get("/feed", async (req, res) => {
  console.log("Fetching posts");
  const posts = await Post.find({})
    .sort({ Date: -1 })
    .populate("user", "username profilePic");
  res.json(posts);
});

router.post("/like", async (req, res) => {
  const { postId, userId } = req.body;

  const post = await Post.findById(postId);

  console.log(userId);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
  }
  const likes = post.likes.map((like) => like.toString());
  const operator = likes.includes(userId) ? "$pull" : "$addToSet";

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId },
    { [operator]: { likes: userId } },
    { new: true, runValidators: true }
  );
  res.json(updatedPost);
});

router.post("/comment", async (req, res) => {
  const { user, postId, text } = req.body;
  // Create a new comment
  const comment = new Comment({
    user,
    text,
    date: new Date(),
  });

  try {
    // Save the comment
    await comment.save();

    // Find the post and add the comment to the comments array
    const post = await Post.findById(postId);
    post.comments.push(comment._id);
    await post.save();

    res.json({ message: "Comment created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the comment" });
  }
});

router.get("/:postId/comment", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username profilePic",
      },
    });
    res.json(post.comments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the comments" });
  }
});

module.exports = router;
