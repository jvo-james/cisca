const looks = [
  ['images/graduation.webp','Graduation','Graduation glam','soft-glam','Graduation'],
  ['images/look-01.webp','Graduation','Golden-hour graduation','soft-glam','Graduation'],
  ['images/look-02.webp','Graduation','Polished graduation beauty','soft-glam','Graduation'],
  ['images/look-03.webp','Graduation','Close-up graduation glow','soft-glam','Graduation'],
  ['images/look-04.webp','Graduation','Celebration-ready skin','soft-glam','Graduation'],
  ['images/look-05.webp','Graduation','Sunset ceremony glam','soft-glam','Graduation'],
  ['images/look-06.webp','Graduation','Classic campus glam','soft-glam','Graduation'],
  ['images/look-07.webp','Graduation','Evening graduation finish','soft-glam','Graduation'],
  ['images/look-08.webp','Graduation','Statement graduation glam','bold-glam','Graduation'],
  ['images/look-09.webp','Graduation','Soft portrait finish','soft-glam','Graduation'],
  ['images/look-10.webp','Graduation','After-ceremony glam','soft-glam','Graduation'],
  ['images/look-11.webp','Graduation','Elegant graduation look','soft-glam','Graduation'],
  ['images/look-12.webp','Graduation','Fresh graduation polish','natural-glam','Graduation'],
  ['images/birthday.webp','Birthday','Birthday glow','soft-glam','Birthday'],
  ['images/client-08.webp','Birthday','Cake-cutting glam','bold-glam','Birthday'],
  ['images/bridal.webp','Wedding','Bridal beauty','bridal-makeup','Wedding'],
  ['images/engagement.webp','Wedding','Engagement elegance','bridal-makeup','Wedding'],
  ['images/client-02.webp','Wedding','Romantic occasion glam','bridal-makeup','Wedding'],
  ['images/matriculation.webp','Matriculation','Matriculation beauty','soft-glam','Matriculation'],
  ['images/client-04.webp','Matriculation','Green-day celebration glam','soft-glam','Matriculation'],
  ['images/photoshoot.webp','Photoshoot','Camera-ready makeup','bold-glam','Photoshoot'],
  ['images/client-01.webp','Photoshoot','Clean editorial beauty','bold-glam','Photoshoot'],
  ['images/client-03.webp','Photoshoot','Polished portrait glam','bold-glam','Photoshoot'],
  ['images/client-05.webp','Photoshoot','Soft editorial finish','soft-glam','Photoshoot'],
  ['images/client-06.webp','Photoshoot','Studio portrait glow','soft-glam','Photoshoot'],
  ['images/client-07.webp','Photoshoot','Evening editorial glam','bold-glam','Photoshoot'],
  ['images/beauty.webp','Beauty','Signature Cisca beauty','natural-glam','Just because'],
  ['images/hero.webp','Beauty','Hero beauty portrait','natural-glam','Just because'],
  ['images/makeup.webp','Beauty','Makeup detail','soft-glam','Date / Event'],
  ['images/detail-01.webp','Beauty','Skin and detail finish','natural-glam','Just because'],
  ['images/detail-02.webp','Beauty','Soft focus beauty','soft-glam','Date / Event'],
  ['images/detail-03.webp','Beauty','Polished finishing touches','soft-glam','Just because'],
  ['images/detail-04.webp','Beauty','Everyday glam finish','natural-glam','Just because'],
  ['images/hair.webp','Hair','Styled hair finish','curling','Date / Event'],
  ['images/lashes.webp','Lashes','Lash detail','classic-lashes','Just because'],
  ['images/brows.webp','Brows','Defined brow finish','brow-shaping','Just because'],
  ['images/nails.webp','Nails','Fresh nail finish','gel-polish','Just because'],
  ['images/classroom.webp','Academy & Studio','Beauty training in session','soft-glam','Just because'],
  ['images/classroom-02.webp','Academy & Studio','Learning by doing','soft-glam','Just because'],
  ['images/studio.webp','Academy & Studio','Studio technique','soft-glam','Just because']
].map(([src,category,title,service,occasion])=>({src,category,title,service,occasion}));

const grid=document.querySelector('[data-gallery]');
const filters=document.querySelector('[data-look-filter]');
const modal=document.querySelector('[data-look-modal]');
const modalImage=modal.querySelector('[data-look-modal-image]');
const modalCategory=modal.querySelector('[data-look-modal-category]');
const modalTitle=modal.querySelector('[data-look-modal-title]');
const modalCaption=modal.querySelector('[data-look-modal-caption]');
const modalPosition=modal.querySelector('[data-look-modal-position]');
const modalBook=modal.querySelector('[data-look-modal-book]');
const prev=modal.querySelector('[data-look-prev]');
const next=modal.querySelector('[data-look-next]');
let active='All';
let visible=[];
let current=0;

function render(){
  visible=looks.filter(x=>active==='All'||x.category===active);
  grid.innerHTML=visible.map((x,i)=>`<button type="button" class="look-item" data-look-index="${i}" aria-label="Open ${x.title}"><img src="${x.src}" alt="${x.title}" loading="lazy"><span class="look-overlay"><span>${x.category}</span><strong>${x.title}</strong><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span></button>`).join('');
  filters.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.filter===active));
  grid.querySelectorAll('[data-look-index]').forEach(b=>b.addEventListener('click',()=>open(Number(b.dataset.lookIndex))));
}
function updateModal(){
  const x=visible[current];
  if(!x)return;
  modalImage.src=x.src;
  modalImage.alt=x.title;
  modalCategory.textContent=x.category;
  modalTitle.textContent=x.title;
  modalCaption.textContent=`${x.title}. Ready to build this ${x.category.toLowerCase()} look with Cisca.`;
  modalPosition.textContent=`${current+1} / ${visible.length}`;
  modalBook.href=`booking.html?service=${encodeURIComponent(x.service)}&occasion=${encodeURIComponent(x.occasion)}`;
  prev.disabled=visible.length<2;
  next.disabled=visible.length<2;
}
function open(index){
  current=Math.max(0,Math.min(index,visible.length-1));
  updateModal();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('overlay-open');
}
function close(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('overlay-open');
}
function step(direction){
  if(!visible.length)return;
  current=(current+direction+visible.length)%visible.length;
  updateModal();
}
filters.addEventListener('click',e=>{const b=e.target.closest('button');if(b){active=b.dataset.filter;close();render();}});
modal.querySelectorAll('[data-look-close]').forEach(b=>b.addEventListener('click',close));
prev.addEventListener('click',()=>step(-1));
next.addEventListener('click',()=>step(1));
document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);});
render();
