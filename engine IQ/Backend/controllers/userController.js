const User = require("../models/User");

/**
 * POST /api/users/sync
 * Creates or updates a user record from Firebase auth data.
 */
exports.syncUser = async (req, res) => {
  try {
    const { googleId, email, name, photoURL } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ error: "googleId and email required" });
    }

    const user = await User.findOneAndUpdate(
      { googleId },
      { googleId, email, name, photoURL },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
