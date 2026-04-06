const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const dns = require('dns');

// Force IPv4 for DNS resolution to avoid 'fetch failed' errors in some environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const classRoutes = require('./routes/classes');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const studyPackRoutes = require('./routes/studyPacks');
const assignmentsRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/materials', express.static(path.join(__dirname, '../uploads/materials')));
app.use('/uploads/slips', express.static(path.join(__dirname, '../uploads/slips')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/studypacks', studyPackRoutes);
app.use('/api/assignments', assignmentsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'EWAY LMS API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (err.stack) console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
