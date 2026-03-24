
const express = require("express");
const router = express.Router();
const Product = require("../models/products");

// sample data inserting
router.post("/seed", async (req, res) => {
  await Product.deleteMany({});
  const products = await Product.insertMany([
    {
      name: "T-Shirt",
      price: 499,
      category: "Clothing",
      variants: [
        { color: "Red", size: "M", stock: 20 },
        { color: "Blue", size: "L", stock: 15 }
      ]
    },
    {
      name: "Laptop",
      price: 55000,
      category: "Electronics",
      variants: [
        { color: "Silver", size: "15-inch", stock: 10 },
        { color: "Gray", size: "13-inch", stock: 5 }
      ]
    },
    {
      name: "Sneakers",
      price: 2999,
      category: "Footwear",
      variants: [
        { color: "White", size: "9", stock: 12 },
        { color: "Black", size: "10", stock: 7 }
      ]
    }
  ]);
  res.json(products);
});


router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// to filter by category
router.get("/category/:category", async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
});

// for variant details
router.get("/variant/:color", async (req, res) => {
  const products = await Product.find(
    { "variants.color": req.params.color },
    { name: 1, category: 1, "variants.$": 1 } 
  );
  res.json(products);
});

module.exports = router;