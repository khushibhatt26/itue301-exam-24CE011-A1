const express = require('express');
const LeaveType = require('../models/LeaveType');

const router = express.Router();

// GET /api/v1/leave-types -> Return all leave types (public)
router.get('/', async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: leaveTypes.length,
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
