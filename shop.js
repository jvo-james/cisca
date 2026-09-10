import { PRODUCT_SEED } from './catalog.js';
import { api, saveCart, getCart, toast } from './shared.js';
import { money } from './config.js';

const FALLBACK = {
  'Makeup':'images/makeup.webp',
  'Nails':'images/nails.webp',
  'Brow & Lash':'images/lashes.webp',
  'Hair':'images/hair.webp'
};
const CATEGORY_LABELS = {'Brow & Lash':'Brows + lashes'};
const PAGE_SIZE = 24;

let products = PRODUCT_SEED.map((p,index)=>({...p,__seedIndex:index}));
try {
  const response = await api('/products');
  if (response.products?.length) {
    const map = new Map(products.map(p=>[p.id,p]));
    response.products.forEach(p=>map.set(p.id,{...(map.get(p.id)||{}),...p}));
    products = [...map.values()];
  }
} catch {}

const els = {
  grid: document.querySelector('[data-product-grid]'),
  favourites: document.querySelector('[data-favourites]'),
  favouritesSection: document.querySelector('[data-favourites-section]'),
  categoryRail: document.querySelector('[data-category-rail]'),
  subcategoryRail: document.querySelector('[data-subcategory-rail]'),
  mobileCategory: document.querySelector('[data-mobile-category]'),
  mobileSubcategory: document.querySelector('[data-mobile-subcategory]'),
  search: document.querySelector('[data-product-search]'),
  clearSearch: document.querySelector('[data-clear-search]'),
  availableOnly: document.querySelector('[data-available-only]'),
  mobileAvailable: document.querySelector('[data-mobile-available]'),
  title: document.querySelector('[data-shop-title]'),
  count: document.querySelector('[data-shop-count]'),
  showing: document.querySelector('[data-showing-count]'),
  load: document.querySelector('[data-load-more]'),
  filterCount: document.querySelector('[data-filter-count]'),
  filterSheet: document.querySelector('[data-filter-sheet]'),
  sortSheet: document.querySelector('[data-sort-sheet]'),
  quickSheet: document.querySelector('[data-quick-sheet]'),
  sortOptions: document.querySelector('[data-sort-options]')
};

const params = new URLSearchParams(location.search);
const state = {
  category: ['Makeup','Nails','Brow & Lash','Hair'].includes(params.get('category')) ? params.get('category') : 'All',
  sub: params.get('sub') || 'All',
  query: '',
  available: params.get('view') === 'available',
  sort: params.get('sort') || 'featured',
  view: params.get('view') || '',
  limit: PAGE_SIZE
};
let draft = {...state};
let quickProduct = null;
let quickQty = 1;

function getSub(p){
  const n=(p.name||'').toLowerCase();
  if(p.category==='Makeup'){
    if(/brush|sponge|palette|puff|applicator|mirror|washer/.test(n)) return 'Tools';
    if(/lip|gloss|balm/.test(n)) return 'Lips';
    if(/eye|liner|mascara|lash|pencil/.test(n)) return 'Eyes';
    if(/moist|primer|micellar|snail|vitamin|cream|soap|mist|spray/.test(n)) return 'Skin Prep';
    return 'Complexion';
  }
  if(p.category==='Nails'){
    if(/charm|rhinestone|glitter|flower|chrome|bead/.test(n)) return 'Art & Charms';
    if(/gel|polish|base|top coat|builder|acrylic|bond/.test(n)) return 'Gel & Acrylic';
    return 'Tools';
  }
  if(p.category==='Brow & Lash'){
    if(/pigment|micro|cartridge|mapping|brow|blade|sealant/.test(n)) return 'Brows & PMU';
    if(/lash|tweezer|eye path|mascara/.test(n)) return 'Lashes';
    return 'Tools & Care';
  }
  if(p.category==='Hair'){
    if(/iron|crimper|dryer|comb|brush|straight|hot comb/.test(n)) return 'Styling Tools';
    if(/lace|bond|wig|cap|melt|glue/.test(n)) return 'Wig & Lace';
    if(/spray|mousse|keeper|protectant|gel|silk/.test(n)) return 'Styling Products';
    return 'Accessories';
  }
  return 'Other';
}

function isReady(p){ return Boolean(p.available && p.price != null); }
function imageFor(p){ return p.image || FALLBACK[p.category] || 'images/beauty.webp'; }
function descriptorFor(p){
  if (p.subtitle) return p.subtitle;
  if (p.variant) return p.variant;
  return getSub(p);
}
function badgeFor(p){
  if (p.badge) return {label:p.badge, wine:/best|pick|new/i.test(p.badge)};
  if (p.new || p.isNew) return {label:'New',wine:true};
  if (p.featured) return {label:'Cisca pick',wine:true};
  if (!isReady(p)) return {label:'Coming soon',wine:false};
  if (p.lowStock) return {label:'Low stock',wine:false};
  return null;
}
function productCard(p,{eager=false}={}){
  const ready=isReady(p), badge=badgeFor(p), img=imageFor(p);
  return `<article class="product-card" data-product-card="${p.id}">
    <a class="product-art" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${img}" alt="${escapeHtml(p.name)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">
      ${badge?`<span class="product-badge ${badge.wine?'badge-wine':''}">${escapeHtml(badge.label)}</span>`:''}
    </a>
    <div class="product-card-body">
      <span class="product-kicker">${escapeHtml(CATEGORY_LABELS[p.category]||p.category)}</span>
      <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h3>
      <div class="product-descriptor">${escapeHtml(descriptorFor(p))}</div>
      <strong class="product-price">${p.price!=null?money(p.price):'Coming soon'}</strong>
      <div class="product-card-actions">
        <button class="card-quick" type="button" data-quick="${p.id}" ${!ready?'disabled':''}>${ready?'Quick add':'Coming soon'}</button>
        <a class="card-view" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${escapeHtml(p.name)}">→</a>
      </div>
    </div>
  </article>`;
}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function availableSubs(category){
  const base=category==='All'?products:products.filter(p=>p.category===category);
  return ['All',...new Set(base.map(getSub))];
}
function matchesChip(p,chip){
  if(chip==='all') return true;
  if(chip==='featured') return Boolean(p.featured);
  if(chip==='new') return Boolean(p.new||p.isNew);
  if(chip==='Nails'||chip==='Hair') return p.category===chip;
  if(chip==='Brows & PMU') return p.category==='Brow & Lash'&&getSub(p)==='Brows & PMU';
  if(chip==='Lashes') return p.category==='Brow & Lash'&&getSub(p)==='Lashes';
  return getSub(p)===chip;
}
function filteredProducts(){
  const q=state.query.trim().toLowerCase();
  let rows=products.filter(p=>(state.category==='All'||p.category===state.category)&&(state.sub==='All'||getSub(p)===state.sub)&&(!q||`${p.name} ${p.category} ${getSub(p)} ${p.subtitle||''}`.toLowerCase().includes(q))&&(!state.available||isReady(p)));
  if(state.view==='featured') rows=rows.filter(p=>p.featured);
  if(state.view==='new') rows=rows.filter(p=>p.new||p.isNew);
  if(state.sort==='name') rows.sort((a,b)=>a.name.localeCompare(b.name));
  else if(state.sort==='price-asc') rows.sort((a,b)=>(a.price==null?Infinity:a.price)-(b.price==null?Infinity:b.price));
  else if(state.sort==='price-desc') rows.sort((a,b)=>(b.price==null?-Infinity:b.price)-(a.price==null?-Infinity:a.price));
  else if(state.sort==='newest') rows.sort((a,b)=>Number(Boolean(b.new||b.isNew))-Number(Boolean(a.new||a.isNew)) || (b.__seedIndex??0)-(a.__seedIndex??0));
  else rows.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)) || Number(isReady(b))-Number(isReady(a)) || (a.__seedIndex??0)-(b.__seedIndex??0));
  return rows;
}
function titleFor(){
  if(state.query) return `Results for “${state.query}”`;
  if(state.view==='featured') return 'Cisca picks';
  if(state.view==='new') return 'New beauty';
  if(state.sub!=='All') return state.sub;
  if(state.category!=='All') return CATEGORY_LABELS[state.category]||state.category;
  return 'All beauty';
}
function filterButtonMarkup(targetState){
  const categories=['All','Makeup','Brow & Lash','Nails','Hair'];
  const subs=availableSubs(targetState.category);
  return {
    cats:categories.map(c=>`<button type="button" class="${c===targetState.category?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(CATEGORY_LABELS[c]||c)}</button>`).join(''),
    subs:subs.map(s=>`<button type="button" class="${s===targetState.sub?'active':''}" data-sub="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')
  };
}
function renderFilters(){
  const desk=filterButtonMarkup(state);
  els.categoryRail.innerHTML=desk.cats; els.subcategoryRail.innerHTML=desk.subs;
  els.availableOnly.checked=state.available;
  els.categoryRail.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;state.sub='All';state.view='';state.limit=PAGE_SIZE;render();});
  els.subcategoryRail.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{state.sub=b.dataset.sub;state.view='';state.limit=PAGE_SIZE;render();});
  const activeCount=Number(state.category!=='All')+Number(state.sub!=='All')+Number(state.available);
  els.filterCount.textContent=activeCount?`(${activeCount})`:'';
}
function renderMobileFilterDraft(){
  const m=filterButtonMarkup(draft);
  els.mobileCategory.innerHTML=m.cats;els.mobileSubcategory.innerHTML=m.subs;els.mobileAvailable.checked=draft.available;
  els.mobileCategory.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{draft.category=b.dataset.cat;draft.sub='All';renderMobileFilterDraft();});
  els.mobileSubcategory.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{draft.sub=b.dataset.sub;renderMobileFilterDraft();});
}
function renderFavourites(){
  let picks=products.filter(p=>p.featured);
  if(picks.length<6) picks=[...picks,...products.filter(p=>!picks.some(x=>x.id===p.id)&&isReady(p))];
  if(picks.length<6) picks=[...picks,...products.filter(p=>!picks.some(x=>x.id===p.id))];
  picks=picks.slice(0,8);
  els.favourites.innerHTML=picks.map((p,i)=>productCard(p,{eager:i<2})).join('');
  bindQuickAdd(els.favourites);
}
function render(){
  const validSubs=availableSubs(state.category);if(!validSubs.includes(state.sub))state.sub='All';
  renderFilters();
  const rows=filteredProducts();
  els.title.textContent=titleFor();els.count.textContent=`${rows.length} ${rows.length===1?'product':'products'}`;
  els.search.value=state.query;els.search.parentElement.classList.toggle('has-query',Boolean(state.query));
  const visible=rows.slice(0,state.limit);
  els.grid.innerHTML=visible.length?visible.map((p,i)=>productCard(p,{eager:i<4})).join(''):`<div class="empty-products"><h3>Nothing here yet.</h3><p>Try another category or clear your filters.</p></div>`;
  bindQuickAdd(els.grid);
  els.showing.textContent=rows.length?`Showing ${Math.min(state.limit,rows.length)} of ${rows.length}`:'';
  els.load.hidden=rows.length<=state.limit;
  document.querySelectorAll('[data-shop-chip]').forEach(b=>{
    const chip=b.dataset.shopChip;
    const active=(chip==='all'&&state.category==='All'&&state.sub==='All'&&!state.view)||(chip==='featured'&&state.view==='featured')||(chip==='new'&&state.view==='new')||(chip==='Nails'&&state.category==='Nails')||(chip==='Hair'&&state.category==='Hair')||(state.sub===chip);
    b.classList.toggle('active',active);
  });
  els.sortOptions.querySelectorAll('[data-sort-value]').forEach(b=>b.classList.toggle('active',b.dataset.sortValue===state.sort));
}
function bindQuickAdd(scope){scope.querySelectorAll('[data-quick]:not(:disabled)').forEach(b=>b.addEventListener('click',()=>openQuick(b.dataset.quick)));}
function openQuick(id){
  const p=products.find(x=>x.id===id);if(!p||!isReady(p))return;
  quickProduct=p;quickQty=1;
  document.querySelector('[data-quick-image]').src=imageFor(p);document.querySelector('[data-quick-image]').alt=p.name;
  document.querySelector('[data-quick-category]').textContent=CATEGORY_LABELS[p.category]||p.category;
  document.querySelector('[data-quick-name]').textContent=p.name;
  document.querySelector('[data-quick-price]').textContent=money(p.price);
  document.querySelector('[data-quick-note]').textContent=p.subtitle||`${getSub(p)} · selected by Cisca for the beauty edit.`;
  document.querySelector('[data-quick-details]').href=`product.html?id=${encodeURIComponent(p.id)}`;
  updateQuickTotal();openSheet(els.quickSheet);
}
function updateQuickTotal(){
  document.querySelector('[data-quick-qty]').textContent=quickQty;
  if(quickProduct)document.querySelector('[data-quick-submit]').textContent=`Add to bag · ${money(Number(quickProduct.price)*quickQty)}`;
}
function addQuick(){
  if(!quickProduct)return;const cart=getCart(),found=cart.find(x=>x.id===quickProduct.id);
  if(found)found.qty=Number(found.qty||1)+quickQty;else cart.push({id:quickProduct.id,name:quickProduct.name,price:quickProduct.price,qty:quickQty,image:imageFor(quickProduct),category:quickProduct.category});
  saveCart(cart);closeSheet(els.quickSheet);toast(`${quickProduct.name} added to your bag.`);
  setTimeout(()=>document.querySelector('[data-bag-open]')?.click(),180);
}
function openSheet(el){el?.classList.add('open');el?.setAttribute('aria-hidden','false');document.body.classList.add('overlay-open');}
function closeSheet(el){el?.classList.remove('open');el?.setAttribute('aria-hidden','true');document.body.classList.remove('overlay-open');}

els.search.addEventListener('input',()=>{state.query=els.search.value;state.view='';state.limit=PAGE_SIZE;render();});
els.clearSearch.addEventListener('click',()=>{state.query='';els.search.focus();render();});
els.availableOnly.addEventListener('change',()=>{state.available=els.availableOnly.checked;state.limit=PAGE_SIZE;render();});
els.load.addEventListener('click',()=>{state.limit+=PAGE_SIZE;render();});
document.querySelectorAll('[data-shop-chip]').forEach(b=>b.addEventListener('click',()=>{
  const chip=b.dataset.shopChip;state.query='';state.available=false;state.limit=PAGE_SIZE;state.view='';
  if(chip==='all'){state.category='All';state.sub='All';}
  else if(chip==='featured'){state.category='All';state.sub='All';state.view='featured';}
  else if(chip==='new'){state.category='All';state.sub='All';state.view='new';}
  else if(chip==='Nails'||chip==='Hair'){state.category=chip;state.sub='All';}
  else if(chip==='Brows & PMU'||chip==='Lashes'){state.category='Brow & Lash';state.sub=chip;}
  else {state.category='Makeup';state.sub=chip;}
  render();document.querySelector('#catalogue')?.scrollIntoView({behavior:'smooth',block:'start'});
}));
document.querySelector('[data-soft-glam-filter]')?.addEventListener('click',()=>{state.category='Makeup';state.sub='All';state.view='';state.query='';state.limit=PAGE_SIZE;render();document.querySelector('#catalogue')?.scrollIntoView({behavior:'smooth'});});

document.querySelector('[data-filter-open]')?.addEventListener('click',()=>{draft={...state};renderMobileFilterDraft();openSheet(els.filterSheet);});
document.querySelectorAll('[data-sheet-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(els.filterSheet)));
document.querySelector('[data-filter-reset]')?.addEventListener('click',()=>{draft={...draft,category:'All',sub:'All',available:false};renderMobileFilterDraft();});
document.querySelector('[data-filter-apply]')?.addEventListener('click',()=>{state.category=draft.category;state.sub=draft.sub;state.available=els.mobileAvailable.checked;state.view='';state.limit=PAGE_SIZE;closeSheet(els.filterSheet);render();});

document.querySelector('[data-sort-open]')?.addEventListener('click',()=>openSheet(els.sortSheet));
document.querySelectorAll('[data-sort-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(els.sortSheet)));
els.sortOptions.querySelectorAll('[data-sort-value]').forEach(b=>b.addEventListener('click',()=>{state.sort=b.dataset.sortValue;state.limit=PAGE_SIZE;closeSheet(els.sortSheet);render();}));

document.querySelectorAll('[data-quick-close]').forEach(b=>b.addEventListener('click',()=>closeSheet(els.quickSheet)));
document.querySelector('[data-qty-minus]')?.addEventListener('click',()=>{quickQty=Math.max(1,quickQty-1);updateQuickTotal();});
document.querySelector('[data-qty-plus]')?.addEventListener('click',()=>{quickQty=Math.min(20,quickQty+1);updateQuickTotal();});
document.querySelector('[data-quick-submit]')?.addEventListener('click',addQuick);

// Add a real thumb-friendly search control to the compact mobile shop header.
if(matchMedia('(max-width:680px)').matches){
  const navRight=document.querySelector('.shop-page .nav-right');
  const bagButton=navRight?.querySelector('[data-bag-open]');
  if(navRight && bagButton && !navRight.querySelector('.shop-mobile-search')){
    const searchButton=document.createElement('button');
    searchButton.type='button';
    searchButton.className='shop-mobile-search';
    searchButton.setAttribute('aria-label','Search products');
    searchButton.textContent='⌕';
    searchButton.addEventListener('click',()=>{
      const overlay=document.querySelector('[data-search-overlay]');
      overlay?.classList.add('open');
      document.body.classList.add('overlay-open');
      setTimeout(()=>document.querySelector('[data-site-search]')?.focus(),80);
    });
    navRight.insertBefore(searchButton,bagButton);
  }
}

renderFavourites();
render();
