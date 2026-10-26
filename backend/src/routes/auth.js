import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, getUserById, createUser, updateUser } from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, company, siret } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mot de passe (6+ caractères)' });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const id = uuidv4();
    const user = {
      id, email, password, name,
      role: role || 'particulier',
      phone: phone || '',
      company: company || '',
      siret: siret || ''
    };

    createUser(user);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id, email, name, role: user.role, phone: user.phone, company: user.company }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        company: user.company,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      company: user.company,
      siret: user.siret,
      avatar: user.avatar,
      created_at: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { name, phone, company, siret, avatar } = req.body;
    const fields = {};
    if (name) fields.name = name;
    if (phone !== undefined) fields.phone = phone;
    if (company !== undefined) fields.company = company;
    if (siret !== undefined) fields.siret = siret;
    if (avatar !== undefined) fields.avatar = avatar;

    if (Object.keys(fields).length > 0) {
      updateUser(req.user.id, fields);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

export default router;