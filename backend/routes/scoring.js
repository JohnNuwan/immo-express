const express = require('express');
const router = express.Router();

// POST /api/scoring — simulate a scoring engine
router.post('/', (req, res) => {
  const { prix, surface, type, ville, pieces } = req.body;

  if (!prix || !surface) {
    return res.status(400).json({ error: 'Prix et surface requis' });
  }

  // Simulated scoring logic
  const ratio = surface > 0 ? prix / surface : 0;
  let score = 50;

  // Lower price per m² → better score
  if (ratio < 1500) score += 20;
  else if (ratio < 3000) score += 10;
  else if (ratio > 6000) score -= 10;
  else score -= 20;

  // Apartments score slightly better by default
  if (type === 'appartement') score += 5;
  if (type === 'maison') score += 3;

  // More rooms is generally better (up to a point)
  if (pieces) {
    if (pieces >= 3 && pieces <= 5) score += 10;
    else if (pieces > 5) score += 5;
    else score -= 5;
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  res.json({
    score,
    details: {
      prix_m2: Math.round(ratio * 100) / 100,
      surface,
      prix,
      type,
      ville: ville || 'Non spécifiée',
    },
    interpretation: score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'Faible',
  });
});

module.exports = router;