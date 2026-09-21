/*
 * IMAGE MAP
 * These are temporary Unsplash image URLs so the site can launch with a consistent beauty look.
 * To replace one, search Unsplash using the comment beside it, download the chosen image and
 * change the URL below. Gallery images remain local so the lookbook can keep its own artwork.
 */
const U='https://images.unsplash.com/';
export const IMAGES = Object.freeze({
  logo:'images/logo.webp',
  hero:U+'photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85', // search: luxury beauty portrait makeup
  studio:U+'photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=85', // search: modern beauty studio
  beauty:U+'photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1400&q=85', // search: makeup artist beauty
  makeup:U+'photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=85', // search: makeup close up
  nails:U+'photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85', // search: nude manicure beauty
  hair:U+'photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85', // search: beauty hair portrait
  lashes:U+'photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1200&q=85', // search: eyelash beauty close up
  brows:U+'photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=85', // search: beauty portrait brows
  bridal:U+'photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85', // search: bridal beauty portrait
  graduation:U+'photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85', // search: graduation beauty portrait
  birthday:U+'photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1200&q=85', // search: fashion beauty portrait
  engagement:U+'photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', // search: elegant beauty portrait
  photoshoot:U+'photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85', // search: editorial beauty portrait
  matriculation:U+'photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85', // search: fashion portrait
  classroom:U+'photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85', // search: beauty class classroom
  classroom2:U+'photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85', // search: creative workshop classroom
  looks:Array.from({length:12},(_,i)=>`images/look-${String(i+1).padStart(2,'0')}.webp`),
  clients:[U+'photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85',U+'photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',U+'photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=85',U+'photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85',U+'photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',U+'photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',U+'photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1200&q=85',U+'photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85'],
  details:[U+'photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',U+'photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1200&q=85',U+'photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85',U+'photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85']
});
