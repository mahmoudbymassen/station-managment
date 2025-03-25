const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['Car Wash', 'Oil Change', 'Tire Service', 'Store Sales'] 
  },
  revenue: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  date: { 
    type: Date, 
    required: true 
  },
  stationId: { 
    type: Number, 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);