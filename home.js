import { PRODUCT_SEED } from './catalog.js';
import { api, SITE_SETTINGS } from './shared.js';
import { money } from './config.js';
import { IMAGES } from './images.js';

const fallback = {
  Makeup: IMAGES.makeup,
  Nails: IMAGES.nails,
  'Brow & Lash': IMAGES.lashes,
  Hair: IMAGES.hair
};

document.querySelectorAll('[data-image]').forEach(img => {
  const key = img.dataset.image;
  if (IMAGES[key]) img.src = IMAGES[key];
});
const heroKicker=document.querySelector('[data-home-kicker]');
const heroTitle=document.querySelector('[data-home-title]');
const heroText=document.querySelector('[data-home-text]');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
if(heroKicker) heroKicker.textContent=SITE_SETTINGS.heroKicker || heroKicker.textContent;
if(heroTitle){const title=String(SITE_SETTINGS.heroTitle || heroTitle.innerHTML).replace(/<br\s*\/?>(\s*)/gi,'\n');heroTitle.innerHTML=title.split('\n').map(escapeHtml).join('<br>');}
if(heroText) heroText.textContent=SITE_SETTINGS.heroText || heroText.textContent;

let products = PRODUCT_SEED;
try {
  const response = await api('/products');
  if (response.products?.length) {
    const map = new Map(PRODUCT_SEED.map(product => [product.id, product]));
    response.products.forEach(product => map.set(product.id, { ...(map.get(product.id) || {}), ...product }));
    products = [...map.values()];
  }
} catch {}

const output = document.querySelector('[data-home-products]');
const tabs = document.querySelector('[data-home-tabs]');
let active = 'Makeup';

function render() {
  const rows = products
    .filter(product => product.category === active)
    .sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 4);

  output.innerHTML = rows.map(product => `
    <a class="home-product" href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="art">
        <img src="${product.image || fallback[product.category] || IMAGES.beauty}" alt="${product.name}" loading="lazy">
        <span class="badge">${product.available && product.price != null ? (product.featured ? 'Cisca pick' : 'Available') : 'Coming soon'}</span>
      </div>
      <div class="home-product-info">
        <small>${product.category}</small>
        <h3>${product.name}</h3>
        <strong>${product.price != null ? money(product.price) : 'Coming soon'}</strong>
      </div>
    </a>
  `).join('') || '<div class="empty-state">Nothing is showing here yet.</div>';

  tabs.querySelectorAll('button').forEach(button =>
    button.classList.toggle('active', button.dataset.homeTab === active)
  );
}

tabs.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  active = button.dataset.homeTab;
  render();
});

render();
