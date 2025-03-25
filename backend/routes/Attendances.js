const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/employee');
const authMiddleware = require('../middleware/authMiddleware'); 

// Get today's attendance (filtered by station for managers)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let query = {
      createdAt: { $gte: today, $lt: tomorrow },
    };

    if (req.user.role === 'manager') {
      const stationEmployees = await Employee.find({ stationId: req.user.stationId });
      const employeeIds = stationEmployees.map(emp => String(emp.IdEmploye));
      query.employeeId = { $in: employeeIds }; 
    }

    const records = await Attendance.find(query).populate('employeeId', 'stationId');
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// Check in (restricted to manager's station)
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { employeeId, employeeName, checkInTime } = req.body;
    if (!employeeId || !employeeName || !checkInTime) {
      return res.status(400).json({ message: 'employeeId, employeeName, and checkInTime are required' });
    }

    // Verify employee exists and belongs to manager's station (if manager)
    const employee = await Employee.findOne({ IdEmploye: employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (req.user.role === 'manager' && employee.stationId.toString() !== req.user.stationId) {
      return res.status(403).json({ message: 'Access denied: Can only check in employees in your station' });
    }

    let record = await Attendance.findOne({
      employeeId,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    if (record) {
      if (record.checkIn) {
        return res.status(400).json({ message: 'Employee already checked in today' });
      }
      record.checkIn = checkInTime;
      record.status = 'Present';
    } else {
      record = new Attendance({
        employeeId,
        employeeName,
        checkIn: checkInTime,
        status: 'Present',
      });
    }
    await record.save();
    res.status(200).json({ message: 'Checked in successfully', record });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// Check out (restricted to manager's station)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { employeeId, checkOutTime } = req.body;
    if (!employeeId || !checkOutTime) {
      return res.status(400).json({ message: 'employeeId and checkOutTime are required' });
    }

    // Verify employee exists and belongs to manager's station (if manager)
    const employee = await Employee.findOne({ IdEmploye: employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (req.user.role === 'manager' && employee.stationId.toString() !== req.user.stationId) {
      return res.status(403).json({ message: 'Access denied: Can only check out employees in your station' });
    }

    const record = await Attendance.findOne({
      employeeId,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'Employee has not checked in today' });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: 'Employee already checked out today' });
    }

    record.checkOut = checkOutTime;
    await record.save();
    res.status(200).json({ message: 'Checked out successfully', record });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
});

module.exports = router;