import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getListings, getListingById, getListingsCount,
  createListing, updateListing, deleteListing, incrementViews
} from '../db.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/biens — liste avec filtres
router.get('/', optionalAuth, (req, res) => {
  try {
    const filters = { ...req.query };
    if (filters.page) {
      const page = Math.max(1, parseInt(filters.page));
      const limit = Math.min(50, parseInt(filters.limit || '12'));
      filters.limit = limit;
      filters.offset = (page - 1) * limit;
    }
    const listings = getListings(filters);
    const total = getListingsCount(filters);
    res.json({
      listings,
      total,
      page: parseInt(filters.page || '1'),
      pages: Math.ceil(total / parseInt(filters.limit || '12'))
    });
  } catch (err) {
    console.error('GET listings error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des biens' });
  }
});

// GET /api/biens/:id
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const listing = getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    // Increment views
    incrementViews(req.params.id);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/biens
router.post('/', authMiddleware, (req, res) => {
  try {
    const data = {
      ...req.body,
      user_id: req.user.id,
      id: uuidv4()
    };

    // Parse equip from array if needed
    if (data.equip && Array.isArray(data.equip)) {
      data.equip = JSON.stringify(data.equip);
    }
    if (data.photos && Array.isArray(data.photos)) {
      data.photos = JSON.stringify(data.photos);
    }

    const id = createListing(data);
    res.status(201).json({ id, success: true });
  } catch (err) {
    console.error('CREATE listing error:', err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// PUT /api/biens/:id
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const listing = getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    // Only owner or admin can update
    if (listing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const fields = { ...req.body };
    delete fields.id;
    delete fields.user_id;
    delete fields.created_at;

    if (fields.equip && Array.isArray(fields.equip)) {
      fields.equip = JSON.stringify(fields.equip);
    }
    if (fields.photos && Array.isArray(fields.photos)) {
      fields.photos = JSON.stringify(fields.photos);
    }

    updateListing(req.params.id, fields);
    res.json({ success: true });
  } catch (err) {
    console.error('UPDATE listing error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/biens/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const listing = getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    if (listing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    deleteListing(req.params.id);
    res.json({ success: true, message: 'Bien supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;