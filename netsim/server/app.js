require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const topologyRoutes = require('./routes/topologies');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // topology JSON can be large

// ── Routes ───────────────────────────────────────────────
// Auth routes are public (no JWT required)
app.use('/api/auth', authRoutes);

// Topology routes are protected (JWT required)
app.use('/api/topologies', authMiddleware, topologyRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────
// Covers checklist item 9: internal details stay in terminal, users see clean message.
app.use((err, req, res, next) => {
  console.error(err.stack); // internal log only
  res.status(500).json({ message: 'Something went wrong.' });
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('[' + new Date().toISOString() + '] NetSim server running on http://localhost:' + PORT);
});
