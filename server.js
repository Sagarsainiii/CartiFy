const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "cartify_secret",
    resave: false,
    saveUninitialized: false,
  })
);

mongoose
  .connect("mongodb://127.0.0.1:27017/CartiFy")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);
app.use("/", profileRoutes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});