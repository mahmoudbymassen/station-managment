const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  IdProduit: {
    type: Number,
    required: true,
    unique: true
  },
  NomProduit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  Type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  Date_ajout: {
    type: Date,
    required: true
  },
  Unite: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }
}, { timestamps: true });

module.exports = mongoose.model('Produit', produitSchema);