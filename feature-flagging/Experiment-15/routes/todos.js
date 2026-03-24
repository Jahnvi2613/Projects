const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/ChandigarhUniversity');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  variants: [
    {
      color: String,
      size: String,
      stock: Number
    }
  ]
});
const Product = mongoose.model('Product', productSchema);

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/products/category/:cat', async (req, res) => {
  const products = await Product.find({ category: req.params.cat });
  res.json(products);
});

app.get('/products/variants', async (req, res) => {
  const products = await Product.find({}, { name: 1, variants: 1 });
  res.json(products);
});

app.listen(3000, () => console.log('Server running on port 3000'));
