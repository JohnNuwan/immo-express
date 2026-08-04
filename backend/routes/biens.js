const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/biens — list all (public)
router.get('/', (req, res) => {
  const { type, ville, statut, min_prix, max_prix, min_surface, max_surface } = req.query;
  let sql = 'SELECT * FROM biens WHERE 1=1';
  const params = [];

  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (ville) { sql += ' AND ville LIKE ?'; params.push(`%${ville}%`); }
  if (statut) { sql += ' AND statut = ?'; params.push(statut); }
  if (min_prix) { sql += ' AND prix >= ?'; params.push(Number(min_prix)); }
  if (max_prix) { sql += ' AND prix <= ?'; params.push(Number(max_prix)); }
  if (min_surface) { sql += ' AND surface >= ?'; params.push(Number(min_surface)); }
  if (max_surface) { sql += ' AND surface <= ?'; params.push(Number(max_surface)); }

  sql += ' ORDER BY created_at DESC';

  const biens = db.prepare(sql).all(...params);
  res.json(biens);
});

// GET /api/biens/:id — get one (public)
router.get('/:id', (req, res) => {
  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }
  res.json(bien);
});

// POST /api/biens — create (authenticated)
router.post('/', auth, (req, res) => {
  const { titre, description, prix, surface, type, ville, code_postal, adresse, pieces, etage, statut } = req.body;

  if (!titre || prix === undefined) {
    return res.status(400).json({ error: 'Titre et prix requis' });
  }

  const result = db.prepare(`
    INSERT INTO biens (titre, description, prix, surface, type, ville, code_postal, adresse, pieces, etage, statut, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    titre, description || null, prix, surface || null,
    type || 'appartement', ville || null, code_postal || null,
    adresse || null, pieces || null, etage || null,
    statut || 'disponible', req.user.id
  );

  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bien);
});

// PUT /api/biens/:id — update (authenticated)
router.put('/:id', auth, (req, res) => {
  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }

  const { titre, description, prix, surface, type, ville, code_postal, adresse, pieces, etage, statut } = req.body;

  db.prepare(`
    UPDATE biens SET
      titre = COALESCE(?, titre),
      description = COALESCE(?, description),
      prix = COALESCE(?, prix),
      surface = COALESCE(?, surface),
      type = COALESCE(?, type),
      ville = COALESCE(?, ville),
      code_postal = COALESCE(?, code_postal),
      adresse = COALESCE(?, adresse),
      pieces = COALESCE(?, pieces),
      etage = COALESCE(?, etage),
      statut = COALESCE(?, statut),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    titre, description, prix, surface, type,
    ville, code_postal, adresse, pieces, etage,
    statut, req.params.id
  );

  const updated = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/biens/:id — delete (authenticated)
router.delete('/:id', auth, (req, res) => {
  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }

  db.prepare('DELETE FROM biens WHERE id = ?').run(req.params.id);
  res.json({ message: 'Bien supprimé avec succès' });
});

module.exports = router;