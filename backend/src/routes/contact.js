import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createContact, getContacts } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/contact
router.post('/', (req, res) => {
  try {
    const { listing_id, name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    const id = createContact({
      id: uuidv4(),
      listing_id: listing_id || '',
      name,
      email,
      phone: phone || '',
      message: message || ''
    });

    res.status(201).json({ id, success: true, message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// GET /api/contact (admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    const listingId = req.query.listing_id || null;
    const contacts = getContacts(listingId);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

export default router;