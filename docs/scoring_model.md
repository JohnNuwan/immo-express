# Modèle de Scoring & Algorithmes (IGI)

Le système de scoring d'Immo-Express est le cœur de son intelligence métier. Il repose sur deux algorithmes principaux permettant d'évaluer la qualité intrinsèque et l'environnement d'un bien immobilier.

## 1. Indice Global Immobilier (IGI)

L'IGI est une note composite sur 100 points, conçue pour refléter l'attractivité globale d'un emplacement.

### Mode de calcul

Le score IGI est la somme pondérée de 4 piliers d'évaluation :

1. **Services & Commerces (35%)**
   - Évalue la densité de POI (Points of Interest) autour du bien : supermarchés, boulangeries, pharmacies, restaurants.
   - Les données sont extraites des API OpenData (ex: Nominatim/OSM).

2. **Éducation & Famille (25%)**
   - Prend en compte la présence d'écoles maternelles, primaires, collèges et lycées à proximité.
   - Un bonus est accordé si des infrastructures de petite enfance (crèches) sont présentes.

3. **Transports & Mobilité (25%)**
   - Analyse la distance jusqu'aux arrêts de bus, stations de métro ou gares.
   - Favorise les biens situés à moins de 10 minutes à pied d'un axe de transport en commun.

4. **Environnement & Nature (15%)**
   - Détecte la proximité des parcs, espaces verts ou zones boisées.

### Référentiel des prix (france.db)

Le modèle s'appuie également sur la base de données statique SQLite locale `assets/data/france.db` pour comparer le prix du bien avec le prix médian du marché dans la commune, ajoutant un indicateur de "Smart Match" financier.

---

## 2. Analyse des Risques Géographiques (Géorisques)

Immo-Express intègre une évaluation dynamique et en temps réel (via cache Backend) des risques naturels et technologiques d'une parcelle cadastrale.

Les données proviennent de l'API officielle de l'État : `georisques.gouv.fr/api/v1/gaspar`.

### Les 5 axes d'analyse des risques :
- **Risques Naturels et Technologiques (PPRn, PPRt)** : Inondations, feux de forêts, etc.
- **Risque Sismique** : Noté de 1 (Très Faible) à 5 (Fort).
- **Potentiel Radon** : Noté de 1 (Faible) à 3 (Élevé).
- **Retrait-Gonflement des Argiles (RGA)** : Sensibilité du sol (Faible, Moyen, Fort).
- **Installations Industrielles (ICPE)** : Présence d'usines ou installations classées à proximité (Seveso, etc.).

### L'Index de Sûreté

Le module agrège ces données pour produire un **Index de Sûreté Géographique** de `A` (Optimal) à `F` (Critique). 
- Un niveau de Sismicité de 4 ou 5 retire 20 points de base.
- Un risque inondation majeur bloque automatiquement la note maximale à `C`.
- Les zones argileuses fortes activent une recommandation automatique d'audit de fondations pour les maisons individuelles.
