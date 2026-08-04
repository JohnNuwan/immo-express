const Database = require('better-sqlite3');
const path = require('path');
const config = require('./config');

const dbPath = path.resolve(__dirname, config.DB_PATH);
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom TEXT,
    prenom TEXT,
    telephone TEXT,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS biens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    prix REAL NOT NULL,
    surface REAL,
    type TEXT DEFAULT 'appartement',
    ville TEXT,
    code_postal TEXT,
    adresse TEXT,
    pieces INTEGER,
    etage INTEGER,
    statut TEXT DEFAULT 'disponible',
    user_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bien_id INTEGER REFERENCES biens(id),
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    message TEXT,
    lu INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;