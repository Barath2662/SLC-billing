require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const billRoutes = require('./routes/billRoutes');
const { startKeepAliveJob } = require('./utils/keepAlive');

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '../static')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', message: 'Srii Lakshmi Cab Billing API is running' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'unavailable', message: 'Database is unavailable' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startKeepAliveJob(prisma);
});

module.exports = app;
