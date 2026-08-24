const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const LeaveType = require('../models/LeaveType');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// Apply authGuard to all leave routes
router.use(authGuard);

// POST /api/v1/leaves -> Apply for leave (protected)
router.post('/', async (req, res, next) => {
  try {
    const { leaveTypeId, fromDate, toDate, days, reason } = req.body;
    const employeeId = req.employee.id;

    // Validate required fields explicitly for clear error messaging
    if (!leaveTypeId || !fromDate || !toDate || days === undefined || days === null) {
      return res.status(400).json({
        success: false,
        message: 'leaveTypeId, fromDate, toDate, and days are required fields',
      });
    }

    const numDays = Number(days);
    if (isNaN(numDays) || numDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Days must be a valid number and at least 1',
      });
    }

    // Verify leave type exists
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leaveTypeId: Leave type not found',
      });
    }

    // Check employee and balance
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Validation: days <= employee.leaveBalance
    if (numDays > employee.leaveBalance) {
      return res.status(400).json({
        success: false,
        errorType: 'InsufficientLeaveBalance',
        message: `Leave request (${numDays} days) exceeds available leave balance (${employee.leaveBalance} days remaining)`,
        availableBalance: employee.leaveBalance,
        requestedDays: numDays,
      });
    }

    // Create LeaveRequest
    const newLeave = await LeaveRequest.create({
      employeeId,
      leaveTypeId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      days: numDays,
      reason: reason || '',
      status: 'pending',
    });

    // Deduct days from employee.leaveBalance
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $inc: { leaveBalance: -numDays } },
      { new: true, runValidators: true }
    );

    const populatedLeave = await LeaveRequest.findById(newLeave._id)
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .populate('employeeId', 'name email department designation');

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave,
      remainingLeaveBalance: updatedEmployee.leaveBalance,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaves/my -> Return the employee's own requests (protected)
router.get('/my', async (req, res, next) => {
  try {
    const employeeId = req.employee.id;

    const leaves = await LeaveRequest.find({ employeeId })
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/leaves -> Return all leave requests (for HR and Managers)
router.get('/', async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('employeeId', 'name email department designation role leaveBalance')
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/leaves/:id/status -> Manager approves/rejects a request (protected)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED = ['approved', 'rejected'];
    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed values are: ${ALLOWED.join(', ')}`,
      });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    const previousStatus = leave.status;
    leave.status = status;
    await leave.save();

    // If status changes to 'rejected' from pending/approved, restore the deducted days to employee's balance
    if (status === 'rejected' && previousStatus !== 'rejected') {
      await Employee.findByIdAndUpdate(leave.employeeId, {
        $inc: { leaveBalance: leave.days },
      });
    }

    const updatedLeave = await LeaveRequest.findById(id)
      .populate('employeeId', 'name email department designation')
      .populate('leaveTypeId', 'name maxDaysPerYear');

    return res.status(200).json({
      success: true,
      message: `Leave request marked as ${status}`,
      data: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
