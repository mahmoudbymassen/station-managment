const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const Delivery = require('../models/Delivery');
const StockHistory = require('../models/StockHistory');
const Station = require('../models/Station');
const authMiddleware = require('../middleware/authMiddleware');

// Get stock (filtered by station for managers)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      query.stationId = managerStation.IdStation;
    }
    const stocks = await Stock.find(query);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Error fetching stock', error: error.message });
  }
});

// Get deliveries (filtered by station for managers)
router.get('/deliveries', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      query.stationId = managerStation.IdStation;
    }
    const deliveries = await Delivery.find(query).sort({ scheduledDate: -1 });
    console.log('Fetched deliveries:', JSON.stringify(deliveries, null, 2));
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
  }
});

// Add stock (restricted to manager's station)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { item, level, capacity, stationId } = req.body;
    if (!['Fuel', 'Lubricant'].includes(item) || typeof level !== 'number' || level < 0 || !stationId) {
      return res.status(400).json({ message: 'Invalid stock data' });
    }

    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      if (parseInt(stationId) !== managerStation.IdStation) {
        return res.status(403).json({ message: 'Access denied: Can only add stock for your station' });
      }
    }

    const stock = await Stock.findOneAndUpdate(
      { item, stationId },
      { level, capacity, updatedAt: Date.now() },
      { upsert: true, new: true, runValidators: true }
    );

    const historyEntry = new StockHistory({
      fuelLevel: item === 'Fuel' ? level : (await Stock.findOne({ item: 'Fuel', stationId })?.level || 0),
      lubricantLevel: item === 'Lubricant' ? level : (await Stock.findOne({ item: 'Lubricant', stationId })?.level || 0),
      consumption: 0,
      losses: 0,
      stationId,
    });
    await historyEntry.save();

    res.status(201).json(stock);
  } catch (error) {
    console.error('Error saving stock:', error);
    res.status(400).json({ message: 'Error saving stock', error: error.message });
  }
});

// Schedule delivery (restricted to manager's station)
router.post('/deliveries', authMiddleware, async (req, res) => {
  try {
    const { item, amount, supplier, scheduledDate, confirmed, stationId } = req.body;
    if (!['Fuel', 'Lubricant'].includes(item) || !amount || !supplier || !scheduledDate || !stationId) {
      return res.status(400).json({ message: 'Invalid delivery data' });
    }

    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      if (parseInt(stationId) !== managerStation.IdStation) {
        return res.status(403).json({ message: 'Access denied: Can only schedule deliveries for your station' });
      }
    }

    const delivery = new Delivery({ item, amount, supplier, scheduledDate, confirmed, stationId });
    await delivery.save();

    const currentStock = await Stock.findOne({ item, stationId });
    const newLevel = (currentStock?.level || 0) + amount;
    const capacity = currentStock?.capacity || (item === 'Fuel' ? 10000 : 5000);

    const updatedStock = await Stock.findOneAndUpdate(
      { item, stationId },
      { level: newLevel, capacity, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    const historyEntry = new StockHistory({
      fuelLevel: item === 'Fuel' ? newLevel : (await Stock.findOne({ item: 'Fuel', stationId })?.level || 0),
      lubricantLevel: item === 'Lubricant' ? newLevel : (await Stock.findOne({ item: 'Lubricant', stationId })?.level || 0),
      consumption: 0,
      losses: 0,
      stationId,
    });
    await historyEntry.save();

    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error scheduling delivery:', error);
    res.status(400).json({ message: 'Error scheduling delivery', error: error.message });
  }
});

module.exports = router;