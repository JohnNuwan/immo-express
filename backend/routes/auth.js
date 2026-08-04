const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const config = require('../config');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, nom, prenom, telephone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email déjà utilisé' });
  }

  const hashed = bcrypt.hashSync(password, 10);

  const result = db.prepare(
    'INSERT INTO users (email, password, nom, prenom, telephone) VALUES (?, ?, ?, ?, ?)'
  ).run(email, hashed, nom || null, prenom || null, telephone || null);

  const token = jwt.sign(
    { id: result.lastInsertRowid, email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    token,
    user: { id: result.lastInsertRowid, email, nom, prenom },
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  res.json({
    message: 'Connexion réussie',
    token,
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    },
  });
});

module.exports = router;