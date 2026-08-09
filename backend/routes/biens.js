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

// GET /api/biens/me — list user's own properties (authenticated)
router.get('/me', auth, (req, res) => {
  const biens = db.prepare('SELECT * FROM biens WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
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

// POST /api/biens/upload — upload property photo (authenticated)
const fs = require('fs');
const path = require('path');

router.post('/upload', auth, (req, res) => {
  const { image, filename } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Données d\'image manquantes' });
  }

  try {
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let ext = 'png';
    let base64Data = image;

    if (matches) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadsDir = path.join(__dirname, '../../public/uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    res.status(201).json({
      message: 'Photo téléversée avec succès',
      url: `/uploads/${safeFilename}`
    });
  } catch (err) {
    console.error('Erreur lors de l\'upload:', err);
    res.status(500).json({ error: 'Erreur lors du traitement de la photo' });
  }
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

// PUT /api/biens/:id — update (authenticated: owner or admin)
router.put('/:id', auth, (req, res) => {
  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }

  if (bien.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé à cette annonce' });
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

// DELETE /api/biens/:id — delete (authenticated: owner or admin)
router.delete('/:id', auth, (req, res) => {
  const bien = db.prepare('SELECT * FROM biens WHERE id = ?').get(req.params.id);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }

  if (bien.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé à cette annonce' });
  }

  const del = db.transaction(() => {
    db.prepare('DELETE FROM contacts WHERE bien_id = ?').run(req.params.id);
    db.prepare('DELETE FROM favorites WHERE bien_id = ?').run(req.params.id);
    db.prepare('DELETE FROM biens WHERE id = ?').run(req.params.id);
  });
  del();

  res.json({ message: 'Bien supprimé avec succès' });
});

module.exports = router;