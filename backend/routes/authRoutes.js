const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// POST /api/v1/auth/login -> Authenticate employee, issue token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const payload = {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey_itue301_2026',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me -> Get current logged-in employee profile
router.get('/me', authGuard, async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.employee.id).select('-password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
