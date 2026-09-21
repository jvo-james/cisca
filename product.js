import { PRODUCT_SEED } from './catalog.js';
import { api, getCart, saveCart, toast } from './shared.js';
import { money } from './config.js';
import { IMAGES } from './images.js';

const id = new URLSearchParams(location.search).get('id');
let products = PRODUCT_SEED;
let product = products.find(item => item.id === id);
try {
  const response = await api('/products');
  if (response.products?.length) {
    const map = new Map(PRODUCT_SEED.map(item => [item.id, item]));
    response.products.forEach(item => map.set(item.id,{...(map.get(item.id)||{}),...item}));
    products = [...map.values()];
    product = products.find(item => item.id === id);
  }
} catch {}

const fallback = {Makeup: IMAGES.makeup, Nails: IMAGES.nails, 'Brow & Lash': IMAGES.lashes, Hair: IMAGES.hair};
const safe = value => String(value ?? '').replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[ch]));
const el = document.querySelector('[data-product-detail]');
const related = document.querySelector('[data-related-products]');

if (!product) {
  el.innerHTML = '<div class="empty-state"><h2>We could not find that product.</h2><p>The product may have been removed or the link may be old.</p><a class="btn" href="shop.html">Back to shop <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>';
} else {
  document.title = `${product.name} | Cisca Shop`;
  const main = product.image || fallback[product.category] || IMAGES.beauty;
  const ready = product.available && product.price != null;
  el.innerHTML = `<section class="product-detail"><div class="product-gallery product-single-image"><div class="product-image-frame"><img src="${main}" alt="${safe(product.name)}" fetchpriority="high"></div></div><aside class="product-panel"><div class="brandline">Cisca Shop · ${safe(product.category)}</div><h1>${safe(product.name)}</h1><div class="product-price">${product.price != null ? money(product.price) : 'Coming soon'}</div><p class="product-desc">${safe(product.description || 'A useful beauty essential selected for practical everyday use.')}</p><div class="product-buy"><div class="qty-box"><button type="button" data-minus aria-label="Decrease quantity"><i class="fas fa-minus" aria-hidden="true"></i></button><input id="qty" type="number" min="1" max="20" value="1" aria-label="Quantity"><button type="button" data-plus aria-label="Increase quantity"><i class="fas fa-plus" aria-hidden="true"></i></button></div><button class="btn btn-pink" data-add ${!ready?'disabled':''}>${ready?'Add to bag':'Coming soon'} <i class="fas fa-shopping-bag" aria-hidden="true"></i></button></div><div class="product-note">${ready?'Secure checkout with Paystack. Your receipt is sent after payment.':'This product is not on sale yet. Cisca will make it available when stock and pricing are ready.'}</div><div class="accordion"><details open><summary>Details</summary><p>${safe(product.description || 'Product details can be added from the admin dashboard.')}</p></details><details><summary>How to use</summary><p>Start with clean tools, work in light layers and keep the routine simple.</p></details><details><summary>Delivery</summary><p>Delivery and pickup options are confirmed during checkout.</p></details></div></aside></section>`;
  const qty = el.querySelector('#qty');
  el.querySelector('[data-minus]')?.addEventListener('click',()=>{qty.value=Math.max(1,Number(qty.value||1)-1)});
  el.querySelector('[data-plus]')?.addEventListener('click',()=>{qty.value=Math.min(20,Number(qty.value||1)+1)});
  el.querySelector('[data-add]')?.addEventListener('click',()=>{const n=Math.max(1,Math.min(20,Number(qty.value||1)));const cart=getCart();const found=cart.find(item=>item.id===product.id);if(found)found.qty=Number(found.qty||1)+n;else cart.push({id:product.id,name:product.name,price:product.price,qty:n,image:main,category:product.category});saveCart(cart);toast(`${product.name} added to your bag.`)});
  const picks = products.filter(item => item.id !== product.id && item.category === product.category).slice(0,4);
  related.innerHTML = picks.map(item => `<a class="complete-card" href="product.html?id=${encodeURIComponent(item.id)}"><img src="${item.image || fallback[item.category] || IMAGES.beauty}" alt="${safe(item.name)}" loading="lazy"><h3>${safe(item.name)}</h3><small>${item.price != null ? money(item.price) : 'Coming soon'}</small></a>`).join('');
}
