const looks=[
  ['images/look-01.webp','Soft Glam','Birthday soft glam','soft-glam','Birthday'],
  ['images/look-02.webp','Editorial','Polished editorial finish','bold-glam','Photoshoot'],
  ['images/look-03.webp','Soft Glam','Soft sculpted glam','soft-glam','Date / Event'],
  ['images/look-04.webp','Bridal','Bridal skin and definition','bridal-makeup','Wedding'],
  ['images/look-05.webp','Graduation','Graduation glam','soft-glam','Graduation'],
  ['images/look-06.webp','Soft Glam','Cisca signature soft glam','soft-glam','Just because'],
  ['images/look-07.webp','Editorial','Camera-ready beauty','bold-glam','Photoshoot'],
  ['images/look-08.webp','Soft Glam','Evening glam','soft-glam','Birthday'],
  ['images/look-09.webp','Brows','Defined brow finish','brow-shaping','Just because'],
  ['images/look-10.webp','Graduation','Celebration glam','soft-glam','Graduation'],
  ['images/look-11.webp','Bridal','Elegant occasion makeup','bridal-makeup','Wedding'],
  ['images/look-12.webp','Hair','Finished beauty look','curling','Date / Event']
];
const grid=document.querySelector('[data-gallery]'),filters=document.querySelector('[data-look-filter]');
let active='All';
function render(){
  const rows=looks.filter(x=>active==='All'||x[1]===active);
  grid.innerHTML=rows.map(x=>`<a class="look-item" href="booking.html?service=${encodeURIComponent(x[3])}&occasion=${encodeURIComponent(x[4])}"><img src="${x[0]}" alt="${x[2]}" loading="lazy"><div class="look-caption"><span>${x[1]}</span><h3>${x[2]}</h3><span>Book this look →</span></div></a>`).join('');
  filters.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.filter===active));
}
filters.addEventListener('click',e=>{const b=e.target.closest('button');if(b){active=b.dataset.filter;render()}});
render();
