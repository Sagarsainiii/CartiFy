const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/signup", (req, res) => {
  res.sendFile("signup.html", { root: "./views" });
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  await User.create({
    name,
    email,
    password,
  });

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "./views" });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (!user) {
    return res.send("Invalid credentials");
  }

  req.session.user = user;
  res.redirect("/home");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;