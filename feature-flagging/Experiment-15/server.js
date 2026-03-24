const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const productsRouter = require("./routes/product");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(morgan("dev"));
app.use(cors());
app.use(express.json());


app.use("/api/products", productsRouter);

app.get("/", (req, res) => {
  res.send("E-commerce app running");
});

const MONGODB_URI = process.env.MONGODB_URI ;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected MongoDB");
    app.listen(PORT, () => console.log(`running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("MongoDB error:", err));