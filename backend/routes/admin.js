const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — get dashboard statistics (authenticated)
router.get('/stats', auth, (req, res) => {
  const totalBiens = db.prepare('SELECT COUNT(*) as count FROM biens').get();
  const disponibilite = db.prepare(
    "SELECT statut, COUNT(*) as count FROM biens GROUP BY statut"
  ).all();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
  const contactsNonLus = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE lu = 0').get();
  const prixMoyen = db.prepare('SELECT AVG(prix) as avg FROM biens').get();
  const surfaceMoyenne = db.prepare('SELECT AVG(surface) as avg FROM biens').get();

  res.json({
    total_biens: totalBiens.count,
    disponibilite,
    total_users: totalUsers.count,
    total_contacts: totalContacts.count,
    contacts_non_lus: contactsNonLus.count,
    prix_moyen: Math.round(prixMoyen.avg * 100) / 100 || 0,
    surface_moyenne: Math.round(surfaceMoyenne.avg * 100) / 100 || 0,
  });
});

module.exports = router;