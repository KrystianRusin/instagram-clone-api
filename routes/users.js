const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { ObjectId } = require("mongodb");

router.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findOne({ _id: id });
    res.json(user);
  } catch (error) {
    res.json({ message: "An error occurred while fetching user data" });
  }
});

module.exports = router;
