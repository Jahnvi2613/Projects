// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json()); // to parse JSON request bodies

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ChandigarhUniversity";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define Product schema and model
const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  price: { type: Number, required: [true, "Price is required"], min: 0 },
  category: { type: String, required: [true, "Category is required"] }
});

const Product = mongoose.model("Product", productSchema);

// Routes

// Create a new product
app.post("/products", async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().exec();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update a product by ID
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

