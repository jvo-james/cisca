import { SERVICE_SEED } from './catalog.js';
import { api } from './shared.js';
import { money } from './config.js';
let services=SERVICE_SEED;
try{const r=await api('/services');if(r.services?.length)services=r.services}catch{}
const categories=['All',...new Set(services.map(s=>s.category))];const tabs=document.querySelector('[data-service-tabs]');const grid=document.querySelector('[data-service-grid]');
function render(cat='All'){tabs.innerHTML=categories.map(c=>`<button class="service-tab ${c===cat?'active':''}" data-cat="${c}">${c}</button>`).join('');const rows=services.filter(s=>s.active!==false&&(cat==='All'||s.category===cat));grid.innerHTML=rows.map(s=>`<article class="service-card"><div class="meta"><span>${s.category||'Beauty'}</span><span>${s.duration||'Timing confirmed after booking'}</span></div><h3>${s.name}</h3><p>${s.description||'A Cisca Makeovers studio service.'}</p><div class="meta"><span class="price">${s.price!=null?money(s.price):'Price on request'}</span><a class="text-link" href="booking.html?service=${encodeURIComponent(s.id)}">Choose</a></div></article>`).join('')||'<div class="empty-state">No services in this category yet.</div>';tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>render(b.dataset.cat))}render();
