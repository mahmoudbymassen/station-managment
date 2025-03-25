const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Station = require('../models/Station');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { day, sales, productId, stationId } = req.body;

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!day || !validDays.includes(day)) {
      return res.status(400).json({ message: 'Day is required and must be a valid day of the week' });
    }
    if (typeof sales !== 'number' || sales < 0 || isNaN(sales)) {
      return res.status(400).json({ message: 'Sales must be a non-negative number' });
    }
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: 'Valid Product ID is required' });
    }
    if (!stationId || isNaN(stationId)) {
      return res.status(400).json({ message: 'Valid Station ID is required' });
    }

    // For managers, map req.user.stationId (ObjectId) to IdStation (Number)
    let managerStationIdNum;
    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      managerStationIdNum = managerStation.IdStation;
      if (parseInt(stationId) !== managerStationIdNum) {
        return res.status(403).json({ message: 'Access denied: Can only add sales for your station' });
      }
    }

    const sale = new Sale({
      day,
      sales,
      product: parseInt(productId),
      station: parseInt(stationId),
    });

    const savedSale = await sale.save();
    console.log('Saved sale:', JSON.stringify(savedSale, null, 2));
    res.status(201).json(savedSale);
  } catch (error) {
    console.error('Error saving sales:', error);
    res.status(400).json({ message: 'Error saving sales', error: error.message });
  }
});

// Update GET for consistency
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      query.station = managerStation.IdStation;
    } else if (req.query.station) {
      query.station = parseInt(req.query.station);
    }
    const sales = await Sale.find(query).sort({ createdAt: -1 });
    console.log('Sales data being sent:', JSON.stringify(sales, null, 2));
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
});

module.exports = router;