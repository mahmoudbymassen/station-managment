const mongoose = require('mongoose');

const fuelPriceSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('FuelPrice', fuelPriceSchema);