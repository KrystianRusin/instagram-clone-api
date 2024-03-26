const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

module.exports = router;
