const mongoose = require('mongoose');

const pompeSchema = new mongoose.Schema({
  IdPompe: {
    type: Number,
    required: true,
    unique: true
  },
  Numero: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  Statut: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    enum: ['Active', 'Inactive', 'Maintenance']
  },
  Debit: {
    type: Number,
    required: true,
    min: 0
  },
  IdCiterne: { 
    type: Number,
    required: true,
    ref: 'Citerne', 
    refPath: 'IdCiterne' 
  }
}, {
  timestamps: true
});

pompeSchema.virtual('citerne', {
  ref: 'Citerne',
  localField: 'IdCiterne',
  foreignField: 'IdCiterne',
  justOne: true
});

module.exports = mongoose.model('Pompe', pompeSchema);