const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("❌ MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit the app if DB connection fails
  }
}

module.exports = { connectDB };