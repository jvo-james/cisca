/*
  Site images use Unsplash URLs so you can change the visual direction without
  touching every page. Replace these URLs later with your downloaded images.

  Search ideas are written beside each image so you know what to look for.
  The gallery is the only place that keeps the local lookbook photos.
*/

const u = (photo, width = 1600) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;

export const IMAGES = Object.freeze({
  // Search: Black woman beauty portrait soft glam studio lighting
  hero: u('photo-1487412720507-e7ab37603c6f'),

  // Search: makeup artist applying makeup beauty close up
  beauty: u('photo-1516975080664-ed2fc6a32937'),

  // Search: beauty products flat lay makeup brushes neutral tones
  makeup: u('photo-1596462502278-27bfdc403348'),

  // Search: close up neutral manicure clean nails
  nails: u('photo-1604654894610-df63bc536371'),

  // Search: woman hair styling long dark hair salon
  hair: u('photo-1529139574466-a303027c1d8b'),

  // Search: eye makeup lashes beauty close up
  lashes: u('photo-1512316609839-ce289d3eba0a'),

  // Search: eyebrow beauty close up natural brows
  brows: u('photo-1500917293891-ef795e70e1f6'),

  // Search: bridal beauty portrait soft wedding makeup
  bridal: u('photo-1519741497674-611481863552'),

  // Search: woman graduation portrait beauty
  graduation: u('photo-1523050854058-8df90110c9f1'),

  // Search: birthday beauty portrait celebration
  birthday: u('photo-1524504388940-b1c1722653e1'),

  // Search: elegant engagement portrait
  engagement: u('photo-1524250502761-1ac6f2e30d43'),

  // Search: fashion editorial beauty portrait
  photoshoot: u('photo-1515886657613-9f3515b0c78f'),

  // Search: beauty studio interior pink neutral
  studio: u('photo-1522337360788-8b13dee7a37e'),

  // Search: makeup artist class beauty classroom
  classroom: u('photo-1556761175-b413da4baf72'),

  // Search: beauty training hands makeup brushes
  classroom2: u('photo-1517841905240-472988babdf9'),

  // Search: skincare beauty detail pink background
  detail1: u('photo-1571781926291-c477ebfd024b'),

  // Search: cosmetics bottles pink beauty detail
  detail2: u('photo-1598440947619-2c35fc9aa908'),

  // Search: makeup brushes beauty tools close up
  detail3: u('photo-1526045478516-99145907023c'),

  // Search: pink beauty products still life
  detail4: u('photo-1556228720-195a672e8a03'),

  // Search: woman beauty portrait natural light
  client1: u('photo-1534528741775-53994a69daeb'),

  // Search: black woman portrait beauty studio
  client2: u('photo-1529626455594-4ff0802cfb7e'),

  // Search: beauty portrait close up natural skin
  client3: u('photo-1512316609839-ce289d3eba0a'),

  // Search: woman portrait polished makeup
  client4: u('photo-1506794778202-cad84cf45f1d'),

  // Search: beauty portrait warm studio
  client5: u('photo-1544005313-94ddf0286df2'),

  // Search: woman portrait beauty natural smile
  client6: u('photo-1488426862026-3ee34a7d66df'),

  // Search: woman portrait soft glam
  client7: u('photo-1492562080023-ab3db95bfbce'),

  // Search: beauty portrait fashion
  client8: u('photo-1520813792240-56fc4a3765a7'),

  // Local gallery only. Keep these real lookbook images.
  galleryLooks: Array.from({ length: 12 }, (_, i) =>
    `images/look-${String(i + 1).padStart(2, '0')}.webp`
  )
});
