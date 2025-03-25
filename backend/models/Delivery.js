const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  item: { type: String, required: true, enum: ['Fuel', 'Lubricant'] },
  amount: { type: Number, required: true, min: 0 },
  supplier: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  confirmed: { type: Boolean, default: false },
  stationId: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);