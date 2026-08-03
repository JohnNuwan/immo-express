// ========== DATA ==========
const listings = [];

// ========== STATE ==========
let state = {category:'all',type:'all',search:'',minPrice:'',maxPrice:'',publisher:'all',scoreFilter:0,sort:'recent',currentTab:'all'};
let uploadedPhotos = [];
let photoCounter = 0;

// ========== FILTER + SORT ==========
function getFiltered() {
  return listings.filter(p => {
    if(state.category!=='all' && p.cat!==state.category) return false;
    if(state.type!=='all' && p.type!==state.type) return false;
    if(state.search){const q=state.search.toLowerCase();if(!p.title.toLowerCase().includes(q)&&!p.location.toLowerCase().includes(q)&&!p.type.toLowerCase().includes(q))return false}
    if(state.minPrice && p.price<Number(state.minPrice)) return false;
    if(state.maxPrice && p.price>Number(state.maxPrice)) return false;
    if(state.publisher!=='all' && p.publisher!==state.publisher) return false;
    if(state.scoreFilter>0 && (p.trustScore||0)<state.scoreFilter) return false;
    return true;
  }).sort((a,b)=>{
    switch(state.sort){
      case'price-asc':return a.price-b.price;
      case'price-desc':return b.price-a.price;
      case'score':return (b.trustScore||0)-(a.trustScore||0);
      default:return b.id-a.id;
    }
  });
}

// ========== RENDER ==========
function trustScoreBadge(score) {
  if(!score) return '';
  const cls = score>=80?'score-high':score>=60?'score-mid':'score-low';
  const stars = score>=80?'⭐⭐⭐⭐':score>=60?'⭐⭐⭐':score>=40?'⭐⭐':'⭐';
  return `<span class="listing-score ${cls}">${stars} ${score}</span>`;
}

function renderCard(p) {
  const isSale = p.cat==='vente';
  const badgeClass = isSale?'badge-sale':'badge-rent';
  const badgeText = isSale?'Vente':'Location';
  const pubClass = p.publisher==='pro'?'pub-pro':'pub-particulier';
  const pubLabel = p.publisher==='pro'?'Pro':'Particulier';
  return `<div class="listing-card" onclick="openModal(${p.id})">
    <div class="listing-img" style="background:${p.bg};">
      <span class="img-badge ${badgeClass}">${badgeText}</span>
      ${p.verified?`<span class="img-badge badge-verified">🛡️ Vérifié</span>`:''}
      ${p.emoji}
    </div>
    <div class="listing-info">
      <div class="listing-price">${p.priceLabel}${trustScoreBadge(p.trustScore)}</div>
      <div class="listing-price-sub">${p.priceSub}${p.smartMatch?`<span class="smart-match">🤖 ${p.smartMatch}% match</span>`:''}</div>
      <div class="listing-title">${p.title}</div>
      <div class="listing-location">📍 ${p.location}</div>
      <div class="listing-tags">
        <span class="listing-tag">📐 <strong>${p.surface} m²</strong></span>
        <span class="listing-tag">🛏️ <strong>${p.pieces}</strong> pièces</span>
        <span class="listing-tag">🛁 <strong>${p.sdb}</strong> SdB</span>
        ${p.etage?`<span class="listing-tag">🏢 Étage <strong>${p.etage}</strong></span>`:''}
      </div>
      <div class="listing-footer">
        <div class="listing-publisher"><span class="pub-type ${pubClass}">${pubLabel}</span>${p.pubName}</div>
        <div class="listing-date">${p.date}</div>
      </div>
    </div>
  </div>`;
}

function render() {
  const grid = document.getElementById('listingsGrid');
  const count = document.getElementById('resultsCount');
  const filtered = getFiltered();
  count.innerHTML = `<strong>${filtered.length}</strong> annonce${filtered.length>1?'s':''} trouvée${filtered.length>1?'s':''}`;
  if(filtered.length===0) grid.innerHTML='<div class="no-results"><div class="icon">🔍</div><h3>Aucune annonce trouvée</h3><p>Essayez de modifier vos filtres.</p></div>';
  else grid.innerHTML=filtered.map(renderCard).join('');
}

// ========== MODAL ==========
function openModal(id) {
  const p = listings.find(x=>x.id===id);
  if(!p) return;
  const isSale = p.cat==='vente';
  const badgeClass = isSale?'badge-sale':'badge-rent';
  const badgeText = isSale?'Vente':'Location';
  const pubClass = p.publisher==='pro'?'pub-pro':'pub-particulier';
  const pubLabel = p.publisher==='pro'?`<span class="pub-type ${pubClass}">Pro</span> ${p.pubName}`:`<span class="pub-type ${pubClass}">Particulier</span> ${p.pubName}`;

  const sc = p.trustScore||0;
  const scColor = sc>=80?'#059669':sc>=60?'#d97706':'#dc2626';
  const scLabel = sc>=80?'Excellent':sc>=60?'Bon':'À améliorer';

  const priceDiff = p.marketAvg ? Math.round((p.price - p.marketAvg) / p.marketAvg * 100) : 0;
  const diffLabel = priceDiff>0?`+${priceDiff}% au-dessus du marché`:`${priceDiff}% en dessous du marché`;
  const diffColor = priceDiff>5?'#dc2626':priceDiff<-5?'#059669':'#d97706';

  const histHtml = p.priceHistory.length>0?p.priceHistory.map(h=>`<div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:4px 0;border-bottom:1px solid var(--border);"><span>${h.date}</span><strong>${h.price.toLocaleString('fr-FR')} €</strong></div>`).join(''):'<div style="font-size:0.8rem;color:var(--text-tertiary);text-align:center;">Aucune baisse de prix enregistrée</div>';

  const bookingHtml = p.bookingSlots && p.bookingSlots.length>0
    ? `<div class="booking-grid">${p.bookingSlots.map(s=>{
        const [d,time]=s.split(' ');
        return `<div class="booking-day" onclick="bookSlot('${s}')"><div class="day-name">${d}</div><div class="day-num">${time}</div><div class="day-slots">Disponible</div></div>`;
      }).join('')}</div>`
    : '<div style="font-size:0.8rem;color:var(--text-tertiary);text-align:center;">Aucun créneau disponible pour le moment</div>';

  // Stats
  const stats = getStats();
  trackView(id);

  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-img" style="background:${p.bg};font-size:5rem;">${p.emoji}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <span class="img-badge ${badgeClass}" style="position:static;">${badgeText}</span>
      ${p.verified?`<span class="img-badge badge-verified" style="position:static;">🛡️ Annonce vérifiée</span>`:''}
    </div>
    <div class="modal-price-big">${p.priceLabel}</div>
    <div style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:4px;">${p.priceSub}</div>
    <div style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:12px;">📍 ${p.location} · ${pubLabel}</div>

    <div class="modal-grid">
      <div class="modal-grid-item">📐 <strong>${p.surface} m²</strong></div>
      <div class="modal-grid-item">🛏️ <strong>${p.pieces} pièces</strong> · ${p.chambres||'N/A'} chambres</div>
      <div class="modal-grid-item">🛁 <strong>${p.sdb}</strong> salle${p.sdb>1?'s':''} de bain</div>
      ${p.etage?`<div class="modal-grid-item">🏢 Étage <strong>${p.etage}</strong></div>`:''}
      <div class="modal-grid-item">📅 En ligne <strong>${p.date}</strong></div>
      <div class="modal-grid-item">🆔 Réf. <strong>#${p.id}</strong></div>
    </div>

    <div class="modal-desc">${p.desc}</div>

    <div class="innov-block">
      <h4>🛡️ Score de confiance IA</h4>
      <div class="score-bar">
        <span style="font-size:0.8rem;">Qualité de l'annonce</span>
        <div class="bar"><div class="bar-fill" style="width:${sc}%;background:${scColor};"></div></div>
        <span class="val" style="color:${scColor};">${sc}/100</span>
      </div>
      <div class="stat-row">
        <span>📊 <strong>${scLabel}</strong></span>
        <span>🆔 Identité vendeur ${p.verified?'✅ vérifiée':'❌ non vérifiée'}</span>
        <span>📄 Photos ${p.verified?'✅ authentifiées':'⚠️ standard'}</span>
      </div>
    </div>

    <div class="innov-block">
      <h4>📊 Analyse IA du prix</h4>
      <div class="score-bar">
        <span style="font-size:0.8rem;">Prix vs marché local</span>
        <div class="bar"><div class="bar-fill" style="width:${Math.min(100,50+priceDiff*2)}%;background:${diffColor};"></div></div>
        <span class="val" style="color:${diffColor};font-size:0.8rem;">${diffLabel}</span>
      </div>
      <div class="stat-row">
        <span>💰 Prix : <strong>${p.price.toLocaleString('fr-FR')} €</strong></span>
        <span>📈 Moyenne secteur : <strong>${(p.marketAvg||0).toLocaleString('fr-FR')} €</strong></span>
        ${p.smartMatch?`<span>🤖 <strong>${p.smartMatch}%</strong> compatible avec vos critères</span>`:''}
      </div>
    </div>

    <div class="innov-block">
      <h4>📉 Historique du prix</h4>
      ${histHtml}
      <div class="stat-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
        <span>📅 En ligne depuis <strong>${p.date}</strong></span>
        ${p.priceHistory.length>0?`<span>📉 <strong>${p.priceHistory.length}</strong> baisse${p.priceHistory.length>1?'s':''} de prix</span>`:''}
      </div>
    </div>

    <div class="innov-block">
      <h4>📅 Réserver une visite</h4>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px;">Cliquez sur un créneau pour le réserver</p>
      ${bookingHtml}
    </div>

    <div class="innov-block">
      <h4>🎨 IA Décoration · Visualisez le bien aménagé</h4>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">Choisissez un style pour voir le rendu (simulation)</p>
      <div class="ai-deco-options">
        <button onclick="alert('🎨 Style scandinave : ambiances claires, bois naturel, lignes épurées. Le bien serait parfait avec ce style !')">🌿 Scandinave</button>
        <button onclick="alert('🎨 Style industriel : brique, métal, noir et bois. Pour un loft contemporain et brut.')">🏭 Industriel</button>
        <button onclick="alert('🎨 Style moderne : lignes droites, tons neutres, mobilier design. Un rendu épuré et chic.')">✨ Moderne</button>
        <button onclick="alert('🎨 Style bohème : couleurs chaudes, matières naturelles, plantes. Ambiance cosy et détendue.')">🌸 Bohème</button>
      </div>
    </div>

    <!-- MAP -->
    <div class="innov-block">
      <h4>📍 Localisation</h4>
      <div id="modalMap_${p.id}" style="height:200px;border-radius:var(--radius-md);margin-top:8px;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);font-size:0.9rem;">🗺️ Chargement de la carte...</div>
    </div>

    <!-- STATS -->
    <div class="innov-block" style="background:var(--bg-card);padding:16px;border-radius:var(--radius-md);margin-bottom:12px;">
      <h4 style="margin-bottom:8px;">📊 Statistiques</h4>
      <div class="stat-row"><span>👁️ Vues : <strong>${stats.viewCount||0}</strong></span><span>❤️ Favoris : <strong>${stats.favCount||0}</strong></span></div>
    </div>

    <!-- ACTIONS -->
    <div class="modal-actions">
      <button class="btn-export" onclick="exportPDF(${p.id})">📄 PDF</button>
      <button class="btn-export" onclick="shareProperty(${p.id})">🔗 Partager</button>
      <button class="btn-export" id="favBtn_${p.id}" onclick="toggleFavBtn(${p.id})" style="${isFavorite(id)?'background:var(--gold);color:#000;':''}">${isFavorite(id)?'❤️':'🤍'} Favori</button>
    </div>

    <div class="modal-contact-bar">
      <button class="btn-contact" onclick="alert('📧 Message envoyé à ${p.pubName}. Réponse sous 24h.')">✉ Contacter</button>
      <button class="btn-phone" onclick="alert('📞 Numéro affiché après confirmation.')">📞 Voir le numéro</button>
    </div>
    <div style="margin-top:12px;font-size:0.8rem;color:var(--text-tertiary);text-align:center;">
      🛡️ Score de confiance ${sc}/100 · ${p.verified?'Annonce vérifiée par Immo-Express':'Annonce non vérifiée'}
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');

  // Init map after modal opens
  setTimeout(() => initMap(p), 300);
}

function initMap(p) {
  const mapId = 'modalMap_' + p.id;
  const el = document.getElementById(mapId);
  if (!el || el.classList.contains('map-initialized')) return;
  el.classList.add('map-initialized');
  try {
    if (typeof L === 'undefined') { el.innerHTML = '📍 ${p.location}'; return; }
    el.innerHTML = '<div class="leaflet-container" style="width:100%;height:200px;border-radius:8px;"></div>';
    const container = el.querySelector('.leaflet-container');
    const map = L.map(container).setView([p.lat||46.6, p.lng||2.2], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([p.lat||46.6, p.lng||2.2]).addTo(map).bindPopup('<b>'+p.title+'</b><br>'+p.priceLabel);
    setTimeout(() => map.invalidateSize(), 100);
  } catch(e) {
    el.innerHTML = '📍 ' + p.location;
  }
}

function closeModal() {document.getElementById('modalOverlay').classList.remove('open');}
document.getElementById('modalOverlay').addEventListener('click',(e)=>{if(e.target===document.getElementById('modalOverlay'))closeModal();});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeModal();});

function bookSlot(slot) {alert(`✅ Créneau réservé : ${slot}. Le propriétaire a été notifié.`);}

// ========== SEARCH ==========
function handleSearch(){
  state.search=document.getElementById('mainSearch').value;
  state.type=document.getElementById('mainType').value;
  state.category=document.getElementById('mainCategory').value;
  document.querySelectorAll('#typeFilters button').forEach(b=>b.classList.toggle('active',b.dataset.type===state.type));
  document.querySelectorAll('#catFilters button').forEach(b=>b.classList.toggle('active',b.dataset.cat===state.category));
  render();
}

// ========== FILTERS ==========
document.querySelectorAll('#typeFilters button').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('#typeFilters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.type=btn.dataset.type;render();})});
document.querySelectorAll('#catFilters button').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('#catFilters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.category=btn.dataset.cat;render();})});
document.getElementById('minPrice').addEventListener('input',e=>{state.minPrice=e.target.value;render();});
document.getElementById('maxPrice').addEventListener('input',e=>{state.maxPrice=e.target.value;render();});
document.getElementById('publisherFilter').addEventListener('change',e=>{state.publisher=e.target.value;render();});
document.getElementById('scoreFilter').addEventListener('change',e=>{state.scoreFilter=Number(e.target.value);render();});
document.querySelectorAll('.results-tabs button').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.results-tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.sort=btn.dataset.sort;render();})});

function resetFilters(){
  state.type='all';state.category='all';state.search='';state.minPrice='';state.maxPrice='';state.publisher='all';state.scoreFilter=0;state.sort='recent';
  document.getElementById('mainSearch').value='';
  document.getElementById('mainType').value='all';
  document.getElementById('mainCategory').value='vente';
  document.getElementById('minPrice').value='';document.getElementById('maxPrice').value='';
  document.getElementById('publisherFilter').value='all';document.getElementById('scoreFilter').value='0';
  document.querySelectorAll('#typeFilters button').forEach(b=>b.classList.toggle('active',b.dataset.type==='all'));
  document.querySelectorAll('#catFilters button').forEach(b=>b.classList.toggle('active',b.dataset.cat==='all'));
  document.querySelectorAll('.results-tabs button').forEach((b,i)=>b.classList.toggle('active',i===0));
  render();
}

// ========== MOBILE ==========
document.getElementById('menuToggle').addEventListener('click',()=>{document.getElementById('headerLinks').classList.toggle('open');});

// ========== DEPOSIT ==========
function openDepositModal(){document.getElementById('depositOverlay').classList.add('open');document.body.style.overflow='hidden';}
function closeDepositModal(){document.getElementById('depositOverlay').classList.remove('open');document.body.style.overflow='';}
document.getElementById('depositOverlay').addEventListener('click',(e)=>{if(e.target===document.getElementById('depositOverlay'))closeDepositModal();});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeDepositModal();});

function toggleCategoryLabels(){
  const cat=document.querySelector('select[name="cat"]').value;
  document.getElementById('priceLabel').textContent=cat==='location'?'Loyer mensuel *':'Prix de vente *';
  document.getElementById('priceSectionTitle').textContent=cat==='location'?'Prix du loyer':'Prix';
}
function togglePublisherInfo(){
  const val=document.querySelector('select[name="publisher"]').value;
  document.getElementById('proCompanyGroup').style.display=val==='pro'?'block':'none';
}
function handlePhotoUpload(e){
  for(const f of e.target.files){
    if(photoCounter>=10)break;
    const r=new FileReader();
    r.onload=ev=>{uploadedPhotos.push(ev.target.result);photoCounter++;renderPhotoPreviews();};
    r.readAsDataURL(f);
  }
}
function renderPhotoPreviews(){
  document.getElementById('photoPreview').innerHTML=uploadedPhotos.map((p,i)=>`<div class="photo-thumb" style="background-image:url(${p})"><button type="button" class="photo-remove" onclick="removePhoto(${i})">✕</button></div>`).join('');
}
function removePhoto(i){uploadedPhotos.splice(i,1);photoCounter--;renderPhotoPreviews();}

function submitDepositForm(e){
  e.preventDefault();
  const form=document.getElementById('depositForm');
  const data=new FormData(form);
  const btn=document.getElementById('submitBtn');
  btn.disabled=true;btn.textContent='⏳ Publication…';
  setTimeout(()=>{
    const cat=data.get('cat'),type=data.get('type'),title=data.get('title'),desc=data.get('desc'),city=data.get('city'),zipcode=data.get('zipcode');
    const surface=parseInt(data.get('surface')),pieces=parseInt(data.get('pieces')),chambres=parseInt(data.get('chambres')||'0'),sdb=parseInt(data.get('sdb')||'1'),etage=parseInt(data.get('etage')||'0');
    const price=parseInt(data.get('price')),publisher=data.get('publisher'),pubName=data.get('pubName');
    const isSale=cat==='vente';
    const equipments=[];
    form.querySelectorAll('input[name="equip"]:checked').forEach(cb=>equipments.push(cb.value));
    const featList=[`📐 ${surface} m²`];
    if(pieces)featList.push(`🛏️ ${pieces} pièces`);
    const bgs=['#e8f0fe','#e6f7ed','#fef3e8','#f3e8ff','#ffe8e8'];
    const emojis={appartement:'🏙️',maison:'🏠',villa:'🌴',studio:'🏘️',penthouse:'🏛️',local:'🏪',terrain:'🌲',immeuble:'🏢'};
    const newListing={
      id:Date.now(),cat,type,title,location:city+(zipcode?', '+zipcode:''),price,
      priceLabel:isSale?price.toLocaleString('fr-FR')+' €':price.toLocaleString('fr-FR')+' €/mois',
      priceSub:isSale?Math.round(price/surface).toLocaleString('fr-FR')+' €/m²':(data.get('price_sub')||''),
      surface,pieces,chambres,sdb,etage,publisher,pubName,date:'À l\'instant',
      bg:bgs[Math.floor(Math.random()*bgs.length)],emoji:emojis[type]||'🏠',desc,
      trustScore:85,verified:false,priceHistory:[],marketAvg:price,smartMatch:75,bookingSlots:['Lun 10h','Mar 14h','Mer 11h','Jeu 15h']
    };
    listings.unshift(newListing);
    const body=document.getElementById('depositBody');
    body.innerHTML=`<div class="form-success"><div class="big-icon">✅</div><h3>Annonce publiée !</h3><p>Votre bien "<strong>${title}</strong>" est en ligne.<br>Réf. #${newListing.id} · ${cat==='vente'?'Vente':'Location'} · ${city}</p><button class="btn-success" onclick="closeDepositModal();render();">👀 Voir les annonces</button></div>`;
    render();
    setTimeout(()=>{uploadedPhotos=[];photoCounter=0;},500);
  },800);
}

// ========== CHATBOT ==========
const chatData={welcome:{msg:'👋 Bonjour ! Je suis l\'assistant intelligent d\'Immo-Express. Je peux vous aider à trouver un bien, comprendre le fonctionnement de la plateforme, ou vous conseiller dans votre projet immobilier. Que cherchez-vous ?',quick:['🏠 Acheter un bien','🔑 Louer un bien','🛡️ Score de confiance','📊 Analyse IA']},faq:{'acheter':{msg:'🛒 **Acheter sur Immo-Express**\n\n• Parcourez les annonces par type, ville ou budget\n• Chaque bien a un **score de confiance** sur 100\n• L\'IA analyse le prix et le compare au marché\n• Réservez une visite directement depuis l\'annonce\n\n💡 Astuce : filtrez par score de confiance pour voir les meilleures annonces !',quick:['🔍 Chercher un appartement','🏡 Chercher une maison','📊 Comment fonctionne l\'IA ?','← Retour']},'louer':{msg:'🔑 **Louer sur Immo-Express**\n\n• Sélectionnez "Location" dans la recherche\n• Filtrez par type et budget\n• Consultez le **score de confiance** du propriétaire\n• Réservez une visite en ligne sans appel\n\n📍 490+ locations disponibles !',quick:['🏙️ Studio à louer','🏠 Maison à louer','🛡️ Vérifier un propriétaire','← Retour']},'score':{msg:'🛡️ **Score de confiance**\n\nChaque annonce reçoit une note sur 100 basée sur :\n\n✅ Identité du vendeur vérifiée\n✅ Photos authentifiées\n✅ Prix cohérent avec le marché (analyse IA)\n✅ Description complète et documents fournis\n✅ Absence de doublons\n\n> 92% de nos annonces ont un score supérieur à 70 !',quick:['🔍 Voir les annonces vérifiées','📊 Comment est calculé le score ?','← Retour']},'analyse':{msg:'📊 **Analyse IA des prix**\n\nNotre intelligence artificielle compare chaque bien au marché local :\n\n• Prix au m² moyen dans le secteur\n• Évolution des prix sur 6 mois\n• Estimation de la justesse du prix\n• Détection des surévaluations\n\n💰 Les acheteurs voient instantanément si le prix est correct.',quick:['🔍 Chercher un bien','🛡️ Voir mon score de confiance','← Retour']},'comment ca marche':{msg:'📋 **Comment ça marche ?**\n\n1️⃣ **Particuliers & Pros** déposent leurs annonces\n2️⃣ L\'**IA analyse** chaque bien (prix, photos, qualité)\n3️⃣ Un **score de confiance** est attribué\n4️⃣ Les acheteurs trouvent le bien idéal en un clic\n5️⃣ **Contact direct** — pas d\'intermédiaire\n\n✅ 100% immobilier · 100% direct · 100% transparent',quick:['🏠 Voir les annonces','📝 Déposer un bien','🛡️ Score de confiance','← Retour']},'pro':{msg:'💼 **Espace professionnels**\n\n• API pour synchroniser vos annonces\n• Tableau de bord avec statistiques\n• Badge "Pro vérifié" sur vos annonces\n• Accès aux données de marché (prix, tendances)\n• Pack Premium : mise en avant, vitrine personnalisable\n\n👉 Contactez-nous pour ouvrir votre compte pro !',quick:['📞 Devenir partenaire','📋 Tarifs','← Retour']}},fallback:{msg:'Je n\'ai pas bien compris. Voici ce que je peux faire :',quick:['🏠 Acheter','🔑 Louer','🛡️ Score confiance','📊 Analyse IA','📝 Déposer']}};
function getTime(){const d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');}
function addMessage(text,type,showTime=true){const c=document.getElementById('chatMessages');const d=document.createElement('div');d.className='chat-msg '+type;d.innerHTML=text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+(showTime?`<span class="msg-time">${getTime()}</span>`:'');c.appendChild(d);c.scrollTop=c.scrollHeight;}
function showQuickReplies(btns){document.getElementById('quickReplies').innerHTML=btns.map(b=>`<button onclick="quickReplyClick('${b.replace(/'/g,"\\'")}')">${b}</button>`).join('');}
function clearTyping(){const t=document.getElementById('chatMessages').querySelector('.typing');if(t)t.remove();}
function simulateTyping(cb){const c=document.getElementById('chatMessages');const d=document.createElement('div');d.className='chat-msg typing';d.textContent='🤔 Je réfléchis…';c.appendChild(d);c.scrollTop=c.scrollHeight;setTimeout(()=>{clearTyping();cb();},600+Math.random()*400);}
function findBestMatch(text){const q=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();const kw={'acheter':['acheter','achat','acquérir','investir','proprio','credit','pret'],'louer':['louer','location','locataire','bail','loyer'],'score':['score','confiance','verifier','verifie','fiable','serieux','arnaque'],'analyse':['analyse','ia','prix','m2','estimation','intelligent','compatible','match'],'comment ca marche':['comment','fonctionne','principe','utiliser','plateforme','a quoi ca sert'],'pro':['professionnel','pro','agent','agence','partenaire','api']};for(const[key,words]of Object.entries(kw))for(const w of words)if(q.includes(w))return key;return null;}
function getResponse(text){const m=findBestMatch(text);return m&&chatData.faq[m]?chatData.faq[m]:chatData.fallback;}
function quickReplyClick(text){if(text==='← Retour'){showWelcome();return;}sendMessage(text);}
function showWelcome(){addMessage(chatData.welcome.msg,'bot');showQuickReplies(chatData.welcome.quick);}
function sendMessage(text){const input=document.getElementById('chatInput');const msg=text||input.value.trim();if(!msg)return;input.value='';addMessage(msg,'user');const btn=document.getElementById('chatSendBtn');btn.disabled=true;btn.style.opacity='0.5';simulateTyping(()=>{const r=getResponse(msg);addMessage(r.msg,'bot');showQuickReplies(r.quick);btn.disabled=false;btn.style.opacity='1';});}
function toggleChat(){const p=document.getElementById('chatPanel');const t=document.getElementById('chatToggle');const isOpen=p.classList.contains('open');if(isOpen){p.classList.remove('open');t.classList.remove('open');t.innerHTML='💬<span class="badge-dot"></span>';}else{p.classList.add('open');t.classList.add('open');t.innerHTML='✕';if(document.getElementById('chatMessages').children.length===0)showWelcome();}}

// ========== THEME TOGGLE ==========
function toggleTheme(){
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')!=='light';
  html.setAttribute('data-theme',isDark?'light':'dark');
  document.getElementById('themeToggle').textContent=isDark?'☀️':'🌙';
  localStorage.setItem('immo-theme',isDark?'light':'dark');
}
(function initTheme(){
  const saved=localStorage.getItem('immo-theme');
  if(saved==='light'){document.documentElement.setAttribute('data-theme','light');document.getElementById('themeToggle').textContent='☀️';}
})();

// ========== STATS ==========
function getStats(){return JSON.parse(localStorage.getItem('immo-stats')||'{"views":{},"favorites":[],"viewCount":0,"favCount":0}');}
function saveStats(s){localStorage.setItem('immo-stats',JSON.stringify(s));}
function trackView(id){
  const s=getStats();
  s.views[id]=(s.views[id]||0)+1;
  s.viewCount=(s.viewCount||0)+1;
  saveStats(s);
}
function toggleFavorite(id){
  const s=getStats();
  const idx=s.favorites.indexOf(id);
  if(idx>-1) s.favorites.splice(idx,1);
  else s.favorites.push(id);
  s.favCount=s.favorites.length;
  saveStats(s);
  updateFavUI();
}
function isFavorite(id){return getStats().favorites.includes(id);}
function updateFavUI(){
  const el=document.getElementById('favCount');
  if(el)el.textContent=getStats().favCount||'';
}
function showFavorites(){
  const favs=getStats().favorites;
  if(favs.length===0)return alert('💔 Aucun favori pour le moment.\n\nCliquez sur 🤍 dans une annonce pour en ajouter.');
  alert('❤️ Vos '+favs.length+' favori'+(favs.length>1?'s':'')+' :\n\n'+favs.map(id=>{const p=listings.find(x=>x.id===id);return p?'• '+p.title+' — '+p.priceLabel:'';}).filter(Boolean).join('\n'));
}
function toggleFavBtn(id){
  toggleFavorite(id);
  const btn=document.getElementById('favBtn_'+id);
  if(!btn)return;
  const isFav=isFavorite(id);
  btn.textContent=isFav?'❤️ Favori':'🤍 Favori';
  btn.style.background=isFav?'var(--gold)':'';
  btn.style.color=isFav?'#000':'';
}

// ========== EXPORT PDF ==========
function exportPDF(id){
  try{
    const p=listings.find(x=>x.id===id);
    if(!p)return alert('Erreur : bien introuvable');
    if(typeof window.jspdf==='undefined'||!window.jspdf.jsPDF) return alert('📄 Export PDF : téléchargement...\n\n'+p.title+'\n'+p.priceLabel+'\n📍 '+p.location+'\n📐 '+p.surface+' m²'+'\n🛡️ Score '+p.trustScore+'/100');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF('p','mm','a4');
    doc.setFillColor(11,11,13);doc.rect(0,0,210,297,'F');
    doc.setFontSize(28);doc.setTextColor(212,168,83);doc.text('Immo-Express',105,25,{align:'center'});
    doc.setFontSize(10);doc.setTextColor(150,150,160);doc.text('Fiche détaillée du bien',105,33,{align:'center'});
    doc.setDrawColor(212,168,83);doc.line(30,38,180,38);
    doc.setFontSize(22);doc.setTextColor(255,255,255);doc.text(p.title,105,52,{align:'center'});
    doc.setFontSize(12);doc.setTextColor(212,168,83);doc.text(p.priceLabel,105,62,{align:'center'});
    doc.setFontSize(10);doc.setTextColor(200,200,200);
    let y=75;
    [['📍 Localisation',p.location],['📐 Surface',p.surface+' m²'],['🛏️ Pièces',p.pieces+' pièces'],['🛁 Salles de bain',String(p.sdb)],['📅 En ligne',p.date],['🛡️ Score confiance',p.trustScore+'/100'],['🤖 Smart Match',p.smartMatch?p.smartMatch+'%':'N/A'],['💰 Budget',p.priceLabel],['📈 Prix marché',p.marketAvg?p.marketAvg.toLocaleString('fr-FR')+' €':'N/A']].forEach(([l,v])=>{
      doc.setFontSize(9);doc.setTextColor(150,150,160);doc.text(l,30,y);
      doc.setFontSize(10);doc.setTextColor(255,255,255);doc.text(v,90,y);
      y+=7;
    });
    doc.setFontSize(9);doc.setTextColor(150,150,160);
    const lines=doc.splitTextToSize(p.desc||'',150);
    doc.text(lines,30,y+10);
    doc.setFontSize(8);doc.setTextColor(100,100,100);
    doc.text('Généré par Immo-Express · Bien #'+p.id+' · '+new Date().toLocaleDateString('fr-FR'),105,285,{align:'center'});
    doc.save('ImmoExpress-'+p.title.slice(0,20).replace(/[^a-zA-Z0-9]/g,'_')+'.pdf');
  }catch(e){alert('📄 PDF généré !');}
}

// ========== SHARE ==========
function shareProperty(id){
  const p=listings.find(x=>x.id===id);
  if(!p)return;
  const text='🏠 '+p.title+' - '+p.priceLabel+'\n📍 '+p.location+'\n🛡️ Score '+p.trustScore+'/100\n\n'+window.location.origin+'?bien='+id;
  if(navigator.share)navigator.share({title:p.title,text,url:window.location.origin+'?bien='+id});
  else{navigator.clipboard.writeText(text).then(()=>alert('🔗 Lien copié !')).catch(()=>alert(text));}
}

// ========== NOTIFICATIONS ==========
if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();
(function checkAlerts(){
  let last=localStorage.getItem('immo-last-alert')||'0';
  setInterval(()=>{
    const n=listings.filter(p=>p.date==="Aujourd'hui").length;
    if(n>Number(last)&&Number(last)>0&&'Notification'in window&&Notification.permission==='granted')
      new Notification('🏠 Nouveaux biens !',{body:n-Number(last)+' nouvelle'+(n-Number(last)>1?'s':'')+' annonce'+(n-Number(last)>1?'s':'')+' aujourd\'hui',icon:'assets/icon-192.png'});
    last=String(n);localStorage.setItem('immo-last-alert',last);
  },60000);
})();

// ========== INIT ==========
render();
updateFavUI();
console.log('🏠 Immo-Express chargé —',listings.length,'annonces avec innovations IA');