export const IMAGES = Object.freeze({
  logo:'images/logo.webp', hero:'images/hero.webp', studio:'images/studio.webp', beauty:'images/beauty.webp',
  makeup:'images/makeup.webp', nails:'images/nails.webp', hair:'images/hair.webp', lashes:'images/lashes.webp', brows:'images/brows.webp',
  bridal:'images/bridal.webp', graduation:'images/graduation.webp', birthday:'images/birthday.webp', engagement:'images/engagement.webp', photoshoot:'images/photoshoot.webp', matriculation:'images/matriculation.webp',
  classroom:'images/classroom.webp', classroom2:'images/classroom-02.webp',
  looks:Array.from({length:12},(_,i)=>`images/look-${String(i+1).padStart(2,'0')}.webp`),
  clients:Array.from({length:8},(_,i)=>`images/client-${String(i+1).padStart(2,'0')}.webp`),
  details:Array.from({length:4},(_,i)=>`images/detail-${String(i+1).padStart(2,'0')}.webp`)
});
