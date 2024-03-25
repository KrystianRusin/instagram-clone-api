const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/signup", async (req, res) => {
  const { email, fullName, username, password } = req.body;

  // check if username already exists in database, if not return error
  if (await User.exists({ username })) {
    return res.status(400).json({ message: "Username already exists" });
  }
  // check if email already exists in database, if not return error
  if (await User.exists({ email })) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    email,
    fullName,
    username,
    password: hashedPassword,
  });
  await user.save();
  res.json({ user });
});

router.post("/login", async (req, res) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.json({ err });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.json({ err });
      }
      return res.json({ user, message: "Login successful!" });
    });
  })(req, res);
});

module.exports = router;
