require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const billRoutes = require('./routes/billRoutes');

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

const KEEP_ALIVE_ENABLED = process.env.KEEP_ALIVE_ENABLED !== 'false';
const keepAliveHoursRaw = Number(process.env.KEEP_ALIVE_INTERVAL_HOURS || 1);
const KEEP_ALIVE_INTERVAL_HOURS = Number.isFinite(keepAliveHoursRaw) && keepAliveHoursRaw > 0
  ? keepAliveHoursRaw
  : 1;
const KEEP_ALIVE_INTERVAL_MS = KEEP_ALIVE_INTERVAL_HOURS * 60 * 60 * 1000;
const KEEP_ALIVE_LOG_THROTTLE_MS = 60 * 60 * 1000;

const startKeepAlive = () => {
  if (!KEEP_ALIVE_ENABLED) return;

  const keepAliveUrl = process.env.KEEP_ALIVE_URL || `http://127.0.0.1:${PORT}/api/health`;
  let lastWarnAt = 0;
  const warnOncePerHour = (message) => {
    const now = Date.now();
    if (now - lastWarnAt >= KEEP_ALIVE_LOG_THROTTLE_MS) {
      console.warn(message);
      lastWarnAt = now;
    }
  };

  const ping = async () => {
    try {
      const res = await fetch(keepAliveUrl);
      if (!res.ok) {
        warnOncePerHour(`[keep-alive] Health ping returned ${res.status}`);
      }
    } catch (err) {
      warnOncePerHour('[keep-alive] Failed to ping health endpoint');
    }
  };

  // Run once shortly after boot, then at the configured interval (default: 1 hour)
  setTimeout(ping, 15000);
  setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startKeepAlive();
});

module.exports = app;
