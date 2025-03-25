const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const authMiddleware = require('../middleware/authMiddleware');

// Get all stations (managers see only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let stations;
    if (req.user.role === 'manager') {
      stations = await Station.find({ _id: req.user.stationId });
    } else {
      stations = await Station.find();
    }
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ message: 'Error fetching stations', error: error.message });
  }
});

// Add a new station (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only admins can add stations' });
    }
    const {
      IdStation,
      NomStation,
      AdresseStation,
      VilleStation,
      DateMiseEnService,
      Latitude,
      Longitude,
      Telephone,
      Email,
      HorairesOuverture,
      Statut,
    } = req.body;

    if (!IdStation || !NomStation || !AdresseStation || !VilleStation || !DateMiseEnService || !Latitude || !Longitude) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const existingStation = await Station.findOne({ IdStation });
    if (existingStation) {
      return res.status(400).json({ message: 'Station ID already exists' });
    }

    const station = new Station({
      IdStation,
      NomStation,
      AdresseStation,
      VilleStation,
      DateMiseEnService,
      Latitude,
      Longitude,
      Telephone,
      Email,
      HorairesOuverture,
      Statut: Statut || 'Active',
    });
    await station.save();
    res.status(201).json(station);
  } catch (error) {
    console.error('Error adding station:', error);
    res.status(400).json({ message: 'Error adding station', error: error.message });
  }
});

// Update a station (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only admins can edit stations' });
    }
    const {
      IdStation,
      NomStation,
      AdresseStation,
      VilleStation,
      DateMiseEnService,
      Latitude,
      Longitude,
      Telephone,
      Email,
      HorairesOuverture,
      Statut,
    } = req.body;

    if (!IdStation || !NomStation || !AdresseStation || !VilleStation || !DateMiseEnService || !Latitude || !Longitude) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const station = await Station.findByIdAndUpdate(
      req.params.id,
      {
        IdStation,
        NomStation,
        AdresseStation,
        VilleStation,
        DateMiseEnService,
        Latitude,
        Longitude,
        Telephone,
        Email,
        HorairesOuverture,
        Statut,
      },
      { new: true, runValidators: true }
    );
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(400).json({ message: 'Error updating station', error: error.message });
  }
});

// Delete a station (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only admins can delete stations' });
    }
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(400).json({ message: 'Error deleting station', error: error.message });
  }
});

module.exports = router;