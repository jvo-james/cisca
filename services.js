import { IMAGES } from './images.js';
import { SERVICE_SEED } from './catalog.js';
import { api } from './shared.js';
import { money } from './config.js';

let services=SERVICE_SEED;
try{const r=await api('/services');if(r.services?.length)services=r.services}catch{}
const categories=['All',...new Set(services.map(s=>s.category))];
const tabs=document.querySelector('[data-service-tabs]');
const grid=document.querySelector('[data-service-grid]');
const icons={All:'fa-sparkles',Makeup:'fa-paintbrush',Lashes:'fa-eye',Brows:'fa-eye',Hair:'fa-scissors',Nails:'fa-hand-sparkles'};
const pics={Makeup:[IMAGES.looks[5],IMAGES.beauty,IMAGES.bridal],Lashes:[IMAGES.lashes],Brows:[IMAGES.brows],Hair:[IMAGES.hair],Nails:[IMAGES.nails]};
let selected=new URLSearchParams(location.search).get('category')||'All';
if(!categories.includes(selected))selected='All';
function pic(s,i){const set=pics[s.category]||[IMAGES.beauty];return s.image||set[i%set.length]}
function render(cat=selected){
  selected=cat;
  tabs.innerHTML=categories.map(c=>`<button type="button" class="service-tab ${c===cat?'active':''}" data-cat="${c}"><i class="fa-solid ${icons[c]||'fa-sparkles'}" aria-hidden="true"></i><span>${c}</span></button>`).join('');
  const rows=services.filter(s=>s.active!==false&&(cat==='All'||s.category===cat));
  grid.innerHTML=rows.map((s,i)=>`<article class="service-card">
    <div class="service-card-image"><img src="${pic(s,i)}" alt="${s.name}" loading="lazy"><span>${s.category||'Beauty'}</span></div>
    <div class="service-body">
      <div class="service-meta"><span>${s.duration||'Timing confirmed after booking'}</span><span>${s.price!=null?money(s.price):'Price on request'}</span></div>
      <h3>${s.name}</h3>
      <p>${s.description||'A Cisca Makeovers studio service.'}</p>
      <div class="service-price-row"><a class="text-link" href="booking.html?service=${encodeURIComponent(s.id)}">Book this</a></div>
    </div>
  </article>`).join('')||'<div class="empty-state">No services in this category yet.</div>';
  tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>render(b.dataset.cat));
}
render();
