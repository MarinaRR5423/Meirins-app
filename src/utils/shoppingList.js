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
const CATEGORY_KEYWORDS = {
 ' Proteínas': [
 'pollo', 'pavo', 'salmón', 'salmon', 'atún', 'atun', 'merluza', 'lubina',
 'ternera', 'cerdo', 'huevo', 'huevos', 'tofu', 'sardinas', 'sardina',
 'tempeh', 'edamame', 'lentejas', 'garbanzos', 'judías', 'frijoles',
 'jamón', 'jamon', 'pavo', 'cordero', 'bacalao', 'caballa',
 'chicken', 'turkey', 'tuna', 'beef', 'pork', 'egg', 'eggs', 'lentils',
 'chickpeas', 'beans', 'fish', 'salmon',
 ],
 ' Verduras': [
 'espinaca', 'espinacas', 'brócoli', 'brocoli', 'calabacín', 'calabacin',
 'calabaza', 'pimiento', 'cebolla', 'zanahoria', 'tomate', 'ajo',
 'kale', 'rúcula', 'rucula', 'pepino', 'espárragos', 'esparragos',
 'batata', 'patata', 'boniato', 'lechuga', 'judías verdes', 'rábano',
 'remolacha', 'puerro', 'apio', 'champiñón', 'champiñones',
 'spinach', 'broccoli', 'courgette', 'pumpkin', 'pepper', 'onion',
 'carrot', 'tomato', 'garlic', 'rocket', 'cucumber', 'asparagus',
 'sweet potato', 'potato', 'lettuce', 'green beans',
 ],
 ' Fruta': [
 'plátano', 'platano', 'manzana', 'fresa', 'fresas', 'arándano', 'arandano',
 'arándanos', 'arandanos', 'mango', 'naranja', 'limón', 'limon',
 'dátil', 'datil', 'dátiles', 'datiles', 'frutos rojos', 'frutos del bosque',
 'kiwi', 'pera', 'piña', 'pina', 'uva', 'melón', 'sandía',
 'cereza', 'cerezas',
 'banana', 'apple', 'strawberry', 'strawberries', 'blueberry', 'blueberries',
 'orange', 'lemon', 'date', 'dates', 'berries', 'kiwi', 'pear',
 ],
 ' Cereales y panes': [
 'avena', 'quinoa', 'arroz', 'pasta', 'pan', 'harina', 'maíz', 'maiz',
 'centeno', 'mijo', 'cuscús', 'cuscus', 'bulgur',
 'oat', 'oats', 'rice', 'bread', 'flour', 'corn', 'rye',
 'wrap', 'tortilla', 'tortita', 'tortitas',
 ],
 ' Frutos secos y semillas': [
 'almendra', 'almendras', 'nueces', 'nuez', 'chía', 'chia', 'lino',
 'sésamo', 'sesamo', 'cáñamo', 'canamo', 'pistachos',
 'avellanas', 'cacahuete', 'cacahuetes', 'macadamia',
 'almond', 'almonds', 'walnut', 'walnuts', 'flax', 'sesame', 'hemp',
 'peanut', 'peanuts',
 ],
 ' Lácteos y vegetales': [
 'leche', 'yogur', 'queso', 'mantequilla', 'nata', 'parmesano',
 'ricotta', 'mozzarella', 'cheddar', 'feta', 'skyr', 'cottage',
 'milk', 'yoghurt', 'yogurt', 'cheese', 'butter', 'cream',
 'leche de avena', 'leche de almendra', 'leche de coco', 'leche de soja',
 'oat milk', 'almond milk', 'coconut milk', 'soy milk',
 ],
 ' Despensa y especias': [
 'aceite', 'oliva', 'miel', 'sirope', 'sal', 'pimienta', 'vinagre',
 'soja', 'miso', 'cacao', 'chocolate', 'canela', 'cúrcuma', 'curcuma',
 'jengibre', 'curry', 'pimentón', 'pimenton', 'comino', 'romero',
 'tomillo', 'orégano', 'oregano', 'laurel', 'mostaza', 'tahini', 'hummus',
 'aceitunas', 'algas', 'caldo',
 'oil', 'olive', 'honey', 'syrup', 'salt', 'pepper', 'vinegar',
 'sauce', 'sauce de soya', 'cinnamon', 'turmeric', 'ginger',
 'paprika', 'cumin', 'rosemary', 'thyme', 'oregano', 'bay', 'mustard',
 'olives', 'broth', 'stock',
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

function categorize(name) {
 const lower = name.toLowerCase();
 for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
 if (keywords.some(k => lower.includes(k))) return cat;
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
