const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const postsRoutes = require("./posts");
const userRoutes = require("./users");

router.use("/auth", authRoutes);
router.use("/posts", postsRoutes);
router.use("/users", userRoutes);

// Route to handle fetching default avatar URL
router.get("/default-avatar", (req, res) => {
  console.log("yes");
  const defaultAvatarUrl =
    "https://firebasestorage.googleapis.com/v0/b/instagram-clone-af213.appspot.com/o/Default.png?alt=media";
  res.json({ defaultAvatarUrl });
});

router.get("/health", (req, res) => {
  res.json({ message: "Server is up and running" });
});

module.exports = router;
