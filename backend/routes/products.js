const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Produit.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Add product
router.post('/', async (req, res) => {
  try {
    const { IdProduit, NomProduit, Type, Date_ajout, Unite } = req.body;

    // Validate required fields
    const requiredFields = {
      IdProduit: 'Product ID is required',
      NomProduit: 'Product Name is required',
      Type: 'Type is required',
      Date_ajout: 'Date Added is required',
      Unite: 'Unit is required'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
        return res.status(400).json({ message });
      }
    }

    const product = new Produit({
      IdProduit,
      NomProduit,
      Type,
      Date_ajout,
      Unite
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Produit.findOneAndUpdate(
      { IdProduit: id },
      { NomProduit: req.body.NomProduit, Type: req.body.Type, Date_ajout: req.body.Date_ajout, Unite: req.body.Unite },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Produit.findOneAndDelete({ IdProduit: id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;