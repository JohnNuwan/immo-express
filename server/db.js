import pkg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'immo_express',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || ''
});

// ===== HELPERS =====
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// ===== USERS =====
export async function getUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function getUserById(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function createUser({ id, email, password, name, role = 'particulier', phone = '', company = '', siret = '' }) {
  const hash = bcrypt.hashSync(password, 10);
  await query(
    `INSERT INTO users (id, email, password, name, role, phone, company, siret)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, email, hash, name, role, phone, company, siret]
  );
  return true;
}

export async function updateUser(id, fields) {
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = $${i}`);
    vals.push(v);
    i++;
  }
  vals.push(id);
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, vals);
  return true;
}

// ===== LISTINGS =====
export async function getListings(filters = {}) {
  let sql = 'SELECT * FROM listings WHERE 1=1';
  const params = [];
  let i = 1;

  if (filters.cat) { sql += ` AND cat = $${i}`; params.push(filters.cat); i++; }
  if (filters.type) { sql += ` AND type = $${i}`; params.push(filters.type); i++; }
  if (filters.city) { sql += ` AND city ILIKE $${i}`; params.push(`%${filters.city}%`); i++; }
  if (filters.status) { sql += ` AND status = $${i}`; params.push(filters.status); i++; }
  if (filters.user_id) { sql += ` AND user_id = $${i}`; params.push(filters.user_id); i++; }
  if (filters.search) {
    sql += ` AND (title ILIKE $${i} OR location ILIKE $${i} OR city ILIKE $${i})`;
    params.push(`%${filters.search}%`);
    i++;
  }
  if (filters.minPrice) { sql += ` AND price >= $${i}`; params.push(parseFloat(filters.minPrice)); i++; }
  if (filters.maxPrice) { sql += ` AND price <= $${i}`; params.push(parseFloat(filters.maxPrice)); i++; }

  sql += ' ORDER BY created_at DESC';
  if (filters.limit) { sql += ` LIMIT $${i}`; params.push(parseInt(filters.limit)); i++; }

  const res = await query(sql, params);
  return res.rows;
}

export async function getListingById(id) {
  const res = await query('SELECT * FROM listings WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function createListing(data) {
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  await query(
    `INSERT INTO listings (${cols.join(', ')}) VALUES (${placeholders})`,
    vals
  );
  return true;
}

export async function updateListing(id, fields) {
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = $${i}`);
    vals.push(v);
    i++;
  }
  vals.push(id);
  sets.push('updated_at = CURRENT_TIMESTAMP');
  await query(`UPDATE listings SET ${sets.join(', ')} WHERE id = $${i}`, vals);
  return true;
}

export async function deleteListing(id) {
  await query('DELETE FROM listings WHERE id = $1', [id]);
  return true;
}

// ===== PRICE HISTORY =====
export async function getPriceHistory(listingId) {
  const res = await query('SELECT * FROM price_history WHERE listing_id = $1 ORDER BY id DESC', [listingId]);
  return res.rows;
}

// ===== MESSAGES =====
export async function getMessages(conversationId) {
  const res = await query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId]);
  return res.rows;
}

export async function createMessage(data) {
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  await query(`INSERT INTO messages (${cols.join(', ')}) VALUES (${placeholders})`, vals);
  return true;
}

// ===== VISITS =====
export async function getVisits(listingId) {
  const res = await query('SELECT * FROM visits WHERE listing_id = $1 ORDER BY slot', [listingId]);
  return res.rows;
}

export async function createVisit(data) {
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  await query(`INSERT INTO visits (${cols.join(', ')}) VALUES (${placeholders})`, vals);
  return true;
}

// ===== ALERTS =====
export async function getAlerts(userId) {
  const res = await query('SELECT * FROM alerts WHERE user_id = $1 AND active = 1', [userId]);
  return res.rows;
}

// ===== SERVICES =====
export async function getServices(filters = {}) {
  let sql = 'SELECT * FROM services WHERE active = 1';
  const params = [];
  let i = 1;
  if (filters.category) { sql += ` AND category = $${i}`; params.push(filters.category); i++; }
  if (filters.city) { sql += ` AND city ILIKE $${i}`; params.push(`%${filters.city}%`); i++; }
  const res = await query(sql, params);
  return res.rows;
}

// ===== REVIEWS =====
export async function getReviews(listingId) {
  const res = await query('SELECT * FROM reviews WHERE listing_id = $1 ORDER BY created_at DESC', [listingId]);
  return res.rows;
}

// ===== STATS =====
export async function getStats() {
  const res = await query(`
    SELECT
      (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COALESCE(AVG(trust_score), 0) FROM listings WHERE status = 'active') as avg_score
  `);
  return res.rows[0];
}

// ===== EXPORT POOL =====
export { pool };

console.log('✅ PostgreSQL connected — immo_express database');