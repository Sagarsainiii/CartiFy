const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

router.get("/profile", async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.redirect("/login");
  }

  const user = await User.findById(sessionUser._id);
  const orders = await Order.find({ userId: sessionUser._id });

  let ordersHtml = "";

  if (orders.length === 0) {
    ordersHtml = "<p>No orders yet</p>";
  } else {
    orders.forEach((order) => {
      ordersHtml += `
        <div style="margin-top:15px; text-align:left;">
          <h3>Order Total: ₹${order.total}</h3>
          <p>Ordered on: ${new Date(order.createdAt).toLocaleString()}</p>
          <hr>
        </div>
      `;
    });
  }

  const addr = user.savedAddress || {};

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/css/style.css">
      <title>Profile</title>
    </head>
    <body>
      <div class="center-box" style="width:650px;">
        <h1>User Profile</h1>
        <br>
        <p><b>Name:</b> ${user.name}</p>
        <p><b>Email:</b> ${user.email}</p>

        <br>
        <h2>Saved Address</h2>
        <p>${addr.fullname || ""}</p>
        <p>${addr.phone || ""}</p>
        <p>${addr.address || ""}</p>
        <p>${addr.city || ""} - ${addr.pincode || ""}</p>

        <br>
        <h2>My Orders</h2>
        ${ordersHtml}

        <br>
        <a class="btn" href="/logout">Logout</a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;