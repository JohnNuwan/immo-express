const jwt = require('jsonwebtoken');
const config = require('../config');

// ========== JWT AUTH MIDDLEWARE ==========
// EVA · NODUS SYSTEMS — Authenticated route guard

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// ========== ADMIN MIDDLEWARE ==========
module.exports.requireAdmin = function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Accès administrateur requis' });
};