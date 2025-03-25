const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); 

// Login route (for both admins and managers)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, stationId: user.stationId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user._id, role: user.role, stationId: user.stationId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add manager (admin only)
router.post('/manager', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const { email, password, stationId } = req.body;

    if (!email || !password || !stationId) {
      return res.status(400).json({ message: 'Email, password, and station ID are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      role: 'manager',
      stationId
    });

    await user.save();
    res.status(201).json({ message: 'Manager created successfully', userId: user._id });
  } catch (error) {
    console.error('Error adding manager:', error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all managers (admin only)
router.get('/managers', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const managers = await User.find({ role: 'manager' })
      .populate('stationId', 'NomStation IdStation');
    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error); 
    res.status(500).json({ message: 'Error fetching managers', error: error.message });
  }
});

module.exports = router;