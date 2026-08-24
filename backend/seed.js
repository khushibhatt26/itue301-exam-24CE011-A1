require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const LeaveType = require('./models/LeaveType');
const LeaveRequest = require('./models/LeaveRequest');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leave_management');
    console.log('[MongoDB Connected for Seeding]');

    // Clear existing data
    await LeaveRequest.deleteMany({});
    await LeaveType.deleteMany({});
    await Employee.deleteMany({});
    console.log('[Cleared Existing Records]');

    // 1. Seed Leave Types (Must match enum: Casual, Sick, Earned, CompOff)
    const leaveTypes = await LeaveType.insertMany([
      { name: 'Casual', maxDaysPerYear: 12 },
      { name: 'Sick', maxDaysPerYear: 10 },
      { name: 'Earned', maxDaysPerYear: 15 },
      { name: 'CompOff', maxDaysPerYear: 5 },
    ]);
    console.log(`[Seeded ${leaveTypes.length} Leave Types]`);

    // 2. Seed Employees
    const hashedPassword = await bcrypt.hash('password123', 10);

    const employees = await Employee.insertMany([
      {
        name: 'Rahul Sharma',
        email: 'rahul@techsolutions.com',
        password: hashedPassword,
        department: 'Engineering',
        designation: 'Senior Full Stack Developer',
        role: 'employee',
        leaveBalance: 16,
      },
      {
        name: 'Priya Patel',
        email: 'priya@techsolutions.com',
        password: hashedPassword,
        department: 'Engineering',
        designation: 'Engineering Manager',
        role: 'manager',
        leaveBalance: 20,
      },
      {
        name: 'Sneha Verma',
        email: 'sneha@techsolutions.com',
        password: hashedPassword,
        department: 'Human Resources',
        designation: 'HR Lead',
        role: 'hr',
        leaveBalance: 20,
      },
    ]);
    console.log(`[Seeded ${employees.length} Employees]`);

    // 3. Seed Sample Leave Requests for Rahul
    const casualType = leaveTypes.find((lt) => lt.name === 'Casual');
    const sickType = leaveTypes.find((lt) => lt.name === 'Sick');
    const earnedType = leaveTypes.find((lt) => lt.name === 'Earned');

    await LeaveRequest.insertMany([
      {
        employeeId: employees[0]._id,
        leaveTypeId: casualType._id,
        fromDate: new Date('2026-09-01'),
        toDate: new Date('2026-09-02'),
        days: 2,
        reason: 'Family function in hometown',
        status: 'approved',
      },
      {
        employeeId: employees[0]._id,
        leaveTypeId: sickType._id,
        fromDate: new Date('2026-09-10'),
        toDate: new Date('2026-09-11'),
        days: 2,
        reason: 'Viral fever and doctor consultation',
        status: 'pending',
      },
      {
        employeeId: employees[0]._id,
        leaveTypeId: earnedType._id,
        fromDate: new Date('2026-08-10'),
        toDate: new Date('2026-08-12'),
        days: 3,
        reason: 'Annual vacation trip',
        status: 'rejected',
      },
    ]);
    console.log('[Seeded Sample Leave Requests]');

    console.log('\n=============================================');
    console.log(' SEEDING COMPLETE! Test Login Credentials:');
    console.log(' 1. Employee: rahul@techsolutions.com / password123');
    console.log(' 2. Manager:  priya@techsolutions.com / password123');
    console.log(' 3. HR Admin: sneha@techsolutions.com / password123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeding Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
