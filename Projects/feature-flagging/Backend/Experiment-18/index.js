// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");

const app = express();
app.use(bodyParser.json());

// Configuration (change SECRET in production)
const MONGO_URI = "mongodb://127.0.0.1:27017/bankDB";
const JWT_SECRET = "replace_this_with_a_strong_secret_in_prod";
const JWT_EXPIRES_IN = "2h";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" Connected to MongoDB"))
  .catch(err => console.error(" MongoDB connection error:", err));

// User schema & model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.methods.toSafeObject = function() {
  const { _id, name, email, balance } = this;
  return { _id, name, email, balance };
};

const User = mongoose.model("User", userSchema);

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization header format" });
  }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// --------------------
// Auth endpoints
// --------------------

// Register: create a new user (email/password)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, initialBalance } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name, email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      balance: typeof initialBalance === "number" ? initialBalance : 0
    });
    await user.save();
    return res.status(201).json({ message: "User created", user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating user" });
  }
});

// Login: returns JWT
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error logging in" });
  }
});

// --------------------
// Seed endpoint (create sample users: Alice & Bob)
// --------------------
// NOTE: This route is provided for quick testing to match your screenshots.
// In production, remove or protect this route.
app.post("/create-users", async (req, res) => {
  try {
    // If the users already exist, return them
    const alice = await User.findOne({ email: "alice@example.com" });
    const bob = await User.findOne({ email: "bob@example.com" });
    if (alice && bob) {
      return res.status(200).json({
        message: "Users already exist",
        users: [alice.toSafeObject(), bob.toSafeObject()]
      });
    }

    // Create two users with simple passwords for testing only
    const aHash = await bcrypt.hash("alicepassword", 10);
    const bHash = await bcrypt.hash("bobpassword", 10);

    const users = await User.insertMany([
      { name: "Alice", email: "alice@example.com", passwordHash: aHash, balance: 1000 },
      { name: "Bob", email: "bob@example.com", passwordHash: bHash, balance: 500 },
    ]);

    return res.status(201).json({
      message: "Users created",
      users: users.map(u => u.toSafeObject())
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating users" });
  }
});

// --------------------
// Transfer endpoint (protected)
// --------------------
app.post("/transfer", authMiddleware, async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;

    // Basic validation
    if (!fromUserId || !toUserId || (typeof amount !== "number")) {
      return res.status(400).json({ message: "Missing required fields or invalid amount. Provide fromUserId, toUserId and numeric amount." });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!Types.ObjectId.isValid(fromUserId) || !Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Invalid user id(s)" });
    }

    // Prevent user from transferring from other users' accounts
    if (req.user.id !== fromUserId) {
      return res.status(403).json({ message: "You may only initiate transfers from your own account" });
    }

    // Load both users
    const [sender, receiver] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Sequential updates without DB transactions:
    sender.balance -= amount;
    receiver.balance += amount;

    // Save sender then receiver (sequential save)
    await sender.save();
    await receiver.save();

    return res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error processing transfer" });
  }
});

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));