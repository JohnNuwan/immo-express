# 📦 Publication Play Store — ImmoExpress v1.0

## Informations générales

| Champ | Valeur |
|---|---|
| **Nom** | ImmoExpress |
| **Description courte** | Plateforme immobilière intelligente — notation IA, achat, location, espace pro |
| **Catégorie** | Immobilier / Utilitaires |
| **Prix** | Gratuit |
| **Âge** | 3+ |
| **App ID** | `com.immoexpress.app` |
| **Version** | 1.0.0 |
| **Min SDK** | Android 7.0 (API 24) |
| **Target SDK** | Android 16 (API 36) |

---

## Description longue (français)

**ImmoExpress** est la première plateforme immobilière intelligente qui analyse et note tous les biens immobiliers avant votre achat ou location.

**🔬 Notation IA 8 critères**
Évaluez n'importe quel bien immobilier avec notre moteur de scoring exclusif : prix de marché, rendement locatif, risques inondation, DPE, transports, quartier, projets urbains et potentiel de plus-value. Obtenez une note sur 100 avec radar chart et recommandations personnalisées.

**💰 Achat**
Parcourez des milliers d'annonces immobilières partout en France. Utilisez notre simulateur de prêt immobilier et notre estimateur de frais de notaire intégrés.

**📍 Location**
Trouvez votre location idéale avec des filtres précis (meublé, DPE, durée, surface). Estimez le loyer de votre futur logement et calculez le rendement locatif d'un investissement.

**🏢 Espace Professionnel**
Les agents immobiliers bénéficient d'un tableau de bord complet : gestion d'annonces, suivi des leads, statistiques de vues et abonnements flexibles à partir de 29€/mois.

**Fonctionnalités clés :**
- ✅ Notation immobilière IA sur 8 critères
- ✅ Simulateur de prêt immobilier
- ✅ Estimateur de loyer et rendement locatif
- ✅ Guide des loyers par ville
- ✅ Calculateur de frais de notaire
- ✅ Dashboard professionnel avec statistiques
- ✅ Annonces vérifiées avec score de confiance
- ✅ Interface moderne, rapide et intuitive

---

## Screenshots à prendre

| # | Page | Contenu à capturer |
|---|---|---|
| 1 | **Accueil** | Hero search + annonces (téléphone) |
| 2 | **Notation IA** | Score circulaire 81/100 + radar chart |
| 3 | **Notation IA** | Grille des 8 critères avec barres de score |
| 4 | **Achat** | Liste des biens + simulateur prêt |
| 5 | **Location** | Carte location + estimateur loyer |
| 6 | **Espace Pro** | Dashboard KPIs + graphique vues |
| 7 | **Espace Pro** | Abonnements (Starter 29€, Pro 59€, Premium 119€) |
| 8 | **Détail annonce** | Modal avec infos + score + prix vs marché |

> **Conseil :** Prends les screenshots avec un émulateur Android en 1080x1920px (Pixel 6 par exemple)
> Format : JPEG 24-bit, 3200px de large max

---

## Texte promotionnel (Google Play)

```
🔬 NOTATION IMMOBILIÈRE IA — Le premier moteur de scoring qui analyse vos biens sur 8 critères : prix, rendement, risques, DPE, transports, quartier, projets et plus-value. Obtenez une note /100 avec radar et conseils personnalisés.

💰 ACHAT : Simulateur de prêt, frais de notaire, comparateur de prix. Trouvez le bien au juste prix.

📍 LOCATION : Estimez votre loyer, calculez le rendement, consultez le guide des loyers par ville.

🏢 ESPACE PRO : Dashboard, leads, statistiques. Abonnements dès 29€/mois.
```

---

## Catégorisation Google Play

- **Catégorie** : Maison et immobilier
- **Tags** : immobilier, maison, appartement, location, vente, notation, IA, prêt immobilier, simulateur
- **Contenu** : Tout public

---

## Fichiers release

| Fichier | Taille | Usage |
|---|---|---|
| `release/ImmoExpress-v1.0.aab` | 3,0 Mo | **À uploader sur Play Store** (format recommandé) |
| `release/ImmoExpress-v1.0.apk` | 3,1 Mo | APK signé (test interne) |
| `release/ImmoExpress-v1.0-debug.apk` | 4,1 Mo | APK debug (installation manuelle) |
| `release/release.keystore` | 2,8 Ko | **À garder précieusement** (perte = app impossible à mettre à jour) |
| `vente.html` | — | Page achat |
| `location.html` | — | Page location |
| `scoring.html` | — | Page notation |
| `pro.html` | — | Espace pro |
| `index.html` | — | Accueil |

---

## ⚠️ IMPORTANT : Conserver la keystore

Le fichier **`release/release.keystore`** est la clé de signature de l'application.

**Sans elle, tu ne pourras JAMAIS mettre à jour l'app sur le Play Store.**
- Mot de passe : `ImmoExpress2026`
- Alias : `immoexpress`
- Backup sur un cloud (Google Drive, Dropbox) et un disque externe