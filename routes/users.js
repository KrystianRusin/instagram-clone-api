const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
require("dotenv").config();

const { bucket } = require("../util/firebaseSetup");

router.get("/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username: { $eq: username } }).populate(
      "posts"
    );
    res.json(user);
  } catch (error) {
    res.json({ message: "An error occurred while fetching user data" });
  }
});

router.get("/id/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    res.json(user);
  } catch (error) {
    res.json({ message: "An error occurred while fetching user data" });
  }
});

router.get("/search/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  try {
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    });
    res.json(users);
  } catch (error) {
    res.json({ message: "An error occurred while searching for users" });
  }
});

router.put("/:userId/follow", async (req, res) => {
  const { userId } = req.params;
  const { followerId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { followers: followerId },
      { new: true }
    );
    const follower = await User.findByIdAndUpdate(
      followerId,
      { following: userId },
      { new: true }
    );
    res.json({ user, follower });
  } catch (error) {
    res.json({ message: "An error occurred while updating followers" });
  }
});

router.put("/:userId/unfollow", async (req, res) => {
  const { userId } = req.params;
  const { followerId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { followers: followerId } },
      { new: true }
    );
    const follower = await User.findByIdAndUpdate(
      followerId,
      { $pull: { following: userId } },
      { new: true }
    );
    res.json({ user, follower });
  } catch (error) {
    res.json({ message: "An error occurred while updating followers" });
  }
});

router.put("/:userId/update", upload.single("avatar"), async (req, res) => {
  const { userId } = req.params;
  const { bio } = req.body;
  const file = req.file; // this is the uploaded avatar file
  console.log("USERID ", userId);
  console.log(file);
  console.log("BIO ", bio);
  try {
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

      // Update the user document with the new bio and profilePic
      const user = await User.findByIdAndUpdate(
        userId,
        { bio, profilePic: publicUrl },
        { new: true }
      );

      res.json(user);
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.json({ message: "An error occurred while updating user data" });
  }
});

module.exports = router;
