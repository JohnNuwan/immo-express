const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const config = require('../config');
const authMiddleware = require('../middleware/auth');

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
      telephone: user.telephone,
      role: user.role,
    },
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, nom, prenom, telephone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  res.json({ user });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  const { nom, prenom, email, telephone, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "L'email est requis" });
  }

  // Check if email is taken by someone else
  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
  if (existing) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte' });
  }

  let updateQuery = 'UPDATE users SET nom = ?, prenom = ?, email = ?, telephone = ?';
  let params = [nom, prenom, email, telephone];

  if (password && password.length >= 6) {
    updateQuery += ', password = ?';
    params.push(bcrypt.hashSync(password, 10));
  } else if (password && password.length > 0 && password.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères' });
  }

  updateQuery += ' WHERE id = ?';
  params.push(req.user.id);

  db.prepare(updateQuery).run(...params);

  const updatedUser = db.prepare('SELECT id, email, nom, prenom, telephone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: 'Profil mis à jour', user: updatedUser });
});

module.exports = router;