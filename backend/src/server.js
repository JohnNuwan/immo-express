import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { json, urlencoded } from 'express';

// Routes
import authRoutes from './routes/auth.js';
import biensRoutes from './routes/biens.js';
import scoringRoutes from './routes/scoring.js';
import contactRoutes from './routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Trop de requêtes, réessayez plus tard' }
});
app.use('/api/', limiter);

// Static files (frontend)
const publicPath = path.join(__dirname, '..', '..');
app.use(express.static(publicPath, {
  setHeaders: (res, p) => {
    if (p.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/biens', biensRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/contact', contactRoutes);

// ===== Admin stats =====
import { getStats } from './db.js';

app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Erreur stats' });
  }
});

// ===== Health check =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    platform: 'NODUS SYSTEMS',
    agent: 'EVA',
    timestamp: new Date().toISOString()
  });
});

// ===== SPA fallback =====
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route API introuvable' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ===== Start =====
app.listen(PORT, () => {
  console.log(`🚀 Immo-Express NODUS API — port ${PORT}`);
  console.log(`📡 Version 2.0.0 · EVA Agent · NODUS SYSTEMS`);
});

export default app;