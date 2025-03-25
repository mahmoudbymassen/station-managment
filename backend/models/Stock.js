const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  item: { type: String, required: true, enum: ['Fuel', 'Lubricant'] },
  level: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 0 },
  stationId: { type: Number, required: true }, // Link to Station
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

stockSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Stock', stockSchema);