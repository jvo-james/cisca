import { SERVICE_SEED } from './catalog.js';
import { api, toast, SITE_SETTINGS } from './shared.js';
import { money } from './config.js';
import { IMAGES } from './images.js';

const form = document.querySelector('[data-booking-form]');
const picker = document.querySelector('[data-service-picker]');
const tabs = document.querySelector('[data-service-tabs]');
const occasionGrid = document.querySelector('[data-occasion-grid]');
const serviceSection = document.querySelector('[data-service-section]');
const calendarEl = document.querySelector('[data-calendar]');
const calendarLabel = document.querySelector('[data-calendar-label]');
const calendarNote = document.querySelector('[data-calendar-note]');
const selectedDateEl = document.querySelector('[data-selected-date]');
const timeSlotsEl = document.querySelector('[data-time-slots]');
const timesHeading = document.querySelector('[data-times-heading]');
const timesPanel = document.querySelector('[data-times-panel]');
const mobileSummary = document.querySelector('[data-mobile-summary]');
const uploadInput = document.querySelector('[data-inspo-files]');
const previewEl = document.querySelector('[data-inspo-preview]');
const uploadStatus = document.querySelector('[data-upload-status]');

let services = SERVICE_SEED;
try {
  const response = await api('/services');
  if (response.services?.length) services = response.services;
} catch {}

const activeServices = services.filter(service => service.active !== false);
const serviceById = id => activeServices.find(service => service.id === id);

const params = new URLSearchParams(location.search);
let selectedServiceId = params.get('service') && serviceById(params.get('service')) ? params.get('service') : '';
let selectedOccasion = params.get('occasion') || '';
let serviceFilter = 'All';
let stage = 1;
let selectedDate = '';
let selectedTime = '';
let uploadedInspo = [];
let selectedInspoFiles = [];
let currentMonth = new Date();
currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
let availability = { closedDates: [], busy: {} };

const TIME_SLOTS = ['09:00','10:30','12:00','13:30','15:00','16:30'];
const monthCache = new Map();

const serviceImages = {
  'natural-glam': IMAGES.client2,
  'soft-glam': IMAGES.client3,
  'bold-glam': IMAGES.photoshoot,
  'bridal-makeup': IMAGES.bridal,
  'classic-lashes': IMAGES.lashes,
  'hybrid-lashes': IMAGES.lashes,
  'volume-lashes': IMAGES.lashes,
  'brow-shaping': IMAGES.brows,
  'brow-tint': IMAGES.brows,
  'microshading': IMAGES.brows,
  'closure-install': IMAGES.hair,
  'frontal-install': IMAGES.hair,
  'curling': IMAGES.hair,
  'gel-polish': IMAGES.nails,
  'acrylic-short': IMAGES.nails,
  'acrylic-medium': IMAGES.nails
};

const occasionRecommendations = {
  Birthday: ['soft-glam','bold-glam','natural-glam'],
  Wedding: ['bridal-makeup','soft-glam','natural-glam'],
  Graduation: ['soft-glam','natural-glam','bold-glam'],
  Photoshoot: ['bold-glam','soft-glam','natural-glam'],
  'Date / Event': ['soft-glam','natural-glam','bold-glam'],
  'Just because': ['natural-glam','soft-glam','classic-lashes']
};

const ymd = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

const monthKey = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}`;

const formatDate = value =>
  value
    ? new Intl.DateTimeFormat('en-GH', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
        .format(new Date(`${value}T12:00:00`))
    : 'Not selected';

const formatLongDate = value =>
  value
    ? new Intl.DateTimeFormat('en-GH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
        .format(new Date(`${value}T12:00:00`))
    : '';

const formatTime = value =>
  value
    ? new Intl.DateTimeFormat('en-GH', { hour:'numeric', minute:'2-digit' })
        .format(new Date(`2026-01-01T${value}:00`))
    : 'Not selected';

const selectedService = () => serviceById(selectedServiceId);
const total = () => Number(selectedService()?.price || 0);
const deposit = () => Math.round(total() * 50) / 100;

function durationMinutes(service) {
  const text = String(service?.duration || '90 min').toLowerCase();
  const hours = Number(text.match(/(\d+(?:\.\d+)?)\s*hr/)?.[1] || 0);
  const minutes = Number(text.match(/(\d+)\s*min/)?.[1] || 0);
  return Math.max(30, Math.round(hours * 60 + minutes) || 90);
}

function minutesOf(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : -1;
}

function serviceImage(service) {
  if (!service) return IMAGES.beauty;
  const defaultByCategory = {
    Makeup: IMAGES.beauty,
    Lashes: IMAGES.lashes,
    Brows: IMAGES.brows,
    Hair: IMAGES.hair,
    Nails: IMAGES.nails
  };
  return service.image || serviceImages[service.id] || defaultByCategory[service.category] || IMAGES.beauty;
}

function overlapsBusy(date, time) {
  const service = selectedService();
  if (!service) return false;
  const start = minutesOf(time);
  const end = start + durationMinutes(service);
  return (availability.busy?.[date] || []).some(slot => {
    const busyStart = minutesOf(slot.time);
    const busyEnd = busyStart + Number(slot.duration || 90);
    return start < busyEnd && end > busyStart;
  });
}

function scrollToElement(element, extra = 14) {
  if (!element) return;
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 64;
  const top = element.getBoundingClientRect().top + window.scrollY - headerHeight - extra;
  window.scrollTo({ top: Math.max(0, top), behavior:'smooth' });
}

function scrollToStage() {
  const section = document.querySelector(`[data-stage="${stage}"]`);
  window.setTimeout(() => scrollToElement(section, 14), 50);
}

function categoryList() {
  return ['All', ...new Set(activeServices.map(service => service.category).filter(Boolean))];
}

function renderOccasions() {
  occasionGrid.querySelectorAll('[data-occasion]').forEach(button =>
    button.classList.toggle('selected', button.dataset.occasion === selectedOccasion)
  );
  form.occasion.value = selectedOccasion;
}

function recommendedIds() {
  return occasionRecommendations[selectedOccasion] || [];
}

function renderServices() {
  const categories = categoryList();
  if (!categories.includes(serviceFilter)) serviceFilter = 'All';

  tabs.innerHTML = categories.map(category => `
    <button type="button" class="${category === serviceFilter ? 'active' : ''}" data-service-filter="${category}">
      ${category}
    </button>
  `).join('');

  const recommended = recommendedIds();
  const filtered = activeServices
    .filter(service => serviceFilter === 'All' || service.category === serviceFilter)
    .sort((a,b) => {
      const ai = recommended.indexOf(a.id);
      const bi = recommended.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const heading = document.querySelector('[data-service-heading]');
  const copy = document.querySelector('[data-service-copy]');
  const kicker = document.querySelector('[data-service-kicker]');

  if (selectedOccasion) {
    kicker.textContent = `${selectedOccasion} picks`;
    heading.textContent = 'Start with one of these.';
    copy.textContent = 'You can still browse every service below.';
  } else {
    kicker.textContent = 'Choose your service';
    heading.textContent = 'What are we doing today?';
    copy.textContent = 'Tap a service to choose it.';
  }

  picker.innerHTML = filtered.map(service => {
    const selected = service.id === selectedServiceId;
    const recommendedClass = recommended.includes(service.id) ? 'recommended' : '';
    return `
      <article class="service-option ${selected ? 'selected' : ''} ${recommendedClass}" data-service-id="${service.id}">
        <div class="service-option-image">
          <img src="${serviceImage(service)}" alt="${service.name}" loading="lazy">
          <button type="button" class="view-look" data-view-look="${service.id}">View look</button>
        </div>
        <button type="button" class="service-option-copy" data-select-service="${service.id}">
          <span>${service.category || 'Beauty'}</span>
          <h4>${service.name}</h4>
          <p>${service.description || 'A beauty service built around your look.'}</p>
          <div class="service-meta">
            <b>${service.duration || 'Timing varies'}</b>
            <b>${service.price != null ? money(service.price) : 'Price on request'}</b>
          </div>
          <span class="service-select-text">${selected ? 'Selected' : 'Select'}</span>
        </button>
      </article>
    `;
  }).join('') || '<div class="empty-state">No services are available right now.</div>';

  tabs.querySelectorAll('[data-service-filter]').forEach(button =>
    button.addEventListener('click', () => {
      serviceFilter = button.dataset.serviceFilter;
      renderServices();
      scrollToElement(serviceSection, 14);
    })
  );

  picker.querySelectorAll('[data-select-service]').forEach(button =>
    button.addEventListener('click', () => selectService(button.dataset.selectService))
  );

  picker.querySelectorAll('[data-view-look]').forEach(button =>
    button.addEventListener('click', event => {
      event.stopPropagation();
      openLook(serviceById(button.dataset.viewLook));
    })
  );
}

function selectService(id) {
  const service = serviceById(id);
  if (!service) return;
  selectedServiceId = id;
  selectedTime = '';
  form.time.value = '';
  renderServices();
  renderTimes();
  updateSummary();
  toast(`${service.name} selected.`);
  window.setTimeout(() => scrollToElement(document.querySelector('.stage-actions'), 18), 80);
}

function openLook(service) {
  if (!service) return;
  const modal = document.createElement('div');
  modal.className = 'look-modal';
  modal.innerHTML = `
    <button class="look-modal-backdrop" type="button" aria-label="Close preview"></button>
    <div class="look-modal-card" role="dialog" aria-modal="true" aria-label="${service.name}">
      <img src="${serviceImage(service)}" alt="${service.name}">
      <button class="look-modal-close" type="button" aria-label="Close"><i class="fas fa-times"></i></button>
      <div class="look-modal-copy">
        <span class="booking-kicker">Example look</span>
        <h3>${service.name}</h3>
        <p>${service.description || ''}</p>
        <button class="booking-primary" type="button" data-pick-preview>Choose this service <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;
  document.body.append(modal);
  document.body.classList.add('overlay-open');

  const close = () => {
    modal.remove();
    document.body.classList.remove('overlay-open');
  };

  modal.querySelector('.look-modal-backdrop').onclick = close;
  modal.querySelector('.look-modal-close').onclick = close;
  modal.querySelector('[data-pick-preview]').onclick = () => {
    selectService(service.id);
    close();
  };
}

async function loadMonth(date) {
  const key = monthKey(date);
  if (monthCache.has(key)) {
    availability = monthCache.get(key);
    return;
  }

  calendarNote.textContent = 'Checking availability...';

  try {
    const data = await api(`/availability?month=${encodeURIComponent(key)}`);
    availability = {
      closedDates: data.closedDates || [],
      busy: data.busy || {}
    };
    monthCache.set(key, availability);
  } catch {
    availability = { closedDates: [], busy: {} };
  }

  calendarNote.textContent = 'Closed dates are muted.';
}

async function renderCalendar() {
  await loadMonth(currentMonth);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  calendarLabel.textContent = new Intl.DateTimeFormat('en-GH', { month:'long', year:'numeric' }).format(currentMonth);

  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  const today = new Date();
  today.setHours(0,0,0,0);
  const max = new Date();
  max.setMonth(max.getMonth() + 6);
  max.setHours(23,59,59,999);

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const value = ymd(date);
    const outside = date.getMonth() !== month;
    const past = date < today;
    const tooFar = date > max;
    const closed = availability.closedDates.includes(value);
    const disabled = outside || past || tooFar || closed;

    cells.push(`
      <button type="button"
        class="calendar-day ${outside ? 'outside' : ''} ${disabled ? '' : 'available'} ${closed ? 'closed' : ''} ${value === selectedDate ? 'selected' : ''} ${ymd(today) === value ? 'today' : ''}"
        data-date="${value}"
        ${disabled ? 'disabled' : ''}
        aria-label="${formatLongDate(value)}"
        ${value === selectedDate ? 'aria-pressed="true"' : ''}>
        <span>${date.getDate()}</span>
      </button>
    `);
  }

  calendarEl.innerHTML = cells.join('');

  selectedDateEl.textContent = selectedDate ? `Selected: ${formatDate(selectedDate)}` : 'Choose a date';

  calendarEl.querySelectorAll('[data-date]:not(:disabled)').forEach(button =>
    button.addEventListener('click', async () => {
      selectedDate = button.dataset.date;
      selectedTime = '';
      form.date.value = selectedDate;
      form.time.value = '';
      await renderCalendar();
      renderTimes();
      updateSummary();
      window.setTimeout(() => scrollToElement(timesPanel, 18), 80);
    })
  );
}

function renderTimes() {
  if (!selectedDate) {
    timesHeading.textContent = 'Choose a date first';
    timeSlotsEl.innerHTML = '<p class="time-empty">Pick a day and the open times will show here.</p>';
    return;
  }

  timesHeading.textContent = formatLongDate(selectedDate);
  const service = selectedService();

  if (!service) {
    timeSlotsEl.innerHTML = '<p class="time-empty">Choose your service first so we can check the right times.</p>';
    return;
  }

  const slots = TIME_SLOTS.map(time => ({ time, busy: overlapsBusy(selectedDate, time) }));
  const openSlots = slots.filter(slot => !slot.busy);

  if (!openSlots.length) {
    timeSlotsEl.innerHTML = '<p class="time-empty">This day is full. Try another day.</p>';
    return;
  }

  timeSlotsEl.innerHTML = slots.map(slot => `
    <button type="button" class="time-slot ${slot.time === selectedTime ? 'selected' : ''}" data-time="${slot.time}" ${slot.busy ? 'disabled' : ''}>
      ${formatTime(slot.time)}
    </button>
  `).join('');

  timeSlotsEl.querySelectorAll('[data-time]:not(:disabled)').forEach(button =>
    button.addEventListener('click', () => {
      selectedTime = button.dataset.time;
      form.time.value = selectedTime;
      renderTimes();
      updateSummary();
      toast('Time selected.');
      window.setTimeout(() => scrollToElement(document.querySelector('.location-section'), 18), 80);
    })
  );
}

function updateLocationState() {
  const value = new FormData(form).get('locationType') || 'Studio appointment';
  document.querySelectorAll('.location-option').forEach(label =>
    label.classList.toggle('selected', label.querySelector('input').checked)
  );
  const home = value === 'Home appointment';
  const box = document.querySelector('[data-home-address]');
  const address = document.querySelector('#booking-address');
  box.hidden = !home;
  address.required = home;
  updateSummary();
  if (document.activeElement?.matches('input[name=locationType]')) {
    window.setTimeout(() => scrollToElement(document.querySelector('.stage-actions'), 18), 80);
  }
}

function addNote(text, button) {
  const area = form.notes;
  const lines = area.value.split('\n').map(line => line.trim()).filter(Boolean);
  const exists = lines.includes(text);
  area.value = exists ? lines.filter(line => line !== text).join('\n') : [...lines, text].join('\n');
  button.classList.toggle('active', !exists);
}

function updateMobileSummary() {
  const service = selectedService();
  mobileSummary.innerHTML = `
    <img src="${serviceImage(service)}" alt="">
    <div>
      <span>${service?.category || 'Beauty'}</span>
      <h4>${service?.name || 'Choose a service'}</h4>
      <p>${selectedDate ? formatDate(selectedDate) : 'Date not selected'}${selectedTime ? ` · ${formatTime(selectedTime)}` : ''}</p>
    </div>
    <strong>${service?.price != null ? money(total()) : 'GH₵0.00'}</strong>
  `;
}

function updateSummary() {
  const service = selectedService();
  const locationType = new FormData(form).get('locationType') || 'Studio appointment';

  document.querySelector('[data-sum-services]').textContent = service?.name || 'No service selected';
  document.querySelector('[data-sum-date]').textContent = selectedDate ? formatDate(selectedDate) : 'Not selected';
  document.querySelector('[data-sum-time]').textContent = selectedTime ? formatTime(selectedTime) : 'Not selected';
  document.querySelector('[data-sum-location]').textContent =
    locationType === 'Home appointment'
      ? 'Home service'
      : (SITE_SETTINGS.locationLabel || 'Studio appointment');

  document.querySelector('[data-sum-total]').textContent =
    service?.price != null ? money(total()) : 'Price on request';

  document.querySelector('[data-progress-service]').textContent = service?.name || 'Choose your service';
  document.querySelector('[data-progress-date]').textContent =
    selectedDate
      ? `${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-GH',{day:'numeric',month:'short'})}${selectedTime ? ` · ${formatTime(selectedTime)}` : ''}`
      : 'Choose a day';

  const image = document.querySelector('[data-summary-image]');
  image.src = serviceImage(service);
  image.alt = service?.name || 'Selected beauty service';

  document.querySelector('[data-change-service]').hidden = !service;
  document.querySelector('[data-full-price]').textContent = money(total());
  document.querySelector('[data-deposit-price]').textContent = money(deposit());

  const payOption = new FormData(form).get('paymentOption') || 'deposit';
  const due = payOption === 'deposit' ? deposit() : total();
  document.querySelector('[data-due-now]').textContent =
    service?.price != null ? money(due) : '';

  document.querySelectorAll('.payment-option').forEach(label =>
    label.classList.toggle('selected', label.querySelector('input').checked)
  );

  form.inspoImages.value = JSON.stringify(uploadedInspo);
  updateMobileSummary();
}

function renderReview() {
  const service = selectedService();
  if (!service) return;

  const details = Object.fromEntries(new FormData(form));
  const location =
    details.locationType === 'Home appointment'
      ? `Home service${details.address ? `, ${details.address}` : ''}`
      : (SITE_SETTINGS.locationLabel || 'Studio appointment');

  document.querySelector('[data-review]').innerHTML = `
    <div class="review-service">
      <img src="${serviceImage(service)}" alt="${service.name}">
      <div>
        <span class="booking-kicker">${service.category || 'Beauty'}</span>
        <h3>${service.name}</h3>
        <p>${service.duration || 'Timing varies'}</p>
      </div>
      <strong>${service.price != null ? money(service.price) : 'Price on request'}</strong>
    </div>
    <div class="review-info">
      <div><span>Date</span><strong>${formatLongDate(selectedDate)}</strong></div>
      <div><span>Time</span><strong>${formatTime(selectedTime)}</strong></div>
      <div><span>Appointment</span><strong>${location}</strong></div>
      <div><span>Client</span><strong>${details.firstName || ''} ${details.lastName || ''}</strong></div>
      <div><span>Email</span><strong>${details.email || ''}</strong></div>
      <div><span>Phone</span><strong>${details.phone || ''}</strong></div>
      <div><span>Inspiration photos</span><strong>${uploadedInspo.length ? `${uploadedInspo.length} photo${uploadedInspo.length === 1 ? '' : 's'} added` : 'None added'}</strong></div>
    </div>
    <div class="review-total"><span>Service total</span><strong>${money(total())}</strong></div>
  `;

  updateSummary();
}

function validateStage() {
  if (stage === 1 && !selectedServiceId) {
    toast('Choose a service to continue.');
    scrollToElement(serviceSection, 14);
    return false;
  }

  if (stage === 2) {
    if (!selectedDate) { toast('Choose an available date.'); scrollToElement(document.querySelector('.calendar-panel'), 14); return false; }
    if (!selectedTime) { toast('Choose an available time.'); scrollToElement(timesPanel, 14); return false; }

    const home = new FormData(form).get('locationType') === 'Home appointment';
    if (home && !form.address.value.trim()) {
      form.address.reportValidity();
      return false;
    }
  }

  if (stage === 3) {
    for (const field of form.querySelectorAll('[data-stage="3"] [required]')) {
      if (!field.reportValidity()) return false;
    }
  }

  if (stage === 4 && (!selectedDate || !selectedTime || !selectedServiceId)) {
    toast('Please complete your appointment details first.');
    return false;
  }

  return true;
}

function isSameFile(a, b) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

function renderPreview() {
  if (!previewEl) return;

  const pending = selectedInspoFiles.map((file, index) => ({
    type:'file',
    key:`file-${index}-${file.name}-${file.size}-${file.lastModified}`,
    source:URL.createObjectURL(file),
    index
  }));

  const uploaded = uploadedInspo.map((url, index) => ({
    type:'uploaded',
    key:`uploaded-${index}`,
    source:url,
    index
  }));

  const items = [...uploaded, ...pending].slice(0,4);

  previewEl.innerHTML = items.map(item => `
    <figure>
      <img src="${item.source}" alt="Inspiration photo">
      <button type="button" class="inspo-remove" data-inspo-remove="${item.type}" data-inspo-index="${item.index}" aria-label="Remove inspiration photo">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </figure>
  `).join('');

  form.inspoImages.value = JSON.stringify(uploadedInspo);
  if (uploadStatus) uploadStatus.textContent = '';
}

async function uploadInspoFiles() {
  if (!selectedInspoFiles.length) return;

  const files = [...selectedInspoFiles];
  for (const file of files) {
    if (!file.type.startsWith('image/')) throw new Error('Only image files can be uploaded.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Each inspiration photo must be 5MB or smaller.');
  }

  for (const file of files) {
    const sign = await api('/booking/inspo-sign', { method:'POST', body:'{}' });
    const data = new FormData();
    data.append('file', file);
    data.append('api_key', sign.apiKey);
    data.append('timestamp', String(sign.timestamp));
    data.append('signature', sign.signature);
    data.append('folder', sign.folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(sign.cloudName)}/image/upload`, {
      method:'POST',
      body:data
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Photo upload failed.');
    uploadedInspo.push(result.secure_url);
  }

  selectedInspoFiles = [];
  form.inspoImages.value = JSON.stringify(uploadedInspo);
  renderPreview();
}

function showStage(nextStage) {
  stage = Math.max(1, Math.min(4, nextStage));

  document.querySelectorAll('[data-stage]').forEach(section =>
    section.classList.toggle('active', Number(section.dataset.stage) === stage)
  );

  document.querySelectorAll('[data-step-nav]').forEach(button => {
    const number = Number(button.dataset.stepNav);
    button.classList.toggle('active', number === stage);
    button.classList.toggle('done', number < stage);
  });

  if (stage === 4) renderReview();
  scrollToStage();
}

async function goNext() {
  if (!validateStage()) return;

  const button = document.querySelector(`[data-stage="${stage}"] [data-next]`);
  const original = button?.innerHTML;

  if (stage === 3 && selectedInspoFiles.length) {
    button.disabled = true;
    button.textContent = 'Uploading photos...';
    try {
      await uploadInspoFiles();
    } catch (error) {
      toast(error.message);
      button.disabled = false;
      button.innerHTML = original || 'Continue';
      return;
    }
    button.disabled = false;
    button.innerHTML = original || 'Continue';
  }

  showStage(stage + 1);
}

occasionGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-occasion]');
  if (!button) return;
  selectedOccasion = button.dataset.occasion;
  renderOccasions();
  renderServices();
  window.setTimeout(() => scrollToElement(serviceSection, 14), 80);
});

document.querySelector('[data-skip-occasion]').addEventListener('click', () =>
  scrollToElement(serviceSection, 14)
);

document.querySelector('[data-change-service]').addEventListener('click', () => {
  showStage(1);
  window.setTimeout(() => scrollToElement(serviceSection, 14), 90);
});

document.querySelector('[data-calendar-prev]').addEventListener('click', async () => {
  const now = new Date();
  const previous = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  if (previous < new Date(now.getFullYear(), now.getMonth(), 1)) return;
  currentMonth = previous;
  selectedDate = '';
  selectedTime = '';
  form.date.value = '';
  form.time.value = '';
  await renderCalendar();
  renderTimes();
  updateSummary();
});

document.querySelector('[data-calendar-next]').addEventListener('click', async () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  await renderCalendar();
});

form.querySelectorAll('input[name="locationType"]').forEach(input =>
  input.addEventListener('change', updateLocationState)
);

form.querySelectorAll('input[name="paymentOption"]').forEach(input =>
  input.addEventListener('change', updateSummary)
);

document.querySelectorAll('[data-note]').forEach(button =>
  button.addEventListener('click', () => addNote(button.dataset.note, button))
);

form.addEventListener('input', event => {
  if (event.target !== uploadInput) updateSummary();
});

uploadInput?.addEventListener('change', () => {
  const incoming = [...uploadInput.files];
  const remaining = 4 - uploadedInspo.length - selectedInspoFiles.length;

  if (incoming.length > remaining) {
    toast(`You can add up to ${remaining} more photo${remaining === 1 ? '' : 's'}.`);
  }

  for (const file of incoming.slice(0, Math.max(0, remaining))) {
    if (!file.type.startsWith('image/')) {
      toast('Only image files can be uploaded.');
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Each inspiration photo must be 5MB or smaller.');
      continue;
    }
    const duplicatePending = selectedInspoFiles.some(existing => isSameFile(existing, file));
    if (!duplicatePending) selectedInspoFiles.push(file);
  }

  uploadInput.value = '';
  renderPreview();
});

previewEl?.addEventListener('click', event => {
  const button = event.target.closest('[data-inspo-remove]');
  if (!button) return;

  const type = button.dataset.inspoRemove;
  const index = Number(button.dataset.inspoIndex);

  if (type === 'uploaded') {
    uploadedInspo.splice(index, 1);
  } else {
    selectedInspoFiles.splice(index, 1);
  }

  form.inspoImages.value = JSON.stringify(uploadedInspo);
  renderPreview();
});

form.querySelectorAll('[data-next]').forEach(button =>
  button.addEventListener('click', goNext)
);

form.querySelectorAll('[data-back]').forEach(button =>
  button.addEventListener('click', () => showStage(stage - 1))
);

document.querySelectorAll('[data-step-nav]').forEach(button =>
  button.addEventListener('click', async () => {
    const target = Number(button.dataset.stepNav);
    if (target < stage) {
      showStage(target);
      return;
    }
    if (target === stage + 1) {
      await goNext();
    }
  })
);

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!validateStage() || !selectedServiceId) return;

  const button = document.querySelector('[data-submit]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Preparing payment...';

  try {
    const data = Object.fromEntries(new FormData(form));
    data.inspoImages = uploadedInspo;
    const response = await api('/booking/start', {
      method:'POST',
      body:JSON.stringify({ ...data, serviceIds:[selectedServiceId] })
    });

    if (!response.authorizationUrl || !response.reference) {
      throw new Error('Paystack did not return a payment link.');
    }

    sessionStorage.setItem('cisca_pending_payment', JSON.stringify({
      reference: response.reference,
      kind: 'booking'
    }));

    window.location.assign(response.authorizationUrl);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.innerHTML = original;

    if (/time|slot|available|date/i.test(error.message || '')) {
      monthCache.delete(monthKey(currentMonth));
      await loadMonth(currentMonth);
      await renderCalendar();
      renderTimes();
      showStage(2);
    }
  }
});

function setHelpLinks() {
  const href = `https://wa.me/${encodeURIComponent(SITE_SETTINGS.whatsapp || '233594186445')}?text=${encodeURIComponent('Hi, I need some help with an appointment.')}`;
  document.querySelectorAll('[data-booking-help],[data-summary-help]').forEach(link => link.href = href);
}

function init() {
  setHelpLinks();
  renderOccasions();
  renderServices();
  updateLocationState();
  renderTimes();
  updateSummary();

  if (selectedServiceId) {
    serviceFilter = serviceById(selectedServiceId)?.category || 'All';
    renderServices();
    updateSummary();
  }
}

await renderCalendar();
init();
