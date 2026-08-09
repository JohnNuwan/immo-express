const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const biensRoutes = require('./routes/biens');
const scoringRoutes = require('./routes/scoring');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const opendataRoutes = require('./routes/opendata');
const favoritesRoutes = require('./routes/favorites');

const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/biens', biensRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opendata', opendataRoutes);
app.use('/api/favorites', favoritesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`🚀 Serveur ImmoExpress démarré sur http://localhost:${config.PORT}`);
  });
}

module.exports = app;