const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

/* ADD TO CART */
router.get("/add-to-cart/:id", async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  const existing = await Cart.findOne({
    userId: user._id,
    productId: req.params.id,
  });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
  } else {
    await Cart.create({
      userId: user._id,
      productId: req.params.id,
      quantity: 1,
    });
  }

  res.redirect("/cart");
});

/* CART PAGE */
router.get("/cart", async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  const items = await Cart.find({ userId: user._id });

  let total = 0;

  let html = `
    <html>
    <head>
      <link rel="stylesheet" href="/css/style.css">
      <title>Your Cart</title>
    </head>
    <body>
      <div class="cart-box">
        <h1>Your Cart</h1>
        <br>
  `;

  for (let item of items) {
    const product = await Product.findById(item.productId);

    if (product) {
      const subtotal = product.price * item.quantity;
      total += subtotal;

      html += `
        <div style="margin-bottom:20px;">
          <h3>${product.name}</h3>
          <p>Price: ₹${product.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Subtotal: ₹${subtotal}</p>
          <a class="btn" href="/remove-cart/${item._id}">Remove</a>
        </div>
        <hr>
      `;
    }
  }

  html += `
        <h2>Total: ₹${total}</h2>
        <br>
        <a class="btn" href="/checkout">Place Order</a>
        <a class="btn" href="/home">Back to Home</a>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

/* REMOVE ITEM */
router.get("/remove-cart/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  await Cart.findByIdAndDelete(req.params.id);
  res.redirect("/cart");
});

/* CHECKOUT PAGE */
router.get("/checkout", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/css/style.css">
      <title>Checkout</title>
    </head>
    <body>
      <div class="center-box">
        <h1>Delivery Address</h1>
        <br>
        <form method="POST" action="/place-order">
          <input type="text" name="fullname" placeholder="Full Name" required>
          <input type="text" name="phone" placeholder="Phone Number" required>
          <input type="text" name="address" placeholder="Full Address" required>
          <input type="text" name="city" placeholder="City" required>
          <input type="text" name="pincode" placeholder="Pincode" required>
          <br><br>
          <button type="submit">Confirm Order</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

/* PLACE ORDER */
router.post("/place-order", async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  const cartItems = await Cart.find({ userId: user._id });

  let total = 0;
  let orderItems = [];

  for (let item of cartItems) {
    const product = await Product.findById(item.productId);

    if (product) {
      total += product.price * item.quantity;

      orderItems.push({
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }
  }

  /* SAVE ORDER USER-WISE */
  await Order.create({
    userId: user._id,
    items: orderItems,
    total: total,
    address: {
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
    },
  });

  /* SAVE ADDRESS IN USER PROFILE */
  await User.findByIdAndUpdate(user._id, {
    savedAddress: {
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
    },
  });

  /* CLEAR USER CART */
  await Cart.deleteMany({ userId: user._id });

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="center-box">
        <h1>✅ Order Placed Successfully</h1>
        <br>
        <p>Total Paid: ₹${total}</p>
        <p>Delivery: ${req.body.address}, ${req.body.city}</p>
        <br>
        <a class="btn" href="/home">Continue Shopping</a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;