const express = require('express');
const router = express.Router();
const Fournisseur = require('../models/Fournisseur');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Fournisseur.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

// Add a new supplier
router.post('/', async (req, res) => {
  try {
    const lastSupplier = await Fournisseur.findOne().sort({ IdFournisseur: -1 });
    const newId = lastSupplier ? lastSupplier.IdFournisseur + 1 : 1;

    const supplier = new Fournisseur({
      IdFournisseur: newId,
      NomFournisseur: req.body.NomFournisseur,
      AdresseFournisseur: req.body.AdresseFournisseur,
      TelephoneFournisseur: req.body.TelephoneFournisseur,
      EmailFournisseur: req.body.EmailFournisseur,
      VilleFournisseur: req.body.VilleFournisseur,
      ContactFournisseur: req.body.ContactFournisseur,
      Statut: req.body.Statut || 'Active'
    });
    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(400).json({ message: 'Error creating supplier', error: error.message });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }
    const supplier = await Fournisseur.findOneAndUpdate(
      { IdFournisseur: id },
      {
        NomFournisseur: req.body.NomFournisseur,
        AdresseFournisseur: req.body.AdresseFournisseur,
        TelephoneFournisseur: req.body.TelephoneFournisseur,
        EmailFournisseur: req.body.EmailFournisseur,
        VilleFournisseur: req.body.VilleFournisseur,
        ContactFournisseur: req.body.ContactFournisseur,
        Statut: req.body.Statut
      },
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error updating supplier', error: error.message });
  }
});

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }
    const supplier = await Fournisseur.findOneAndDelete({ IdFournisseur: id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
});

module.exports = router;