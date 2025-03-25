const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Present', 'On Leave', 'Absent'],
    default: 'Absent',
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);