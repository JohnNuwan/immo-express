import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { saveScoring, getScoringHistory } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/scoring — évaluer un bien
router.post('/', authMiddleware, (req, res) => {
  try {
    const { city, surface, pieces, type, price, year, condition, dpe, etage, chambres } = req.body;

    if (!city || !surface || !pieces) {
      return res.status(400).json({ error: 'Ville, surface et pièces requis' });
    }

    // Algorithme de scoring NODUS
    const surfaceNum = parseFloat(surface) || 50;
    const piecesNum = parseInt(pieces) || 1;
    const priceNum = parseFloat(price) || 0;
    const yearNum = parseInt(year) || 2000;

    // Score de base
    let score = 50;

    // Bonus surface (optimum 70-120m²)
    if (surfaceNum >= 70 && surfaceNum <= 120) score += 15;
    else if (surfaceNum > 120) score += 10;
    else if (surfaceNum < 30) score -= 5;

    // Bonus pièces
    if (piecesNum >= 3 && piecesNum <= 5) score += 10;
    else if (piecesNum > 5) score += 5;
    else if (piecesNum <= 2) score -= 5;

    // Bonus année
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearNum;
    if (age <= 5) score += 15;
    else if (age <= 15) score += 10;
    else if (age <= 30) score += 5;
    else if (age > 50) score -= 10;

    // DPE
    const dpeScores = { A: 20, B: 15, C: 10, D: 5, E: 0, F: -5, G: -10 };
    if (dpe && dpeScores[dpe.toUpperCase()]) {
      score += dpeScores[dpe.toUpperCase()];
    }

    // Condition
    const conditionScores = { neuf: 15, 'bon-etat': 10, travaux: 0, renover: -10 };
    if (condition && conditionScores[condition]) {
      score += conditionScores[condition];
    }

    // Bonus étage (vue)
    if (parseInt(etage || 0) >= 3) score += 5;

    // Ratio prix/surface (prix au m²)
    if (priceNum > 0 && surfaceNum > 0) {
      const pricePerM2 = priceNum / surfaceNum;
      if (pricePerM2 > 10000) score -= 10;    // Très cher
      else if (pricePerM2 > 7000) score -= 5;
      else if (pricePerM2 > 5000) score += 0;
      else if (pricePerM2 > 3000) score += 5;
      else score += 10;                        // Bon marché
    }

    // Normalisation
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Ville bonus
    const cityBonus = {
      'paris': 5, 'lyon': 8, 'bordeaux': 10, 'toulouse': 8,
      'marseille': 3, 'nice': 6, 'nantes': 8, 'lille': 7,
      'strasbourg': 7, 'rennes': 8, 'montpellier': 6, 'grenoble': 7
    };
    const cityKey = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (cityBonus[cityKey]) {
      score = Math.min(100, score + cityBonus[cityKey]);
    }

    // Détails du calcul
    const details = {
      score,
      surface: surfaceNum,
      pieces: piecesNum,
      price: priceNum,
      year: yearNum,
      dpe: dpe || 'N/A',
      condition: condition || 'N/A',
      city_bonus: cityBonus[cityKey] || 0,
      age
    };

    // Sauvegarde
    const id = saveScoring({
      id: uuidv4(),
      user_id: req.user.id,
      city, surface: surfaceNum,
      pieces: piecesNum,
      type: type || 'appartement',
      score,
      details: JSON.stringify(details)
    });

    res.json({ id, score, details });
  } catch (err) {
    console.error('Scoring error:', err);
    res.status(500).json({ error: 'Erreur lors du calcul du score' });
  }
});

// GET /api/scoring/history
router.get('/history', authMiddleware, (req, res) => {
  try {
    const history = getScoringHistory(req.user.id);
    res.json(history.map(h => ({
      ...h,
      details: typeof h.details === 'string' ? JSON.parse(h.details) : h.details
    })));
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET /api/scoring/public — scoring public simplifié (sans auth)
router.post('/public', (req, res) => {
  try {
    const { city, surface, pieces, price, year } = req.body;
    if (!city || !surface || !pieces) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const s = parseFloat(surface) || 50;
    const p = parseInt(pieces) || 1;
    let score = 50;
    if (s >= 70 && s <= 120) score += 15;
    if (p >= 3 && p <= 5) score += 10;
    if (price) {
      const ppm = parseFloat(price) / s;
      if (ppm < 3000) score += 10;
      else if (ppm > 7000) score -= 5;
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    res.json({ score, details: { surface: s, pieces: p } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur de calcul' });
  }
});

export default router;