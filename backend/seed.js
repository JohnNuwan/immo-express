const Database = require('better-sqlite3');
const path = require('path');
const config = require('./config');

const dbPath = path.resolve(__dirname, config.DB_PATH);
const db = new Database(dbPath);

console.log('🌱 Début du seeding de la base de données...');

const biens = [
  {
    titre: "Appartement d'exception Haussmannien",
    description: "Superbe appartement haussmannien avec parquet point de Hongrie, moulures dorées et 3 cheminées en marbre. Plein sud, très lumineux.",
    prix: 685000,
    priceLabel: "685 000 €",
    priceSub: "8 058 €/m²",
    surface: 85,
    cat: 'vente',
    type: 'appartement',
    ville: 'Paris',
    code_postal: '75008',
    location: 'Paris 8e (75008)',
    pieces: 4,
    chambres: 2,
    sdb: 1,
    etage: 3,
    publisher: 'pro',
    pubName: 'Agence Opéra Prestige',
    bg: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    emoji: '🏛️',
    trustScore: 94,
    verified: 1,
    smartMatch: 96
  },
  {
    titre: "Villa contemporaine avec piscine chauffée",
    description: "Villa d'architecte aux prestations haut de gamme, piscine à débordement, vue panoramique sur la Sainte-Victoire.",
    prix: 1250000,
    priceLabel: "1 250 000 €",
    priceSub: "5 681 €/m²",
    surface: 220,
    cat: 'vente',
    type: 'villa',
    ville: 'Aix-en-Provence',
    code_postal: '13100',
    location: 'Aix-en-Provence (13100)',
    pieces: 6,
    chambres: 4,
    sdb: 3,
    etage: 0,
    publisher: 'pro',
    pubName: 'Sainte-Victoire Immobilier',
    bg: 'linear-gradient(135deg, #064e3b, #047857)',
    emoji: '🏡',
    trustScore: 98,
    verified: 1,
    smartMatch: 92
  },
  {
    titre: "Loft industriel rénové — Canal Saint-Martin",
    description: "Ancienne imprimerie réhabilitée avec verrière de 5m de hauteur sous plafond. Style brut, métal et briques apparentes.",
    prix: 890000,
    priceLabel: "890 000 €",
    priceSub: "7 416 €/m²",
    surface: 120,
    cat: 'vente',
    type: 'loft',
    ville: 'Paris',
    code_postal: '75010',
    location: 'Paris 10e (75010)',
    pieces: 3,
    chambres: 2,
    sdb: 2,
    etage: 1,
    publisher: 'particulier',
    pubName: 'Marc V.',
    bg: 'linear-gradient(135deg, #451a03, #78350f)',
    emoji: '🏭',
    trustScore: 88,
    verified: 1,
    smartMatch: 89
  },
  {
    titre: "Studio meublé design — Hyper centre Lyon",
    description: "Studio refait à neuf par architecte d'intérieur, cuisine équipée, tout confort. Idéal étudiant ou jeune actif.",
    prix: 780,
    priceLabel: "780 €/mois",
    priceSub: "CC (Charges Comprises)",
    surface: 28,
    cat: 'location',
    type: 'studio',
    ville: 'Lyon',
    code_postal: '69002',
    location: 'Lyon 2e (69002)',
    pieces: 1,
    chambres: 1,
    sdb: 1,
    etage: 2,
    publisher: 'pro',
    pubName: 'Rhône Habitat Pro',
    bg: 'linear-gradient(135deg, #311b92, #4527a0)',
    emoji: '🛋️',
    trustScore: 91,
    verified: 1,
    smartMatch: 95
  },
  {
    titre: "Maison familiale avec grand jardin arboré",
    description: "Maison de ville éco-responsable avec panneaux solaires et terrasse plein sud. Proche écoles et commerces.",
    prix: 420000,
    priceLabel: "420 000 €",
    priceSub: "3 111 €/m²",
    surface: 135,
    cat: 'vente',
    type: 'maison',
    ville: 'Bordeaux',
    code_postal: '33000',
    location: 'Bordeaux (33000)',
    pieces: 5,
    chambres: 3,
    sdb: 2,
    etage: 0,
    publisher: 'particulier',
    pubName: 'Sophie T.',
    bg: 'linear-gradient(135deg, #14532d, #15803d)',
    emoji: '🌳',
    trustScore: 85,
    verified: 0,
    smartMatch: 87
  },
  {
    titre: "Superbe appartement T3 Vue Mer",
    description: "Bel appartement avec balcon offrant une magnifique vue dégagée sur la mer. Résidence sécurisée.",
    prix: 1200,
    priceLabel: "1 200 €/mois",
    priceSub: "CC (Charges Comprises)",
    surface: 70,
    cat: 'location',
    type: 'appartement',
    ville: 'Marseille',
    code_postal: '13008',
    location: 'Marseille 8e (13008)',
    pieces: 3,
    chambres: 2,
    sdb: 1,
    etage: 4,
    publisher: 'pro',
    pubName: 'Sud Immo',
    bg: 'linear-gradient(135deg, #0369a1, #075985)',
    emoji: '🌊',
    trustScore: 92,
    verified: 1,
    smartMatch: 90
  }
];

const insert = db.prepare(`
  INSERT INTO biens (
    titre, description, prix, priceLabel, priceSub, surface, cat, type, ville, code_postal, location,
    pieces, chambres, sdb, etage, publisher, pubName, bg, emoji, trustScore, verified, smartMatch
  ) VALUES (
    @titre, @description, @prix, @priceLabel, @priceSub, @surface, @cat, @type, @ville, @code_postal, @location,
    @pieces, @chambres, @sdb, @etage, @publisher, @pubName, @bg, @emoji, @trustScore, @verified, @smartMatch
  )
`);

const check = db.prepare('SELECT count(*) as count FROM biens').get();
db.prepare('DELETE FROM biens').run();
console.log('🗑️ Anciennes données effacées.');

let count = 0;
for (const bien of biens) {
  insert.run(bien);
  count++;
}
console.log(`✅ Succès : ${count} annonces ont été insérées.`);

console.log('🌱 Seeding terminé.');
