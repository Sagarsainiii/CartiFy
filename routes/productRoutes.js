const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/home", async (req, res) => {
  const search = req.query.search || "";

  const products = await Product.find({
    name: { $regex: search, $options: "i" },
  }).limit(20);

  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>CartiFy</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <nav class="navbar">
      <h1>🛒 CartiFy</h1>

      <form action="/home" method="GET" style="display:flex; gap:10px;">
        <input 
          type="text" 
          name="search" 
          placeholder="Search products..." 
          value="${search}"
          style="padding:10px; border-radius:8px; border:none; width:250px;"
        >
        <button class="btn" type="submit">Search</button>
      </form>

      <div>
        <a href="/cart">Cart</a>
        <a href="/profile">Profile</a>
        <a href="/logout">Logout</a>
      </div>
    </nav>

    <div class="container">
  `;

  products.forEach((product) => {
    html += `
      <div class="card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <a class="btn" href="/add-to-cart/${product._id}">
          Add to Cart
        </a>
      </div>
    `;
  });

  html += `
    </div>
  </body>
  </html>
  `;

  res.send(html);
});

module.exports = router;