const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const postsRoutes = require("./posts");

router.use("/auth", authRoutes);
router.use("/posts", postsRoutes);

module.exports = router;
