const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  IdStation: { type: Number, required: true, unique: true },
  NomStation: { type: String, required: true },
  AdresseStation: { type: String, required: true },
  VilleStation: { type: String, required: true },
  DateMiseEnService: { type: Date, required: true },
  Latitude: { type: Number, required: true },
  Longitude: { type: Number, required: true },
  Telephone: { type: String },
  Email: { type: String },
  HorairesOuverture: { type: String },
  Statut: { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);