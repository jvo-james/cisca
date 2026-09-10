import { SERVICE_SEED } from './catalog.js';
import { api, toast } from './shared.js';
import { CISCA_CONFIG, money } from './config.js';

const form = document.querySelector('[data-booking-form]');
const picker = document.querySelector('[data-service-picker]');
const tabs = document.querySelector('[data-service-tabs]');
const occasionGrid = document.querySelector('[data-occasion-grid]');
const serviceSection = document.querySelector('[data-service-section]');
const calendarEl = document.querySelector('[data-calendar]');
const calendarLabel = document.querySelector('[data-calendar-label]');
const calendarNote = document.querySelector('[data-calendar-note]');
const timeSlotsEl = document.querySelector('[data-time-slots]');
const timesHeading = document.querySelector('[data-times-heading]');
const mobileBar = document.querySelector('[data-mobile-summary-bar]');
const mobileSheet = document.querySelector('[data-mobile-summary-sheet]');

let services = SERVICE_SEED;
try {
  const r = await api('/services');
  if (r.services?.length) services = r.services;
} catch {}

const activeServices = services.filter(s => s.active !== false);
const serviceById = id => activeServices.find(s => s.id === id);

const params = new URLSearchParams(location.search);
let selectedServiceId = params.get('service') && serviceById(params.get('service')) ? params.get('service') : '';
let selectedOccasion = params.get('occasion') || '';
let serviceFilter = params.get('category') || 'All';
let stage = 1;
let selectedDate = '';
let selectedTime = '';
let availability = { closedDates: [], busy: {} };
let currentMonth = new Date();
currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

const TIME_SLOTS = ['09:00','10:30','12:00','13:30','15:00','16:30'];
const monthCache = new Map();

const serviceImages = {
  'natural-glam': 'images/look-06.webp',
  'soft-glam': 'images/look-03.webp',
  'bold-glam': 'images/look-02.webp',
  'bridal-makeup': 'images/bridal.webp',
  'classic-lashes': 'images/lashes.webp',
  'hybrid-lashes': 'images/lashes.webp',
  'volume-lashes': 'images/lashes.webp',
  'brow-shaping': 'images/brows.webp',
  'brow-tint': 'images/brows.webp',
  'microshading': 'images/brows.webp',
  'closure-install': 'images/hair.webp',
  'frontal-install': 'images/hair.webp',
  'curling': 'images/hair.webp',
  'gel-polish': 'images/nails.webp',
  'acrylic-short': 'images/nails.webp',
  'acrylic-medium': 'images/nails.webp'
};

const occasionRecommendations = {
  'Birthday': ['soft-glam','bold-glam','natural-glam'],
  'Wedding': ['bridal-makeup','soft-glam','natural-glam'],
  'Graduation': ['soft-glam','natural-glam','bold-glam'],
  'Photoshoot': ['bold-glam','soft-glam','natural-glam'],
  'Date / Event': ['soft-glam','natural-glam','bold-glam'],
  'Just because': ['natural-glam','soft-glam','classic-lashes']
};

const formatDate = value => value ? new Intl.DateTimeFormat('en-GH', { weekday:'short', day:'numeric', month:'short', year:'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Not selected';
const formatLongDate = value => value ? new Intl.DateTimeFormat('en-GH', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date(`${value}T12:00:00`)) : '';
const formatTime = value => value ? new Intl.DateTimeFormat('en-GH', { hour:'numeric', minute:'2-digit' }).format(new Date(`2026-01-01T${value}:00`)) : 'Not selected';
const ymd = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const monthKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
const selectedService = () => serviceById(selectedServiceId);
const total = () => Number(selectedService()?.price || 0);
const deposit = () => Math.round(total() * 50) / 100;

function durationMinutes(service) {
  const text = String(service?.duration || '90 min').toLowerCase();
  const h = Number(text.match(/(\d+(?:\.\d+)?)\s*hr/)?.[1] || 0);
  const m = Number(text.match(/(\d+)\s*min/)?.[1] || 0);
  return Math.max(30, Math.round(h * 60 + m) || 90);
}

function minutesOf(time) {
  const [h,m] = String(time || '').split(':').map(Number);
  return h * 60 + m;
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

function serviceImage(service) {
  if (!service) return 'images/look-06.webp';
  return service.image || serviceImages[service.id] || ({ Makeup:'images/look-06.webp', Lashes:'images/lashes.webp', Brows:'images/brows.webp', Hair:'images/hair.webp', Nails:'images/nails.webp' }[service.category] || 'images/look-06.webp');
}

function setHelpLinks() {
  const href = `https://wa.me/${CISCA_CONFIG.whatsapp}?text=${encodeURIComponent('Hi Cisca, I need some help with booking an appointment.')}`;
  document.querySelectorAll('[data-booking-help],[data-summary-help]').forEach(a => a.href = href);
}

function renderOccasions() {
  occasionGrid.querySelectorAll('[data-occasion]').forEach(btn => btn.classList.toggle('selected', btn.dataset.occasion === selectedOccasion));
  form.occasion.value = selectedOccasion;
}

function categoryList() {
  return ['All', ...new Set(activeServices.map(s => s.category))];
}

function recommendedIds() {
  return occasionRecommendations[selectedOccasion] || [];
}

function renderServices() {
  const cats = categoryList();
  if (!cats.includes(serviceFilter)) serviceFilter = 'All';
  tabs.innerHTML = cats.map(cat => `<button type="button" class="${cat===serviceFilter?'active':''}" data-service-filter="${cat}">${cat}</button>`).join('');

  const recommended = recommendedIds();
  const filtered = activeServices
    .filter(s => serviceFilter === 'All' || s.category === serviceFilter)
    .sort((a,b) => {
      const ai = recommended.indexOf(a.id), bi = recommended.indexOf(b.id);
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
    heading.textContent = 'We think you’ll love these.';
    copy.textContent = 'Choose one, or browse every Cisca service below.';
  } else {
    kicker.textContent = 'Choose your service';
    heading.textContent = 'What are we doing today?';
    copy.textContent = 'Choose the service that feels right for you.';
  }

  picker.innerHTML = filtered.map(service => {
    const selected = service.id === selectedServiceId;
    const rec = recommended.includes(service.id);
    return `<article class="service-option ${selected?'selected':''} ${rec?'recommended':''}" data-service-id="${service.id}">
      <div class="service-option-image">
        <img src="${serviceImage(service)}" alt="${service.name}" loading="lazy">
        <button type="button" class="view-look" data-view-look="${service.id}">View look</button>
      </div>
      <button type="button" class="service-option-copy" data-select-service="${service.id}">
        <span>${service.category}</span>
        <h4>${service.name}</h4>
        <p>${service.description || 'A Cisca Makeovers beauty service.'}</p>
        <div class="service-meta"><b>${service.duration || 'Timing confirmed'}</b><b>${service.price != null ? money(service.price) : 'Price on request'}</b></div>
        <span class="service-select-text">${selected ? 'Selected' : 'Select service'}</span>
      </button>
    </article>`;
  }).join('');

  tabs.querySelectorAll('[data-service-filter]').forEach(btn => btn.addEventListener('click', () => {
    serviceFilter = btn.dataset.serviceFilter;
    renderServices();
  }));
  picker.querySelectorAll('[data-select-service]').forEach(btn => btn.addEventListener('click', () => selectService(btn.dataset.selectService)));
  picker.querySelectorAll('[data-view-look]').forEach(btn => btn.addEventListener('click', event => {
    event.stopPropagation();
    openLook(serviceById(btn.dataset.viewLook));
  }));
}

function selectService(id) {
  selectedServiceId = id;
  selectedTime = '';
  form.time.value = '';
  renderServices();
  updateSummary();
  if (selectedDate) renderTimes();
}

function openLook(service) {
  if (!service) return;
  const modal = document.createElement('div');
  modal.className = 'look-modal';
  modal.innerHTML = `<button class="look-modal-backdrop" type="button" aria-label="Close preview"></button><div class="look-modal-card"><img src="${serviceImage(service)}" alt="${service.name}"><button class="look-modal-close" type="button" aria-label="Close">×</button><div class="look-modal-copy"><span class="booking-kicker">Example look</span><h3>${service.name}</h3><p>${service.description || ''}</p><button class="booking-primary" type="button" data-pick-preview>Choose this service</button></div></div>`;
  document.body.append(modal);
  document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('.look-modal-backdrop').onclick = close;
  modal.querySelector('.look-modal-close').onclick = close;
  modal.querySelector('[data-pick-preview]').onclick = () => { selectService(service.id); close(); };
}

async function loadMonth(date) {
  const key = monthKey(date);
  if (monthCache.has(key)) {
    availability = monthCache.get(key);
    return;
  }
  calendarNote.textContent = 'Checking Cisca’s calendar...';
  try {
    const data = await api(`/availability?month=${encodeURIComponent(key)}`);
    availability = { closedDates: data.closedDates || [], busy: data.busy || {} };
    monthCache.set(key, availability);
  } catch {
    availability = { closedDates: [], busy: {} };
  }
  calendarNote.textContent = 'Closed dates are muted. Select an available day to continue.';
}

async function renderCalendar() {
  await loadMonth(currentMonth);
  const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
  calendarLabel.textContent = new Intl.DateTimeFormat('en-GH', { month:'long', year:'numeric' }).format(currentMonth);
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  const today = new Date(); today.setHours(0,0,0,0);
  const max = new Date(); max.setMonth(max.getMonth()+6); max.setHours(23,59,59,999);
  const cells = [];
  for (let i=0;i<42;i++) {
    const d = new Date(gridStart); d.setDate(gridStart.getDate()+i);
    const value = ymd(d);
    const outside = d.getMonth() !== month;
    const past = d < today;
    const tooFar = d > max;
    const closed = availability.closedDates.includes(value);
    const disabled = outside || past || tooFar || closed;
    cells.push(`<button type="button" class="calendar-day ${outside?'outside':''} ${closed?'closed':''} ${value===selectedDate?'selected':''} ${ymd(today)===value?'today':''}" data-date="${value}" ${disabled?'disabled':''} aria-label="${formatLongDate(value)}">${d.getDate()}</button>`);
  }
  calendarEl.innerHTML = cells.join('');
  calendarEl.querySelectorAll('[data-date]:not(:disabled)').forEach(btn => btn.addEventListener('click', () => {
    selectedDate = btn.dataset.date;
    selectedTime = '';
    form.date.value = selectedDate;
    form.time.value = '';
    renderCalendar();
    renderTimes();
    updateSummary();
  }));
}

function renderTimes() {
  if (!selectedDate) {
    timesHeading.textContent = 'Choose a date first';
    timeSlotsEl.innerHTML = '<p class="time-empty">Available times will appear here.</p>';
    return;
  }
  timesHeading.textContent = formatLongDate(selectedDate);
  const service = selectedService();
  if (!service) {
    timeSlotsEl.innerHTML = '<p class="time-empty">Choose your service first so we can show the right availability.</p>';
    return;
  }
  const slots = TIME_SLOTS.map(time => ({ time, busy: overlapsBusy(selectedDate,time) }));
  const open = slots.filter(s => !s.busy);
  if (!open.length) {
    timeSlotsEl.innerHTML = '<p class="time-empty">Cisca is fully booked for this date. Try another day.</p>';
    return;
  }
  timeSlotsEl.innerHTML = slots.map(slot => `<button type="button" class="time-slot ${slot.time===selectedTime?'selected':''}" data-time="${slot.time}" ${slot.busy?'disabled':''}>${formatTime(slot.time)}</button>`).join('');
  timeSlotsEl.querySelectorAll('[data-time]:not(:disabled)').forEach(btn => btn.addEventListener('click', () => {
    selectedTime = btn.dataset.time;
    form.time.value = selectedTime;
    renderTimes();
    updateSummary();
  }));
}

function updateLocationState() {
  const value = new FormData(form).get('locationType') || 'Studio appointment';
  document.querySelectorAll('.location-option').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  const home = value === 'Home appointment';
  const box = document.querySelector('[data-home-address]');
  box.hidden = !home;
  document.querySelector('#booking-address').required = home;
  updateSummary();
}

function addNote(text, button) {
  const area = form.notes;
  const exists = area.value.split('\n').map(x=>x.trim()).includes(text);
  if (exists) {
    area.value = area.value.split('\n').filter(x => x.trim() !== text).join('\n').trim();
    button.classList.remove('active');
  } else {
    area.value = [area.value.trim(), text].filter(Boolean).join('\n');
    button.classList.add('active');
  }
}

function updateSummary() {
  const service = selectedService();
  const locationType = new FormData(form).get('locationType') || 'Studio appointment';
  document.querySelector('[data-sum-services]').textContent = service?.name || 'No service selected';
  document.querySelector('[data-sum-date]').textContent = selectedDate ? formatDate(selectedDate) : 'Not selected';
  document.querySelector('[data-sum-time]').textContent = selectedTime ? formatTime(selectedTime) : 'Not selected';
  document.querySelector('[data-sum-location]').textContent = locationType === 'Home appointment' ? 'Home service' : 'Cisca Studio';
  document.querySelector('[data-sum-total]').textContent = service?.price != null ? money(total()) : 'Price on request';
  document.querySelector('[data-progress-service]').textContent = service?.name || 'Choose your look';
  document.querySelector('[data-progress-date]').textContent = selectedDate ? `${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-GH',{day:'numeric',month:'short'})}${selectedTime?` · ${formatTime(selectedTime)}`:''}` : 'Pick a slot';
  const image = document.querySelector('[data-summary-image] img');
  image.src = serviceImage(service);
  image.alt = service?.name || 'Cisca beauty look';
  document.querySelector('[data-change-service]').hidden = !service;
  document.querySelector('[data-full-price]').textContent = money(total());
  document.querySelector('[data-deposit-price]').textContent = money(deposit());
  const payOption = new FormData(form).get('paymentOption') || 'deposit';
  const due = payOption === 'deposit' ? deposit() : total();
  document.querySelector('[data-due-now]').textContent = service?.price != null ? money(due) : '';
  document.querySelector('[data-mobile-service]').textContent = service?.name || 'Your appointment';
  document.querySelector('[data-mobile-total]').textContent = service?.price != null ? money(total()) : 'Choose service';
  mobileBar.hidden = !service;
  document.querySelectorAll('.payment-option').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  renderMobileSummary();
}

function renderMobileSummary() {
  const service = selectedService();
  const locationType = new FormData(form).get('locationType') || 'Studio appointment';
  document.querySelector('[data-mobile-summary-content]').innerHTML = `<h3>${service?.name || 'No service selected'}</h3>
    <div class="sheet-line"><span>Date</span><strong>${selectedDate ? formatDate(selectedDate) : 'Not selected'}</strong></div>
    <div class="sheet-line"><span>Time</span><strong>${selectedTime ? formatTime(selectedTime) : 'Not selected'}</strong></div>
    <div class="sheet-line"><span>Location</span><strong>${locationType === 'Home appointment' ? 'Home service' : 'Cisca Studio'}</strong></div>
    <div class="sheet-total"><span>Estimated total</span><strong>${service?.price != null ? money(total()) : 'Price on request'}</strong></div>`;
}

function renderReview() {
  const service = selectedService();
  if (!service) return;
  const fd = Object.fromEntries(new FormData(form));
  const location = fd.locationType === 'Home appointment' ? `Home service${fd.address ? `, ${fd.address}` : ''}` : 'Cisca Studio';
  document.querySelector('[data-review]').innerHTML = `<div class="review-service">
      <img src="${serviceImage(service)}" alt="${service.name}">
      <div><span class="booking-kicker">${service.category}</span><h3>${service.name}</h3><p>${service.duration || 'Timing confirmed'}</p></div>
      <strong>${service.price != null ? money(service.price) : 'Price on request'}</strong>
    </div>
    <div class="review-info">
      <div><span>Date</span><strong>${formatLongDate(selectedDate)}</strong></div>
      <div><span>Time</span><strong>${formatTime(selectedTime)}</strong></div>
      <div><span>Location</span><strong>${location}</strong></div>
      <div><span>Client</span><strong>${fd.firstName || ''} ${fd.lastName || ''}</strong></div>
      <div><span>Email</span><strong>${fd.email || ''}</strong></div>
      <div><span>Phone</span><strong>${fd.phone || ''}</strong></div>
    </div>
    <div class="review-total"><span>Service total</span><strong>${money(total())}</strong></div>`;
  updateSummary();
}

function validateStage() {
  if (stage === 1 && !selectedServiceId) {
    toast('Choose a service to continue.');
    serviceSection.scrollIntoView({ behavior:'smooth', block:'start' });
    return false;
  }
  if (stage === 2) {
    if (!selectedDate) { toast('Choose an available date.'); return false; }
    if (!selectedTime) { toast('Choose an available time.'); return false; }
    const home = new FormData(form).get('locationType') === 'Home appointment';
    if (home && !form.address.value.trim()) { form.address.reportValidity(); return false; }
  }
  if (stage === 3) {
    for (const field of form.querySelectorAll('[data-stage="3"] [required]')) {
      if (!field.reportValidity()) return false;
    }
  }
  return true;
}

function showStage(next) {
  stage = Math.max(1, Math.min(4, next));
  document.querySelectorAll('[data-stage]').forEach(section => section.classList.toggle('active', Number(section.dataset.stage) === stage));
  document.querySelectorAll('[data-step-nav]').forEach(button => {
    const n = Number(button.dataset.stepNav);
    button.classList.toggle('active', n === stage);
    button.classList.toggle('done', n < stage);
  });
  if (stage === 4) renderReview();
  const progress = document.querySelector('.booking-progress');
  window.scrollTo({ top: progress.offsetTop - 86, behavior:'smooth' });
}

occasionGrid.addEventListener('click', event => {
  const btn = event.target.closest('[data-occasion]');
  if (!btn) return;
  selectedOccasion = btn.dataset.occasion;
  renderOccasions();
  renderServices();
  setTimeout(() => serviceSection.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
});

document.querySelector('[data-skip-occasion]').addEventListener('click', () => serviceSection.scrollIntoView({ behavior:'smooth', block:'start' }));
document.querySelector('[data-change-service]').addEventListener('click', () => { showStage(1); setTimeout(() => serviceSection.scrollIntoView({behavior:'smooth',block:'start'}),250); });

document.querySelector('[data-calendar-prev]').addEventListener('click', async () => {
  const now = new Date();
  const previous = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1);
  if (previous < new Date(now.getFullYear(), now.getMonth(), 1)) return;
  currentMonth = previous;
  await renderCalendar();
});
document.querySelector('[data-calendar-next]').addEventListener('click', async () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1);
  await renderCalendar();
});

form.querySelectorAll('input[name="locationType"]').forEach(input => input.addEventListener('change', updateLocationState));
form.querySelectorAll('input[name="paymentOption"]').forEach(input => input.addEventListener('change', updateSummary));
document.querySelectorAll('[data-note]').forEach(button => button.addEventListener('click', () => addNote(button.dataset.note, button)));
form.addEventListener('input', updateSummary);

form.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
  if (validateStage()) showStage(stage + 1);
}));
form.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showStage(stage - 1)));
document.querySelectorAll('[data-step-nav]').forEach(button => button.addEventListener('click', () => {
  const target = Number(button.dataset.stepNav);
  if (target < stage) return showStage(target);
  if (target === stage + 1 && validateStage()) showStage(target);
}));

mobileBar.querySelector('[data-mobile-summary-open]').addEventListener('click', () => {
  mobileSheet.classList.add('open');
  mobileSheet.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
});
document.querySelectorAll('[data-mobile-summary-close]').forEach(btn => btn.addEventListener('click', () => {
  mobileSheet.classList.remove('open');
  mobileSheet.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}));

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateStage() || !selectedServiceId) return;
  const button = document.querySelector('[data-submit]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Preparing secure payment...';
  try {
    const fd = Object.fromEntries(new FormData(form));
    const result = await api('/booking/start', {
      method:'POST',
      body:JSON.stringify({ ...fd, serviceIds:[selectedServiceId] })
    });
    location.href = result.authorizationUrl;
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

setHelpLinks();
renderOccasions();
renderServices();
updateLocationState();
await renderCalendar();
renderTimes();
updateSummary();

if (selectedServiceId) {
  serviceFilter = serviceById(selectedServiceId)?.category || 'All';
  renderServices();
  updateSummary();
}
