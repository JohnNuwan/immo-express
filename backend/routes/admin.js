const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

const router = express.Router();

// ========== ADMIN ROUTES ==========
// EVA · NODUS SYSTEMS — Administration immobilière

// GET /api/admin/stats — dashboard stats
router.get('/stats', auth, requireAdmin, (req, res) => {
  const stats = {
    total_biens: db.prepare('SELECT COUNT(*) as count FROM biens').get().count,
    total_users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    total_contacts: db.prepare('SELECT COUNT(*) as count FROM contacts').get().count,
    contacts_non_lus: db.prepare('SELECT COUNT(*) as count FROM contacts WHERE lu = 0').get().count,
    biens_par_type: db.prepare('SELECT type, COUNT(*) as count FROM biens GROUP BY type').all(),
    biens_par_statut: db.prepare('SELECT statut, COUNT(*) as count FROM biens GROUP BY statut').all(),
    derniers_inscrits: db.prepare('SELECT id, email, nom, prenom, created_at FROM users ORDER BY created_at DESC LIMIT 5').all(),
    derniers_contacts: db.prepare('SELECT c.*, b.titre as bien_titre FROM contacts c LEFT JOIN biens b ON c.bien_id = b.id ORDER BY c.created_at DESC LIMIT 5').all(),
  };
  res.json(stats);
});

// GET /api/admin/users — list all users
router.get('/users', auth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, email, nom, prenom, telephone, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// PUT /api/admin/users/:id/role — change user role
router.put('/users/:id/role', auth, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin', 'pro'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide (user, admin, pro)' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Rôle mis à jour' });
});

// GET /api/admin/contacts — list all contacts
router.get('/contacts', auth, requireAdmin, (req, res) => {
  const { lu } = req.query;
  let sql = 'SELECT c.*, b.titre as bien_titre, b.prix FROM contacts c LEFT JOIN biens b ON c.bien_id = b.id';
  const params = [];
  if (lu !== undefined) {
    sql += ' WHERE c.lu = ?';
    params.push(Number(lu));
  }
  sql += ' ORDER BY c.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// PUT /api/admin/contacts/:id/lu — mark contact as read
router.put('/contacts/:id/lu', auth, requireAdmin, (req, res) => {
  db.prepare('UPDATE contacts SET lu = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Contact marqué comme lu' });
});

// DELETE /api/admin/biens/:id — admin delete any bien
router.delete('/biens/:id', auth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM contacts WHERE bien_id = ?').run(req.params.id);
  db.prepare('DELETE FROM biens WHERE id = ?').run(req.params.id);
  res.json({ message: 'Bien supprimé par l\'administrateur' });
});

module.exports = router;