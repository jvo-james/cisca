import { api, saveCart } from './shared.js';
import { money } from './config.js';

const params = new URLSearchParams(location.search);
const reference = params.get('reference') || params.get('trxref');
const element = document.querySelector('[data-success]');
const escape = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function receiptRows(record, ref){
  const rows = [
    ['Payment reference', record.reference || ref],
    ['Total paid', money(record.amountPaid || record.total || record.amountDue || 0)]
  ];
  if (record.orderNumber) rows.push(['Order number',record.orderNumber]);
  if (record.bookingNumber) rows.push(['Booking number',record.bookingNumber]);
  if (record.registrationNumber) rows.push(['Registration',record.registrationNumber]);
  if (record.date) rows.push(['Date',record.date]);
  if (record.time) rows.push(['Time',record.time]);
  if (record.classTitle) rows.push(['Class',record.classTitle]);
  if (record.items?.length) rows.push(['Items',record.items.map(item=>`${item.name} × ${item.qty}`).join(' | ')]);
  if (record.services?.length) rows.push(['Services',record.services.map(item=>item.name).join(' | ')]);
  return rows.map(([label,value])=>`<div class="receipt-row"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('');
}

try {
  if (!reference) throw new Error('Payment reference is missing.');
  const response = await api(`/payment/verify?reference=${encodeURIComponent(reference)}`);
  const record = response.record || {};
  if (response.kind === 'order') saveCart([]);
  const message = response.kind === 'booking'
    ? {tag:'Appointment confirmed',title:'You are booked.',copy:'Your payment is confirmed and the appointment is recorded. A receipt has also been sent by email.'}
    : response.kind === 'class'
      ? {tag:'Registration confirmed',title:'Your place is saved.',copy:'Your payment is confirmed and the class registration is recorded. A receipt has also been sent by email.'}
      : {tag:'Order confirmed',title:'Your beauty order is in.',copy:'Your payment is confirmed and the order is recorded. A receipt has also been sent by email.'};
  element.innerHTML=`<div class="success-top"><div><span class="eyebrow pink">${message.tag}</span><h1>${message.title}</h1><p>${message.copy}</p></div><button class="icon-btn" type="button" data-print aria-label="Print receipt"><i class="fas fa-print" aria-hidden="true"></i></button></div><div class="receipt-card"><div class="receipt-brand">Cisca Makeovers <span>Payment receipt</span></div>${receiptRows(record,reference)}</div><div class="success-actions">${record.trackingToken?`<a class="btn btn-pink" href="track.html?token=${encodeURIComponent(record.trackingToken)}">Track order <i class="fas fa-arrow-right" aria-hidden="true"></i></a>`:''}<button class="btn btn-outline" type="button" data-print>Print or save receipt <i class="fas fa-print" aria-hidden="true"></i></button><a class="btn btn-outline" href="index.html">Back home <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>`;
  document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
} catch (error) {
  element.innerHTML=`<span class="eyebrow pink">Payment check</span><h1>We could not confirm it yet.</h1><p>${escape(error.message)}</p><p class="muted">If your account was charged, keep the payment reference and contact Cisca so the payment can be checked.</p><div class="success-actions"><a class="btn" href="contact.html">Contact Cisca <i class="fas fa-arrow-right" aria-hidden="true"></i></a><a class="btn btn-outline" href="index.html">Back home <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>`;
}
