const express = require('express');
const router = express.Router();
const FuelPrice = require('../models/FuelPrice');

router.get('/', async (req, res) => {
  try {
    const prices = await FuelPrice.find().sort({ day: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fuel prices', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { day, price } = req.body;
    const fuelPrice = await FuelPrice.findOneAndUpdate(
      { day },
      { price },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(fuelPrice);
  } catch (error) {
    res.status(400).json({ message: 'Error saving fuel price', error: error.message });
  }
});

module.exports = router;