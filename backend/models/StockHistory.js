const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  fuelLevel: {
    type: Number,
    required: true,
    min: 0,
  },
  lubricantLevel: {
    type: Number,
    required: true,
    min: 0,
  },
  consumption: {
    type: Number,
    required: true,
    min: 0,
  },
  losses: {
    type: Number,
    required: true,
    min: 0,
  },
  stationId: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('StockHistory', stockHistorySchema);