const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Station = require('../models/Station');
const authMiddleware = require('../middleware/authMiddleware');

// Get all service records (filtered by station for managers)
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
    const services = await Service.find(query).sort({ date: -1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
});

// Add a new service record (restricted to manager's station)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, revenue, date, stationId } = req.body;
    if (!['Car Wash', 'Oil Change', 'Tire Service', 'Store Sales'].includes(type) || 
        typeof revenue !== 'number' || revenue < 0 || !date || !stationId) {
      return res.status(400).json({ message: 'Invalid service data' });
    }

    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      if (parseInt(stationId) !== managerStation.IdStation) {
        return res.status(403).json({ message: 'Access denied: Can only add services for your station' });
      }
    }

    const service = new Service({ type, revenue, date, stationId: parseInt(stationId) });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(400).json({ message: 'Error adding service', error: error.message });
  }
});

// Get summary of revenue by service type (filtered by station for managers)
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      const managerStation = await Station.findById(req.user.stationId);
      if (!managerStation) {
        return res.status(400).json({ message: 'Manager’s station not found' });
      }
      query.stationId = managerStation.IdStation;
    }
    const summary = await Service.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$revenue' }
        }
      },
      {
        $project: {
          type: '$_id',
          revenue: 1,
          _id: 0
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching service summary:', error);
    res.status(500).json({ message: 'Error fetching service summary', error: error.message });
  }
});

module.exports = router;