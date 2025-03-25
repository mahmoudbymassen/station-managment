const mongoose = require('mongoose');

const citerneSchema = new mongoose.Schema({
  IdCiterne: {
    type: Number,
    required: true,
    unique: true
  },
  Station: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  Capacite: {
    type: Number,
    required: true
  },
  DateInstallation: {
    type: Date,
    required: true
  },
  TypeCarburant: {
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
    enum: ['Operational', 'Maintenance', 'Out of Service']
  },
  CurrentLevel: { 
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Citerne', citerneSchema);