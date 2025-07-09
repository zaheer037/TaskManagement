const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware"); // adjust path if needed

// Get all users (protected)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users }); // Wrap users in an object
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;