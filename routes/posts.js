const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const sharp = require("sharp");
const Comment = require("../models/Comment");
const User = require("../models/User");
require("dotenv").config();

const { bucket } = require("../util/firebaseSetup");

// Route to handle creating a new post
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

// Route to handle fetching all posts
router.get("/feed/:_id", async (req, res) => {
  console.log("Fetching posts");
  const userId = req.params._id;

  // Fetch the current user's data
  const currentUser = await User.findById(userId);

  // Get the list of users the current user is following
  const following = currentUser.following;

  // Fetch posts from users the current user is following
  const posts = await Post.find({ user: { $in: following } })
    .sort({ Date: -1 }) // Sort by date in descending order
    .populate("user", "username profilePic");

  res.json(posts);
});

// Route to handle fetching posts by user
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

// Route to handle creating a new comment
router.post("/comment", async (req, res) => {
  const { user, postId, text } = req.body;
  console.log(req.body);
  // Create a new comment
  const comment = new Comment({
    user,
    post: postId,
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

// Route to handle fetching comments by post
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

router.get("/:postId/commentTotal", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = post.comments.length;
    res.json(comments);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the comments" });
  }
});

module.exports = router;
