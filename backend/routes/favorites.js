const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites — list logged-in user's favorites
router.get('/', auth, (req, res) => {
  const favorites = db.prepare(`
    SELECT b.*, f.created_at as favorited_at
    FROM favorites f
    JOIN biens b ON f.bien_id = b.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);

  res.json(favorites);
});

// POST /api/favorites/:bienId — add a property to favorites
router.post('/:bienId', auth, (req, res) => {
  const bienId = parseInt(req.params.bienId, 10);
  
  const bien = db.prepare('SELECT id FROM biens WHERE id = ?').get(bienId);
  if (!bien) {
    return res.status(404).json({ error: 'Bien non trouvé' });
  }

  try {
    db.prepare(`
      INSERT INTO favorites (user_id, bien_id) VALUES (?, ?)
      ON CONFLICT(user_id, bien_id) DO NOTHING
    `).run(req.user.id, bienId);

    res.status(201).json({ message: 'Ajouté aux favoris avec succès', bien_id: bienId });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

// DELETE /api/favorites/:bienId — remove a property from favorites
router.delete('/:bienId', auth, (req, res) => {
  const bienId = parseInt(req.params.bienId, 10);

  const result = db.prepare('DELETE FROM favorites WHERE user_id = ? AND bien_id = ?').run(req.user.id, bienId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Favori non trouvé' });
  }

  res.json({ message: 'Retiré des favoris avec succès', bien_id: bienId });
});

module.exports = router;
