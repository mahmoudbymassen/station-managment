const express = require('express');
const router = express.Router();
const Citerne = require('../models/Citerne');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query.Station = req.user.stationId;
    }
    const tanks = await Citerne.find(query).populate('Station', 'NomStation IdStation');
    res.json(tanks);
  } catch (error) {
    console.error('Error fetching tanks:', error);
    res.status(500).json({ message: 'Error fetching tanks', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') { 
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const tankData = req.body;

    const lastTank = await Citerne.findOne().sort({ IdCiterne: -1 });
    const newId = lastTank ? lastTank.IdCiterne + 1 : 1;

    const tank = new Citerne({
      IdCiterne: newId,
      Station: tankData.Station,
      Capacite: tankData.Capacite,
      DateInstallation: tankData.DateInstallation,
      TypeCarburant: tankData.TypeCarburant,
      Statut: tankData.Statut,
      CurrentLevel: tankData.CurrentLevel
    });
    const savedTank = await tank.save();
    res.status(201).json(savedTank);
  } catch (error) {
    console.error('Error creating tank:', error);
    res.status(400).json({ message: 'Error creating tank', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const tank = await Citerne.findOne({ IdCiterne: parseInt(req.params.id) });
    if (!tank) {
      return res.status(404).json({ message: 'Tank not found' });
    }

    if (req.user.role === 'manager') {
      if (tank.Station.toString() !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only edit tanks in your station' });
      }
      if (req.body.Station && req.body.Station !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Cannot change station' });
      }
    }

    const updatedTank = await Citerne.findOneAndUpdate(
      { IdCiterne: parseInt(req.params.id) },
      {
        Station: req.body.Station,
        Capacite: req.body.Capacite,
        DateInstallation: req.body.DateInstallation,
        TypeCarburant: req.body.TypeCarburant,
        Statut: req.body.Statut,
        CurrentLevel: req.body.CurrentLevel
      },
      { new: true, runValidators: true }
    );
    res.json(updatedTank);
  } catch (error) {
    console.error('Error updating tank:', error);
    res.status(400).json({ message: 'Error updating tank', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid tank ID' });
    }

    const tank = await Citerne.findOne({ IdCiterne: id });
    if (!tank) {
      return res.status(404).json({ message: 'Tank not found' });
    }

    if (req.user.role === 'manager') {
      if (tank.Station.toString() !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only delete tanks in your station' });
      }
    }

    await Citerne.deleteOne({ IdCiterne: id });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tank:', error);
    res.status(500).json({ message: 'Error deleting tank', error: error.message });
  }
});

module.exports = router;