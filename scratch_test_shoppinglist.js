const ADJECTIVES = ['fresco','fresca'];
const PARTICLES_TO_STRIP = [
  /\((?:[^)]*)\)?/g,
  /\b(de|del|de la|de los|de las|en|con|sin|y|o|al)\b/g,
];
function singularize(word){ return word; }

function normalizeName(name) {
 let n = name.toLowerCase().trim();
 n = n.replace(/\s+para\s+.*/i, '');
 n = n.replace(/:.*/g, '');
 PARTICLES_TO_STRIP.forEach(re => { n = n.replace(re, ''); });
 ADJECTIVES.forEach(adj => {
  const re = new RegExp(`\\b${adj}\\b`, 'gi');
  n = n.replace(re, '');
 });
 n = n.replace(/[,.;:\/\\]/g, '');
 console.log('before space collapse:', JSON.stringify(n));
 n = n.replace(/\s+/g, '').trim();
 console.log('after space collapse (bug):', JSON.stringify(n));
 n = n.split('').map(singularize).join('').trim();
 console.log('final:', JSON.stringify(n));
 return n;
}
normalizeName('pechuga de pollo');
normalizeName('leche de avena');
normalizeName('pimiento rojo');
