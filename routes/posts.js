const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

router.post("/create", async (req, res) => {
  const { user, comment } = req.body;

  const post = new Post({
    user,
    comment,
    Date: new Date(),
  });

  await post.save();

  bucket.getFiles(function (err, files) {
    if (err) {
      console.error("Error connecting to Firebase:", err);
      return res.status(500).json({ error: "Error connecting to Firebase" });
    }

    console.log("Successfully connected to Firebase");
    res.json({ post, firebaseConnection: "successful" });
  });
});

module.exports = router;
