const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  IdFournisseur: {
    type: Number,
    required: true,
    unique: true
  },
  NomFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  AdresseFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  TelephoneFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  EmailFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  VilleFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ContactFournisseur: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  Statut: { 
    type: String,
    required: true,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fournisseur', fournisseurSchema);