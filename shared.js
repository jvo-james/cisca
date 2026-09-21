import { CISCA_CONFIG, DEFAULT_SITE, money } from './config.js';
import { PRODUCT_SEED } from './catalog.js';
import { IMAGES } from './images.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));

let SITE = { ...DEFAULT_SITE };
try {
  const response = await fetch(`${CISCA_CONFIG.apiBase}/settings`, { headers: { 'Accept': 'application/json' } });
  if (response.ok) { const data = await response.json(); SITE = { ...SITE, ...(data.settings || data) }; }
} catch {}

export const SITE_SETTINGS = SITE;

const phone = SITE.phoneDisplay || '';
const whatsapp = SITE.whatsapp || CISCA_CONFIG.whatsapp;
const social = {
  instagram: SITE.instagram || CISCA_CONFIG.instagram,
  youtube: SITE.youtube || CISCA_CONFIG.youtube,
  pinterest: SITE.pinterest || CISCA_CONFIG.pinterest
};

const header = `
<header class="site-header" data-site-header-inner>
  <div class="wrap nav-row">
    <nav class="nav-left" aria-label="Main navigation">
      <span class="nav-has-mega">
        <a class="nav-link" href="shop.html">Shop</a>
        <div class="mega">
          <div class="mega-inner">
            <div>
              <h3>Shop</h3>
              <a href="shop.html">All products</a>
              <a href="shop.html?view=available">Available now</a>
              <a href="shop.html?view=featured">Cisca picks</a>
              <a href="track.html">Track an order</a>
            </div>
            <div>
              <h3>Makeup</h3>
              <a href="shop.html?category=Makeup&sub=Complexion">Complexion</a>
              <a href="shop.html?category=Makeup&sub=Eyes">Eyes</a>
              <a href="shop.html?category=Makeup&sub=Lips">Lips</a>
              <a href="shop.html?category=Makeup&sub=Skin%20Prep">Skin prep</a>
              <a href="shop.html?category=Makeup&sub=Tools">Tools</a>
            </div>
            <div>
              <h3>Beauty</h3>
              <a href="shop.html?category=Brow%20%26%20Lash">Brows & lashes</a>
              <a href="shop.html?category=Nails">Nails</a>
              <a href="shop.html?category=Hair">Hair</a>
              <a href="services.html">Beauty services</a>
            </div>
            <a class="mega-media" href="shop.html?view=featured">
              <img src="${IMAGES.detail2}" alt="Beauty products">
              <span>Browse Cisca picks <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
            </a>
          </div>
        </div>
      </span>

      <span class="nav-has-mega">
        <a class="nav-link" href="services.html">Services</a>
        <div class="mega">
          <div class="mega-inner">
            <div>
              <h3>Makeup</h3>
              <a href="services.html?category=Makeup">Signature glam</a>
              <a href="booking.html">Book an appointment</a>
            </div>
            <div>
              <h3>Beauty</h3>
              <a href="services.html?category=Brows">Brows</a>
              <a href="services.html?category=Lashes">Lashes</a>
              <a href="services.html?category=Nails">Nails</a>
              <a href="services.html?category=Hair">Hair</a>
            </div>
            <div>
              <h3>Occasions</h3>
              <a href="booking.html?occasion=Wedding">Wedding</a>
              <a href="booking.html?occasion=Graduation">Graduation</a>
              <a href="booking.html?occasion=Birthday">Birthday</a>
              <a href="booking.html?occasion=Photoshoot">Photoshoot</a>
            </div>
            <a class="mega-media" href="gallery.html">
              <img src="${IMAGES.client3}" alt="Beauty look">
              <span>See the looks <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
            </a>
          </div>
        </div>
      </span>

      <a class="nav-link" href="academy.html">Academy</a>
      <a class="nav-link" href="gallery.html">Looks</a>
      <a class="nav-link" href="about.html">About</a>
    </nav>

    <button class="menu-btn" type="button" data-menu aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
      <span class="menu-lines" aria-hidden="true"></span>
    </button>

    <a class="brand" href="index.html">
      ${esc(SITE.brand)}
      <small>${esc(SITE.tagline)}</small>
    </a>

    <nav class="nav-right" aria-label="Quick actions">
      <button class="nav-action" type="button" data-search-open aria-label="Search">
        <i class="fas fa-search" aria-hidden="true"></i><span>Search</span>
      </button>
      <a class="nav-action" href="booking.html">Book</a>
      <button class="nav-action bag-button" type="button" data-bag-open>
        <i class="fas fa-shopping-bag" aria-hidden="true"></i><span>Bag</span>
        <span class="cart-count" data-cart-count>0</span>
      </button>
    </nav>
  </div>
</header>

<div class="mobile-menu" id="mobileMenu" data-mobile-menu>
  <a href="shop.html">Shop <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <div class="mobile-shop-cats">
    <a href="shop.html?category=Makeup">Makeup</a>
    <a href="shop.html?category=Nails">Nails</a>
    <a href="shop.html?category=Brow%20%26%20Lash">Brows & lashes</a>
    <a href="shop.html?category=Hair">Hair</a>
  </div>
  <a href="services.html">Services <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <a href="booking.html">Book an appointment <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <a href="academy.html">Academy <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <a href="gallery.html">Lookbook <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <a href="about.html">About <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <a href="track.html">Track an order <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  <button class="nav-action mobile-search-link" type="button" data-search-open>Search products</button>
  <div class="mobile-meta">
    <a href="${esc(social.instagram)}" target="_blank" rel="noopener">Instagram</a>
    <a href="${esc(social.youtube)}" target="_blank" rel="noopener">YouTube</a>
    <a href="${esc(social.pinterest)}" target="_blank" rel="noopener">Pinterest</a>
  </div>
</div>

<div class="search-overlay" data-search-overlay aria-hidden="true">
  <div class="search-panel">
    <div class="overlay-head">
      <div>
        <span class="eyebrow pink">Search</span>
        <h2>Find something you like.</h2>
      </div>
      <button class="icon-btn" type="button" data-search-close aria-label="Close search">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
    <input class="site-search" data-site-search placeholder="Search products, lashes, hair..." autocomplete="off">
    <div class="search-results" data-search-results>
      <div class="search-empty">Start typing to search the shop.</div>
    </div>
  </div>
</div>

<div class="bag-drawer" data-bag-drawer aria-hidden="true">
  <aside class="bag-panel">
    <div class="bag-head">
      <div>
        <span class="eyebrow pink">Your bag</span>
        <h2>What you picked</h2>
      </div>
      <button class="icon-btn" type="button" data-bag-close aria-label="Close bag">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
    <div class="bag-items" data-bag-items></div>
    <div class="bag-foot">
      <div class="bag-total"><span>Subtotal</span><span data-bag-total>GH₵0.00</span></div>
      <div class="bag-actions">
        <a class="btn btn-outline" href="cart.html">View bag</a>
        <a class="btn" href="checkout.html">Checkout</a>
      </div>
    </div>
  </aside>
</div>
`;

const footer = `
<footer class="site-footer">
  <div class="footer-photo-row">
    <a href="gallery.html?filter=Soft%20Glam"><img src="${IMAGES.client1}" alt="Beauty look"></a>
    <a href="gallery.html?filter=Bridal"><img src="${IMAGES.bridal}" alt="Bridal beauty"></a>
    <a href="gallery.html?filter=Brows"><img src="${IMAGES.brows}" alt="Brows"></a>
    <a href="gallery.html?filter=Hair"><img src="${IMAGES.hair}" alt="Hair styling"></a>
    <a href="gallery.html?filter=Editorial"><img src="${IMAGES.photoshoot}" alt="Beauty portrait"></a>
  </div>

  <div class="footer-main">
    <div class="wrap">
      <div class="footer-top">
        <div>
          <span class="eyebrow" style="color:var(--rose)">Stay close</span>
          <h2>Beauty things worth hearing about.</h2>
        </div>
        <div>
          <p>New products, class dates and booking updates when there is something useful to share.</p>
          <form class="newsletter" data-newsletter>
            <input type="email" name="email" required placeholder="Email address" aria-label="Email address">
            <button type="submit">Join <i class="fas fa-arrow-right" aria-hidden="true"></i></button>
          </form>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-brand">
          ${esc(SITE.brand)}
          <p>${esc(SITE.footerText)}</p>
          <div class="footer-socials">
            <a class="social-icon" href="${esc(social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a class="social-icon" href="${esc(social.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            <a class="social-icon" href="${esc(social.pinterest)}" target="_blank" rel="noopener" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            ${phone ? `<a class="social-icon" href="tel:${esc(phone.replace(/\s+/g,''))}" aria-label="Phone"><i class="fas fa-phone"></i></a>` : ''}
          </div>
        </div>

        <div class="footer-col">
          <h3>Shop</h3>
          <a href="shop.html">All products <i class="fas fa-arrow-right"></i></a>
          <a href="shop.html?view=featured">Cisca picks <i class="fas fa-arrow-right"></i></a>
          <a href="cart.html">Your bag <i class="fas fa-arrow-right"></i></a>
        </div>

        <div class="footer-col">
          <h3>Beauty</h3>
          <a href="services.html">Services <i class="fas fa-arrow-right"></i></a>
          <a href="booking.html">Book <i class="fas fa-arrow-right"></i></a>
          <a href="gallery.html">Looks <i class="fas fa-arrow-right"></i></a>
        </div>

        <div class="footer-col">
          <h3>Academy</h3>
          <a href="academy.html">Classes <i class="fas fa-arrow-right"></i></a>
          <a href="student-resources.html">Student resources <i class="fas fa-arrow-right"></i></a>
          <a href="class-registration.html">Registration <i class="fas fa-arrow-right"></i></a>
        </div>

        <div class="footer-col">
          <h3>Help</h3>
          <a href="track.html">Track order <i class="fas fa-arrow-right"></i></a>
          <a href="contact.html">Contact <i class="fas fa-arrow-right"></i></a>
          ${phone ? `<a href="tel:${esc(phone.replace(/\s+/g,''))}">${esc(phone)} <i class="fas fa-phone"></i></a>` : ''}
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${esc(SITE.brand)}</span>
        <span>${esc(SITE.locationLabel || '')}</span>
      </div>
    </div>
  </div>
</footer>
`;

document.querySelector('[data-site-header]')?.insertAdjacentHTML('afterbegin', header);
document.querySelector('[data-site-footer]')?.insertAdjacentHTML('afterbegin', footer);

const headerEl = document.querySelector('[data-site-header-inner]');
const menu = document.querySelector('[data-mobile-menu]');
const menuBtn = document.querySelector('[data-menu]');
let lastY = window.scrollY;
let ticking = false;

function updateHeader() {
  const current = window.scrollY;
  if (current <= 12) {
    headerEl?.classList.remove('is-hidden', 'scrolling-up');
  } else if (current < lastY - 3) {
    headerEl?.classList.remove('is-hidden');
    headerEl?.classList.add('scrolling-up');
  } else if (current > lastY + 6 && !menu?.classList.contains('open')) {
    headerEl?.classList.add('is-hidden');
    headerEl?.classList.remove('scrolling-up');
  }
  lastY = current;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
}, { passive: true });

function closeMenu() {
  menu?.classList.remove('open');
  menuBtn?.classList.remove('is-open');
  menuBtn?.setAttribute('aria-expanded','false');
  document.body.classList.remove('nav-open');
}
menuBtn?.addEventListener('click', () => {
  const open = !menu?.classList.contains('open');
  menu?.classList.toggle('open', open);
  menuBtn?.classList.toggle('is-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
  if (open) headerEl?.classList.remove('is-hidden');
});
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

export function getCart() {
  try { return JSON.parse(localStorage.getItem('cisca_cart') || '[]'); } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem('cisca_cart', JSON.stringify(cart));
  updateCartCount();
  renderBag();
}

export function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);
}

function renderBag() {
  const items = document.querySelector('[data-bag-items]');
  const total = document.querySelector('[data-bag-total]');
  if (!items) return;
  const cart = getCart();
  items.innerHTML = cart.length
    ? cart.map(item => `
        <div class="bag-item">
          <img src="${esc(item.image || IMAGES.beauty)}" alt="${esc(item.name)}">
          <div>
            <h3>${esc(item.name)}</h3>
            <small>${esc(item.category || 'Beauty')} · Qty ${Number(item.qty || 1)}</small>
          </div>
          <strong>${money(Number(item.price || 0) * Number(item.qty || 1))}</strong>
        </div>
      `).join('')
    : '<div class="empty-state">Your bag is empty.</div>';
  if (total) total.textContent = money(cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0));
}

document.querySelectorAll('[data-image]').forEach(element => { const source = IMAGES[element.dataset.image]; if (source) element.src = source; });

updateCartCount();
renderBag();

const bag = document.querySelector('[data-bag-drawer]');
document.querySelectorAll('[data-bag-open]').forEach(button => button.addEventListener('click', () => {
  bag?.classList.add('open');
  bag?.setAttribute('aria-hidden','false');
  document.body.classList.add('overlay-open');
  renderBag();
}));
document.querySelector('[data-bag-close]')?.addEventListener('click', () => {
  bag?.classList.remove('open');
  bag?.setAttribute('aria-hidden','true');
  document.body.classList.remove('overlay-open');
});
bag?.addEventListener('click', event => {
  if (event.target === bag) {
    bag.classList.remove('open');
    bag.setAttribute('aria-hidden','true');
    document.body.classList.remove('overlay-open');
  }
});

const searchOverlay = document.querySelector('[data-search-overlay]');
const searchInput = document.querySelector('[data-site-search]');
const searchResults = document.querySelector('[data-search-results]');

function closeSearch() {
  searchOverlay?.classList.remove('open');
  searchOverlay?.setAttribute('aria-hidden','true');
  document.body.classList.remove('overlay-open');
}
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  searchOverlay?.classList.add('open');
  searchOverlay?.setAttribute('aria-hidden','false');
  document.body.classList.add('overlay-open');
  setTimeout(() => searchInput?.focus(), 80);
}));
document.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
searchOverlay?.addEventListener('click', event => {
  if (event.target === searchOverlay) closeSearch();
});

let searchProducts = PRODUCT_SEED;
fetch(`${CISCA_CONFIG.apiBase}/products`)
  .then(response => response.ok ? response.json() : null)
  .then(response => {
    if (!response?.products?.length) return;
    const map = new Map(PRODUCT_SEED.map(product => [product.id, product]));
    response.products.forEach(product => map.set(product.id, { ...(map.get(product.id) || {}), ...product }));
    searchProducts = [...map.values()];
  })
  .catch(() => {});

const fallbacks = {
  Makeup: IMAGES.makeup,
  Nails: IMAGES.nails,
  'Brow & Lash': IMAGES.lashes,
  Hair: IMAGES.hair
};

searchInput?.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 2) {
    searchResults.innerHTML = '<div class="search-empty">Type at least two letters.</div>';
    return;
  }
  const rows = searchProducts
    .filter(product => `${product.name} ${product.category}`.toLowerCase().includes(query))
    .slice(0, 8);
  searchResults.innerHTML = rows.length
    ? rows.map(product => `
        <a class="search-item" href="product.html?id=${encodeURIComponent(product.id)}">
          <img src="${esc(product.image || fallbacks[product.category] || IMAGES.beauty)}" alt="${esc(product.name)}">
          <div>
            <small>${esc(product.category)}</small>
            <h3>${esc(product.name)}</h3>
            <span>${product.price != null ? money(product.price) : 'Coming soon'}</span>
          </div>
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </a>
      `).join('')
    : '<div class="search-empty">Nothing found. Try another word.</div>';
});

export function toast(message) {
  let element = document.querySelector('.toast');
  if (!element) {
    element = document.createElement('div');
    element.className = 'toast';
    document.body.append(element);
  }
  element.textContent = message;
  element.classList.add('show');
  window.setTimeout(() => element.classList.remove('show'), 2600);
}

export async function api(path, options = {}) {
  const response = await fetch(`${CISCA_CONFIG.apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

document.querySelectorAll('[data-newsletter]').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    await api('/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: new FormData(form).get('email') })
    });
    form.reset();
    toast('You are on the list.');
  } catch (error) {
    toast(error.message);
  } finally {
    button.disabled = false;
  }
}));
