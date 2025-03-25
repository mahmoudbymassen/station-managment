const express = require('express');
const router = express.Router();
const Pompe = require('../models/Pompe');
const Citerne = require('../models/Citerne');
const authMiddleware = require('../middleware/authMiddleware'); // Add this

// Get all pumps with linked tank info (filtered for managers)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let pumps;
    if (req.user.role === 'manager') {
      const tanks = await Citerne.find({ Station: req.user.stationId });
      if (tanks.length === 0) {
        return res.json([]); // No tanks, no pumps
      }
      const tankIds = tanks.map(tank => tank.IdCiterne);
      pumps = await Pompe.find({ IdCiterne: { $in: tankIds } });
    } else {
      pumps = await Pompe.find();
    }

    const pumpsWithTankInfo = await Promise.all(
      pumps.map(async (pump) => {
        const tank = await Citerne.findOne({ IdCiterne: pump.IdCiterne });
        if (!tank) {
          console.warn(`Pump ${pump.IdPompe} references non-existent tank ${pump.IdCiterne}`);
          return null; // Exclude invalid pumps
        }
        return {
          ...pump.toObject(),
          TypeCarburant: tank.TypeCarburant
        };
      })
    );
    res.json(pumpsWithTankInfo.filter(pump => pump !== null));
  } catch (error) {
    console.error('Error fetching pumps:', error);
    res.status(500).json({ message: 'Error fetching pumps', error: error.message });
  }
});

// Add a new pump
router.post('/', authMiddleware, async (req, res) => {
  try {
    const pumpData = req.body;

    // Verify the tank exists and get its station
    const tank = await Citerne.findOne({ IdCiterne: pumpData.IdCiterne });
    if (!tank) {
      return res.status(400).json({ message: 'Invalid tank ID: Tank not found' });
    }

    if (req.user.role !== 'admin') { 
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const lastPump = await Pompe.findOne().sort({ IdPompe: -1 });
    const newId = lastPump ? lastPump.IdPompe + 1 : 1;

    const pump = new Pompe({
      IdPompe: newId,
      Numero: pumpData.Numero,
      Statut: pumpData.Statut,
      Debit: pumpData.Debit,
      IdCiterne: pumpData.IdCiterne
    });
    const savedPump = await pump.save();
    const pumpWithTank = {
      ...savedPump.toObject(),
      TypeCarburant: tank.TypeCarburant
    };
    res.status(201).json(pumpWithTank);
  } catch (error) {
    console.error('Error creating pump:', error); 
    res.status(400).json({ message: 'Error creating pump', error: error.message });
  }
});

// Update a pump
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid pump ID' });
    }

    const pump = await Pompe.findOne({ IdPompe: id });
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }

    // Check current tank's station
    const currentTank = await Citerne.findOne({ IdCiterne: pump.IdCiterne });
    if (req.user.role === 'manager' && currentTank.Station.toString() !== req.user.stationId) {
      return res.status(403).json({ message: 'Access denied: Can only edit pumps in your station' });
    }

    // Verify new tank if IdCiterne is updated
    if (req.body.IdCiterne) {
      const newTank = await Citerne.findOne({ IdCiterne: req.body.IdCiterne });
      if (!newTank) {
        return res.status(400).json({ message: 'Invalid tank ID: Tank not found' });
      }
      if (req.user.role === 'manager' && newTank.Station.toString() !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only link to tanks in your station' });
      }
    }

    const updatedPump = await Pompe.findOneAndUpdate(
      { IdPompe: id },
      {
        Numero: req.body.Numero,
        Statut: req.body.Statut,
        Debit: req.body.Debit,
        IdCiterne: req.body.IdCiterne
      },
      { new: true, runValidators: true }
    );
    const tank = await Citerne.findOne({ IdCiterne: updatedPump.IdCiterne });
    const pumpWithTank = {
      ...updatedPump.toObject(),
      TypeCarburant: tank ? tank.TypeCarburant : 'N/A'
    };
    res.json(pumpWithTank);
  } catch (error) {
    console.error('Error updating pump:', error); 
    res.status(400).json({ message: 'Error updating pump', error: error.message });
  }
});

// Delete a pump
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid pump ID' });
    }

    const pump = await Pompe.findOne({ IdPompe: id });
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }

    const tank = await Citerne.findOne({ IdCiterne: pump.IdCiterne });
    if (!tank) {
      return res.status(400).json({ message: 'Associated tank not found' });
    }

    if (req.user.role === 'manager' && tank.Station.toString() !== req.user.stationId) {
      return res.status(403).json({ message: 'Access denied: Can only delete pumps in your station' });
    }

    await Pompe.deleteOne({ IdPompe: id }); 
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pump:', error);
    res.status(500).json({ message: 'Error deleting pump', error: error.message });
  }
});

module.exports = router;