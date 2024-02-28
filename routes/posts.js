const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const params = {
  Bucket: process.env.AWS_BUCKET_NAME,
};

router.post("/create", upload.single("image"), async (req, res) => {
  s3.listObjects(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
  // use multer middleware
  const { user, comment } = req.body;
  //const image = req.file.path; // get the path of the uploaded file

  const post = new Post({
    user,
    comment,
    // image, // store the path in the database
    Date: new Date(),
  });
  await post.save();
  res.json({ post });
});

module.exports = router;
