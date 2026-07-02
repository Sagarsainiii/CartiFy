const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  savedAddress: {
    fullname: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },
});

module.exports = mongoose.model("User", userSchema);