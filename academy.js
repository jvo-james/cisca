import { CLASS_SEED } from './catalog.js';
import { api } from './shared.js';
import { money } from './config.js';
import { IMAGES } from './images.js';

let classes = CLASS_SEED;
try {
  const response = await api('/classes');
  if (response.classes?.length) classes = response.classes;
} catch {}

const grid = document.querySelector('[data-class-grid]');
const imageByTrack = {
  Makeup: IMAGES.classroom,
  'Brows & Lashes': IMAGES.brows,
  Nails: IMAGES.nails,
  Hair: IMAGES.hair
};

const safe = value => String(value ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

if (grid) {
  grid.innerHTML = classes.map(item => {
    const image = item.image || imageByTrack[item.track] || IMAGES.beauty;
    const open = item.available && item.price != null;
    const imageLink = open
      ? `<a class="class-card-image" href="class-registration.html?id=${encodeURIComponent(item.id)}" aria-label="Open ${safe(item.title)}"></a>`
      : `<div class="class-card-image" aria-hidden="true"></div>`;
    return `<article class="class-card" style="--class-image:url('${image}')">
      ${imageLink}
      <div class="class-content">
        <div class="class-meta"><span>${safe(item.track)}</span><span>${safe(item.level)}</span></div>
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.summary)}</p>
        <div class="class-foot">
          <div><strong>${item.price != null ? money(item.price) : 'Fee coming soon'}</strong><br><small>${safe(item.duration || 'Schedule coming soon')}</small></div>
          ${open ? `<a class="btn btn-light" href="class-registration.html?id=${encodeURIComponent(item.id)}">Register <i class="fas fa-arrow-right" aria-hidden="true"></i></a>` : '<span class="tag">Registration closed</span>'}
        </div>
      </div>
    </article>`;
  }).join('');
}
