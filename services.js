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
const servicePhotos={'natural-glam':'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85', 'soft-glam':'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85', 'bold-glam':'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85', 'bridal-makeup':'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', 'classic-lashes':'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1000&q=85', 'hybrid-lashes':'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1000&q=85', 'volume-lashes':'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=1000&q=85', 'brow-shaping':'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1000&q=85', 'brow-tint':'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1000&q=85', 'microshading':'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85', 'closure-install':'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85', 'frontal-install':'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85', 'curling':'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', 'gel-polish':'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=85', 'acrylic-short':'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85', 'acrylic-medium':'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=85'};
function pic(s,i){return s.image||servicePhotos[s.id]||IMAGES.beauty}
let selected=new URLSearchParams(location.search).get('category')||'All';
if(!categories.includes(selected))selected='All';
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
