const express = require('express');
const router = express.Router();
const db = require('../database');
const https = require('https');

// Helper to fetch using Node's native https or fetch if available (Node 18+)
async function fetchUrl(url) {
  if (typeof fetch !== 'undefined') {
    const res = await fetch(url, { headers: { 'User-Agent': 'ImmoExpress-Backend/1.0' } });
    if (res.status === 404) return null; // Gracefully handle 404 as null
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
  } else {
    // Fallback for older Node versions
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'ImmoExpress-Backend/1.0' } }, (res) => {
        if (res.statusCode === 404) return resolve(null);
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }
}

// Allowed domains for proxying
const ALLOWED_DOMAINS = [
  'georisques.gouv.fr',
  'api-adresse.data.gouv.fr'
];

router.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (!ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain))) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // Check cache
    // SQLite datetime('now', '-30 days') checks if created_at is within the last 30 days
    const cached = db.prepare(`
      SELECT response_data FROM api_cache 
      WHERE endpoint = ? 
      AND updated_at > datetime('now', '-30 days')
    `).get(targetUrl);

    if (cached) {
      if (cached.response_data === 'null') {
        res.setHeader('X-Cache', 'HIT');
        return res.status(404).json({ error: 'Not found on remote server' });
      }
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      return res.send(cached.response_data);
    }

    // Cache Miss -> Fetch data
    const responseData = await fetchUrl(targetUrl);

    if (responseData === null) {
      // Store 'null' string in cache to avoid re-fetching 404s
      const stmt = db.prepare(`
        INSERT INTO api_cache (endpoint, response_data, created_at, updated_at) 
        VALUES (?, 'null', datetime('now'), datetime('now'))
        ON CONFLICT(endpoint) DO UPDATE SET 
          response_data = 'null',
          updated_at = datetime('now')
      `);
      stmt.run(targetUrl);
      return res.status(404).json({ error: 'Not found on remote server' });
    }

    // Save or update cache
    const stmt = db.prepare(`
      INSERT INTO api_cache (endpoint, response_data, created_at, updated_at) 
      VALUES (?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(endpoint) DO UPDATE SET 
        response_data = excluded.response_data,
        updated_at = datetime('now')
    `);
    stmt.run(targetUrl, responseData);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'application/json');
    res.send(responseData);

  } catch (error) {
    console.error('[OpenData Proxy] Error fetching URL:', targetUrl, error.message);
    res.status(500).json({ error: 'Failed to fetch open data' });
  }
});

module.exports = router;
