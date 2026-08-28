/**
 * shoppingList.js — genera la lista de la compra a partir de las recetas de la semana
 *
 * Pipeline:
 * 1. Recoge todos los ingredientes de las 7 cenas/almuerzos/desayunos/snacks
 * 2. Parsea cada string ("150g salmón") → { qty, unit, name }
 * 3. Normaliza el nombre (quita adjetivos: maduro, fresco, ahumado, rallado…)
 * 4. Agrupa por nombre + unidad y suma cantidades
 * 5. Multiplica por número de personas (adultos + niños/2)
 * 6. Clasifica por categoría (proteínas, verduras, fruta, despensa…)
 */

// ── Unidades reconocidas ──────────────────────────────────────────────────────
// Fracciones unicode → decimal
const UNICODE_FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667 };

// Palabras que indican que el item NO es un ingrediente (consejos de estilo de vida o instrucciones)
const NON_FOOD_WORDS = [
 'yoga', 'estiramientos', 'paseo', 'caminata', 'obligaci', 'disfrutar', 'escucha',
 'brunch', 'senderismo', 'plato familiar', 'hambre', 'ganas', 'savourer', 'prenditi',
 'sin exceso', 'sin oblig', 'tómate', 'tomate tu', 'listen', 'ascolta', 'écoute',
 'natación', 'natacion', 'deporte', 'entrena', 'correr', 'bicicleta', 'pilates',
 'meditaci', 'respiraci', 'descanso activo', 'actividad',
 // instrucciones de preparación que no son ingredientes
 'para la salsa', 'para el aderezo', 'para servir', 'para decorar', 'para acompañar',
 'al gusto', 'opcional', 'to taste', 'to serve', 'for the sauce', 'for serving',
 'pour la sauce', 'pour servir', 'per la salsa', 'per servire',
];

// Prefijos que indican nota de preparación, no ingrediente
const PREP_PREFIXES = ['para ', 'for ', 'pour ', 'per ', 'to serve', 'al gusto'];

function isFood(raw) {
 if (!raw || raw.length < 2) return false;
 if (raw.includes('—') || raw.includes('--')) return false;
 const lower = raw.toLowerCase().trim();
 if (PREP_PREFIXES.some(p => lower.startsWith(p))) return false;
 return !NON_FOOD_WORDS.some(w => lower.includes(w));
}

const UNIT_PATTERNS = [
 { re: /^(\d+(?:[\.,]\d+)?)\s*g\b/i, unit: 'g' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*kg\b/i, unit: 'kg' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*ml\b/i, unit: 'ml' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*l\b/i, unit: 'l' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*cda?s?\b/i, unit: 'cda' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*cdta?s?\b/i, unit: 'cdta' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:cucharadas?|cucharaditas?)/i, unit: 'cda' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*latas?\b/i, unit: 'lata' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*tazas?\b/i, unit: 'taza' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:rebanadas?|rebanadas?)/i, unit: 'reb' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:tbsp|tablespoons?)/i, unit: 'cda' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:tsp|teaspoons?)/i, unit: 'cdta' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:cans?)/i, unit: 'lata' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:cups?)/i, unit: 'taza' },
 { re: /^(\d+(?:[\.,]\d+)?)\s*(?:slices?)/i, unit: 'reb' },
];

const ADJECTIVES = [
 'maduro', 'maduros', 'madura', 'maduras',
 'fresco', 'frescos', 'fresca', 'frescas',
 'crudo', 'crudos', 'cruda', 'crudas',
 'cocido', 'cocidos', 'cocida', 'cocidas',
 'rallado', 'rallados', 'rallada', 'ralladas',
 'molido', 'molidos', 'molida', 'molidas',
 'troceado', 'troceados', 'troceada', 'troceadas',
 'natural', 'naturales',
 'integral', 'integrales',
 'ahumado', 'ahumados', 'ahumada', 'ahumadas',
 'al natural', 'en aceite', 'en agua', 'en conserva',
 'firme', 'firmes',
 'puro', 'pura',
 'baby',
 'grande', 'grandes', 'pequeño', 'pequeños',
 'fino', 'fina', 'finos', 'finas',
 // preparaciones de corte
 'rodaja', 'rodajas', 'dados', 'desmenuzado', 'desmenuzada',
 'laminado', 'laminada', 'laminados', 'laminadas',
 'picado', 'picada', 'picados', 'picadas',
 'fileteado', 'fileteada',
 'lomo', 'lomos', 'filete', 'filetes',
 'entero', 'entera', 'enteros', 'enteras',
 'medio', 'media', 'temporada',
 'ripe', 'fresh', 'raw', 'cooked', 'grated', 'ground', 'chopped',
 'natural', 'whole', 'smoked', 'firm', 'pure', 'large', 'small', 'thin',
 // cortes y formatos
 'espirale', 'espiral', 'espirales', 'bastone', 'bastones', 'juliana',
 'brunoise', 'mirepoix', 'chiffonade', 'carpaccio',
 // tamaños parciales
 'pequeñ',
 // partes de ajo
 'diente', 'dientes',
];

const PARTICLES_TO_STRIP = [
 /\((?:[^)]*)\)?/g, // paréntesis (cerrados o no): "(para la salsa" también
 /\b(de|del|de la|de los|de las|en|con|sin|y|o|al)\b/g,
];

// ── Categorías ────────────────────────────────────────────────────────────────
// ORDEN IMPORTANTE: las categorías se comprueban en este orden.
// Poner Lácteos antes de Cereales para que "leche de avena" → Lácteos.
const CATEGORY_KEYWORDS = {
 ' Proteínas': [
  // Carnes
  'pollo', 'pavo', 'ternera', 'cerdo', 'cordero', 'pato', 'conejo',
  'bacon', 'loncha', 'lonchas', 'panceta', 'chorizo',
  'salchicha', 'salchichón', 'mortadela', 'fiambre', 'embutido',
  'carne', 'pechuga', 'muslo', 'contramuslo', 'deshuesado', 'escalope',
  'solomillo', 'costilla', 'hamburguesa',
  'jamón', 'jamon',
  // Pescados y mariscos
  'salmón', 'salmon', 'atún', 'atun', 'merluza', 'lubina', 'bacalao',
  'sardina', 'sardinas', 'caballa', 'dorada', 'rodaballo',
  'boquerón', 'boqueron', 'anchoa', 'trucha', 'sepia', 'calamar',
  'pulpo', 'mejillón', 'mejillones', 'almeja', 'almejas',
  'gamba', 'gambas', 'langostino', 'langostinos',
  'cigala', 'bogavante', 'nécora',
  // Huevos
  'huevo', 'huevos', 'clara', 'yema',
  // Legumbres
  'lentejas', 'garbanzos', 'frijoles', 'alubias', 'habas', 'guisantes', 'azuki',
  'judías blancas', 'judías negras', 'judías pintas', 'judías rojas',
  // Proteína vegetal
  'tofu', 'tempeh', 'seitán', 'seitan', 'quorn',
  'edamame', 'soja texturizada', 'proteína de soja',
  'proteína de suero', 'proteína de guisante', 'proteína en polvo', 'whey',
  // EN
  'chicken', 'turkey', 'beef', 'pork', 'lamb', 'duck', 'rabbit',
  'tuna', 'hake', 'cod', 'sardine', 'mackerel',
  'shrimp', 'prawns', 'squid', 'octopus', 'mussel', 'clam',
  'egg', 'eggs', 'lentils', 'chickpeas', 'fish',
 ],
 ' Lácteos y vegetales': [
  // Bebidas vegetales primero (antes de que "avena" → Cereales)
  'leche de avena', 'bebida de avena',
  'leche de almendra', 'bebida de almendra',
  'leche de coco', 'bebida de coco',
  'leche de soja', 'bebida de soja',
  'leche de arroz', 'bebida de arroz',
  'bebida vegetal',
  // Lácteos
  'leche', 'yogur', 'yogurt', 'kéfir', 'kefir',
  'queso', 'parmesano', 'ricotta', 'mozzarella', 'cheddar',
  'feta', 'gouda', 'brie', 'camembert', 'manchego', 'cottage',
  'skyr', 'quark',
  'mantequilla', 'ghee', 'margarina',
  'nata', 'crema', 'crème',
  // EN
  'milk', 'yoghurt', 'cheese', 'butter', 'cream',
  'oat milk', 'almond milk', 'coconut milk', 'soy milk', 'rice milk',
 ],
 ' Verduras': [
  'espinaca', 'espinacas', 'brócoli', 'brocoli', 'coliflor',
  'calabacín', 'calabacin', 'calabaza', 'zapallo',
  'pimiento', 'pimientos', 'guindilla', 'jalapeño',
  'cebolla', 'cebolleta', 'chalotas', 'chalota',
  'zanahoria', 'zanahorias',
  'tomate', 'tomates', 'cherry', 'cherry tomate',
  'kale', 'rúcula', 'rucula', 'pepino', 'pepinos',
  'espárragos', 'esparragos', 'espárrago', 'esparrago',
  'batata', 'patata', 'patatas', 'boniato', 'yuca',
  'lechuga', 'lechugas', 'judías verdes', 'rábano', 'rabano',
  'remolacha', 'puerro', 'hinojo',
  'champiñón', 'champiñones', 'seta', 'setas', 'portobello',
  'berenjena', 'berenjenas', 'alcachofa', 'alcachofas',
  'acelga', 'acelgas', 'chirivía',
  // 'col' eliminada (3 chars, coincide con "chocolate") → usar términos más largos
  'repollo', 'lombarda', 'coles de bruselas', 'chucrut', 'berza',
  // 'maíz'/'maiz' eliminados de aquí → solo en Cereales (tortillas, mazorca…)
  'elote', 'mazorca',
  'aguacate', 'palta',
  'mezcla', 'mezclum', 'canónigos', 'hojas verdes', 'brotes tiernos',
  'microgreens', 'pak choi', 'bok choy',
  'okra', 'wakame', 'nabo',
  // EN
  'spinach', 'broccoli', 'cauliflower', 'courgette', 'zucchini',
  'pumpkin', 'pepper', 'chilli', 'onion', 'leek', 'carrot',
  'tomato', 'garlic', 'cucumber', 'asparagus', 'sweet potato',
  'potato', 'lettuce', 'mushroom', 'eggplant', 'aubergine',
  'artichoke', 'chard', 'avocado', 'rocket', 'arugula',
  'celery', 'fennel', 'beetroot', 'cabbage', 'sprouts',
 ],
 ' Fruta': [
  'plátano', 'platano', 'manzana', 'pera',
  'fresa', 'fresas', 'frambuesa', 'frambuesas',
  'arándano', 'arandano', 'arándanos', 'arandanos',
  'mango', 'naranja', 'naranjas', 'mandarina',
  'limón', 'limon', 'lima', 'pomelo', 'toronja',
  'dátil', 'datil', 'dátiles', 'datiles',
  'frutos rojos', 'frutos del bosque', 'bayas',
  'kiwi', 'piña', 'pina', 'papaya', 'maracuyá',
  'uva', 'uvas', 'melón', 'melon', 'sandía', 'sandia',
  'cereza', 'cerezas', 'melocotón', 'melocoton', 'nectarina',
  'albaricoque', 'ciruela', 'higo', 'granada',
  'coco', 'caquí', 'lichi',
  // Frutas secas
  'orejones', 'pasas', 'uvas pasas', 'ciruelas pasas',
  'dátiles medjool', 'higos secos', 'cranberries', 'goji',
  // EN
  'banana', 'apple', 'pear', 'strawberry', 'raspberry', 'blueberry',
  'orange', 'lemon', 'lime', 'grapefruit', 'date', 'berries',
  'pineapple', 'grape', 'melon', 'watermelon', 'cherry',
  'peach', 'nectarine', 'apricot', 'plum', 'fig', 'pomegranate',
  'raisin', 'dried fruit',
 ],
 ' Cereales y panes': [
  'avena', 'quinoa', 'arroz', 'pasta', 'espagueti', 'espaguetis',
  'macarrón', 'macarrones', 'penne', 'fusilli', 'fettuccine',
  'pan', 'panecillo', 'baguette', 'pita', 'naan',
  'harina', 'maíz', 'maiz', 'centeno', 'mijo', 'cebada',
  'cuscús', 'cuscus', 'bulgur', 'amaranto', 'teff', 'sorgo',
  'granola', 'muesli', 'copos', 'cereales',
  'wrap', 'tortilla', 'tortita', 'tortitas', 'crepe',
  'crackers', 'galletas', 'biscotes', 'pan de molde',
  // EN
  'oat', 'oats', 'rice', 'bread', 'flour', 'corn', 'rye', 'barley',
  'couscous', 'cereal', 'cracker', 'biscuit',
 ],
 ' Frutos secos y semillas': [
  'almendra', 'almendras', 'nueces', 'nuez', 'avellana', 'avellanas',
  'pistachos', 'pistacho', 'anacardo', 'anacardos', 'macadamia',
  'cacahuete', 'cacahuetes', 'pecan',
  'chía', 'chia', 'lino', 'linaza', 'sésamo', 'sesamo',
  'cáñamo', 'girasol', 'pepitas', 'semilla', 'semillas',
  // EN
  'almond', 'walnut', 'hazelnut', 'pistachio',
  'cashew', 'peanut',
  'flax', 'sesame', 'hemp',
 ],
 ' Despensa y especias': [
  // Aceites y condimentos
  'aceite', 'oliva', 'vinagre', 'mayonesa', 'ketchup', 'mostaza',
  'salsa', 'tamari', 'teriyaki', 'tahini', 'hummus', 'miso',
  'sriracha', 'tabasco', 'worcestershire', 'aderezo',
  // Especias y hierbas frescas/secas
  'sal', 'pimienta', 'pimentón', 'pimenton', 'paprika', 'comino',
  'curry', 'cúrcuma', 'curcuma', 'canela', 'jengibre', 'cardamomo',
  'clavo', 'nuez moscada', 'azafrán', 'azafran',
  'orégano', 'oregano', 'tomillo', 'romero', 'laurel', 'albahaca',
  'cilantro', 'perejil', 'eneldo', 'menta', 'hierbabuena',
  'cebollino', 'estragón', 'estragon', 'hierbas', 'especias',
  // Dulces y endulzantes
  'miel', 'sirope', 'jarabe', 'azúcar', 'azucar',
  'stevia', 'estevia', 'eritritol', 'xilitol',
  'cacao', 'chocolate', 'vainilla',
  // Conservas y botes
  'aceitunas', 'alcaparra', 'alcaparras', 'pepinillo', 'pepinillos', 'encurtido',
  'lata', 'conserva', 'tomate triturado', 'tomate frito', 'passata',
  'caldo', 'consomé', 'bouillon',
  // Algas y superalimentos
  'algas', 'nori', 'alga', 'wakame', 'espirulina', 'chlorella',
  'kombucha', 'kéfir de agua',
  // Básicos de despensa
  'levadura', 'bicarbonato', 'polvo de hornear',
  'agua', 'agua mineral', 'zumo', 'jugo', 'caldo vegetal',
  'maicena', 'almidón', 'gelatina', 'agar',
  // EN
  'oil', 'vinegar', 'mayonnaise', 'mustard', 'sauce',
  'salt', 'pepper', 'paprika', 'cumin', 'cinnamon', 'turmeric',
  'ginger', 'oregano', 'thyme', 'rosemary', 'basil',
  'parsley', 'dill', 'mint', 'honey', 'syrup', 'sugar', 'cocoa',
  'olives', 'capers', 'broth', 'stock', 'water', 'juice',
 ],
};

const DEFAULT_CATEGORY = ' Otros';

/** Traducciones de las categorías de la lista de la compra */
export const CAT_LABEL_MAP = {
 ' Proteínas':               { es: 'Proteínas',           en: 'Proteins',              fr: 'Protéines',           it: 'Proteine' },
 ' Verduras':                { es: 'Verduras',             en: 'Vegetables',            fr: 'Légumes',             it: 'Verdure' },
 ' Fruta':                   { es: 'Fruta',                en: 'Fruit',                 fr: 'Fruits',              it: 'Frutta' },
 ' Cereales y panes':        { es: 'Cereales y panes',     en: 'Cereals & breads',      fr: 'Céréales & pains',    it: 'Cereali e pane' },
 ' Frutos secos y semillas': { es: 'Frutos secos',         en: 'Nuts & seeds',          fr: 'Noix & graines',      it: 'Frutta secca' },
 ' Lácteos y vegetales':     { es: 'Lácteos y vegetales',  en: 'Dairy & alternatives',  fr: 'Produits laitiers',   it: 'Latticini' },
 ' Despensa y especias':     { es: 'Despensa y especias',  en: 'Pantry & spices',       fr: 'Épicerie & épices',   it: 'Dispensa e spezie' },
 ' Otros':                   { es: 'Otros',                en: 'Other',                 fr: 'Autres',              it: 'Altro' },
};

// ── Plurales irregulares españoles ───────────────────────────────────────────
const IRREGULAR_PLURALS = {
 // frutos secos
 nueces: 'nuez', nuez: 'nuez',
 almendras: 'almendra',
 avellanas: 'avellana',
 pistachos: 'pistacho',
 cacahuetes: 'cacahuete',
 // verduras -ines/-ones (terminación consonante+es — la regla genérica falla)
 calabacines: 'calabacin', 'calabacín': 'calabacin',
 champiñones: 'champiñon', champinones: 'champiñon', 'champiñón': 'champiñon',
 espárragos: 'esparrago', esparragos: 'esparrago', 'espárrago': 'esparrago',
 pimientos: 'pimiento',
 pepinos: 'pepino',
 rabanos: 'rabano', 'rábanos': 'rabano',
 // verduras simples
 zanahorias: 'zanahoria',
 espinacas: 'espinaca',
 tomates: 'tomate',
 cebollas: 'cebolla',
 lechugas: 'lechuga',
 judias: 'judia', 'judías': 'judia',
 // fruta
 fresas: 'fresa',
 cerezas: 'cereza',
 manzanas: 'manzana',
 naranjas: 'naranja',
 uvas: 'uva',
 platanos: 'platano', 'plátanos': 'platano',
 melocotones: 'melocototon',
 limones: 'limon', 'limón': 'limon',
 melones: 'melon', 'melón': 'melon',
 dátiles: 'datil', datiles: 'datil',
 'arándanos': 'arandano', arandanos: 'arandano',
 // proteínas
 huevos: 'huevo',
 sardinas: 'sardina',
 garbanzos: 'garbanzo',
 lentejas: 'lenteja',
 // otros
 aceitunas: 'aceituna',
 frutos: 'fruto',
 alcaparras: 'alcaparra',
};

function singularize(word) {
 if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
 // palabras que terminan en vocal + s → quitar la s (tomate→tomates, huevo→huevos)
 if (word.length > 4 && word.endsWith('s') && /[aeiouáéíóú]/.test(word[word.length - 2])) {
 return word.slice(0, -1);
 }
 return word;
}

// ── Funciones principales ────────────────────────────────────────────────────

function parseQty(text) {
 // Reemplazar fracciones unicode (½, ¼, ¾…) por su valor decimal
 let t = text;
 for (const [frac, val] of Object.entries(UNICODE_FRACTIONS)) {
 // Handles "½ aguacate" and "1½ taza" (with or without space)
 t = t.replace(new RegExp(`(\\d*)\\s*${frac}`, 'g'), (_, pre) => {
 const base = pre ? parseFloat(pre) : 0;
 return `${base + val} `;
 });
 }
 t = t.trim();

 for (const { re, unit } of UNIT_PATTERNS) {
 const m = t.match(re);
 if (m) {
 const qty = parseFloat(m[1].replace(',', '.'));
 const rest = t.replace(re, '').trim();
 return { qty, unit, rest };
 }
 }
 // Sin unidad → intenta "1 plátano", "2 huevos"
 const num = t.match(/^(\d+(?:[\.,]\d+)?)\s+/);
 if (num) {
 const qty = parseFloat(num[1].replace(',', '.'));
 const rest = t.replace(num[0], '').trim();
 return { qty, unit: 'unidad', rest };
 }
 // No hay cantidad → asumir 1 unidad
 return { qty: 1, unit: 'unidad', rest: t };
}

// Palabras que solas no son un ingrediente válido
const STOP_WORDS = new Set(['de','del','la','las','los','el','en','con','sin','y','o','al','a','para','un','una','unos','unas','su','sus']);

function normalizeName(name) {
 let n = name.toLowerCase().trim();
 // Quitar todo desde "para " en adelante (notas de preparación inline)
 n = n.replace(/\s+para\s+.*/i, '');
 // Quitar todo desde ":" en adelante (instrucciones)
 n = n.replace(/:.*/g, '');
 PARTICLES_TO_STRIP.forEach(re => { n = n.replace(re, ''); });
 ADJECTIVES.forEach(adj => {
 const re = new RegExp(`\\b${adj}\\b`, 'gi');
 n = n.replace(re, '');
 });
 // Quita comas y signos
 n = n.replace(/[,.;:\/\\]/g, '');
 // Espacios duplicados → un solo espacio
 n = n.replace(/\s+/g, ' ').trim();
 // Singulariza cada palabra
 n = n.split(' ').map(singularize).join(' ').trim();
 // Si solo queda una stop word o cadena vacía → inválido
 if (!n || n.split('').every(w => STOP_WORDS.has(w))) return '';
 return n;
}

// Regexp de palabra entera (acepta tildes y ñ) para keywords cortas
function wordRe(k) {
 return new RegExp(`(?<![a-záéíóúüñ])${k}(?![a-záéíóúüñ])`, 'i');
}

function categorize(name) {
 const lower = name.toLowerCase();
 for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
   if (keywords.some(k =>
     k.length <= 4
       ? wordRe(k).test(lower)   // palabras cortas: solo palabra completa
       : lower.includes(k)        // palabras largas: substring (más permisivo)
   )) return cat;
 }
 return DEFAULT_CATEGORY;
}

function capitalize(name) {
 return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Formatea cantidad + unidad.
 */
export function formatQuantity(qty, unit) {
 const rounded = Math.round(qty * 10) / 10;
 const q = Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
 const labels = {
 g: 'g', kg: 'kg', ml: 'ml', l: 'l',
 cda: 'cda', cdta: 'cdta', lata: 'lata', taza: 'taza', reb: 'reb',
 unidad: '',
 };
 const u = labels[unit] ?? unit;
 return u ? `${q} ${u}` : `${q}`;
}

/**
 * Construye la lista de la compra desde un array de comidas.
 *
 * @param {Array} meals array de { items: [...] }
 * @param {number} servings multiplicador de personas (1 adulto = 1.0)
 * @returns {Object} { categoria: [ { name, qty, unit, key } ] }
 */
export function buildShoppingList(meals, servings = 1) {
 // items keyed por nombre normalizado solo (para fusionar independientemente de unidad)
 const byName = {};

 meals.forEach(meal => {
 (meal.items || []).forEach(ingredient => {
 if (!ingredient || typeof ingredient !== 'string') return;

 // Separar por comas solo cuando tras la coma viene letra (no número ni espacio+número)
 // Esto evita cortar "sal, 1 cdta pimienta" mal
 const parts = ingredient.split(/,\s*(?=[a-zA-ZáéíóúñÁÉÍÓÚÑ])/);

 parts.forEach(part => {
 const cleaned = part.trim();
 if (!cleaned || cleaned.length < 2) return;
 if (!isFood(cleaned)) return;

 const { qty, unit, rest } = parseQty(cleaned);
 const name = normalizeName(rest);
 if (!name || name.length < 2) return;

 const existing = byName[name];
 if (!existing) {
 byName[name] = { name: capitalize(name), qty: qty * servings, unit };
 } else if (existing.unit === unit) {
 existing.qty += qty * servings;
 } else if (existing.unit === 'unidad' && unit !== 'unidad') {
 existing.unit = unit;
 existing.qty = qty * servings;
 } else if (unit === 'unidad') {
 // ya tenemos medida concreta, ignorar
 } else {
 existing.qty += qty * servings;
 }
 });
 });
 });

 // Agrupar por categoría
 const grouped = {};
 Object.values(byName).forEach(item => {
 const cat = categorize(item.name);
 if (!grouped[cat]) grouped[cat] = [];
 grouped[cat].push({ ...item, key: item.name });
 });

 // Ordenar items dentro de cada categoría
 Object.keys(grouped).forEach(cat => {
 grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
 });

 return grouped;
}

/**
 * Total de items en la lista (para el badge "67 productos")
 */
export function countItems(shoppingList) {
 return Object.values(shoppingList).reduce((acc, items) => acc + items.length, 0);
}
