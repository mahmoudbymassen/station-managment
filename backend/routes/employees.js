const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = require('../models/employee');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query.stationId = req.user.stationId; // Restrict to manager's station
    }
    const employees = await Employee.find(query).populate('stationId', 'NomStation IdStation');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const employeeData = req.body;

    if (req.user.role === 'manager') {
      if (employeeData.stationId !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only add employees to your station' });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(employeeData.stationId)) {
      return res.status(400).json({ message: 'Invalid station ID' });
    }

    // Generate next IdEmploye
    const lastEmployee = await Employee.findOne().sort({ IdEmploye: -1 });
    const nextId = lastEmployee ? lastEmployee.IdEmploye + 1 : 1;
    employeeData.IdEmploye = nextId;

    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ IdEmploye: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user.role === 'manager') {
      if (employee.stationId.toString() !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only edit employees in your station' });
      }
      if (req.body.stationId && req.body.stationId !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Cannot change station' });
      }
    }

    Object.assign(employee, req.body);
    await employee.save();
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ IdEmploye: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user.role === 'manager') {
      if (employee.stationId.toString() !== req.user.stationId) {
        return res.status(403).json({ message: 'Access denied: Can only delete employees in your station' });
      }
    }

    await Employee.deleteOne({ IdEmploye: req.params.id }); 
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Error deleting employee:', error.stack); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;