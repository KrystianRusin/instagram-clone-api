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

module.exports = router;
