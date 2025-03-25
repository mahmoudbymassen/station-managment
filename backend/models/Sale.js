const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  sales: {
    type: Number,
    required: true,
    min: 0,
  },
  product: {
    type: Number,
    required: true
  },
  station: {
    type: Number, 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);