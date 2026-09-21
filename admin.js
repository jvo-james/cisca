import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-client.js';
import { CISCA_CONFIG } from './config.js';
import { PRODUCT_SEED, SERVICE_SEED, CLASS_SEED } from './catalog.js';

const login = document.querySelector('[data-login]');
const app = document.querySelector('[data-app]');
const loginForm = document.querySelector('[data-login-form]');
let data = {};

async function token() {
  return auth.currentUser?.getIdToken();
}

async function api(path, options = {}) {
  const accessToken = await token();
  const response = await fetch(`${CISCA_CONFIG.apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));
const money = value => new Intl.NumberFormat('en-GH', {
  style:'currency', currency:'GHS', maximumFractionDigits:2
}).format(Number(value || 0));
const dateText = value => value
  ? new Date(value).toLocaleString('en-GH', { dateStyle:'medium', timeStyle:'short' })
  : '';
const table = (heads, rows) => `<div class="table-scroll"><table class="admin-table"><thead><tr>${heads.map(head => `<th>${head}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

function inputField(label, name, value, type = 'text', full = false) {
  const escaped = safe(value);
  const input = type === 'textarea'
    ? `<textarea name="${name}">${escaped}</textarea>`
    : `<input name="${name}" type="${type}" value="${escaped}">`;
  return `<div class="field ${full ? 'full' : ''}"><label>${label}</label>${input}</div>`;
}

function setSaveNote(message, isError = false) {
  const el = document.querySelector('[data-save-note]');
  el.textContent = message;
  el.style.color = isError ? '#9a3850' : '';
  clearTimeout(setSaveNote.timer);
  setSaveNote.timer = setTimeout(() => { el.textContent = ''; }, 3200);
}

function tableSafeId(value) {
  return CSS.escape(String(value ?? ''));
}

loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  const errorEl = document.querySelector('[data-login-error]');
  button.disabled = true;
  errorEl.textContent = '';
  try {
    const values = new FormData(loginForm);
    await signInWithEmailAndPassword(auth, values.get('email'), values.get('password'));
  } catch (error) {
    errorEl.textContent = error.message || 'Could not sign in.';
    button.disabled = false;
  }
});

document.querySelector('[data-logout]')?.addEventListener('click', () => signOut(auth));
document.querySelector('[data-refresh]')?.addEventListener('click', load);

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-section]').forEach(section => section.classList.toggle('active', section.dataset.section === button.dataset.view));
    document.querySelector('[data-view-title]').textContent = button.querySelector('i') ? button.textContent.replace(button.querySelector('i').textContent, '').trim() : button.textContent.trim();
    window.scrollTo({ top:0, behavior:'smooth' });
  });
});

async function load() {
  try {
    data = await api('/admin/dashboard');
    render();
    setSaveNote('Updated');
  } catch (error) {
    setSaveNote(error.message, true);
  }
}

function render() {
  const {
    orders = [], bookings = [], registrations = [], products = [], classes = [], services = [],
    messages = [], subscribers = [], availability = [], settings = {}
  } = data;

  document.querySelector('[data-stats]').innerHTML = [
    ['Paid orders', orders.filter(item => item.paymentStatus === 'paid').length],
    ['Appointments', bookings.length],
    ['Students', registrations.length],
    ['Products live', products.filter(item => item.available && item.price != null).length]
  ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');

  const activity = [
    ...orders.slice(0, 3).map(item => `<p><strong>${safe(item.orderNumber)}</strong> · ${safe(item.customer?.firstName)} · ${money(item.total)}</p>`),
    ...bookings.slice(0, 3).map(item => `<p><strong>${safe(item.bookingNumber)}</strong> · ${safe(item.date)} · ${safe(item.time)}</p>`)
  ];
  document.querySelector('[data-recent]').innerHTML = activity.join('') || '<p class="muted">No recent activity yet.</p>';

  renderSettings(settings);
  renderOrders(orders);
  renderBookings(bookings);
  renderStudents(registrations);
  renderProducts(products);
  renderClasses(classes);
  renderServices(services);
  renderAvailability(availability);
  renderInbox(messages, subscribers);
}

function renderSettings(settings) {
  const s = { ...settings };
  document.querySelector('[data-settings-form]').innerHTML = `
    <p class="settings-help">Leave the location field blank when the location is not fixed. The public site will not show a city name by default.</p>
    ${inputField('Brand name','brand',s.brand || 'Cisca Makeovers')}
    ${inputField('Tagline','tagline',s.tagline || 'Beauty Studio · Academy · Shop')}
    ${inputField('Hero label','heroKicker',s.heroKicker || 'Cisca Beauty')}
    ${inputField('Phone display','phoneDisplay',s.phoneDisplay || '')}
    ${inputField('WhatsApp number','whatsapp',s.whatsapp || '')}
    ${inputField('Location label','locationLabel',s.locationLabel || '')}
    ${inputField('Instagram URL','instagram',s.instagram || '')}
    ${inputField('YouTube URL','youtube',s.youtube || '')}
    ${inputField('Pinterest URL','pinterest',s.pinterest || '')}
    ${inputField('Hero title','heroTitle',s.heroTitle || 'Your beauty.<br>Your moment.','textarea',true)}
    ${inputField('Hero text','heroText',s.heroText || '','textarea',true)}
    ${inputField('Footer text','footerText',s.footerText || '','textarea',true)}
  `;
}

function statusSelect(kind, id, status, options) {
  return `<select class="status-select" data-status-kind="${kind}" data-status-id="${safe(id)}">${options.map(option => `<option value="${safe(option)}" ${option === status ? 'selected' : ''}>${safe(option)}</option>`).join('')}</select>`;
}

function bindStatusButtons() {
  document.querySelectorAll('[data-status-save]').forEach(button => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const row = button.closest('tr');
        const select = row?.querySelector('[data-status-kind]');
        await api('/admin/status', {
          method:'POST',
          body:JSON.stringify({ kind:select?.dataset.statusKind, id:select?.dataset.statusId, status:select?.value })
        });
        setSaveNote('Status saved');
        await load();
      } catch (error) {
        setSaveNote(error.message, true);
        button.disabled = false;
      }
    });
  });
}

function renderOrders(rows) {
  document.querySelector('[data-orders]').innerHTML = table(
    ['Order','Customer','Total','Payment','Status','Date'],
    rows.map(order => `<tr>
      <td><strong>${safe(order.orderNumber)}</strong><br><small>${safe(order.reference)}</small></td>
      <td>${safe(order.customer?.firstName)} ${safe(order.customer?.lastName)}<br>${safe(order.customer?.email)}<br>${safe(order.customer?.phone)}</td>
      <td>${money(order.total)}</td>
      <td>${safe(order.paymentStatus)}</td>
      <td>${statusSelect('order',order.id,order.status,['pending','confirmed','processing','ready','completed','cancelled'])} <button class="status-save" type="button" data-status-save>Save</button></td>
      <td>${dateText(order.createdAt)}</td>
    </tr>`)
  );
  bindStatusButtons();
}

function renderBookings(rows) {
  document.querySelector('[data-bookings]').innerHTML = table(
    ['Booking','Client','Appointment','Amount','Payment','Status'],
    rows.map(item => `<tr>
      <td><strong>${safe(item.bookingNumber)}</strong><br>${safe(item.occasion)}</td>
      <td>${safe(item.client?.firstName)} ${safe(item.client?.lastName)}<br>${safe(item.client?.email)}<br>${safe(item.client?.phone)}${item.inspoImages?.length ? `<br><small>${item.inspoImages.length} inspiration photo${item.inspoImages.length > 1 ? 's' : ''}</small>` : ''}</td>
      <td>${safe(item.date)}<br>${safe(item.time)}<br>${safe(item.locationType)}${item.address ? `<br>${safe(item.address)}` : ''}</td>
      <td>${money(item.amountPaid || item.amountDue || item.total)}</td>
      <td>${safe(item.paymentStatus)}</td>
      <td>${statusSelect('booking',item.id,item.status,['pending','confirmed','completed','cancelled','rescheduled'])} <button class="status-save" type="button" data-status-save>Save</button></td>
    </tr>`)
  );
  bindStatusButtons();
}

function renderStudents(rows) {
  document.querySelector('[data-students]').innerHTML = table(
    ['Registration','Student','Class','Fee','Payment','Status'],
    rows.map(item => `<tr>
      <td><strong>${safe(item.registrationNumber)}</strong></td>
      <td>${safe(item.student?.firstName)} ${safe(item.student?.lastName)}<br>${safe(item.student?.email)}<br>${safe(item.student?.phone)}</td>
      <td>${safe(item.classTitle)}<br>${safe(item.experience)}</td>
      <td>${money(item.amountPaid || item.amountDue)}</td>
      <td>${safe(item.paymentStatus)}</td>
      <td>${safe(item.status)}</td>
    </tr>`)
  );
}

function renderProducts(rows) {
  document.querySelector('[data-products]').innerHTML = table(
    ['Product','Category','Subcategory','Price','Live','Featured','Description','Image','Save'],
    rows.map(product => `<tr>
      <td><input data-product-field="name" data-id="${safe(product.id)}" value="${safe(product.name)}"></td>
      <td><input data-product-field="category" data-id="${safe(product.id)}" value="${safe(product.category)}"></td>
      <td><input data-product-field="subcategory" data-id="${safe(product.id)}" value="${safe(product.subcategory)}"></td>
      <td><input type="number" min="0" step="0.01" data-product-field="price" data-id="${safe(product.id)}" value="${product.price ?? ''}"></td>
      <td><input type="checkbox" data-product-field="available" data-id="${safe(product.id)}" ${product.available ? 'checked' : ''}></td>
      <td><input type="checkbox" data-product-field="featured" data-id="${safe(product.id)}" ${product.featured ? 'checked' : ''}></td>
      <td><textarea data-product-description data-id="${safe(product.id)}" rows="3">${safe(product.description)}</textarea></td>
      <td><div class="image-upload">${product.image ? `<img class="image-preview" src="${safe(product.image)}" alt="">` : ''}<input type="file" accept="image/*" data-product-image="${safe(product.id)}"></div></td>
      <td><button class="status-save" type="button" data-product-save="${safe(product.id)}">Save</button></td>
    </tr>`)
  );
  document.querySelectorAll('[data-product-save]').forEach(button => button.addEventListener('click', saveProduct));
  document.querySelectorAll('[data-product-image]').forEach(input => input.addEventListener('change', uploadRecordImage));
}

async function saveProduct(event) {
  const button = event.currentTarget;
  const id = button.dataset.productSave;
  const fields = [...document.querySelectorAll(`[data-product-field][data-id="${tableSafeId(id)}"]`)];
  const payload = { id };
  fields.forEach(field => {
    let value = field.type === 'checkbox' ? field.checked : field.value;
    if (field.dataset.productField === 'price') value = value === '' ? null : Number(value);
    payload[field.dataset.productField] = value;
  });
  const description = document.querySelector(`[data-product-description][data-id="${tableSafeId(id)}"]`);
  if (description) payload.description = description.value;
  button.disabled = true;
  try {
    await api('/admin/product',{method:'POST',body:JSON.stringify(payload)});
    setSaveNote('Product saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
    button.disabled = false;
  }
}

async function uploadRecordImage(event) {
  const input = event.currentTarget;
  const type = input.dataset.productImage ? 'product' : input.dataset.classImage ? 'class' : 'service';
  const id = input.dataset.productImage || input.dataset.classImage || input.dataset.serviceImage;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { setSaveNote('Choose an image file.', true); return; }
  if (file.size > 8 * 1024 * 1024) { setSaveNote('Keep images under 8MB.', true); return; }
  input.disabled = true;
  try {
    const sign = await api('/admin/cloudinary-sign',{method:'POST',body:'{}'});
    const body = new FormData();
    body.append('file',file);
    body.append('api_key',sign.apiKey);
    body.append('timestamp',sign.timestamp);
    body.append('folder',sign.folder);
    body.append('signature',sign.signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,{method:'POST',body});
    const uploaded = await response.json().catch(() => ({}));
    if (!response.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message || 'Image upload failed.');
    const path = type === 'product' ? '/admin/product' : type === 'class' ? '/admin/class' : '/admin/service';
    await api(path,{method:'POST',body:JSON.stringify({id,image:uploaded.secure_url})});
    setSaveNote('Image saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
  } finally {
    input.disabled = false;
  }
}

function renderClasses(rows) {
  document.querySelector('[data-classes]').innerHTML = table(
    ['Class','Track','Level','Fee','Open','Duration','Summary','Image','Save'],
    rows.map(item => `<tr>
      <td><input data-class-field="title" data-id="${safe(item.id)}" value="${safe(item.title)}"></td>
      <td><input data-class-field="track" data-id="${safe(item.id)}" value="${safe(item.track)}"></td>
      <td><input data-class-field="level" data-id="${safe(item.id)}" value="${safe(item.level)}"></td>
      <td><input type="number" min="0" step="0.01" data-class-field="price" data-id="${safe(item.id)}" value="${item.price ?? ''}"></td>
      <td><input type="checkbox" data-class-field="available" data-id="${safe(item.id)}" ${item.available ? 'checked' : ''}></td>
      <td><input data-class-field="duration" data-id="${safe(item.id)}" value="${safe(item.duration || '')}"></td>
      <td><textarea data-class-field="summary" data-id="${safe(item.id)}" rows="3">${safe(item.summary)}</textarea></td>
      <td><div class="image-upload">${item.image ? `<img class="image-preview" src="${safe(item.image)}" alt="">` : ''}<input type="file" accept="image/*" data-class-image="${safe(item.id)}"></div></td>
      <td><button class="status-save" type="button" data-class-save="${safe(item.id)}">Save</button></td>
    </tr>`)
  );
  document.querySelectorAll('[data-class-save]').forEach(button => button.addEventListener('click', saveClass));
  document.querySelectorAll('[data-class-image]').forEach(input => input.addEventListener('change', uploadRecordImage));
}

async function saveClass(event) {
  const button = event.currentTarget;
  const id = button.dataset.classSave;
  const fields = [...document.querySelectorAll(`[data-class-field][data-id="${tableSafeId(id)}"]`)];
  const payload = { id };
  fields.forEach(field => {
    let value = field.type === 'checkbox' ? field.checked : field.value;
    if (field.dataset.classField === 'price') value = value === '' ? null : Number(value);
    payload[field.dataset.classField] = value;
  });
  button.disabled = true;
  try {
    await api('/admin/class',{method:'POST',body:JSON.stringify(payload)});
    setSaveNote('Class saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
    button.disabled = false;
  }
}

function renderServices(rows) {
  document.querySelector('[data-services]').innerHTML = table(
    ['Service','Category','Price','Duration','Live','Description','Image','Save'],
    rows.map(item => `<tr>
      <td><input data-service-field="name" data-id="${safe(item.id)}" value="${safe(item.name)}"></td>
      <td><input data-service-field="category" data-id="${safe(item.id)}" value="${safe(item.category)}"></td>
      <td><input type="number" min="0" step="0.01" data-service-field="price" data-id="${safe(item.id)}" value="${item.price ?? ''}"></td>
      <td><input data-service-field="duration" data-id="${safe(item.id)}" value="${safe(item.duration || '')}"></td>
      <td><input type="checkbox" data-service-field="active" data-id="${safe(item.id)}" ${item.active !== false ? 'checked' : ''}></td>
      <td><textarea data-service-field="description" data-id="${safe(item.id)}" rows="3">${safe(item.description)}</textarea></td>
      <td><div class="image-upload">${item.image ? `<img class="image-preview" src="${safe(item.image)}" alt="">` : ''}<input type="file" accept="image/*" data-service-image="${safe(item.id)}"></div></td>
      <td><button class="status-save" type="button" data-service-save="${safe(item.id)}">Save</button></td>
    </tr>`)
  );
  document.querySelectorAll('[data-service-save]').forEach(button => button.addEventListener('click', saveService));
  document.querySelectorAll('[data-service-image]').forEach(input => input.addEventListener('change', uploadRecordImage));
}

async function saveService(event) {
  const button = event.currentTarget;
  const id = button.dataset.serviceSave;
  const fields = [...document.querySelectorAll(`[data-service-field][data-id="${tableSafeId(id)}"]`)];
  const payload = { id };
  fields.forEach(field => {
    let value = field.type === 'checkbox' ? field.checked : field.value;
    if (field.dataset.serviceField === 'price') value = value === '' ? null : Number(value);
    payload[field.dataset.serviceField] = value;
  });
  button.disabled = true;
  try {
    await api('/admin/service',{method:'POST',body:JSON.stringify(payload)});
    setSaveNote('Service saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
    button.disabled = false;
  }
}

function renderAvailability(rows) {
  document.querySelector('[data-availability-list]').innerHTML = table(
    ['Date','Status','Note','Updated'],
    [...rows].sort((a,b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0,100).map(item => `<tr><td><strong>${safe(item.date || item.id)}</strong></td><td>${item.open === false ? 'Closed' : 'Open'}</td><td>${safe(item.note)}</td><td>${dateText(item.updatedAt)}</td></tr>`)
  );
}

function renderInbox(messages, subscribers) {
  document.querySelector('[data-inbox]').innerHTML = `
    <h3 style="margin:0 0 11px;font-size:1rem">Messages</h3>
    ${messages.slice(0,30).map(item => `<div class="admin-inbox-block"><small>${safe(item.subject || item.topic || 'General')} · ${dateText(item.createdAt)}</small><p><strong>${safe(item.name)}</strong> · ${safe(item.email)}${item.phone ? ` · ${safe(item.phone)}` : ''}</p><p>${safe(item.message)}</p></div>`).join('') || '<p class="muted">No messages yet.</p>'}
    <h3 style="margin:25px 0 11px;font-size:1rem">Subscribers</h3>
    ${subscribers.slice(0,50).map(item => `<div class="admin-inbox-block"><small>${dateText(item.createdAt)}</small><p>${safe(item.email)}</p></div>`).join('') || '<p class="muted">No subscribers yet.</p>'}
  `;
}

async function saveSettings() {
  const values = Object.fromEntries(new FormData(document.querySelector('[data-settings-form]')));
  try {
    await api('/admin/settings',{method:'POST',body:JSON.stringify(values)});
    setSaveNote('Settings saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
  }
}

document.querySelector('[data-save-settings]')?.addEventListener('click',saveSettings);

document.querySelectorAll('[data-seed]').forEach(button => {
  button.addEventListener('click',async () => {
    const type = button.dataset.seed;
    const payload = type === 'products' ? { products: PRODUCT_SEED } : type === 'classes' ? { classes: CLASS_SEED } : { services: SERVICE_SEED };
    button.disabled = true;
    try {
      await api('/admin/seed',{method:'POST',body:JSON.stringify(payload)});
      setSaveNote('Supplied list loaded');
      await load();
    } catch (error) {
      setSaveNote(error.message,true);
    } finally {
      button.disabled = false;
    }
  });
});

document.querySelector('[data-save-availability]')?.addEventListener('click',async () => {
  const date = document.querySelector('[data-avail-date]').value;
  const open = document.querySelector('[data-avail-open]').value === 'true';
  const note = document.querySelector('[data-avail-note]').value;
  try {
    await api('/admin/availability',{method:'POST',body:JSON.stringify({date,open,note})});
    setSaveNote('Availability saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
  }
});

async function createRecord(form, path, numberFields = []) {
  const button = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form));
  numberFields.forEach(name => { if (values[name] !== '') values[name] = Number(values[name]); else values[name] = null; });
  values.id = String(values.id || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
  if (!values.id) { setSaveNote('Add an ID first.',true); return; }
  ['available','featured','active'].forEach(name => { values[name] = form.querySelector(`[name="${name}"]`)?.checked ?? true; });
  button.disabled = true;
  try {
    await api(path,{method:'POST',body:JSON.stringify(values)});
    form.reset();
    if (form.querySelector('[name="available"]')) form.querySelector('[name="available"]').checked = true;
    if (form.querySelector('[name="active"]')) form.querySelector('[name="active"]').checked = true;
    setSaveNote('Saved');
    await load();
  } catch (error) {
    setSaveNote(error.message,true);
  } finally {
    button.disabled = false;
  }
}

document.querySelector('[data-new-product-form]')?.addEventListener('submit',event => { event.preventDefault(); createRecord(event.currentTarget,'/admin/product',['price']); });
document.querySelector('[data-new-class-form]')?.addEventListener('submit',event => { event.preventDefault(); createRecord(event.currentTarget,'/admin/class',['price']); });
document.querySelector('[data-new-service-form]')?.addEventListener('submit',event => { event.preventDefault(); createRecord(event.currentTarget,'/admin/service',['price']); });

onAuthStateChanged(auth, async user => {
  login.hidden = Boolean(user);
  app.hidden = !user;
  if (user) await load();
});
