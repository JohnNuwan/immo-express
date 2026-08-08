// ========== RISQUES GÉOGRAPHIQUES — Module Immo-Express ==========
// Sources officielles : API Géorisques (BRGM/État), IGN, data.gouv.fr
// ==============================================================

// ========== API GÉORISQUES ==========
const GEORISQUES_BASE = 'https://georisques.gouv.fr/api/v1';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// ========== CACHE ==========
const geoCache = {};

// ========== GÉOCODAGE ==========
async function geocodeAddress(query) {
  const cacheKey = 'geo_' + query.toLowerCase().trim();
  if (geoCache[cacheKey]) return geoCache[cacheKey];

  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=fr&addressdetails=1`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'ImmoExpress/1.0' } });
  if (!resp.ok) throw new Error('Géocoding échoué');
  const data = await resp.json();
  if (!data.length) throw new Error('Adresse introuvable');
  const r = data[0];
  const result = {
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
    city: r.address?.city || r.address?.town || r.address?.village || '',
    postcode: r.address?.postcode || '',
    insee: r.address?.city_code || r.address?.village_code || '',
    department: r.address?.state || ''
  };
  geoCache[cacheKey] = result;
  return result;
}

// ========== API GÉORISQUES — Données par commune ==========
async function fetchRisquesByCommune(codeInsee) {
  if (!codeInsee) return null;
  const cacheKey = 'risques_' + codeInsee;
  if (geoCache[cacheKey]) return geoCache[cacheKey];

  try {
    // Risques naturels et technologiques (endpoint consolidé)
    const proxy = 'http://127.0.0.1:8000/api/opendata/proxy?url=';
    const [risques, radon, seisme, argiles, icpe] = await Promise.all([
      fetch(proxy + encodeURIComponent(`${GEORISQUES_BASE}/risques?code_insee=${codeInsee}`)).then(r => r.ok ? r.json() : null),
      fetch(proxy + encodeURIComponent(`${GEORISQUES_BASE}/radon?code_insee=${codeInsee}`)).then(r => r.ok ? r.json() : null),
      fetch(proxy + encodeURIComponent(`${GEORISQUES_BASE}/seisme?code_insee=${codeInsee}`)).then(r => r.ok ? r.json() : null),
      fetch(proxy + encodeURIComponent(`${GEORISQUES_BASE}/argiles?code_insee=${codeInsee}`)).then(r => r.ok ? r.json() : null),
      fetch(proxy + encodeURIComponent(`${GEORISQUES_BASE}/icpe?code_insee=${codeInsee}&page=1&page_size=1`)).then(r => r.ok ? r.json() : null)
    ]);

    const result = {
      risques: parseRisques(risques),
      radon: parseRadon(radon),
      seisme: parseSeisme(seisme),
      argiles: parseArgiles(argiles),
      icpe: parseICPE(icpe),
      raw: { risques, radon, seisme, argiles, icpe }
    };
    geoCache[cacheKey] = result;
    return result;
  } catch (e) {
    console.warn('Erreur API Géorisques:', e);
    return null;
  }
}

// ========== PARSERS ==========
function parseRisques(data) {
  if (!data?.data?.length) return null;
  const risques = data.data;
  const result = {
    inondation: null,
    mouvementTerrain: null,
    cavites: null,
    feuxForet: null,
    submersionMarine: null,
    avalanche: null,
    risquesTechno: null,
    count: 0
  };
  for (const r of risques) {
    const lib = (r.libelle_risque || '').toLowerCase();
    if (lib.includes('inondation') || lib.includes('crue')) result.inondation = r;
    if (lib.includes('mouvement de terrain')) result.mouvementTerrain = r;
    if (lib.includes('cavité') || lib.includes('cavite')) result.cavites = r;
    if (lib.includes('feu de forêt') || lib.includes('feu de foret')) result.feuxForet = r;
    if (lib.includes('submersion')) result.submersionMarine = r;
    if (lib.includes('avalanche')) result.avalanche = r;
    if (lib.includes('industriel') || lib.includes('seveso') || lib.includes('icpe')) result.risquesTechno = r;
    result.count++;
  }
  return result;
}

function parseRadon(data) {
  if (!data?.data?.length) return null;
  return data.data[0];
}

function parseSeisme(data) {
  if (!data?.data?.length) return null;
  return data.data[0];
}

function parseArgiles(data) {
  if (!data?.data?.length) return null;
  return data.data[0];
}

function parseICPE(data) {
  if (!data?.data?.length) return null;
  return { count: data.total_count || data.data.length, etablissements: data.data };
}

// ========== CALCUL DU SCORE GÉOGRAPHIQUE & RISQUES ==========
function computeGeoRiskScore(geoData) {
  if (!geoData) return { score: 50, details: {}, niveau: 'Non disponible' };

  const details = {};
  let penalites = 0;
  let maxPenalite = 100;

  // 1. SÉISME (15 points)
  const seisme = geoData.seisme;
  if (seisme) {
    const zone = parseInt(seisme.zone_sismique) || 1;
    // Zone 1 = très faible, Zone 5 = très fort
    const penSeisme = Math.min(15, (zone - 1) * 3.75);
    penalites += penSeisme;
    details.seisme = {
      note: Math.round(15 - penSeisme),
      penalite: Math.round(penSeisme),
      zone: zone,
      label: ['Très faible', 'Faible', 'Modéré', 'Moyen', 'Fort'][zone - 1] || 'Inconnu'
    };
  }

  // 2. ARGILES — Retrait-gonflement (15 points)
  const argiles = geoData.argiles;
  if (argiles) {
    const niveau = (argiles.libelle_alea || argiles.alea || '').toLowerCase();
    let penArgiles = 0;
    if (niveau.includes('fort')) penArgiles = 15;
    else if (niveau.includes('moyen')) penArgiles = 10;
    else if (niveau.includes('faible')) penArgiles = 3;
    else penArgiles = 0;
    penalites += penArgiles;
    details.argiles = {
      note: Math.round(15 - penArgiles),
      penalite: Math.round(penArgiles),
      niveau: niveau || 'Non renseigné'
    };
  }

  // 3. INONDATION (15 points)
  const inondation = geoData.risques?.inondation;
  if (inondation) {
    const penInondation = 12; // Présence d'un risque inondation
    penalites += penInondation;
    details.inondation = {
      note: 3,
      penalite: penInondation,
      present: true,
      libelle: inondation.libelle_risque || 'Zone inondable'
    };
  } else {
    details.inondation = { note: 15, penalite: 0, present: false };
  }

  // 4. RADON (10 points)
  const radon = geoData.radon;
  if (radon) {
    const categorie = parseInt(radon.classe_potentiel) || 1;
    const penRadon = [0, 2, 5, 10][categorie - 1] || 0;
    penalites += penRadon;
    details.radon = {
      note: Math.round(10 - penRadon),
      penalite: penRadon,
      categorie: categorie,
      label: ['Faible', 'Moyen', 'Significatif', 'Élevé'][categorie - 1] || 'Inconnu'
    };
  }

  // 5. MOUVEMENTS DE TERRAIN (10 points)
  const mt = geoData.risques?.mouvementTerrain;
  if (mt) {
    penalites += 8;
    details.mouvementTerrain = { note: 2, penalite: 8, present: true };
  } else {
    details.mouvementTerrain = { note: 10, penalite: 0, present: false };
  }

  // 6. CAVITÉS SOUTERRAINES (10 points)
  const cavites = geoData.risques?.cavites;
  if (cavites) {
    penalites += 8;
    details.cavites = { note: 2, penalite: 8, present: true };
  } else {
    details.cavites = { note: 10, penalite: 0, present: false };
  }

  // 7. FEUX DE FORÊT (10 points)
  const feux = geoData.risques?.feuxForet;
  if (feux) {
    penalites += 7;
    details.feuxForet = { note: 3, penalite: 7, present: true };
  } else {
    details.feuxForet = { note: 10, penalite: 0, present: false };
  }

  // 8. SUBMERSION MARINE (5 points — seulement pour le littoral)
  const submersion = geoData.risques?.submersionMarine;
  if (submersion) {
    penalites += 5;
    details.submersionMarine = { note: 0, penalite: 5, present: true };
  } else {
    details.submersionMarine = { note: 5, penalite: 0, present: false };
  }

  // 9. RISQUES INDUSTRIELS / ICPE (10 points)
  const icpe = geoData.icpe;
  if (icpe && icpe.count > 0) {
    const penICPE = Math.min(10, Math.round(icpe.count / 5));
    penalites += penICPE;
    details.icpe = {
      note: Math.round(10 - penICPE),
      penalite: penICPE,
      count: icpe.count
    };
  } else {
    details.icpe = { note: 10, penalite: 0, count: 0 };
  }

  // Score final (inversé : plus de pénalités = moins de points)
  const score = Math.max(0, Math.min(100, Math.round(100 - penalites)));

  // Niveau
  let niveau, couleur;
  if (score >= 85) { niveau = 'Très faible'; couleur = '#059669'; }
  else if (score >= 70) { niveau = 'Faible'; couleur = '#0d9488'; }
  else if (score >= 55) { niveau = 'Modéré'; couleur = '#d97706'; }
  else if (score >= 35) { niveau = 'Élevé'; couleur = '#ea580c'; }
  else { niveau = 'Très élevé'; couleur = '#dc2626'; }

  return { score, penalites, maxPenalite, details, niveau, couleur };
}

// ========== FONCTION PRINCIPALE ==========
async function analyzeGeoRisques(address) {
  if (!address || address.trim().length < 3) {
    throw new Error('Veuillez saisir une adresse valide (3 caractères minimum)');
  }

  // 1. Géocodage
  const geo = await geocodeAddress(address);
  if (!geo || !geo.insee) {
    // Fallback : essayer avec juste la ville
    const geo2 = await geocodeAddress(address + ', France');
    if (!geo2 || !geo2.insee) throw new Error('Impossible de localiser cette adresse');
    Object.assign(geo, geo2);
  }

  // 2. Risques via Géorisques
  const risques = await fetchRisquesByCommune(geo.insee);
  if (!risques) {
    throw new Error('Données risques non disponibles pour cette commune');
  }

  // 3. Calcul du score
  const scoreData = computeGeoRiskScore(risques);

  // 4. Enrichissement avec les données de marché si disponibles
  const market = typeof findMarket === 'function' ? findMarket(geo.city) : null;

  return {
    geo,
    risques,
    score: scoreData,
    market
  };
}

// ========== UTILITAIRES D'AFFICHAGE ==========
function getRiskEmoji(riskType) {
  const map = {
    seisme: '🌋',
    argiles: '🏜️',
    inondation: '🌊',
    radon: '☢️',
    mouvementTerrain: '⛰️',
    cavites: '🕳️',
    feuxForet: '🔥',
    submersionMarine: '🌊',
    icpe: '🏭'
  };
  return map[riskType] || '⚠️';
}

function getRiskIcon(score) {
  if (score >= 85) return '🟢';
  if (score >= 70) return '🟢';
  if (score >= 55) return '🟡';
  if (score >= 35) return '🟠';
  return '🔴';
}

// ========== EXPORT ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeGeoRisques, computeGeoRiskScore, geocodeAddress, fetchRisquesByCommune };
}