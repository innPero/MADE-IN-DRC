'use strict';
(() => {
  const D = window.DRC_DATA;
  const KEY = 'made-in-drc.demo.v1';
  const main = document.querySelector('#main');
  const dialog = document.querySelector('#contact-dialog');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const id = () => 'local-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2));
  const str = (value, max = 3000) => typeof value === 'string' ? value.slice(0, max) : '';
  const safePhoto = value => typeof value === 'string' && value.length < 750000 && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) ? value : '';
  const emptyState = () => ({version:1,profile:null,products:[],requests:[],chat:[]});
  const money = value => value === null ? 'Sur devis' : new Intl.NumberFormat('fr-FR', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
  const opts = (items, selected = '') => items.map(x => `<option value="${esc(x)}" ${x === selected ? 'selected' : ''}>${esc(x)}</option>`).join('');
  const qs = fields => new URLSearchParams(fields).toString();
  let saveTimer;
  let state = load();

  // Un fichier local n'est pas un compte : les données restent dans ce navigateur.
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (!s || s.version !== 1) return emptyState();
      const result = emptyState();
      if (s.profile && typeof s.profile.name === 'string') result.profile = {id:'local-seller',name:str(s.profile.name,100),city:str(s.profile.city,100),category:D.categories.includes(s.profile.category) ? s.profile.category : 'Services',about:str(s.profile.about),email:str(s.profile.email,200),phone:str(s.profile.phone,60),verified:false};
      result.products = Array.isArray(s.products) ? s.products.filter(p => p && typeof p.id === 'string' && p.seller === 'local-seller' && typeof p.name === 'string' && D.categories.includes(p.category)).slice(0,100).map(p => ({...p,id:str(p.id,100),name:str(p.name,120),description:str(p.description),details:str(p.details),city:str(p.city,100),minimum:str(p.minimum,80),unit:str(p.unit,50),price:typeof p.price === 'number' && Number.isFinite(p.price) && p.price >= 0 ? p.price : null,type:p.type === 'Service' ? 'Service' : 'Produit',active:p.active === true,photo:safePhoto(p.photo),art:str(p.art,20)})) : [];
      result.requests = Array.isArray(s.requests) ? s.requests.filter(r => r && typeof r.id === 'string' && typeof r.target === 'string').slice(0,200).map(r => ({id:str(r.id,100),target:str(r.target,100),seller:str(r.seller,100),label:str(r.label,150),kind:r.kind === 'partner' ? 'partner' : 'product',name:str(r.name,100),email:str(r.email,200),destination:str(r.destination,100),quantity:str(r.quantity,80),created:str(r.created,100),messages:Array.isArray(r.messages) ? r.messages.filter(m => m && typeof m.text === 'string').slice(0,100).map(m => ({role:m.role === 'seller' ? 'seller' : 'buyer',text:str(m.text)})) : []})) : [];
      result.chat = Array.isArray(s.chat) ? s.chat.filter(m => m && typeof m.text === 'string').slice(-50).map(m => ({role:m.role === 'user' ? 'user' : 'assistant',text:str(m.text),partners:Array.isArray(m.partners) ? m.partners.filter(x => D.partners.some(p => p.id === x)) : []})) : [];
      return result;
    } catch { return emptyState(); }
  }
  function persist(next) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; return true; }
    catch { toast('Enregistrement impossible : espace du navigateur insuffisant ou stockage désactivé. Réduisez les photos.'); return false; }
  }
  function change(fn) { const next = JSON.parse(JSON.stringify(state)); fn(next); return persist(next); }
  function toast(text) { const el = document.querySelector('#toast'); el.textContent = text; el.style.display = 'block'; clearTimeout(saveTimer); saveTimer = setTimeout(() => { el.style.display = 'none'; }, 5500); }
  function products() { return [...D.products, ...state.products]; }
  function sellers() { return [...D.sellers, ...(state.profile ? [state.profile] : [])]; }
  function sellerFor(id) { return sellers().find(s => s.id === id); }
  function routeInfo() {
    const [path, search = ''] = (location.hash.slice(1) || '/').split('?');
    return {path, parts:path.split('/').filter(Boolean), params:new URLSearchParams(search)};
  }
  function go(path) { if (location.hash === '#' + path) render(); else location.hash = path; }
  function statusBadge(item) { return item.verified ? '<span class="badge">Vérification simulée · démo</span>' : '<span class="badge pending">À vérifier</span>'; }

  // Illustrations vectorielles originales, et non photographies de produits réels.
  function art(kind = 'coffee', hero = false) {
    const scenes = {
      coffee:'<ellipse cx="220" cy="303" rx="107" ry="16" fill="#4c352d" opacity=".14"/><path d="M157 83h119l20 204q-70 28-158 0z" fill="#c8a570"/><path d="M157 83h119l-9 25H164z" fill="#84633f"/><path d="M152 141h132l8 116H143z" fill="#183d36"/><text x="217" y="173" text-anchor="middle" fill="#f0d392" font-family="Georgia" font-size="14" letter-spacing="3">KIVU</text><path d="M209 193c-35-11-40 50-9 51 33 1 36-46 9-51z" fill="#e8c371"/><path d="M211 194c-24 12-4 30-13 48" stroke="#183d36" stroke-width="4" fill="none"/><text x="217" y="277" text-anchor="middle" fill="#59432d" font-family="Arial" font-size="9" letter-spacing="3">CAFÉ ARABICA</text>',
      basket:'<ellipse cx="220" cy="302" rx="128" ry="17" fill="#714e28" opacity=".12"/><path d="M147 145q-2-113 73-112 77 0 74 112" fill="none" stroke="#9e703d" stroke-width="15"/><path d="M87 144h266l-38 149q-100 33-190 0z" fill="#cba767"/><ellipse cx="220" cy="145" rx="133" ry="24" fill="#79512e"/><ellipse cx="220" cy="146" rx="119" ry="15" fill="#553e29"/><path d="M101 179h238M108 199h226M113 219h214M120 240h201M123 261h194M128 281h187" stroke="#9f763e" stroke-width="5"/><path d="M141 166l24 136m15-137 12 143m28-140v142m38-141-12 140m50-141-28 135" stroke="#e1c390" stroke-width="8"/>',
      textile:'<defs><pattern id="woven" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#ad5037"/><path d="M30 0 60 30 30 60 0 30z" fill="#e3b86a"/><path d="m30 13 17 17-17 17-17-17z" fill="#183d36"/></pattern></defs><path d="m105 76 219-20 28 229-219 25z" fill="#6e4638" opacity=".15"/><path d="m91 67 221-16 32 227-221 27z" fill="url(#woven)"/><path d="m312 51 9 221 23 6z" fill="#6b301f" opacity=".5"/><path d="m124 305 10 20m6-22 10 20m6-22 10 20m6-23 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20m6-22 10 20" stroke="#a76c48" stroke-width="3"/>',
      cocoa:'<ellipse cx="224" cy="290" rx="126" ry="18" fill="#46342e" opacity=".12"/><path d="M99 225C72 102 234 60 266 74c-1 120-65 180-167 151z" fill="#a35133"/><path d="M100 225C126 133 195 101 266 74M100 225C145 193 220 143 266 74" stroke="#ca7843" stroke-width="12" fill="none"/><path d="M218 207c-21-38 17-93 75-74 46 16 51 101 4 120-31 13-58-8-79-46z" fill="#6a3826"/><path d="M236 204c-16-27 5-65 39-54 28 9 45 69 11 82-22 8-36-6-50-28z" fill="#e3c8a4"/><g fill="#775140"><ellipse cx="265" cy="173" rx="9" ry="13"/><ellipse cx="277" cy="198" rx="9" ry="13"/><ellipse cx="261" cy="215" rx="8" ry="10"/></g>',
      lamp:'<path d="M220 0v93" stroke="#655443" stroke-width="4"/><path d="M154 114q68-37 133 0l52 130q-123 50-238 0z" fill="#c9a671"/><ellipse cx="220" cy="246" rx="119" ry="24" fill="#9e784c"/><ellipse cx="220" cy="246" rx="101" ry="14" fill="#eed7a3"/><path d="m154 114-44 126m63-131-26 137m48-144-9 148m31-150v153m23-148 11 144m15-140 30 135m-11-131 45 123" stroke="#a7804d" stroke-width="5"/><path d="M149 128h143M143 146h156M136 165h170M128 184h185M121 203h198M114 224h214" stroke="#dec394" stroke-width="5"/>',
      design:'<rect x="74" y="69" width="285" height="208" rx="8" fill="#183d36" transform="rotate(-7 220 175)"/><rect x="110" y="105" width="258" height="188" rx="5" fill="#f7ebcc" transform="rotate(5 230 190)"/><circle cx="237" cy="179" r="42" fill="#b6603c"/><path d="m211 195 26-42 26 42z" fill="#e6c074"/><path d="M189 244h104M207 260h67" stroke="#567063" stroke-width="5"/>'
    };
    const content = hero ? '<circle cx="229" cy="163" r="135" fill="#e6bf81"/><path d="M0 274q120-44 230-10t210-10v106H0z" fill="#d4bc93"/><g transform="translate(-61 54) scale(.87)">' + scenes.basket + '</g><g transform="translate(148 61) scale(.7)">' + scenes.coffee + '</g><path d="M335 193q-12-116 12-148" stroke="#345b41" stroke-width="5" fill="none"/><path d="M339 139q-72-13-49-53 42 7 49 53M338 103q59-19 40-62-37 9-40 62M338 71q-50-19-36-47 27 4 36 47" fill="#4f7450"/>' : (scenes[kind] || scenes.design);
    return `<svg class="product-art" viewBox="0 0 440 350" role="img" aria-label="Illustration de démonstration"><rect width="440" height="350" fill="${kind === 'textile' ? '#e9ddcc' : kind === 'coffee' ? '#e4e8da' : '#ede3d2'}"/>${content}</svg>`;
  }
  function productImage(p) { return p.photo ? `<img class="product-art" src="${esc(p.photo)}" alt="${esc(p.name)}">` : art(p.art); }
  function productCard(p) {
    const seller = sellerFor(p.seller);
    return `<article class="product-card"><a href="#/produit/${encodeURIComponent(p.id)}" aria-label="Voir ${esc(p.name)}">${productImage(p)}</a><div class="card-copy"><div class="meta"><span>${esc(p.category)}</span><span>${esc(p.city)}</span></div><h3><a href="#/produit/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p class="byline">Par ${esc(seller?.name || 'Votre entreprise')}</p><div class="price-row"><span>${money(p.price)} ${p.price !== null ? `<small>/ ${esc(p.unit)}</small>` : ''}</span><a class="round-arrow" href="#/produit/${encodeURIComponent(p.id)}" aria-label="Découvrir ${esc(p.name)}">↗</a></div></div></article>`;
  }
  function empty(title, description) { return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`; }
  function heading(eyebrow, title, description) { return `<div class="page-title"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p class="lead">${esc(description)}</p></div>`; }
  function home() {
    return `<section class="wrap hero"><div><div class="eyebrow">Savoir-faire congolais, horizon international</div><h1>Le Congo crée.<br>Le monde <em>découvre.</em></h1><p class="lead">Rencontrez les producteurs, artisans et PME de la RDC. Découvrez leurs offres et construisez vos prochains échanges.</p><form class="search-box" id="home-search" role="search"><input name="q" aria-label="Rechercher un produit ou service" placeholder="Café, artisanat, textile, services…" maxlength="120"><button class="button" type="submit">Explorer ↗</button></form><div class="quick-links"><span>À découvrir :</span><a href="#/catalogue?category=Agroalimentaire">Café du Kivu</a><a href="#/catalogue?category=Artisanat+%26+d%C3%A9coration">Artisanat</a><a href="#/catalogue?category=Services">Services créatifs</a></div></div><div class="hero-art">${art('hero', true)}<div class="hero-caption"><strong>Le savoir-faire a une origine.<br>L’ambition, aucune frontière.</strong><small>MADE IN DRC · ILLUSTRATION DU PROTOTYPE</small></div></div></section><div class="proof-strip"><span><b>01</b> Découvrez les talents locaux</span><span><b>02</b> Échangez avec les vendeurs</span><span><b>03</b> Préparez votre logistique</span></div><section class="wrap"><div class="section-heading"><div><div class="eyebrow">Une terre de possibilités</div><h2>Explorez nos univers</h2></div><a href="#/catalogue">Tout le catalogue ↗</a></div><div class="category-grid">${D.categories.map((c,i) => `<a class="category-tile" href="#/catalogue?${qs({category:c})}"><span class="category-icon" aria-hidden="true">${['◒','▧','◇','✳'][i]}</span>${esc(c)} <span aria-hidden="true">↗</span></a>`).join('')}</div><div class="section-heading"><div><div class="eyebrow">Sélection découverte</div><h2>Des créations à rencontrer</h2><p>Offres fictives pour explorer le parcours d’achat professionnel.</p></div><a href="#/catalogue">Voir les offres ↗</a></div><div class="grid">${products().filter(p=>p.active).slice(0,3).map(productCard).join('')}</div><div class="journey"><div><div class="eyebrow">Du premier contact au projet</div><h2>Votre prochain échange commence ici.</h2></div><div class="steps"><div><span class="step-number">01</span><h3>Trouvez votre produit</h3><p>Explorez les offres et les profils des entreprises congolaises.</p></div><div><span class="step-number">02</span><h3>Parlez au producteur</h3><p>Précisez vos quantités, vos besoins et les conditions de votre projet.</p></div><div><span class="step-number">03</span><h3>Préparez l’acheminement</h3><p>Utilisez l’assistant pour identifier les services logistiques à solliciter.</p></div></div></div><div class="cta"><div><div class="eyebrow">PME · Artisans · Producteurs</div><h2>Votre talent mérite d’être vu.</h2><p>Créez votre vitrine et présentez votre savoir-faire au-delà des frontières.</p></div><a class="button light" href="#/espace">Devenir vendeur ↗</a></div></section>`;
  }
  function catalogue(params) {
    const filters = {q:params.get('q') || '',category:params.get('category') || '',city:params.get('city') || '',sort:params.get('sort') || 'selection',type:params.get('type') || ''};
    let items = products().filter(p => p.active && (!filters.category || p.category === filters.category) && (!filters.city || p.city === filters.city) && (!filters.type || p.type === filters.type) && norm([p.name,p.category,p.city,p.description,sellerFor(p.seller)?.name].join(' ')).includes(norm(filters.q)));
    if (filters.sort === 'price') items.sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (filters.sort === 'name') items.sort((a,b) => a.name.localeCompare(b.name,'fr'));
    return `<section class="wrap">${heading('La marketplace','Une production. Mille possibilités.','Explorez des produits et services, puis échangez directement avec les vendeurs.')}<form id="catalogue-filters"><div class="filters"><div class="field"><label for="search">Votre recherche</label><input id="search" name="q" value="${esc(filters.q)}" placeholder="Produit, activité, vendeur…" maxlength="120"></div><div class="field"><label for="category">Catégorie</label><select id="category" name="category"><option value="">Toutes les catégories</option>${opts(D.categories,filters.category)}</select></div><div class="field"><label for="city">Localisation</label><select id="city" name="city"><option value="">Toutes les villes</option>${opts([...new Set(products().map(p=>p.city))],filters.city)}</select></div><div class="field"><label for="type">Type d’offre</label><select id="type" name="type"><option value="">Produits et services</option>${opts(['Produit','Service'],filters.type)}</select></div></div><div class="filter-bottom"><div class="actions"><button class="button small" type="submit">Rechercher</button><a class="text-button" href="#/catalogue">Effacer les filtres</a></div><label>Trier <select name="sort" aria-label="Trier les offres"><option value="selection">Sélection</option><option value="price" ${filters.sort === 'price' ? 'selected':''}>Prix croissant</option><option value="name" ${filters.sort === 'name' ? 'selected':''}>Nom A–Z</option></select></label></div></form><p class="muted" style="font-size:12px">${items.length} offre${items.length > 1 ? 's':''} · Prix indicatifs de démonstration, hors transport</p>${items.length ? `<div class="grid">${items.map(productCard).join('')}</div>` : empty('Aucune offre trouvée','Essayez un autre mot ou effacez les filtres.')}<div class="cta"><div><h2>Un projet d’importation ?</h2><p>Décrivez votre besoin pour découvrir les étapes et les services utiles.</p></div><a class="button light" href="#/assistant">Ouvrir l’assistant ↗</a></div></section>`;
  }
  function productPage(pid) {
    const p = products().find(p => p.id === pid && p.active);
    if (!p) return missing();
    const seller = sellerFor(p.seller);
    return `<section class="wrap"><div class="breadcrumbs"><a href="#/">Accueil</a><span>/</span><a href="#/catalogue">Marketplace</a><span>/</span><span>${esc(p.name)}</span></div><div class="detail-grid"><div>${productImage(p)}<p class="illustration-note">${p.photo ? 'Image ajoutée dans votre démonstration locale.' : 'Illustration de démonstration. Demandez des photos réelles au vendeur.'}</p></div><div><div class="eyebrow">${esc(p.category)} · ${esc(p.city)}</div><h1>${esc(p.name)}</h1><p class="lead">${esc(p.description)}</p><div class="detail-price">${money(p.price)} ${p.price !== null ? `<small>/ ${esc(p.unit)}</small>` : ''}</div><p class="muted" style="font-size:11px">Prix d’exemple. Transport et frais éventuels à préciser.</p><div class="detail-facts"><div class="fact"><small>Commande minimale</small><strong>${esc(p.minimum)}</strong></div><div class="fact"><small>Modalités</small><strong>À convenir avec le vendeur</strong></div></div><div class="actions"><button class="button" data-contact="product" data-id="${esc(p.id)}">Contacter le vendeur ↗</button><a class="button secondary" href="#/assistant?${qs({product:p.id})}">Aide logistique</a></div><div class="seller-mini"><span class="avatar">${esc(seller?.name.slice(0,1))}</span><div><a href="#/vendeur/${encodeURIComponent(p.seller)}">${esc(seller?.name)}</a><p>${esc(seller?.city)} · ${seller?.verified ? 'Vérification simulée' : 'À vérifier'}</p></div></div></div></div><div class="panel spaced"><h2>À préciser avant de commander</h2><p>${esc(p.details)}</p><p class="muted">Confirmez la disponibilité, la qualité, le prix total, les délais et les responsabilités de transport avec vos interlocuteurs. Cette démonstration ne traite aucun paiement.</p></div></section>`;
  }
  function sellerPage(sid) {
    const s = sellerFor(sid); if (!s) return missing();
    const offers = products().filter(p=>p.seller === s.id && p.active);
    return `<section class="wrap"><div class="breadcrumbs"><a href="#/catalogue">Marketplace</a><span>/</span><span>Profil vendeur</span></div><div class="seller-header"><span class="avatar">${esc(s.name.slice(0,1))}</span><div><div class="eyebrow">${esc(s.city)} · RDC</div><h1>${esc(s.name)}</h1>${statusBadge(s)}<p class="spaced">${esc(s.about)}</p><p class="muted">${esc(s.category)} · Contact professionnel : ${esc(s.email)}${s.phone ? ' · ' + esc(s.phone) : ''}</p></div></div><div class="section-heading"><div><h2>Les offres du vendeur</h2><p>${offers.length} offre${offers.length > 1 ? 's':''} disponible${offers.length > 1 ? 's':''} dans le prototype.</p></div></div>${offers.length ? `<div class="grid">${offers.map(productCard).join('')}</div>` : empty('La vitrine est prête','Le vendeur n’a pas encore publié d’offre.')}<p class="illustration-note spaced">Les profils d’exemple ne représentent aucune entreprise réelle. Une vérification réelle devra être réalisée par l’équipe avant l’ouverture publique.</p></section>`;
  }
  function missing() { return `<section class="wrap">${empty('Cette page est introuvable','L’offre a peut-être été masquée ou le lien est incorrect.')}<p class="spaced"><a class="button" href="#/catalogue">Revenir au catalogue</a></p></section>`; }

  function partnerCard(p) {
    return `<article class="partner-card" id="partenaire-${esc(p.id)}">${statusBadge(p)}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="partner-info"><strong>${esc(p.service)}</strong><br>${esc(p.city)} · ${esc(p.regions.join(', '))}</div><button class="button secondary small" data-contact="partner" data-id="${esc(p.id)}">Demander un devis ↗</button></article>`;
  }
  function partnerPage(params) {
    const service = params.get('service') || '', region = params.get('region') || '', city = params.get('city') || '', verified = params.get('verified') === 'on';
    const list = D.partners.filter(p => (!service || p.service === service) && (!city || p.city === city) && (!region || p.regions.includes(region)) && (!verified || p.verified));
    return `<section class="wrap">${heading('L’annuaire logistique','Les bons interlocuteurs, à chaque étape.','Transport, accompagnement export et préparation des démarches : trouvez le service adapté à votre projet.')}<div class="notice"><strong>Annuaire de démonstration.</strong> Ces prestataires sont fictifs. « Vérification simulée » illustre le futur contrôle administratif ; ce n’est ni une certification ni une recommandation réelle.</div><form id="partner-filters"><div class="filters"><div class="field"><label for="service">Service recherché</label><select id="service" name="service"><option value="">Tous les services</option>${opts([...new Set(D.partners.map(p=>p.service))],service)}</select></div><div class="field"><label for="region">Destination</label><select id="region" name="region"><option value="">Toutes les destinations</option>${opts(['Europe','Afrique','Amérique','Asie'],region)}</select></div><div class="field"><label for="partner-city">Localisation</label><select id="partner-city" name="city"><option value="">Toutes les villes</option>${opts([...new Set(D.partners.map(p=>p.city))],city)}</select></div><div class="field"><label for="partner-submit">Appliquer</label><button class="button" id="partner-submit" type="submit">Filtrer</button></div></div><div class="filter-bottom"><label><input type="checkbox" name="verified" ${verified?'checked':''}> Vérification simulée uniquement</label><a class="text-button" href="#/partenaires">Réinitialiser</a><span>${list.length} prestataire${list.length > 1 ? 's':''}</span></div></form>${list.length ? `<div class="grid partner-grid">${list.map(partnerCard).join('')}</div>` : empty('Aucun partenaire pour ces critères','Modifiez le service, la ville ou la destination.')}<div class="cta"><div><h2>Vous ne savez pas par où commencer ?</h2><p>L’assistant vous aide à formuler votre besoin logistique.</p></div><a class="button light" href="#/assistant">Parler à l’assistant ↗</a></div></section>`;
  }
  function assistantAnswer(text, product) {
    const q = norm(text);
    const explicitRegion = /europe|france|belgique|allemagne|espagne|italie|suisse|royaume.uni|portugal|pays.bas/.test(q) ? 'Europe' : /amerique|canada|etats.unis|usa|bresil/.test(q) ? 'Amérique' : /afrique|zambie|kenya|angola|senegal|cameroun|tanzanie|congo/.test(q) ? 'Afrique' : /asie|chine|japon|inde|dubai|emirats/.test(q) ? 'Asie' : '';
    const hasOtherRegion = /australie|oceanie|nouvelle.zelande/.test(q);
    const context = product ? `Concernant « ${product.name} » :\n\n` : '';
    if (/paiement|payer|transaction|securit|arnaque/.test(q)) return {text:context + 'Made in DRC facilite la mise en relation. Aucun paiement n’est traité dans ce prototype.\n\nAvant de conclure, vérifiez l’identité de vos interlocuteurs, demandez une offre écrite et un échantillon si nécessaire, puis convenez du paiement et des responsabilités de livraison. La plateforme ne garantit pas les transactions.\n\nIndiquez le produit et le pays de destination pour préparer une demande logistique.',partners:[]};
    if (/verifi|fiable|certifi/.test(q)) return {text:'Les vérifications affichées sont simulées. Le futur parcours devra prévoir un examen des documents professionnels et des coordonnées, une validation par l’équipe, une date de contrôle et un moyen de signaler un problème. Aucun prestataire réel n’a été vérifié dans ce prototype.',partners:[]};
    if (product?.type === 'Service' || /service numerique|logo|identite visuelle|design|site web/.test(q)) return {text:context + 'Pour un service livré à distance, commencez par convenir du périmètre, des livrables, du calendrier, des révisions et des droits d’utilisation avec le prestataire. Un transport physique n’est généralement pas nécessaire pour des livrables numériques.\n\nUtilisez « Contacter le vendeur » sur la fiche pour préparer votre demande.',partners:[]};
    if (hasOtherRegion) return {text:context + 'Le répertoire de démonstration ne couvre pas cette destination. Je ne peux donc pas proposer de prestataire adapté.\n\nPréparez le pays exact, le produit, la quantité, le poids et les dimensions, puis recherchez un professionnel disposant d’une couverture confirmée pour ce trajet.',partners:[]};
    const isLogistic = /transport|livr|export|import|envo|europe|belgique|france|afrique|asie|amerique|maritime|avion|aerien|route|routier|devis|echantillon|lot|document|douane/.test(q) || !!explicitRegion;
    if (!isLogistic) return {text:'Je peux vous aider à préparer une demande de transport ou d’accompagnement export. Précisez :\n• le produit ou service ;\n• le pays de destination ;\n• la quantité, le poids et les dimensions si vous les connaissez ;\n• votre délai souhaité.\n\nExemple : « Je souhaite envoyer 10 kg de café en Belgique. »\nCet assistant de démonstration utilise des règles locales, sans IA connectée.',partners:[]};
    const service = /douane|document|formalit/.test(q) ? 'Accompagnement export' : /maritime|bateau|conteneur/.test(q) ? 'Transport maritime' : /routier|route|camion/.test(q) ? 'Transport routier' : /aerien|avion|echantillon/.test(q) ? 'Transport aérien' : '';
    const matches = D.partners.filter(p => p.verified && (!explicitRegion || p.regions.includes(explicitRegion)) && (!service || p.service === service));
    return {text:context + 'Voici comment préparer votre projet :\n\n1. Confirmez avec le vendeur la disponibilité, les quantités, le prix et le conditionnement.\n2. Précisez le pays et la ville de livraison, le poids, les dimensions et votre délai.\n3. Demandez un devis détaillé aux prestataires couvrant ce trajet et comparez transport, assurance et frais éventuels.\n4. Faites confirmer les documents et exigences applicables par les professionnels et autorités concernés avant l’envoi.\n\n' + (matches.length ? `${explicitRegion ? 'Destination repérée : ' + explicitRegion + '. ' : 'Destination à préciser. '}Les fiches ci-dessous sont des exemples correspondant ${service ? 'au service demandé' : 'à une première recherche'}. Aucun tarif ni trajet n’est garanti.` : 'Aucun partenaire au statut simulé « vérifié » ne correspond à ces critères dans notre démonstration.'),partners:matches.map(p=>p.id)};
  }
  function assistantPage(params) {
    const product = products().find(p=>p.id === params.get('product'));
    const welcome = {role:'assistant',text:product ? `Bonjour ! Vous consultez « ${product.name} ». Où souhaitez-vous recevoir ce produit ou service ?` : 'Bonjour ! Je vous aide à préparer votre projet d’achat et à explorer les services logistiques. Quel produit souhaitez-vous acheter et vers quel pays ?',partners:[]};
    const messages = state.chat.length ? state.chat : [welcome];
    return `<section class="wrap">${heading('Assistant Made in DRC','Un peu d’aide pour aller plus loin.','Décrivez votre projet. Préparez les bonnes questions et explorez les partenaires adaptés.')}<div class="chat-layout"><aside><div class="notice"><strong>Assistant de démonstration.</strong> Réponses guidées par des règles locales. Aucun modèle d’IA, devis réel ou service externe n’est connecté.</div>${product ? `<p>Offre sélectionnée : <a class="text-button" href="#/produit/${esc(product.id)}">${esc(product.name)}</a></p>` : ''}<h3>Essayez une question</h3><div class="suggestions"><button data-prompt="Je souhaite envoyer 10 kg de café en Belgique.">Envoyer du café en Belgique ↗</button><button data-prompt="Comment envoyer un échantillon par avion en Europe ?">Envoyer un échantillon ↗</button><button data-prompt="Comment préparer les documents pour exporter en Afrique ?">Préparer mon dossier export ↗</button><button data-prompt="Comment sécuriser le paiement ?">Préparer la transaction ↗</button></div><p class="chat-hint">Les recommandations portent uniquement sur des fiches fictives du prototype.</p><button class="text-button" data-action="clear-chat">Nouvelle conversation</button></aside><div class="chat-panel"><div class="chat-top"><strong>Assistant Made in DRC</strong><span>Orientation · mode démo</span></div><div class="chat-log" role="log" aria-live="polite" aria-label="Conversation avec l’assistant">${messages.map(m=>`<div class="chat-message ${m.role === 'user' ? 'user':''}">${esc(m.text)}${(m.partners || []).map(pid=>{const p = D.partners.find(p=>p.id===pid);return p ? `<a class="partner-link" href="#/partenaires?${qs({service:p.service,verified:'on'})}">${esc(p.name)} · ${esc(p.service)} ↗</a>` : '';}).join('')}</div>`).join('')}</div><form class="chat-form" id="chat-form"><input name="message" aria-label="Votre question" placeholder="Produit, destination, quantité…" maxlength="1000" required><button class="button" type="submit">Envoyer ↗</button></form></div></div></section>`;
  }
  function profileForm(edit = false) {
    const p = state.profile || {};
    return `<form id="profile-form"><div class="form-grid"><div class="field full"><label for="company">Nom professionnel</label><input id="company" name="name" required maxlength="100" value="${esc(p.name)}" placeholder="Ex. Atelier de démonstration"></div><div class="field"><label for="profile-city">Ville</label><input id="profile-city" name="city" required maxlength="100" value="${esc(p.city)}" placeholder="Kinshasa"></div><div class="field"><label for="activity">Activité principale</label><select id="activity" name="category">${opts(D.categories,p.category)}</select></div><div class="field"><label for="profile-email">E-mail professionnel</label><input id="profile-email" name="email" type="email" required maxlength="200" value="${esc(p.email)}" placeholder="demo@example.com"></div><div class="field"><label for="phone">Téléphone (facultatif)</label><input id="phone" name="phone" type="tel" maxlength="60" value="${esc(p.phone)}" placeholder="Numéro de démonstration"></div><div class="field full"><label for="about">Présentez votre savoir-faire</label><textarea id="about" name="about" required maxlength="2000" placeholder="Votre activité, vos produits, vos capacités…">${esc(p.about)}</textarea></div></div><p class="form-foot">Ce profil est stocké uniquement dans ce navigateur. Utilisez des coordonnées fictives pour la démonstration. Il ne s’agit pas d’une inscription sécurisée.</p><button class="button" type="submit">${edit ? 'Enregistrer le profil' : 'Créer ma vitrine de démonstration'} ↗</button></form>`;
  }
  function listingForm(pid) {
    const p = state.products.find(p=>p.id === pid) || {};
    return `<div class="panel"><h2>${p.id ? 'Modifier mon offre' : 'Présenter une nouvelle offre'}</h2><form id="listing-form" data-id="${esc(p.id || '')}"><div class="form-grid"><div class="field full"><label for="offer-title">Nom du produit ou service</label><input id="offer-title" name="name" required maxlength="120" value="${esc(p.name)}"></div><div class="field"><label for="offer-category">Catégorie</label><select id="offer-category" name="category">${opts(D.categories,p.category)}</select></div><div class="field"><label for="offer-type">Type</label><select id="offer-type" name="type">${opts(['Produit','Service'],p.type)}</select></div><div class="field"><label for="offer-price">Prix en USD (vide = sur devis)</label><input id="offer-price" name="price" type="number" min="0" max="100000000" step="0.01" value="${esc(p.price ?? '')}"></div><div class="field"><label for="offer-unit">Unité de vente</label><input id="offer-unit" name="unit" required maxlength="50" value="${esc(p.unit || 'pièce')}" placeholder="kg, pièce, projet…"></div><div class="field"><label for="offer-minimum">Commande minimale</label><input id="offer-minimum" name="minimum" required maxlength="80" value="${esc(p.minimum || '1 pièce')}"></div><div class="field"><label for="photo">Photo (facultatif, 500 Ko max.)</label><input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp">${p.photo ? '<label class="check-line"><input type="checkbox" name="removePhoto"> Retirer la photo actuelle</label>' : ''}</div><div class="field full"><label for="offer-description">Description</label><textarea id="offer-description" name="description" required maxlength="3000">${esc(p.description)}</textarea></div><div class="field full"><label for="offer-details">Détails et modalités</label><textarea id="offer-details" name="details" maxlength="2000" placeholder="Matières, formats, capacité, délais…">${esc(p.details)}</textarea></div><label class="check-line full"><input type="checkbox" name="active" ${p.active !== false ? 'checked':''}> Afficher cette offre dans le catalogue local</label></div><p class="form-foot">Une illustration est utilisée si aucune photo n’est ajoutée. Le prix ne doit pas inclure de frais non précisés. Cette publication reste locale.</p><div class="actions"><button class="button" type="submit">Enregistrer mon offre ↗</button><a class="button secondary" href="#/espace?tab=offres">Annuler</a></div></form></div>`;
  }
  function requestCard(r, reply = true) {
    return `<article class="request"><h3>${esc(r.label)}</h3><div class="request-meta">${esc(r.name)} · ${esc(r.email)}<br>Destination : ${esc(r.destination)} · Quantité : ${esc(r.quantity || 'à préciser')}<br>${esc(new Date(r.created).toLocaleString('fr-FR'))} · Simulation locale</div>${r.messages.map(m=>`<div class="message ${m.role === 'seller' ? 'own':''}"><strong>${m.role === 'seller' ? 'Réponse vendeur (locale)' : 'Demande acheteur (locale)'}</strong><br>${esc(m.text)}</div>`).join('')}${reply ? `<form class="reply-form" data-id="${esc(r.id)}"><input name="reply" required maxlength="2000" placeholder="Rédiger une réponse de démonstration…" aria-label="Réponse à ${esc(r.name)}"><button type="submit" class="button small">Enregistrer la réponse</button></form>` : ''}</article>`;
  }
  function dashboard(params) {
    if (!state.profile) return `<section class="wrap">${heading('Espace vendeur','Votre savoir-faire, votre vitrine.','Présentez votre activité aux acheteurs qui souhaitent découvrir la production congolaise.')}<div class="two-column"><aside><h2>Commencez en quelques étapes.</h2><div class="steps" style="grid-template-columns:1fr"><div><span class="step-number">01</span><h3>Présentez votre activité</h3><p>Ajoutez votre nom professionnel, votre ville et votre savoir-faire.</p></div><div><span class="step-number">02</span><h3>Publiez votre première offre</h3><p>Décrivez un produit ou un service et ses modalités de commande.</p></div><div><span class="step-number">03</span><h3>Testez une prise de contact</h3><p>Recevez une demande dans la messagerie locale du prototype.</p></div></div><div class="notice">La création de profil ne vaut pas vérification. Le futur statut « vérifié » devra être attribué après contrôle par l’équipe.</div></aside><div class="panel">${profileForm()}</div></div></section>`;
    const tab = params.get('tab') || 'offres';
    const received = state.requests.filter(r=>r.seller === 'local-seller');
    const examples = state.requests.filter(r=>r.seller !== 'local-seller');
    const localProducts = state.products;
    let body = '';
    if (tab === 'ajouter' || tab === 'modifier') body = listingForm(params.get('id'));
    else if (tab === 'profil') body = `<div class="panel">${profileForm(true)}</div>`;
    else if (tab === 'demandes') body = `<div class="notice">Cette messagerie conserve uniquement les simulations faites dans ce navigateur. Aucun e-mail ou message n’est envoyé à un tiers.</div>${received.length ? received.slice().reverse().map(r=>requestCard(r)).join('') : empty('Aucune demande pour vos offres','Ouvrez une de vos offres dans le catalogue et utilisez « Contacter le vendeur » pour tester le parcours.')}<h2 class="spaced">Autres demandes de démonstration</h2><p class="muted">Demandes que vous avez préparées pour les vendeurs et partenaires fictifs.</p>${examples.length ? examples.slice().reverse().map(r=>requestCard(r,false)).join('') : empty('Aucune simulation supplémentaire','Vous retrouverez ici les demandes faites sur les fiches d’exemple.')}`;
    else body = `<div class="section-heading"><div><h2>Mes offres</h2><p>Gérez votre catalogue de démonstration.</p></div><a class="button small" href="#/espace?tab=ajouter">+ Ajouter une offre</a></div>${localProducts.length ? `<div class="table-scroll"><table><thead><tr><th>Offre</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${localProducts.map(p=>`<tr><td>${p.active ? `<a href="#/produit/${esc(p.id)}">${esc(p.name)}</a>` : esc(p.name)}<br><small class="muted">${esc(p.category)}</small></td><td>${money(p.price)}</td><td><span class="badge ${p.active ? '' : 'pending'}">${p.active ? 'Visible localement' : 'Masquée'}</span></td><td><div class="actions"><a class="text-button" href="#/espace?${qs({tab:'modifier',id:p.id})}">Modifier</a><button class="text-button" data-action="toggle-offer" data-id="${esc(p.id)}">${p.active ? 'Masquer' : 'Afficher'}</button><button class="text-button error" data-action="delete-offer" data-id="${esc(p.id)}">Supprimer</button></div></td></tr>`).join('')}</tbody></table></div>` : empty('Votre première offre vous attend','Cliquez sur « Ajouter une offre » pour présenter votre produit ou service.')}`;
    return `<section class="wrap"><div class="section-heading"><div><div class="eyebrow">Tableau de bord vendeur</div><h1 style="font-size:40px;margin-bottom:12px">${esc(state.profile.name)}</h1><p>${esc(state.profile.city)} · Profil local · À vérifier</p></div><a href="#/vendeur/local-seller">Voir ma vitrine ↗</a></div><div class="stats"><div class="stat"><strong>${localProducts.filter(p=>p.active).length}</strong><span>Offres visibles</span></div><div class="stat"><strong>${received.length}</strong><span>Demandes reçues</span></div><div class="stat"><strong>${received.filter(r=>r.messages.some(m=>m.role==='seller')).length}</strong><span>Conversations traitées</span></div></div><nav class="tabs" aria-label="Navigation de l’espace vendeur"><a class="${['offres','ajouter','modifier'].includes(tab)?'active':''}" href="#/espace?tab=offres">Mes offres</a><a class="${tab==='demandes'?'active':''}" href="#/espace?tab=demandes">Demandes & conversations</a><a class="${tab==='profil'?'active':''}" href="#/espace?tab=profil">Mon profil</a></nav>${body}<div class="actions spaced"><button class="text-button" data-action="export-data">Exporter mes données de démonstration</button><button class="text-button error" data-action="reset-demo">Effacer mes données locales</button></div></section>`;
  }

  function openContact(kind, targetId) {
    const target = kind === 'product' ? products().find(p=>p.id===targetId && p.active) : D.partners.find(p=>p.id===targetId);
    if (!target) return;
    dialog.innerHTML = `<button class="close" aria-label="Fermer" data-action="close-dialog">×</button><div class="eyebrow">Prise de contact</div><h2 id="contact-title">${kind === 'product' ? 'Parlons de votre projet.' : 'Préparez votre demande de devis.'}</h2><p>${esc(target.name)}</p><div class="notice">Démonstration : votre demande sera enregistrée dans ce navigateur. Aucun message ne sera envoyé. Utilisez des coordonnées fictives.</div><form id="contact-form" data-kind="${kind}" data-id="${esc(targetId)}"><div class="form-grid"><div class="field"><label for="buyer-name">Nom ou entreprise</label><input id="buyer-name" name="name" required maxlength="100" autocomplete="off"></div><div class="field"><label for="buyer-email">E-mail de démonstration</label><input id="buyer-email" name="email" type="email" required maxlength="200" placeholder="acheteur@example.com" autocomplete="off"></div><div class="field"><label for="destination">Pays et ville de destination</label><input id="destination" name="destination" required maxlength="100" placeholder="Belgique, Bruxelles"></div><div class="field"><label for="quantity">Quantité / volume</label><input id="quantity" name="quantity" maxlength="80" placeholder="Ex. 10 kg ou 1 projet"></div><div class="field full"><label for="buyer-message">Votre demande</label><textarea id="buyer-message" name="message" required maxlength="3000" placeholder="Disponibilité, échantillons, délai, transport…"></textarea></div></div><button class="button spaced" type="submit">Enregistrer la demande de démonstration</button></form>`;
    dialog.showModal();
  }
  function sendChat(text) {
    if (!text.trim()) return;
    const product = products().find(p=>p.id===routeInfo().params.get('product'));
    const answer = assistantAnswer(text.slice(0,1000),product);
    if (change(s=>{ s.chat = [...s.chat,{role:'user',text:text.trim().slice(0,1000),partners:[]},{role:'assistant',...answer}].slice(-50); })) { render(false); document.querySelector('#chat-form input')?.focus(); }
  }
  async function readPhoto(file) {
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choisissez une image PNG, JPG ou WebP.');
    if (file.size > 500000) throw new Error('La photo dépasse 500 Ko. Réduisez sa taille puis recommencez.');
    const data = await new Promise((resolve,reject)=>{ const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(new Error('Impossible de lire cette image.')); reader.readAsDataURL(file); });
    const img = new Image(); img.src = data;
    try { await img.decode(); } catch { throw new Error('Cette image est illisible. Choisissez un autre fichier.'); }
    if (img.naturalWidth > 6000 || img.naturalHeight > 6000) throw new Error('Réduisez les dimensions de la photo à 6 000 pixels maximum.');
    return safePhoto(data);
  }
  async function onSubmit(e) {
    const form = e.target;
    if (!form.matches('form')) return;
    e.preventDefault();
    for (const input of form.querySelectorAll('[required]')) {
      if (typeof input.value === 'string' && !input.value.trim()) { input.focus(); toast('Veuillez compléter les champs obligatoires.'); return; }
    }
    const f = new FormData(form);
    const value = key => String(f.get(key) || '').trim();
    if (form.id === 'home-search') return go('/catalogue?' + qs({q:value('q')}));
    if (form.id === 'catalogue-filters') return go('/catalogue?' + new URLSearchParams(f).toString());
    if (form.id === 'partner-filters') return go('/partenaires?' + new URLSearchParams(f).toString());
    if (form.id === 'chat-form') return sendChat(value('message'));
    if (form.id === 'profile-form') {
      const profile = {id:'local-seller',name:value('name'),city:value('city'),category:value('category'),about:value('about'),email:value('email'),phone:value('phone'),verified:false};
      if (change(s=>{s.profile=profile;s.products=s.products.map(p=>({...p,city:profile.city}));})) { go('/espace?tab=offres'); toast('Votre vitrine est enregistrée dans ce navigateur.'); }
    }
    if (form.id === 'listing-form') {
      if (!state.profile) return;
      const old = state.products.find(p=>p.id === form.dataset.id);
      if (!old && state.products.length >= 100) return toast('Le prototype accepte 100 offres locales maximum.');
      const price = value('price') === '' ? null : Number(value('price'));
      if (price !== null && (!Number.isFinite(price) || price < 0 || price > 100000000)) return toast('Indiquez un prix valide, ou laissez le champ vide pour « Sur devis ».');
      const submit = form.querySelector('[type=submit]'); submit.disabled=true;
      try {
        const file = f.get('photo');
        const photo = file?.size ? await readPhoto(file) : f.get('removePhoto') ? '' : (old?.photo || '');
        const category = value('category');
        const p = {id:old?.id || id(),seller:'local-seller',name:value('name'),category,type:value('type'),price,unit:value('unit'),minimum:value('minimum'),description:value('description'),details:value('details'),city:state.profile.city,active:f.has('active'),photo,art:{'Agroalimentaire':'coffee','Mode & textile':'textile','Artisanat & décoration':'basket','Services':'design'}[category]};
        if (change(s=>{if(old)s.products=s.products.map(x=>x.id===old.id?p:x);else s.products.push(p);})) { go('/espace?tab=offres'); toast('Offre enregistrée dans votre catalogue local.'); }
      } finally { submit.disabled=false; }
    }
    if (form.id === 'contact-form') {
      if (state.requests.length >= 200) return toast('Le prototype accepte 200 demandes maximum. Exportez puis effacez les données pour recommencer.');
      const kind=form.dataset.kind, targetId=form.dataset.id;
      const target = kind === 'product' ? products().find(p=>p.id===targetId && p.active) : D.partners.find(p=>p.id===targetId);
      if (!target) return toast('Cette offre n’est plus disponible.');
      const request = {id:id(),kind,target:targetId,label:target.name,seller:target.seller || 'partner',name:value('name'),email:value('email'),destination:value('destination'),quantity:value('quantity'),created:new Date().toISOString(),messages:[{role:'buyer',text:value('message')}]};
      if (change(s=>s.requests.push(request))) {
        dialog.innerHTML = `<button class="close" aria-label="Fermer" data-action="close-dialog">×</button><h2 id="contact-title">Demande enregistrée localement.</h2><p>Vous pouvez maintenant consulter la demande dans l’historique de démonstration. Aucun message n’a été envoyé à un vendeur ou prestataire.</p><div class="actions"><a class="button" href="#/demandes">Voir mes demandes</a><button class="button secondary" data-action="close-dialog">Continuer</button></div>`;
        dialog.querySelector('.button').focus();
      }
    }
    if (form.classList.contains('reply-form')) {
      const request=state.requests.find(r=>r.id===form.dataset.id && r.seller==='local-seller');
      if (!request) return;
      if (request.messages.length >= 100) return toast('Cette conversation a atteint la limite de démonstration.');
      if (change(s=>s.requests.find(r=>r.id===request.id).messages.push({role:'seller',text:value('reply')}))) { render(false); toast('Réponse enregistrée localement. Aucun message externe envoyé.'); }
    }
  }
  function render(moveFocus = true) {
    const {parts,params} = routeInfo();
    let content;
    if (!parts.length) content = home();
    else if (parts[0] === 'catalogue') content = catalogue(params);
    else if (parts[0] === 'produit') content = productPage(parts[1]);
    else if (parts[0] === 'vendeur') content = sellerPage(parts[1]);
    else if (parts[0] === 'partenaires') content = partnerPage(params);
    else if (parts[0] === 'assistant') content = assistantPage(params);
    else if (parts[0] === 'espace') content = dashboard(params);
    else if (parts[0] === 'demandes') content = `<section class="wrap">${heading('Historique local','Vos demandes de démonstration.','Retrouvez ici les demandes préparées sur cet appareil. Aucun message n’a été envoyé à un tiers.')}${state.requests.length ? state.requests.slice().reverse().map(r=>requestCard(r,false)).join('') : empty('Aucune demande enregistrée','Choisissez une offre dans le catalogue pour tester une prise de contact.')}<a class="button secondary spaced" href="#/catalogue">Retour au catalogue</a></section>`;
    else content = missing();
    main.innerHTML=content;
    document.title=(main.querySelector('h1')?.textContent || 'Made in DRC') + ' — Made in DRC';
    document.querySelectorAll('[data-nav]').forEach(link=>{if(link.dataset.nav===parts[0])link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    document.querySelector('#navigation').classList.remove('open');
    document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
    if (dialog.open) dialog.close();
    const log=document.querySelector('.chat-log'); if(log)log.scrollTop=log.scrollHeight;
    if(moveFocus){window.scrollTo(0,0);main.focus({preventScroll:true});}
  }
  document.addEventListener('submit',e=>{onSubmit(e).catch(error=>toast(error.message || 'Impossible d’enregistrer cette action.'));});
  document.addEventListener('change',e=>{
    if(e.target.matches('#catalogue-filters select, #partner-filters select, #partner-filters input[type=checkbox]')) e.target.form.requestSubmit();
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('button'); if(!button)return;
    if(button.classList.contains('menu-toggle')){const open=document.querySelector('#navigation').classList.toggle('open');button.setAttribute('aria-expanded',String(open));return;}
    if(button.dataset.contact)return openContact(button.dataset.contact,button.dataset.id);
    if(button.dataset.prompt)return sendChat(button.dataset.prompt);
    const action=button.dataset.action;
    if(action==='close-dialog')dialog.close();
    if(action==='clear-chat' && change(s=>{s.chat=[];})){render(false);document.querySelector('#chat-form input')?.focus();}
    if(action==='toggle-offer' && change(s=>{const p=s.products.find(p=>p.id===button.dataset.id);if(p)p.active=!p.active;}))render(false);
    if(action==='delete-offer' && confirm('Supprimer cette offre de votre démonstration locale ? Les demandes déjà reçues seront conservées.')){if(change(s=>{s.products=s.products.filter(p=>p.id!==button.dataset.id);}))render(false);}
    if(action==='reset-demo' && confirm('Effacer le profil, les offres, les demandes et la conversation de ce navigateur ? Exportez vos données avant de continuer si nécessaire.')){if(persist(emptyState())){render();toast('Vos données de démonstration ont été effacées.');}}
    if(action==='export-data'){
      const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='made-in-drc-donnees-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      toast('Export préparé. Ce fichier peut contenir les coordonnées saisies.');
    }
  });
  window.addEventListener('hashchange',()=>render());
  render(false);
})();
