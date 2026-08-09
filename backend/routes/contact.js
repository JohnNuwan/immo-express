const express = require('express');
const db = require('../database');
const createRateLimiter = require('../middleware/rateLimiter');

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Trop de messages envoyés. Veuillez réessayer ultérieurement.'
});

const router = express.Router();

// POST /api/contact — submit a contact request (public)
router.post('/', contactLimiter, (req, res) => {
  const { bien_id, nom, email, telephone, message } = req.body;

  if (!nom || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  if (bien_id) {
    const bien = db.prepare('SELECT id FROM biens WHERE id = ?').get(bien_id);
    if (!bien) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }
  }

  db.prepare(
    'INSERT INTO contacts (bien_id, nom, email, telephone, message) VALUES (?, ?, ?, ?, ?)'
  ).run(bien_id || null, nom, email, telephone || null, message || null);

  res.status(201).json({ message: 'Message envoyé avec succès' });
});

module.exports = router;