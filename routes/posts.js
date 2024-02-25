const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { user, comment } = req.body;

  const post = new Post({
    user,
    comment,
    Date: new Date(),
  });
  await post.save();
  res.json({ post });
});

module.exports = router;
