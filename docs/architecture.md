# Architecture d'Immo-Express

## Vue d'ensemble

Immo-Express est une application web **monolithique** (single-page application) en HTML/CSS/JS vanilla. Toute la logique est contenue dans un seul fichier `index.html` pour une simplicité de déploiement maximale.

## Architecture technique

### Structure des données

```javascript
// Une annonce (listing)
{
  id: number,           // Identifiant unique
  cat: 'vente'|'location',
  type: string,          // appartement, maison, villa, studio...
  title: string,         // Titre de l'annonce
  location: string,      // Ville + code postal
  price: number,         // Prix en euros
  priceLabel: string,    // Prix formaté pour affichage
  priceSub: string,      // Sous-titre prix (€/m², CC, HC...)
  surface: number,       // Surface en m²
  pieces: number,        // Nombre de pièces
  chambres: number,      // Nombre de chambres
  sdb: number,           // Salles de bain
  etage: number,         // Étage
  publisher: 'pro'|'particulier',
  pubName: string,       // Nom du publiant
  date: string,          // Date de publication
  bg: string,            // Couleur d'arrière-plan
  emoji: string,         // Emoji représentatif
  desc: string,          // Description détaillée
  trustScore: number,     // Score de confiance /100
  verified: boolean,      // Annonce vérifiée ?
  priceHistory: array,    // Historique des prix
  marketAvg: number,      // Prix moyen du marché
  smartMatch: number,     // % de compatibilité
  bookingSlots: array     // Créneaux de visite
}
```

### Innovations intégrées

| Innovation | Où ? | Comment ? |
|---|---|---|
| Score de confiance | Carte + Modale | Barre de progression, couleur, label |
| Analyse IA du prix | Modale | Comparaison marché, écart en % |
| Historique des prix | Modale | Liste des baisses avec dates |
| Smart Match | Carte + Modale | % sous le prix |
| Réservation visites | Modale | Grille de créneaux cliquables |
| IA Décoration | Modale | 4 styles avec simulation |
| Chatbot | Bouton flottant | 8 thématiques, réponses rapides |
| Favoris | Header + Carte | localStorage, compteur |
| Récemment consultés | Sidebar | localStorage, 5 derniers |
| Comparateur | Sidebar + Modale | 2-3 biens en grille |
| Calculateur prêt | Modale | Simulation mensualités |
| Partage | Modale | WhatsApp, email, lien |

### Flux de données

```
[localStorage]
  ├── favorites : [id1, id2, ...]
  ├── recent : [{id, title, price, ...}, ...]
  ├── compare : [id1, id2]
  └── alerts : [{criteria}, ...]

[listings] → getFiltered() → render() → DOM
  ↓ filtres, tri
[state] → cat, type, search, minPrice, maxPrice, publisher, scoreFilter, sort
```

### Composants UI

```
Header
├── Logo
├── Navigation (Vente, Location, Pros)
├── Favoris (compteur + popup)
└── Déposer une annonce

Hero Search
├── Titre
└── Barre de recherche (input + 2 selects + bouton)

Quick Stats
└── 4 indicateurs

Main Layout
├── Sidebar (filtres)
│   ├── Type de bien
│   ├── Catégorie
│   ├── Budget
│   ├── Score de confiance
│   ├── Éditeur
│   ├── Récemment consultés
│   └── Comparateur
└── Results Area
    ├── En-tête (compteur + tri)
    └── Grille d'annonces

Modal Détail
├── En-tête (titre + fermeture)
├── Image + badges
├── Prix + localisation
├── Grille caractéristiques
├── Description
├── Block Score de confiance
├── Block Analyse IA du prix
├── Block Historique des prix
├── Block Calendrier visites
├── Block IA Décoration
├── Calculateur de prêt
├── Annonces similaires
├── Contact
└── Partage

Modal Dépôt
├── 8 sections de formulaire
└── Écran de succès

Chatbot
├── Bouton flottant
├── Panneau de chat
├── Réponses rapides
└── Input

Footer
└── 4 colonnes + bottom
```

### Performance

- **Poids** : ~72 KB (index.html)
- **Requêtes** : 1 (Google Fonts) + 2 (icônes SVG inline)
- **Rendu** : DOM manipulation directe, pas de framework
- **Stockage** : localStorage (< 10 KB)

### Roadmap technique

1. **Découpage** : séparer CSS/JS en fichiers distincts
2. **Build** : ajouter un bundler (Vite) pour minification
3. **Backend** : API REST (Node.js + Express ou Python + FastAPI)
4. **Base de données** : PostgreSQL pour les annonces, utilisateurs
5. **Auth** : JWT pour les comptes utilisateur
6. **Mobile** : PWA ou React Native