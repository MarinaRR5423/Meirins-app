-- Table: foods
-- Macronutrient detail per 100g for each ingredient used in the app.
-- Values are approximate, sourced from standard nutritional databases (USDA / BEDCA).

create table if not exists foods (
  id            uuid primary key default gen_random_uuid(),
  name_es       text not null,
  name_en       text not null,
  name_fr       text not null,
  name_it       text not null,
  category      text not null,  -- proteins | grains_legumes | vegetables | fruits | nuts_seeds | pantry
  kcal          numeric(6,1),   -- per 100g or 100ml
  protein_g     numeric(5,2),
  carbs_g       numeric(5,2),
  fat_g         numeric(5,2),
  fiber_g       numeric(5,2),
  unit          text default 'g',  -- g | ml
  created_at    timestamptz default now()
);

-- Enable RLS (read-only for authenticated users)
alter table foods enable row level security;
create policy "foods_read" on foods for select using (auth.role() = 'authenticated');

-- ─── INSERT DATA ─────────────────────────────────────────────────────────────

insert into foods (name_es, name_en, name_fr, name_it, category, kcal, protein_g, carbs_g, fat_g, fiber_g, unit) values

-- ── Proteínas ────────────────────────────────────────────────────────────────
('Salmón fresco',       'Fresh salmon',            'Saumon frais',                   'Salmone fresco',           'proteins',       208.0, 20.1,  0.0,  13.4, 0.0,  'g'),
('Pechuga de pollo',    'Chicken breast',           'Blanc de poulet',                'Petto di pollo',           'proteins',       165.0, 31.0,  0.0,   3.6, 0.0,  'g'),
('Merluza (filetes)',   'Hake fillets',             'Filets de merlu',                'Filetti di nasello',       'proteins',        80.0, 17.8,  0.0,   0.7, 0.0,  'g'),
('Huevos',              'Eggs',                     'Œufs',                           'Uova',                     'proteins',       155.0, 12.6,  1.1,  10.6, 0.0,  'g'),
('Gambas frescas',      'Fresh prawns',             'Crevettes fraîches',             'Gamberi freschi',          'proteins',        85.0, 18.0,  0.9,   0.9, 0.0,  'g'),
('Pavo (filetes)',      'Turkey fillets',           'Filets de dinde',                'Fettine di tacchino',      'proteins',       104.0, 21.9,  0.0,   1.7, 0.0,  'g'),
('Tofu firme',          'Firm tofu',                'Tofu ferme',                     'Tofu compatto',            'proteins',        76.0,  8.1,  1.9,   4.2, 0.3,  'g'),
('Pollo (muslos)',      'Chicken thighs',           'Cuisses de poulet',              'Cosce di pollo',           'proteins',       209.0, 26.0,  0.0,  11.0, 0.0,  'g'),

-- ── Cereales y legumbres ──────────────────────────────────────────────────────
('Avena (copos)',        'Rolled oats',              'Flocons d''avoine',              'Fiocchi d''avena',         'grains_legumes', 379.0, 13.2, 67.7,   6.9, 10.1, 'g'),
('Quinoa',              'Quinoa',                   'Quinoa',                         'Quinoa',                   'grains_legumes', 368.0, 14.1, 64.2,   6.1,  7.0, 'g'),
('Pan de centeno',      'Rye bread',                'Pain de seigle',                 'Pane di segale',           'grains_legumes', 259.0,  8.5, 48.3,   3.3,  5.8, 'g'),
('Lentejas rojas',      'Red lentils',              'Lentilles rouges',               'Lenticchie rosse',         'grains_legumes', 352.0, 24.6, 63.3,   1.1, 10.8, 'g'),
('Boniato',             'Sweet potato',             'Patate douce',                   'Patata dolce',             'grains_legumes',  86.0,  1.6, 20.1,   0.1,  3.0, 'g'),
('Arroz integral',      'Brown rice',               'Riz complet',                    'Riso integrale',           'grains_legumes', 370.0,  7.9, 76.2,   2.9,  3.5, 'g'),
('Granola sin gluten',  'Gluten-free granola',      'Granola sans gluten',            'Granola senza glutine',    'grains_legumes', 420.0,  7.0, 64.0,  15.0,  5.0, 'g'),
('Pan integral',        'Wholegrain bread',         'Pain complet',                   'Pane integrale',           'grains_legumes', 247.0,  8.5, 41.3,   3.9,  6.9, 'g'),
('Fideos de arroz',     'Rice noodles',             'Nouilles de riz',                'Spaghetti di riso',        'grains_legumes', 364.0,  6.0, 80.2,   0.6,  1.8, 'g'),

-- ── Verduras ─────────────────────────────────────────────────────────────────
('Espinacas frescas',   'Fresh spinach',            'Épinards frais',                 'Spinaci freschi',          'vegetables',      23.0,  2.9,  3.6,   0.4,  2.2, 'g'),
('Ajos',                'Garlic cloves',            'Gousses d''ail',                 'Spicchi d''aglio',         'vegetables',     149.0,  6.4, 33.1,   0.5,  2.1, 'g'),
('Brócoli',             'Broccoli',                 'Brocoli',                        'Broccoli',                 'vegetables',      34.0,  2.8,  6.6,   0.4,  2.6, 'g'),
('Zanahoria',           'Carrot',                   'Carotte',                        'Carota',                   'vegetables',      41.0,  0.9,  9.6,   0.2,  2.8, 'g'),
('Espárragos',          'Asparagus',                'Asperges',                       'Asparagi',                 'vegetables',      20.0,  2.2,  3.9,   0.1,  2.1, 'g'),
('Pepino',              'Cucumber',                 'Concombre',                      'Cetriolo',                 'vegetables',      15.0,  0.7,  3.6,   0.1,  0.5, 'g'),
('Rúcula',              'Rocket / Arugula',         'Roquette',                       'Rucola',                   'vegetables',      25.0,  2.6,  3.7,   0.7,  1.6, 'g'),
('Tomate cherry',       'Cherry tomatoes',          'Tomates cerises',                'Pomodorini ciliegia',      'vegetables',      18.0,  0.9,  3.9,   0.2,  1.2, 'g'),
('Verduras mixtas (wok)','Mixed stir-fry vegetables','Légumes mixtes pour wok',       'Verdure miste per wok',    'vegetables',      30.0,  2.0,  6.0,   0.2,  2.5, 'g'),
('Verduras para sopa',  'Soup vegetables',          'Légumes pour soupe',             'Verdure per zuppa',        'vegetables',      25.0,  1.5,  5.0,   0.2,  2.0, 'g'),

-- ── Frutas ───────────────────────────────────────────────────────────────────
('Plátano',             'Banana',                   'Banane',                         'Banana',                   'fruits',          89.0,  1.1, 22.8,   0.3,  2.6, 'g'),
('Limones',             'Lemons',                   'Citrons',                        'Limoni',                   'fruits',          29.0,  1.1,  9.3,   0.3,  2.8, 'g'),
('Aguacate',            'Avocado',                  'Avocat',                         'Avocado',                  'fruits',         160.0,  2.0,  8.5,  14.7,  6.7, 'g'),
('Fruta de temporada',  'Seasonal fruit',           'Fruit de saison',                'Frutta di stagione',       'fruits',          50.0,  0.8, 12.0,   0.2,  2.0, 'g'),
('Frutos rojos',        'Berries',                  'Fruits rouges',                  'Frutti di bosco',          'fruits',          41.0,  1.2,  9.7,   0.5,  3.0, 'g'),
('Dátiles',             'Dates',                    'Dattes',                         'Datteri',                  'fruits',         282.0,  2.5, 75.0,   0.4,  8.0, 'g'),

-- ── Frutos secos y semillas ───────────────────────────────────────────────────
('Nueces',              'Walnuts',                  'Noix',                           'Noci',                     'nuts_seeds',     654.0, 15.2, 13.7,  65.2,  6.7, 'g'),
('Semillas de chía',    'Chia seeds',               'Graines de chia',                'Semi di chia',             'nuts_seeds',     486.0, 16.5, 42.1,  30.7, 34.4, 'g'),
('Pepitas de calabaza', 'Pumpkin seeds',            'Graines de courge',              'Semi di zucca',            'nuts_seeds',     559.0, 30.2, 10.7,  49.1,  6.5, 'g'),
('Semillas de sésamo',  'Sesame seeds',             'Graines de sésame',              'Semi di sesamo',           'nuts_seeds',     573.0, 17.7, 23.5,  49.7, 11.8, 'g'),
('Mantequilla de almendra','Almond butter',         'Purée d''amande',                'Crema di mandorle',        'nuts_seeds',     614.0, 20.8, 18.8,  55.5,  7.4, 'g'),
('Semillas de girasol', 'Sunflower seeds',          'Graines de tournesol',           'Semi di girasole',         'nuts_seeds',     584.0, 20.8, 20.0,  51.5,  8.6, 'g'),

-- ── Despensa ─────────────────────────────────────────────────────────────────
('Leche de avena',      'Oat milk',                 'Lait d''avoine',                 'Latte di avena',           'pantry',          45.0,  1.0,  6.6,   1.5,  0.8, 'ml'),
('Chocolate negro 85%', 'Dark chocolate 85%',       'Chocolat noir 85%',              'Cioccolato fondente 85%',  'pantry',         598.0,  8.0, 46.0,  43.0,  11.0,'g'),
('Aceite de oliva virgen','Extra virgin olive oil', 'Huile d''olive vierge',          'Olio extravergine di oliva','pantry',        884.0,  0.0,  0.0, 100.0,  0.0, 'ml'),
('Miel',                'Honey',                    'Miel',                           'Miele',                    'pantry',         304.0,  0.3, 82.4,   0.0,  0.2, 'g'),
('Jengibre fresco',     'Fresh ginger',             'Gingembre frais',                'Zenzero fresco',           'pantry',          80.0,  1.8, 17.8,   0.7,  2.0, 'g'),
('Cúrcuma molida',      'Ground turmeric',          'Curcuma en poudre',              'Curcuma in polvere',       'pantry',         354.0,  7.8, 64.9,   9.9,  21.1,'g'),
('Hummus',              'Hummus',                   'Houmous',                        'Hummus',                   'pantry',         177.0,  7.9, 14.3,  10.4,  6.0, 'g'),
('Kombucha natural',    'Plain kombucha',           'Kombucha nature',                'Kombucha naturale',        'pantry',          13.0,  0.0,  3.0,   0.0,  0.0, 'ml'),
('Leche de coco (lata)','Coconut milk (canned)',    'Lait de coco (en boîte)',        'Latte di cocco (in lattina)','pantry',       197.0,  2.0,  5.5,  21.3,  0.0, 'ml'),
('Matcha en polvo',     'Matcha powder',            'Poudre de matcha',               'Polvere di matcha',        'pantry',         324.0, 30.0, 38.0,   5.0, 37.0, 'g'),
('Caldo de pollo',      'Chicken stock',            'Bouillon de poulet',             'Brodo di pollo',           'pantry',           7.0,  0.7,  0.5,   0.2,  0.0, 'ml'),
('Salsa tamari',        'Tamari sauce',             'Sauce tamari',                   'Salsa tamari',             'pantry',          60.0,  7.0,  5.0,   0.0,  0.0, 'ml'),
('Aceite de sésamo',    'Sesame oil',               'Huile de sésame',                'Olio di sesamo',           'pantry',         884.0,  0.0,  0.0, 100.0,  0.0, 'ml');
