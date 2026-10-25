import { v4 as uuidv4 } from 'uuid';
import { createUser, createListing } from './db.js';

console.log('🌱 Seeding Immo-Express NODUS database...\n');

// Admin user
const adminId = uuidv4();
createUser({
  id: adminId,
  email: 'admin@nodus.systems',
  password: 'admin123',
  name: 'Admin NODUS',
  role: 'admin',
  phone: '+33123456789',
  company: 'NODUS SYSTEMS'
});
console.log('✅ Admin: admin@nodus.systems / admin123');

// Test agent
const agentId = uuidv4();
createUser({
  id: agentId,
  email: 'agent@immo.express',
  password: 'agent123',
  name: 'Eva Agent',
  role: 'agent',
  phone: '+33987654321',
  company: 'NODUS SYSTEMS'
});
console.log('✅ Agent: agent@immo.express / agent123');

// Test user
const userId = uuidv4();
createUser({
  id: userId,
  email: 'user@test.fr',
  password: 'user123',
  name: 'Test User',
  role: 'particulier',
  phone: '+33612345678'
});
console.log('✅ User: user@test.fr / user123\n');

// Sample listings
const listings = [
  { title: 'Appartement 3 pièces centre-ville', cat: 'vente', type: 'appartement', price: 295000, surface: 72, pieces: 3, city: 'Lyon', zipcode: '69003', description: 'Superbe appartement lumineux au 3e étage avec balcon. Proche métro et commerces.', dpe: 'C', condition: 'bon-etat', etage: 3, chambres: 2, sdb: 1, year: 2015, equip: '["balcon","ascenseur","fibre"]' },
  { title: 'Maison de ville 4 pièces avec jardin', cat: 'vente', type: 'maison', price: 420000, surface: 110, pieces: 4, city: 'Bordeaux', zipcode: '33000', description: 'Belle maison de ville entièrement rénovée. Jardin de 80m², garage, proche écoles.', dpe: 'B', condition: 'neuf', etage: 0, chambres: 3, sdb: 2, year: 2022, equip: '["jardin","parking","fibre","cheminee"]' },
  { title: 'Studio meublé centre historique', cat: 'location', type: 'studio', price: 650, surface: 28, pieces: 1, city: 'Paris', zipcode: '75004', description: 'Studio meublé au coeur du Marais. Proche métro, commerces de proximité.', dpe: 'D', condition: 'bon-etat', etage: 4, chambres: 0, sdb: 1, year: 1995, equip: '["ascenseur","meuble","fibre"]' },
  { title: 'Villa contemporaine piscine vue mer', cat: 'vente', type: 'villa', price: 890000, surface: 180, pieces: 6, city: 'Nice', zipcode: '06000', description: 'Magnifique villa contemporaine avec piscine chauffée et vue imprenable sur la Méditerranée.', dpe: 'A', condition: 'neuf', etage: 0, chambres: 4, sdb: 3, year: 2024, equip: '["piscine","jardin","terrasse","parking","alarme","fibre"]' },
  { title: 'Local commercial 150m² rue passante', cat: 'vente', type: 'local', price: 550000, surface: 150, pieces: 3, city: 'Marseille', zipcode: '13001', description: 'Local commercial en pleine rue piétonne. Vitrine de 8m, mezzanine, cave.', dpe: 'E', condition: 'travaux', etage: 0, chambres: 0, sdb: 1, year: 1980, equip: '["alarme","fibre"]' },
  { title: 'Appartement 2 pièces proche gare', cat: 'location', type: 'appartement', price: 520, surface: 45, pieces: 2, city: 'Nantes', zipcode: '44000', description: 'Appartement fonctionnel à 5min de la gare. Idéal étudiant ou jeune actif.', dpe: 'C', condition: 'bon-etat', etage: 2, chambres: 1, sdb: 1, year: 2005, equip: '["ascenseur","fibre","cuisine-equipee"]' },
  { title: 'Terrain à bâtir 500m² vue montagne', cat: 'vente', type: 'terrain', price: 145000, surface: 500, pieces: 0, city: 'Grenoble', zipcode: '38000', description: 'Terrain constructible viabilisé avec vue imprenable sur le massif de Belledonne.', dpe: '', condition: 'neuf', year: 2024, equip: '[]' },
  { title: 'Penthouse de luxe 5 pièces rooftop', cat: 'vente', type: 'penthouse', price: 1250000, surface: 200, pieces: 5, city: 'Toulouse', zipcode: '31000', description: 'Penthouse d\'exception au dernier étage. Terrasse de 80m², jacuzzi, vue dégagée.', dpe: 'B', condition: 'neuf', etage: 10, chambres: 3, sdb: 3, year: 2023, equip: '["terrasse","parking","ascenseur","alarme","fibre","cuisine-equipee"]' },
];

for (const data of listings) {
  createListing({
    id: uuidv4(),
    user_id: adminId,
    ...data,
    publisher: 'pro',
    pub_name: 'NODUS Immobilier',
    email: 'contact@nodus.systems',
    phone: '+33123456789',
    company: 'NODUS SYSTEMS',
    trust_score: Math.floor(Math.random() * 30) + 70,
    status: 'active'
  });
}

console.log(`✅ ${listings.length} annonces de démonstration créées`);
console.log('\n🚀 Seed complete — Immo-Express NODUS prêt !');