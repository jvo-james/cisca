import { SERVICE_SEED } from './catalog.js';
import { api } from './shared.js';
import { money } from './config.js';
import { IMAGES } from './images.js';

document.querySelectorAll('[data-image]').forEach(image => {
  const key = image.dataset.image;
  if (IMAGES[key]) image.src = IMAGES[key];
});

let services = SERVICE_SEED;
try {
  const response = await api('/services');
  if (response.services?.length) services = response.services;
} catch {}

const categories = ['All', ...new Set(services.map(service => service.category).filter(Boolean))];
const tabs = document.querySelector('[data-service-tabs]');
const grid = document.querySelector('[data-service-grid]');
let selected = new URLSearchParams(location.search).get('category') || 'All';
if (!categories.includes(selected)) selected = 'All';

function serviceImage(service, index) {
  if (service.image) return service.image;
  const map = {
    Makeup: [IMAGES.beauty, IMAGES.client2, IMAGES.photoshoot],
    Brows: [IMAGES.brows],
    Lashes: [IMAGES.lashes],
    Hair: [IMAGES.hair],
    Nails: [IMAGES.nails]
  };
  return (map[service.category] || [IMAGES.beauty])[index % (map[service.category] || [IMAGES.beauty]).length];
}

function render(category = selected) {
  selected = category;
  tabs.innerHTML = categories.map(categoryName => `
    <button type="button" class="service-tab ${categoryName === category ? 'active' : ''}" data-category="${categoryName}">
      ${categoryName}
    </button>
  `).join('');

  const rows = services.filter(service =>
    service.active !== false && (category === 'All' || service.category === category)
  );

  grid.innerHTML = rows.length ? rows.map((service, index) => `
    <a class="service-card" href="booking.html?service=${encodeURIComponent(service.id)}">
      <img src="${serviceImage(service,index)}" alt="${service.name}" loading="lazy">
      <div class="service-body">
        <div class="service-meta"><span>${service.category || 'Beauty'}</span><span>${service.duration || 'Timing varies'}</span></div>
        <h3>${service.name}</h3>
        <p>${service.description || 'A beauty service built around your look and your moment.'}</p>
        <div class="service-price-row">
          <strong class="service-price">${service.price != null ? money(service.price) : 'Price on request'}</strong>
          <span class="text-link">Book <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </a>
  `).join('') : '<div class="empty-state">No services are showing here yet.</div>';

  tabs.querySelectorAll('[data-category]').forEach(button =>
    button.addEventListener('click', () => render(button.dataset.category))
  );
}

render();
