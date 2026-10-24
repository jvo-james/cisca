import { IMAGES } from './images.js';import { SERVICE_SEED } from './catalog.js';
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
const draftKey='cisca_booking_draft_v2';let selectedServiceIds=new Set(params.get('service')&&serviceById(params.get('service'))?[params.get('service')]:[]);let selectedServiceId=[...selectedServiceIds][0]||'';
let selectedOccasion = params.get('occasion') || '';
let serviceFilter = params.get('category') || 'All';
let stage = 1;
let selectedDate = '';
let selectedTime = '';
let availability = { closedDates: [], fullDates: [], timesByDate: {}, busy: {} };
let currentMonth = new Date();
currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

const TIME_SLOTS = ['09:00','10:30','12:00','13:30','15:00','16:30'];
const monthCache = new Map();

const serviceImages = {
  'natural-glam': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85',
  'soft-glam': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85',
  'bold-glam': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85',
  'bridal-makeup': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
  'classic-lashes': 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1000&q=85',
  'hybrid-lashes': 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1000&q=85',
  'volume-lashes': 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=1000&q=85',
  'brow-shaping': 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1000&q=85',
  'brow-tint': 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1000&q=85',
  'microshading': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85',
  'closure-install': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85',
  'frontal-install': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85',
  'curling': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
  'gel-polish': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=85',
  'acrylic-short': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85',
  'acrylic-medium': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=85'
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
const selectedServices = () => [...selectedServiceIds].map(serviceById).filter(Boolean);
const selectedService = () => selectedServices()[0];
const total = () => selectedServices().reduce((sum,s)=>sum+Number(s.price||0),0);
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
  const picked = selectedServices();
  if (!picked.length) return false;
  const start = minutesOf(time);
  const end = start + picked.reduce((sum,s)=>sum+durationMinutes(s),0);
  return (availability.busy?.[date] || []).some(slot => {
    const busyStart = minutesOf(slot.time);
    const busyEnd = busyStart + Number(slot.duration || 90);
    return start < busyEnd && end > busyStart;
  });
}

function serviceImage(service) {
  if (!service) return IMAGES.beauty;
  return service.image || serviceImages[service.id] || ({ Makeup:IMAGES.beauty, Lashes:IMAGES.lashes, Brows:IMAGES.brows, Hair:IMAGES.hair, Nails:IMAGES.nails }[service.category] || IMAGES.beauty);
}

function saveDraft(){try{const values=Object.fromEntries(new FormData(form));delete values.inspoPhotos;sessionStorage.setItem(draftKey,JSON.stringify({stage,serviceIds:[...selectedServiceIds],selectedOccasion,serviceFilter,selectedDate,selectedTime,currentMonth:monthKey(currentMonth),values}));}catch{}}
function restoreDraft(){try{const d=JSON.parse(sessionStorage.getItem(draftKey)||'null');if(!d)return;const paramsService=params.get('service');if(!paramsService&&Array.isArray(d.serviceIds))selectedServiceIds=new Set(d.serviceIds.filter(id=>serviceById(id)));selectedServiceId=[...selectedServiceIds][0]||'';if(!params.get('occasion'))selectedOccasion=d.selectedOccasion||'';serviceFilter=d.serviceFilter||serviceFilter;selectedDate=d.selectedDate||'';selectedTime=d.selectedTime||'';if(d.currentMonth&&/^\d{4}-\d{2}$/.test(d.currentMonth)){const [y,m]=d.currentMonth.split('-').map(Number);currentMonth=new Date(y,m-1,1)}for(const [key,value] of Object.entries(d.values||{})){const field=form.elements.namedItem(key);if(field&&typeof value==='string'&&field.type!=='file'){if(field.length&&field[0]?.type==='radio'){[...field].forEach(x=>x.checked=x.value===value)}else if(field.type==='checkbox')field.checked=!!value;else field.value=value}}if(selectedDate)form.date.value=selectedDate;if(selectedTime)form.time.value=selectedTime;if(d.stage)stage=Math.max(1,Math.min(4,Number(d.stage)));}catch{}}
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
    copy.textContent = 'Choose one or browse every Cisca service below.';
  } else {
    kicker.textContent = 'Choose your service';
    heading.textContent = 'What are we doing today?';
    copy.textContent = 'Choose the service that feels right for you.';
  }

  picker.innerHTML = filtered.map(service => {
    const selected = selectedServiceIds.has(service.id);
    const rec = recommended.includes(service.id);
    return `<article class="service-option ${selected?'selected':''} ${rec?'recommended':''}" data-service-id="${service.id}">
      <button type="button" class="service-option-image" data-view-look="${service.id}" aria-label="View details for ${service.name}"><img src="${serviceImage(service)}" alt="${service.name}" loading="lazy"></button>
      <div class="service-option-copy"><button type="button" class="service-detail-trigger" data-view-look="${service.id}"><span>${service.category}</span><h4>${service.name}</h4></button><p>${service.description || 'A Cisca Makeovers beauty service.'}</p><div class="service-meta"><b>${service.duration || 'Timing confirmed'}</b><b>${service.price != null ? money(service.price) : 'Price on request'}</b></div><label class="service-check-label"><input type="checkbox" data-select-service="${service.id}" ${selected?'checked':''}><span class="fake-check"><i class="fa-solid fa-check" aria-hidden="true"></i></span><span>${selected?'Added to appointment':'Add this service'}</span></label></div>
    </article>`;
  }).join('');

  tabs.querySelectorAll('[data-service-filter]').forEach(btn => btn.addEventListener('click', () => {
    serviceFilter = btn.dataset.serviceFilter;
    renderServices();
  }));
  picker.querySelectorAll('[data-select-service]').forEach(input => input.addEventListener('change', () => selectService(input.dataset.selectService, input.checked)));
  picker.querySelectorAll('[data-view-look]').forEach(btn => btn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    openLook(serviceById(btn.dataset.viewLook));
  }));
}

function selectService(id, shouldSelect=true) {
  if (shouldSelect) selectedServiceIds.add(id); else selectedServiceIds.delete(id);
  selectedServiceId=[...selectedServiceIds][0]||'';
  selectedTime = ''; form.time.value = '';
  renderServices(); updateSummary(); if (selectedDate) renderTimes(); saveDraft();
}

function openLook(service) {
  if (!service) return;
  const modal = document.createElement('div');
  modal.className = 'look-modal service-detail-drawer';
  const isSelected=selectedServiceIds.has(service.id);
  modal.innerHTML = `<button class="look-modal-backdrop" type="button" aria-label="Close preview"></button><div class="look-modal-card"><div class="service-detail-image"><img src="${serviceImage(service)}" alt="${service.name}"></div><button class="look-modal-close" type="button" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><div class="look-modal-copy"><span class="booking-kicker">${service.category}</span><h3>${service.name}</h3><div class="detail-meta"><span><i class="fa-regular fa-clock"></i> ${service.duration||'Timing confirmed'}</span><strong>${service.price!=null?money(service.price):'Price on request'}</strong></div><p>${service.description || 'A thoughtful beauty service from Cisca Makeovers.'}</p><button class="booking-primary" type="button" data-pick-preview>${isSelected?'Remove from appointment':'Add this service'}</button><small class="drawer-note">You can choose more than one service. Your appointment total updates as you add or remove services.</small></div></div>`;
  document.body.append(modal);
  document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('.look-modal-backdrop').onclick = close;
  modal.querySelector('.look-modal-close').onclick = close;
  modal.querySelector('[data-pick-preview]').onclick = () => { selectService(service.id, !selectedServiceIds.has(service.id)); close(); };
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
    availability = { closedDates: data.closedDates || [], fullDates:data.fullDates||[], timesByDate:data.timesByDate||{}, busy: data.busy || {} };
    monthCache.set(key, availability);
  } catch {
    availability = { closedDates: [], fullDates: [], timesByDate:{}, busy: {} };
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
    const closed = availability.closedDates.includes(value);const full= (availability.fullDates||[]).includes(value);
    const disabled = outside || past || tooFar || closed || full;
    cells.push(`<button type="button" class="calendar-day ${outside?'outside':''} ${closed||full?'closed':''} ${value===selectedDate?'selected':''} ${ymd(today)===value?'today':''}" data-date="${value}" ${disabled?'disabled':''} aria-label="${formatLongDate(value)}">${d.getDate()}</button>`);
  }
  calendarEl.innerHTML = cells.join('');
  calendarEl.querySelectorAll('[data-date]:not(:disabled)').forEach(btn => btn.addEventListener('click', () => {
    selectedDate = btn.dataset.date;
    selectedTime = '';
    form.date.value = selectedDate;
    form.time.value = '';
    calendarEl.querySelectorAll('[data-date]').forEach(day=>{day.classList.toggle('selected',day.dataset.date===selectedDate);day.classList.toggle('today',day.dataset.date===ymd(new Date()))});
    renderTimes();
    updateSummary();saveDraft();
    setTimeout(()=>document.querySelector('.times-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
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
  const daySlots=availability.timesByDate?.[selectedDate]?.length?availability.timesByDate[selectedDate]:TIME_SLOTS;
  const slots = daySlots.map(time => ({ time, busy: overlapsBusy(selectedDate,time) }));
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
    updateSummary();saveDraft();
    setTimeout(()=>document.querySelector('.location-section')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
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
  document.querySelector('[data-sum-services]').textContent = selectedServices().map(s=>s.name).join(', ') || 'No service selected';
  document.querySelector('[data-sum-date]').textContent = selectedDate ? formatDate(selectedDate) : 'Not selected';
  document.querySelector('[data-sum-time]').textContent = selectedTime ? formatTime(selectedTime) : 'Not selected';
  document.querySelector('[data-sum-location]').textContent = locationType === 'Home appointment' ? 'Home service' : 'Cisca Studio';
  document.querySelector('[data-sum-total]').textContent = service?.price != null ? money(total()) : 'Price on request';
  document.querySelector('[data-progress-service]').textContent = selectedServices().length ? `${selectedServices().length} service${selectedServices().length===1?'':'s'} selected` : 'Choose your look';
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
  document.querySelector('[data-mobile-service]').textContent = selectedServices().map(s=>s.name).join(', ') || 'Your appointment';
  document.querySelector('[data-mobile-total]').textContent = service?.price != null ? money(total()) : 'Choose service';
  mobileBar.hidden = !service;
  document.querySelectorAll('.payment-option').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  renderMobileSummary();
}

function renderMobileSummary() {
  const service = selectedService();
  const locationType = new FormData(form).get('locationType') || 'Studio appointment';
  document.querySelector('[data-mobile-summary-content]').innerHTML = `<h3>${selectedServices().map(s=>s.name).join(', ') || 'No service selected'}</h3>
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
  document.querySelector('[data-review]').innerHTML = selectedServices().map(s=>`<div class="review-service"><img src="${serviceImage(s)}" alt="${s.name}"><div><span class="booking-kicker">${s.category}</span><h3>${s.name}</h3><p>${s.duration || 'Timing confirmed'}</p></div><strong>${s.price != null ? money(s.price) : 'Price on request'}</strong></div>`).join('') + `<div class="review-info">
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
  if (stage === 1 && !selectedServiceIds.size) {
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
  setTimeout(()=>{ const target=document.querySelector(`[data-stage="${stage}"]`); target?.scrollIntoView({behavior:'smooth',block:'start'}); }, 60);
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

let inspoFiles=[];
const inspoInput=document.querySelector('#inspo-photos');
const inspoPreview=document.querySelector('[data-inspo-preview]');
const inspoLimit=document.querySelector('[data-inspo-limit]');
function sameFile(a,b){return a.name===b.name&&a.size===b.size&&a.lastModified===b.lastModified}
function syncInspoInput(){
  if(!inspoInput)return;
  const dt=new DataTransfer();
  inspoFiles.forEach(file=>dt.items.add(file));
  inspoInput.files=dt.files;
  inspoInput.disabled=inspoFiles.length>=4;
  if(inspoLimit)inspoLimit.textContent=`${inspoFiles.length} of 4 photos added`;
}
function renderInspoPreview(){
  if(!inspoPreview)return;
  inspoPreview.innerHTML='';
  inspoFiles.forEach((file,index)=>{
    const tile=document.createElement('div');tile.className='inspo-tile';
    const img=document.createElement('img');img.alt=`Inspiration photo ${index+1}`;img.src=URL.createObjectURL(file);
    const remove=document.createElement('button');remove.type='button';remove.className='inspo-remove';remove.setAttribute('aria-label',`Remove inspiration photo ${index+1}`);remove.innerHTML='<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    remove.addEventListener('click',()=>{inspoFiles.splice(index,1);syncInspoInput();renderInspoPreview();});
    tile.append(img,remove);inspoPreview.append(tile);
  });
}

async function uploadInspoPhotos(files){
  const chosen=[...files].slice(0,4);
  if(files.length>4) throw new Error('You can add a maximum of 4 inspiration photos.');
  if(!chosen.length) return [];
  const urls=[];
  for(const file of chosen){
    if(file.size>8*1024*1024) throw new Error('Each inspiration photo must be under 8 MB.');
    const sign=await api('/booking/inspo-sign',{method:'POST',body:'{}'});
    const fd=new FormData();
    fd.append('file',file); fd.append('api_key',sign.apiKey); fd.append('timestamp',sign.timestamp); fd.append('folder',sign.folder); fd.append('signature',sign.signature);
    const r=await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,{method:'POST',body:fd});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error?.message||'Could not upload an inspiration photo.');
    urls.push(d.secure_url);
  }
  return urls;
}
inspoInput?.addEventListener('change',()=>{
  const picked=[...(inspoInput.files||[])];
  const slots=4-inspoFiles.length;
  const additions=picked.filter(file=>!inspoFiles.some(existing=>sameFile(existing,file))).slice(0,Math.max(0,slots));
  if(picked.length>slots) toast('You can add a maximum of 4 inspiration photos.');
  inspoFiles.push(...additions);
  syncInspoInput();
  renderInspoPreview();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateStage() || !selectedServiceIds.size) return;
  const button = document.querySelector('[data-submit]');
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Preparing secure payment...';
  try {
    const fd = Object.fromEntries(new FormData(form));
    delete fd.inspoPhotos;
    const inspoUrls = await uploadInspoPhotos(inspoFiles);
    const result = await api('/booking/start', {
      method:'POST',
      body:JSON.stringify({ ...fd, inspoUrls, serviceIds:[...selectedServiceIds] })
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

restoreDraft();
setHelpLinks();
renderOccasions();
renderServices();
updateLocationState();
await renderCalendar();
renderTimes();
updateSummary();
showStage(stage);
form.addEventListener('input',saveDraft);form.addEventListener('change',saveDraft);document.querySelectorAll('[data-step-nav],[data-next],[data-back]').forEach(b=>b.addEventListener('click',()=>setTimeout(saveDraft,0)));

if (selectedServiceId) {
  serviceFilter = serviceById(selectedServiceId)?.category || 'All';
  renderServices();
  updateSummary();
}
