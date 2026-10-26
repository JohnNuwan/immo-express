import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { mkdir } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'immo_express.db');

mkdir(DATA_DIR, { recursive: true }).catch(() => {});

const db = new Database(DB_PATH, {});
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== SCHEMA INIT =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'particulier',
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    siret TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    cat TEXT NOT NULL DEFAULT 'vente',
    type TEXT NOT NULL DEFAULT 'appartement',
    price REAL NOT NULL,
    price_sub TEXT DEFAULT '',
    fees TEXT DEFAULT 'charge-vendeur',
    surface REAL,
    land REAL DEFAULT 0,
    pieces INTEGER DEFAULT 1,
    chambres INTEGER DEFAULT 0,
    sdb INTEGER DEFAULT 1,
    etage INTEGER DEFAULT 0,
    year INTEGER,
    condition TEXT DEFAULT 'bon-etat',
    chauffage TEXT DEFAULT '',
    dpe TEXT DEFAULT '',
    equip TEXT DEFAULT '[]',
    address TEXT DEFAULT '',
    city TEXT NOT NULL,
    zipcode TEXT DEFAULT '',
    region TEXT DEFAULT '',
    near TEXT DEFAULT '',
    photos TEXT DEFAULT '[]',
    publisher TEXT DEFAULT 'particulier',
    pub_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    trust_score REAL DEFAULT 50,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    listing_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    message TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scoring_history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    city TEXT NOT NULL,
    surface REAL,
    pieces INTEGER,
    type TEXT,
    score REAL,
    details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    user_id TEXT,
    rating INTEGER DEFAULT 5,
    comment TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    user_id TEXT,
    slot TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

console.log('✅ SQLite init — immo_express.db');

// ===== USERS =====
export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser({ id, email, password, name, role = 'particulier', phone = '', company = '', siret = '' }) {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    `INSERT INTO users (id, email, password, name, role, phone, company, siret)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, email, hash, name, role, phone, company, siret);
  return true;
}

export function updateUser(id, fields) {
  const keys = Object.keys(fields);
  const setStr = keys.map(k => `${k} = ?`).join(', ');
  const vals = keys.map(k => fields[k]);
  vals.push(id);
  db.prepare(`UPDATE users SET ${setStr}, updated_at = datetime('now') WHERE id = ?`).run(...vals);
  return true;
}

// ===== LISTINGS =====
export function getListings(filters = {}) {
  let sql = 'SELECT * FROM listings WHERE 1=1';
  const params = [];

  if (filters.cat && filters.cat !== 'all') { sql += ' AND cat = ?'; params.push(filters.cat); }
  if (filters.type && filters.type !== 'all') { sql += ' AND type = ?'; params.push(filters.type); }
  if (filters.city) { sql += ' AND city LIKE ?'; params.push(`%${filters.city}%`); }
  if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
  if (filters.user_id) { sql += ' AND user_id = ?'; params.push(filters.user_id); }
  if (filters.search) {
    sql += ' AND (title LIKE ? OR city LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.minPrice) { sql += ' AND price >= ?'; params.push(parseFloat(filters.minPrice)); }
  if (filters.maxPrice) { sql += ' AND price <= ?'; params.push(parseFloat(filters.maxPrice)); }

  const sortMap = {
    'price-asc': 'ORDER BY price ASC',
    'price-desc': 'ORDER BY price DESC',
    'score': 'ORDER BY trust_score DESC',
    'oldest': 'ORDER BY created_at ASC'
  };
  sql += ' ' + (sortMap[filters.sort] || 'ORDER BY created_at DESC');

  if (filters.limit) { sql += ' LIMIT ?'; params.push(parseInt(filters.limit)); }
  if (filters.offset) { sql += ' OFFSET ?'; params.push(parseInt(filters.offset)); }

  return db.prepare(sql).all(...params);
}

export function getListingById(id) {
  return db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
}

export function getListingsCount(filters = {}) {
  let sql = 'SELECT COUNT(*) as total FROM listings WHERE 1=1';
  const params = [];
  if (filters.cat && filters.cat !== 'all') { sql += ' AND cat = ?'; params.push(filters.cat); }
  if (filters.type && filters.type !== 'all') { sql += ' AND type = ?'; params.push(filters.type); }
  if (filters.city) { sql += ' AND city LIKE ?'; params.push(`%${filters.city}%`); }
  if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
  const row = db.prepare(sql).get(...params);
  return row ? row.total : 0;
}

export function createListing(data) {
  const id = data.id || uuidv4();
  data.id = id;
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const vals = keys.map(k => data[k]);
  db.prepare(`INSERT INTO listings (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
  return id;
}

export function updateListing(id, fields) {
  const keys = Object.keys(fields);
  const setStr = keys.map(k => `${k} = ?`).join(', ');
  const vals = keys.map(k => fields[k]);
  vals.push(id);
  db.prepare(`UPDATE listings SET ${setStr}, updated_at = datetime('now') WHERE id = ?`).run(...vals);
  return true;
}

export function deleteListing(id) {
  db.prepare('DELETE FROM listings WHERE id = ?').run(id);
  return true;
}

export function incrementViews(id) {
  db.prepare('UPDATE listings SET views = views + 1 WHERE id = ?').run(id);
}

// ===== CONTACTS =====
export function createContact(data) {
  const id = data.id || uuidv4();
  data.id = id;
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const vals = keys.map(k => data[k]);
  db.prepare(`INSERT INTO contacts (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
  return id;
}

export function getContacts(listingId = null) {
  if (listingId) {
    return db.prepare('SELECT * FROM contacts WHERE listing_id = ? ORDER BY created_at DESC').all(listingId);
  }
  return db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
}

// ===== SCORING =====
export function saveScoring(data) {
  const id = data.id || uuidv4();
  data.id = id;
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const vals = keys.map(k => data[k]);
  db.prepare(`INSERT INTO scoring_history (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
  return id;
}

export function getScoringHistory(userId = null) {
  if (userId) {
    return db.prepare('SELECT * FROM scoring_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId);
  }
  return db.prepare('SELECT * FROM scoring_history ORDER BY created_at DESC LIMIT 100').all();
}

// ===== REVIEWS =====
export function getReviews(listingId) {
  return db.prepare('SELECT * FROM reviews WHERE listing_id = ? ORDER BY created_at DESC').all(listingId);
}

export function createReview(data) {
  const id = data.id || uuidv4();
  data.id = id;
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const vals = keys.map(k => data[k]);
  db.prepare(`INSERT INTO reviews (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
  return id;
}

// ===== STATS =====
export function getStats() {
  const row = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COALESCE(AVG(trust_score), 0) FROM listings WHERE status = 'active') as avg_score,
      (SELECT COUNT(*) FROM contacts) as total_contacts,
      (SELECT COUNT(*) FROM scoring_history) as total_scorings
  `).get();
  return row;
}

export function getDashboardStats(userId) {
  const data = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM listings WHERE user_id = ?) as my_listings,
      (SELECT COUNT(*) FROM listings WHERE user_id = ? AND status = 'active') as active_listings,
      (SELECT COUNT(*) FROM contacts WHERE listing_id IN (SELECT id FROM listings WHERE user_id = ?)) as total_leads,
      (SELECT COALESCE(SUM(views), 0) FROM listings WHERE user_id = ?) as total_views
  `).get(userId, userId, userId, userId);
  return data;
}

export default db;