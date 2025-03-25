const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  IdEmploye: { type: Number, unique: true },
  CINEmploye: { type: String, required: true, trim: true, maxlength: 50 },
  NomEmploye: { type: String, required: true, trim: true, maxlength: 100 },
  PrenomEmploye: { type: String, required: true, trim: true, maxlength: 100 },
  EmailEmploye: { 
    type: String, 
    required: [true, 'Email is required'], 
    trim: true, 
    maxlength: 100, 
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    unique: true
  },
  TeleEmploye: { type: String, trim: true, maxlength: 20 },
  GenreEmploye: { type: String, enum: ['M', 'F'], required: true },
  DateNaissanceEmploye: { type: Date, required: true },
  AdresseEmploye: { type: String, required: true, trim: true, maxlength: 255 },
  NationaliteEmploye: { type: String, required: true, trim: true, maxlength: 50 },
  StatutEmploye: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active', maxlength: 50 },
  CNSS: { type: String, trim: true, maxlength: 50 },
  TypeContrat: { type: String, required: true, trim: true },
  stationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Station', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);