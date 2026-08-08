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
    priceLabel TEXT,
    priceSub TEXT,
    surface REAL,
    cat TEXT DEFAULT 'vente',
    type TEXT DEFAULT 'appartement',
    ville TEXT,
    code_postal TEXT,
    adresse TEXT,
    location TEXT,
    pieces INTEGER,
    chambres INTEGER DEFAULT 1,
    sdb INTEGER DEFAULT 1,
    etage INTEGER,
    publisher TEXT DEFAULT 'particulier',
    pubName TEXT DEFAULT 'Propriétaire',
    bg TEXT DEFAULT 'linear-gradient(135deg, #1e293b, #0f172a)',
    emoji TEXT DEFAULT '🏠',
    trustScore INTEGER DEFAULT 80,
    verified INTEGER DEFAULT 1,
    smartMatch INTEGER DEFAULT 90,
    date TEXT DEFAULT "Aujourd'hui",
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

  CREATE TABLE IF NOT EXISTS api_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL UNIQUE,
    response_data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Safe migrations helper
const columns = [
  "priceLabel TEXT", "priceSub TEXT", "cat TEXT DEFAULT 'vente'",
  "location TEXT", "chambres INTEGER DEFAULT 1", "sdb INTEGER DEFAULT 1",
  "publisher TEXT DEFAULT 'particulier'", "pubName TEXT DEFAULT 'Propriétaire'",
  "bg TEXT DEFAULT 'linear-gradient(135deg, #1e293b, #0f172a)'",
  "emoji TEXT DEFAULT '🏠'", "trustScore INTEGER DEFAULT 80",
  "verified INTEGER DEFAULT 1", "smartMatch INTEGER DEFAULT 90", "date TEXT DEFAULT \"Aujourd'hui\""
];

for (const colDef of columns) {
  const colName = colDef.split(' ')[0];
  try {
    db.exec(`ALTER TABLE biens ADD COLUMN ${colDef}`);
  } catch (e) {
    // Column already exists
  }
}

// Seed initial listings if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM biens').get();
if (count.count === 0) {
  const seedBiens = [
    {
      titre: "Appartement d'exception Haussmannien",
      prix: 685000,
      priceLabel: "685 000 €",
      priceSub: "8 058 €/m²",
      surface: 85,
      cat: "vente",
      type: "appartement",
      location: "Paris 8e (75008)",
      ville: "Paris",
      code_postal: "75008",
      pieces: 4,
      chambres: 2,
      sdb: 1,
      etage: 3,
      publisher: "pro",
      pubName: "Agence Opéra Prestige",
      bg: "linear-gradient(135deg, #1e1b4b, #312e81)",
      emoji: "🏛️",
      trustScore: 94,
      verified: 1,
      smartMatch: 96,
      date: "Aujourd'hui",
      description: "Superbe appartement haussmannien avec parquet point de Hongrie, moulures dorées et 3 cheminées en marbre."
    },
    {
      titre: "Villa contemporaine avec piscine chauffée",
      prix: 1250000,
      priceLabel: "1 250 000 €",
      priceSub: "5 681 €/m²",
      surface: 220,
      cat: "vente",
      type: "villa",
      location: "Aix-en-Provence (13100)",
      ville: "Aix-en-Provence",
      code_postal: "13100",
      pieces: 6,
      chambres: 4,
      sdb: 3,
      etage: 0,
      publisher: "pro",
      pubName: "Sainte-Victoire Immobilier",
      bg: "linear-gradient(135deg, #064e3b, #047857)",
      emoji: "🏡",
      trustScore: 98,
      verified: 1,
      smartMatch: 92,
      date: "Aujourd'hui",
      description: "Villa d'architecte aux prestations haut de gamme, piscine à débordement, vue panoramique."
    },
    {
      titre: "Loft industriel rénové — Canal Saint-Martin",
      prix: 890000,
      priceLabel: "890 000 €",
      priceSub: "7 416 €/m²",
      surface: 120,
      cat: "vente",
      type: "loft",
      location: "Paris 10e (75010)",
      ville: "Paris",
      code_postal: "75010",
      pieces: 3,
      chambres: 2,
      sdb: 2,
      etage: 1,
      publisher: "particulier",
      pubName: "Marc V.",
      bg: "linear-gradient(135deg, #451a03, #78350f)",
      emoji: "🏭",
      trustScore: 88,
      verified: 1,
      smartMatch: 89,
      date: "Hier",
      description: "Ancienne imprimerie réhabilitée avec verrière de 5m de hauteur sous plafond."
    },
    {
      titre: "Studio meublé design — Hyper centre Lyon",
      prix: 780,
      priceLabel: "780 €/mois",
      priceSub: "CC (Charges Comprises)",
      surface: 28,
      cat: "location",
      type: "studio",
      location: "Lyon 2e (69002)",
      ville: "Lyon",
      code_postal: "69002",
      pieces: 1,
      chambres: 1,
      sdb: 1,
      etage: 2,
      publisher: "pro",
      pubName: "Rhône Habitat Pro",
      bg: "linear-gradient(135deg, #311b92, #4527a0)",
      emoji: "🛋️",
      trustScore: 91,
      verified: 1,
      smartMatch: 95,
      date: "Aujourd'hui",
      description: "Studio refait à neuf par architecte d'intérieur, cuisine équipée, tout confort."
    },
    {
      titre: "Maison familiale avec grand jardin arboré",
      prix: 420000,
      priceLabel: "420 000 €",
      priceSub: "3 111 €/m²",
      surface: 135,
      cat: "vente",
      type: "maison",
      location: "Bordeaux (33000)",
      ville: "Bordeaux",
      code_postal: "33000",
      pieces: 5,
      chambres: 3,
      sdb: 2,
      etage: 0,
      publisher: "particulier",
      pubName: "Sophie T.",
      bg: "linear-gradient(135deg, #14532d, #15803d)",
      emoji: "🌳",
      trustScore: 85,
      verified: 0,
      smartMatch: 87,
      date: "Il y a 3 jours",
      description: "Maison de ville éco-responsable avec panneaux solaires et terrasse plein sud."
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO biens (titre, prix, priceLabel, priceSub, surface, cat, type, location, ville, code_postal, pieces, chambres, sdb, etage, publisher, pubName, bg, emoji, trustScore, verified, smartMatch, date, description)
    VALUES (@titre, @prix, @priceLabel, @priceSub, @surface, @cat, @type, @location, @ville, @code_postal, @pieces, @chambres, @sdb, @etage, @publisher, @pubName, @bg, @emoji, @trustScore, @verified, @smartMatch, @date, @description)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) stmt.run(item);
  });
  insertMany(seedBiens);
  console.log('✅ Base SQLite alimentée avec', seedBiens.length, 'annonces initiales.');
}

module.exports = db;