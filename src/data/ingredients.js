// Shopping list ingredients per cycle phase — multilingual
// cat and name are { es, en, fr, it } objects

export const INGREDIENTS = {
 menstrual: [
 { cat: { es: 'Pescados', en: 'Fish', fr: 'Poissons', it: 'Pesce' }, items: [
 { name: { es: 'Salmón fresco', en: 'Fresh salmon', fr: 'Saumon frais', it: 'Salmone fresco' }, qty: 150, unit: 'g' },
 ]},
 { cat: { es: 'Cereales y legumbres', en: 'Grains & legumes', fr: 'Céréales et légumineuses', it: 'Cereali e legumi' }, items: [
 { name: { es: 'Avena (copos)', en: 'Rolled oats', fr: 'Flocons d\'avoine', it: 'Fiocchi d\'avena' }, qty: 50, unit: 'g' },
 { name: { es: 'Quinoa', en: 'Quinoa', fr: 'Quinoa', it: 'Quinoa' }, qty: 80, unit: 'g' },
 { name: { es: 'Pan de centeno', en: 'Rye bread', fr: 'Pain de seigle', it: 'Pane di segale' }, qty: 40, unit: 'g' },
 { name: { es: 'Lentejas rojas', en: 'Red lentils', fr: 'Lentilles rouges', it: 'Lenticchie rosse' }, qty: 80, unit: 'g' },
 ]},
 { cat: { es: 'Verduras', en: 'Vegetables', fr: 'Légumes', it: 'Verdure' }, items: [
 { name: { es: 'Espinacas frescas', en: 'Fresh spinach', fr: 'Épinards frais', it: 'Spinaci freschi' }, qty: 100, unit: 'g' },
 { name: { es: 'Ajos', en: 'Garlic cloves', fr: 'Gousses d\'ail', it: 'Spicchi d\'aglio' }, qty: 2, unit: 'uds' },
 ]},
 { cat: { es: 'Frutas', en: 'Fruits', fr: 'Fruits', it: 'Frutta' }, items: [
 { name: { es: 'Plátano', en: 'Banana', fr: 'Banane', it: 'Banana' }, qty: 1, unit: 'ud' },
 { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons', it: 'Limoni' }, qty: 1, unit: 'ud' },
 ]},
 { cat: { es: 'Frutos secos y semillas', en: 'Nuts & seeds', fr: 'Noix et graines', it: 'Frutta secca e semi' }, items: [
 { name: { es: 'Nueces', en: 'Walnuts', fr: 'Noix', it: 'Noci' }, qty: 30, unit: 'g' },
 { name: { es: 'Semillas de chía', en: 'Chia seeds', fr: 'Graines de chia', it: 'Semi di chia' }, qty: 10, unit: 'g' },
 ]},
 { cat: { es: 'Despensa', en: 'Pantry', fr: 'Épicerie', it: 'Dispensa' }, items: [
 { name: { es: 'Leche de avena', en: 'Oat milk', fr: 'Lait d\'avoine', it: 'Latte di avena' }, qty: 200, unit: 'ml' },
 { name: { es: 'Chocolate negro 85%', en: 'Dark chocolate 85%', fr: 'Chocolat noir 85%', it: 'Cioccolato fondente 85%' }, qty: 20, unit: 'g' },
 { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge', it: 'Olio extravergine di oliva' }, qty: 15, unit: 'ml' },
 { name: { es: 'Miel', en: 'Honey', fr: 'Miel', it: 'Miele' }, qty: 10, unit: 'g' },
 { name: { es: 'Jengibre fresco', en: 'Fresh ginger', fr: 'Gingembre frais', it: 'Zenzero fresco' }, qty: 10, unit: 'g' },
 { name: { es: 'Cúrcuma molida', en: 'Ground turmeric', fr: 'Curcuma en poudre', it: 'Curcuma in polvere' }, qty: 2, unit: 'g' },
 ]},
 ],
 follicular: [
 { cat: { es: 'Proteínas', en: 'Proteins', fr: 'Protéines', it: 'Proteine' }, items: [
 { name: { es: 'Pechuga de pollo', en: 'Chicken breast', fr: 'Blanc de poulet', it: 'Petto di pollo' }, qty: 150, unit: 'g' },
 { name: { es: 'Merluza (filetes)', en: 'Hake fillets', fr: 'Filets de merlu', it: 'Filetti di nasello' }, qty: 150, unit: 'g' },
 { name: { es: 'Huevos', en: 'Eggs', fr: 'Œufs', it: 'Uova' }, qty: 3, unit: 'uds' },
 ]},
 { cat: { es: 'Cereales', en: 'Grains', fr: 'Céréales', it: 'Cereali' }, items: [
 { name: { es: 'Quinoa', en: 'Quinoa', fr: 'Quinoa', it: 'Quinoa' }, qty: 80, unit: 'g' },
 { name: { es: 'Pan de centeno', en: 'Rye bread', fr: 'Pain de seigle', it: 'Pane di segale' }, qty: 40, unit: 'g' },
 { name: { es: 'Boniato', en: 'Sweet potato', fr: 'Patate douce', it: 'Patata dolce' }, qty: 120, unit: 'g' },
 ]},
 { cat: { es: 'Verduras', en: 'Vegetables', fr: 'Légumes', it: 'Verdure' }, items: [
 { name: { es: 'Espinacas frescas', en: 'Fresh spinach', fr: 'Épinards frais', it: 'Spinaci freschi' }, qty: 60, unit: 'g' },
 { name: { es: 'Brócoli', en: 'Broccoli', fr: 'Brocoli', it: 'Broccoli' }, qty: 150, unit: 'g' },
 { name: { es: 'Zanahoria', en: 'Carrot', fr: 'Carotte', it: 'Carota' }, qty: 100, unit: 'g' },
 ]},
 { cat: { es: 'Frutas', en: 'Fruits', fr: 'Fruits', it: 'Frutta' }, items: [
 { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat', it: 'Avocado' }, qty: 1, unit: 'ud' },
 { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons', it: 'Limoni' }, qty: 1, unit: 'ud' },
 { name: { es: 'Fruta de temporada', en: 'Seasonal fruit', fr: 'Fruit de saison', it: 'Frutta di stagione' }, qty: 1, unit: 'ud' },
 ]},
 { cat: { es: 'Semillas', en: 'Seeds', fr: 'Graines', it: 'Semi' }, items: [
 { name: { es: 'Pepitas de calabaza', en: 'Pumpkin seeds', fr: 'Graines de courge', it: 'Semi di zucca' }, qty: 15, unit: 'g' },
 ]},
 { cat: { es: 'Despensa', en: 'Pantry', fr: 'Épicerie', it: 'Dispensa' }, items: [
 { name: { es: 'Hummus', en: 'Hummus', fr: 'Houmous', it: 'Hummus' }, qty: 60, unit: 'g' },
 { name: { es: 'Kombucha natural', en: 'Plain kombucha', fr: 'Kombucha nature', it: 'Kombucha naturale' }, qty: 250, unit: 'ml' },
 { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge', it: 'Olio extravergine di oliva' }, qty: 15, unit: 'ml' },
 ]},
 ],
 ovulation: [
 { cat: { es: 'Proteínas', en: 'Proteins', fr: 'Protéines', it: 'Proteine' }, items: [
 { name: { es: 'Gambas frescas o congeladas', en: 'Fresh or frozen prawns', fr: 'Crevettes fraîches ou surgelées', it: 'Gamberi freschi o surgelati' }, qty: 150, unit: 'g' },
 { name: { es: 'Pavo (filetes)', en: 'Turkey fillets', fr: 'Filets de dinde', it: 'Fettine di tacchino' }, qty: 150, unit: 'g' },
 ]},
 { cat: { es: 'Cereales', en: 'Grains', fr: 'Céréales', it: 'Cereali' }, items: [
 { name: { es: 'Arroz integral', en: 'Brown rice', fr: 'Riz complet', it: 'Riso integrale' }, qty: 70, unit: 'g' },
 { name: { es: 'Granola sin gluten', en: 'Gluten-free granola', fr: 'Granola sans gluten', it: 'Granola senza glutine' }, qty: 40, unit: 'g' },
 ]},
 { cat: { es: 'Verduras', en: 'Vegetables', fr: 'Légumes', it: 'Verdure' }, items: [
 { name: { es: 'Espárragos', en: 'Asparagus', fr: 'Asperges', it: 'Asparagi' }, qty: 150, unit: 'g' },
 { name: { es: 'Pepino', en: 'Cucumber', fr: 'Concombre', it: 'Cetriolo' }, qty: 100, unit: 'g' },
 { name: { es: 'Rúcula', en: 'Rocket / Arugula', fr: 'Roquette', it: 'Rucola' }, qty: 60, unit: 'g' },
 ]},
 { cat: { es: 'Frutas', en: 'Fruits', fr: 'Fruits', it: 'Frutta' }, items: [
 { name: { es: 'Frutos rojos (frescos o congelados)', en: 'Berries (fresh or frozen)', fr: 'Fruits rouges (frais ou surgelés)', it: 'Frutti di bosco (freschi o surgelati)' }, qty: 200, unit: 'g' },
 { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat', it: 'Avocado' }, qty: 1, unit: 'ud' },
 { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons', it: 'Limoni' }, qty: 1, unit: 'ud' },
 ]},
 { cat: { es: 'Semillas', en: 'Seeds', fr: 'Graines', it: 'Semi' }, items: [
 { name: { es: 'Pepitas de calabaza', en: 'Pumpkin seeds', fr: 'Graines de courge', it: 'Semi di zucca' }, qty: 50, unit: 'g' },
 { name: { es: 'Semillas de sésamo', en: 'Sesame seeds', fr: 'Graines de sésame', it: 'Semi di sesamo' }, qty: 10, unit: 'g' },
 ]},
 { cat: { es: 'Despensa', en: 'Pantry', fr: 'Épicerie', it: 'Dispensa' }, items: [
 { name: { es: 'Leche de coco (en lata)', en: 'Coconut milk (canned)', fr: 'Lait de coco (en boîte)', it: 'Latte di cocco (in lattina)' }, qty: 200, unit: 'ml' },
 { name: { es: 'Leche de avena', en: 'Oat milk', fr: 'Lait d\'avoine', it: 'Latte di avena' }, qty: 200, unit: 'ml' },
 { name: { es: 'Matcha en polvo', en: 'Matcha powder', fr: 'Poudre de matcha', it: 'Polvere di matcha' }, qty: 2, unit: 'g' },
 { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge', it: 'Olio extravergine di oliva' }, qty: 15, unit: 'ml' },
 ]},
 ],
 luteal: [
 { cat: { es: 'Proteínas', en: 'Proteins', fr: 'Protéines', it: 'Proteine' }, items: [
 { name: { es: 'Tofu firme', en: 'Firm tofu', fr: 'Tofu ferme', it: 'Tofu compatto' }, qty: 150, unit: 'g' },
 { name: { es: 'Pollo (muslos)', en: 'Chicken thighs', fr: 'Cuisses de poulet', it: 'Cosce di pollo' }, qty: 150, unit: 'g' },
 { name: { es: 'Huevos', en: 'Eggs', fr: 'Œufs', it: 'Uova' }, qty: 2, unit: 'uds' },
 ]},
 { cat: { es: 'Cereales', en: 'Grains', fr: 'Céréales', it: 'Cereali' }, items: [
 { name: { es: 'Pan integral', en: 'Wholegrain bread', fr: 'Pain complet', it: 'Pane integrale' }, qty: 80, unit: 'g' },
 { name: { es: 'Arroz integral', en: 'Brown rice', fr: 'Riz complet', it: 'Riso integrale' }, qty: 80, unit: 'g' },
 { name: { es: 'Fideos de arroz', en: 'Rice noodles', fr: 'Nouilles de riz', it: 'Spaghetti di riso' }, qty: 80, unit: 'g' },
 ]},
 { cat: { es: 'Verduras', en: 'Vegetables', fr: 'Légumes', it: 'Verdure' }, items: [
 { name: { es: 'Tomate cherry', en: 'Cherry tomatoes', fr: 'Tomates cerises', it: 'Pomodorini ciliegia' }, qty: 80, unit: 'g' },
 { name: { es: 'Verduras mixtas para wok', en: 'Mixed stir-fry vegetables', fr: 'Légumes mixtes pour wok', it: 'Verdure miste per wok' }, qty: 150, unit: 'g' },
 { name: { es: 'Verduras para sopa', en: 'Soup vegetables', fr: 'Légumes pour soupe', it: 'Verdure per zuppa' }, qty: 100, unit: 'g' },
 ]},
 { cat: { es: 'Frutas', en: 'Fruits', fr: 'Fruits', it: 'Frutta' }, items: [
 { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat', it: 'Avocado' }, qty: 1, unit: 'ud' },
 { name: { es: 'Plátano', en: 'Banana', fr: 'Banane', it: 'Banana' }, qty: 1, unit: 'ud' },
 { name: { es: 'Dátiles', en: 'Dates', fr: 'Dattes', it: 'Datteri' }, qty: 3, unit: 'uds' },
 ]},
 { cat: { es: 'Semillas', en: 'Seeds & nut butters', fr: 'Graines et purées', it: 'Semi e creme di frutta secca' }, items: [
 { name: { es: 'Mantequilla de almendra', en: 'Almond butter', fr: 'Purée d\'amande', it: 'Crema di mandorle' }, qty: 20, unit: 'g' },
 { name: { es: 'Semillas de girasol', en: 'Sunflower seeds', fr: 'Graines de tournesol', it: 'Semi di girasole' }, qty: 15, unit: 'g' },
 ]},
 { cat: { es: 'Despensa', en: 'Pantry', fr: 'Épicerie', it: 'Dispensa' }, items: [
 { name: { es: 'Caldo de pollo (brick)', en: 'Chicken stock (carton)', fr: 'Bouillon de poulet (brique)', it: 'Brodo di pollo (tetrapak)' }, qty: 400, unit: 'ml' },
 { name: { es: 'Chocolate negro 85%', en: 'Dark chocolate 85%', fr: 'Chocolat noir 85%', it: 'Cioccolato fondente 85%' }, qty: 20, unit: 'g' },
 { name: { es: 'Salsa tamari', en: 'Tamari sauce', fr: 'Sauce tamari', it: 'Salsa tamari' }, qty: 15, unit: 'ml' },
 { name: { es: 'Aceite de sésamo', en: 'Sesame oil', fr: 'Huile de sésame', it: 'Olio di sesamo' }, qty: 15, unit: 'ml' },
 { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge', it: 'Olio extravergine di oliva' }, qty: 15, unit: 'ml' },
 ]},
 ],
};

// Unit labels per language
const UNIT_LABELS = {
 es: { ud: 'unidad', uds: 'unidades' },
 en: { ud: 'unit', uds: 'units' },
 fr: { ud: 'unité', uds: 'unités' },
 it: { ud: 'unità', uds: 'unità' },
};

export const formatQty = (qty, unit, lang = 'es') => {
 const r = Math.ceil(qty);
 const ul = UNIT_LABELS[lang] || UNIT_LABELS.es;
 if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
 if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} L`;
 if (unit === 'ud' || unit === 'uds') return `${r} ${r === 1 ? ul.ud : ul.uds}`;
 return `${r} ${unit}`;
};

// Helper: resolve a multilingual name to the current language
export function locName(name, lang = 'es') {
 if (!name) return '';
 if (typeof name === 'string') return name; // legacy flat string
 return name[lang] ?? name.es ?? '';
}

export function locCat(cat, lang = 'es') {
 if (!cat) return '';
 if (typeof cat === 'string') return cat;
 return cat[lang] ?? cat.es ?? '';
}
