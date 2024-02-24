const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

const session = require("express-session");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post("/signup", async (req, res) => {
  const { email, fullName, username, password } = req.body;

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

app.post("/login", async (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.json({ err });
    }
    if (!user) {
      return res.json({ info });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.json({ err });
      }
      return res.json({ user, message: "Login successful!" });
    });
  })(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
