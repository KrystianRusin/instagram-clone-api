const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/create", upload.single("image"), async (req, res) => {
  // use multer middleware
  const { user, comment } = req.body;
  const image = req.file.path; // get the path of the uploaded file

  const post = new Post({
    user,
    comment,
    image, // store the path in the database
    Date: new Date(),
  });
  await post.save();
  res.json({ post });
});

module.exports = router;
