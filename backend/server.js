require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TechSolutions Employee Leave Management API (SET C)',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth/login',
      leaveTypes: '/api/v1/leave-types',
      leaves: '/api/v1/leaves',
      myLeaves: '/api/v1/leaves/my',
      patchStatus: '/api/v1/leaves/:id/status',
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leave-types', leaveTypeRoutes);
app.use('/api/v1/leaves', leaveRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server Running] http://localhost:${PORT}`);
});
