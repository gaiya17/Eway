/**
 * EWAY LMS Backend API
 * Core entry point for the Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dns = require('dns');
const path = require('path');
require('dotenv').config();

// Force IPv4 for DNS resolution to avoid 'fetch failed' errors in some environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const classRoutes = require('./routes/classes');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const assignmentsRoutes = require('./routes/assignments');
const attendanceRoutes = require('./routes/attendance');

const studyPacksRouter = require('./routes/study-packs');
const freeTutorialsRouter = require('./routes/free-tutorials');
const reportsRouter = require('./routes/reports');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

// Security and Logging Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Static Asset Routing
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/materials', express.static(path.join(__dirname, '../uploads/materials')));
app.use('/uploads/slips', express.static(path.join(__dirname, '../uploads/slips')));
app.use('/uploads/tutorials', express.static(path.join(__dirname, '../uploads/tutorials')));

// API Sub-route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use('/api/study-packs', studyPacksRouter);
app.use('/api/free-tutorials', freeTutorialsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);

/**
 * Root health check route
 */
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'EWAY LMS API is running...',
    version: '1.0.0'
  });
});

/**
 * Global Error Handling Middleware
 */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/**
 * Start the Express server
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  const host = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  console.log(`\n🚀 Server is running on ${host}`);
  console.log(`🏥 Health check manual: ${host}/api/auth/health (if available)\n`);
});

// Handle server initialization errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use by another process.`);
  } else {
    console.error('CRITICAL SERVER ERROR:', err);
  }
  process.exit(1);
});
