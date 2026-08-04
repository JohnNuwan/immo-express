const express = require('express');
const db = require('../database');

const router = express.Router();

// POST /api/contact — submit a contact request (public)
router.post('/', (req, res) => {
  const { bien_id, nom, email, telephone, message } = req.body;

  if (!nom || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
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