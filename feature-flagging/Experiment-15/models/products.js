
const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  color: String,
  size: String,
  stock: Number
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  variants: [VariantSchema]
});

module.exports = mongoose.model("Product", ProductSchema);