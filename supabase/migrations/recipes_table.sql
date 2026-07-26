-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Tabla recipes — base de 40 recetas etiquetadas
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipes (
  id                 TEXT        PRIMARY KEY,
  display_order      INT         NOT NULL DEFAULT 0,
  meal_type          TEXT        NOT NULL,
  emoji              TEXT,
  title              JSONB       NOT NULL,
  description        JSONB,

  prep_time_min      INT,
  cook_time_min      INT,
  servings           INT         DEFAULT 1,

  kcal               INT,
  protein_g          NUMERIC(5,1),
  carbs_g            NUMERIC(5,1),
  fat_g              NUMERIC(5,1),
  fiber_g            NUMERIC(5,1),

  diets              TEXT[]      DEFAULT '{}',
  phases             TEXT[]      DEFAULT '{}',
  goals              TEXT[]      DEFAULT '{}',
  good_for           TEXT[]      DEFAULT '{}',
  avoid_for          TEXT[]      DEFAULT '{}',
  contains_allergens TEXT[]      DEFAULT '{}',

  difficulty         TEXT        DEFAULT 'easy',
  cooking_bucket     TEXT        DEFAULT '20_to_40',
  budget             TEXT        DEFAULT 'medium',

  ingredients        JSONB,
  steps              JSONB,

  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recipes_meal_idx     ON recipes (meal_type);
CREATE INDEX IF NOT EXISTS recipes_diets_idx    ON recipes USING gin (diets);
CREATE INDEX IF NOT EXISTS recipes_phases_idx   ON recipes USING gin (phases);
CREATE INDEX IF NOT EXISTS recipes_goals_idx    ON recipes USING gin (goals);
CREATE INDEX IF NOT EXISTS recipes_good_idx     ON recipes USING gin (good_for);
CREATE INDEX IF NOT EXISTS recipes_allerg_idx   ON recipes USING gin (contains_allergens);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recipes_public_read" ON recipes;
CREATE POLICY "recipes_public_read" ON recipes FOR SELECT USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌅 DESAYUNOS (10)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO recipes (id,display_order,meal_type,emoji,title,description,prep_time_min,cook_time_min,kcal,protein_g,carbs_g,fat_g,fiber_g,diets,phases,goals,good_for,contains_allergens,difficulty,cooking_bucket,budget,ingredients,steps) VALUES

('porridge_chia_iron',1,'breakfast','🌾',
'{"es":"Porridge de avena con chía y plátano","en":"Oat porridge with chia and banana","fr":"Porridge avoine, chia et banane","it":"Porridge di avena, chia e banana"}',
'{"es":"Reconfortante y rico en hierro y magnesio, ideal fase menstrual","en":"Comforting, rich in iron and magnesium, ideal menstrual phase"}',
3,8,380,12,58,11,9,
ARRAY['standard','mediterranean','vegetarian','vegan','anti_inflammatory'],
ARRAY['menstrual','luteal'],
ARRAY['maintain','energy','reduce_symptoms'],
ARRAY['anemia','endometriosis'],
ARRAY['gluten'],
'easy','under_20','low',
'{"es":["80g copos de avena","200ml leche de avena","1 plátano maduro","1 cdta semillas de chía","½ cdta canela","1 cdta miel o sirope de agave"],"en":["80g oat flakes","200ml oat milk","1 ripe banana","1 tsp chia seeds","½ tsp cinnamon","1 tsp honey or agave syrup"]}',
'{"es":["Calienta la leche de avena en un cazo","Añade la avena y cocina 5 min removiendo","Vierte en un bol y lamina el plátano encima","Añade la chía, canela y la miel"],"en":["Heat oat milk in a saucepan","Add oats and cook 5 min stirring","Pour into a bowl and slice banana on top","Add chia, cinnamon and honey"]}'
),

('tortilla_espinacas_aguacate',2,'breakfast','🥚',
'{"es":"Tortilla de espinacas con aguacate","en":"Spinach omelette with avocado","fr":"Omelette épinards et avocat","it":"Frittata di spinaci con avocado"}',
'{"es":"Alta en proteína y grasas saludables, perfecta fase folicular","en":"High protein and healthy fats, perfect for follicular phase"}',
2,8,420,24,12,30,6,
ARRAY['standard','mediterranean','vegetarian','low_carb','keto','high_protein','anti_inflammatory'],
ARRAY['follicular','ovulation'],
ARRAY['lose_weight','gain_muscle','maintain','performance'],
ARRAY['pcos','type2_diabetes'],
ARRAY['egg'],
'easy','under_20','medium',
'{"es":["3 huevos","60g espinacas frescas","½ aguacate","1 cdta aceite oliva","Sal y pimienta"],"en":["3 eggs","60g fresh spinach","½ avocado","1 tsp olive oil","Salt and pepper"]}',
'{"es":["Saltea las espinacas 1 min","Bate los huevos, añade y cuaja 3-4 min","Sirve con aguacate laminado"],"en":["Sauté spinach 1 min","Beat eggs, add and set 3-4 min","Serve with sliced avocado"]}'
),

('yogur_griego_frutos_rojos',3,'breakfast','🍓',
'{"es":"Yogur griego con frutos rojos y nueces","en":"Greek yoghurt with berries and walnuts","fr":"Yaourt grec, fruits rouges et noix","it":"Yogurt greco con frutti di bosco e noci"}',
'{"es":"Antioxidantes, proteína y omega-3","en":"Antioxidants, protein and omega-3"}',
3,0,310,18,28,12,5,
ARRAY['standard','mediterranean','vegetarian','high_protein','anti_inflammatory'],
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','gain_muscle'],
ARRAY['pcos','endometriosis'],
ARRAY['lactose','nuts'],
'easy','under_20','medium',
'{"es":["200g yogur griego 0%","100g frutos rojos","20g nueces","1 cdta miel"],"en":["200g 0% Greek yoghurt","100g berries","20g walnuts","1 tsp honey"]}',
'{"es":["Sirve el yogur en un bol","Añade los frutos rojos","Espolvorea las nueces y miel"],"en":["Spoon yoghurt into a bowl","Top with berries","Sprinkle walnuts and honey"]}'
),

('smoothie_vegano_chia',4,'breakfast','🥤',
'{"es":"Smoothie de plátano, espinacas y semillas de lino","en":"Banana, spinach and flaxseed smoothie","fr":"Smoothie banane, épinards et lin","it":"Smoothie banana, spinaci e lino"}',
'{"es":"Vegano, antiinflamatorio y rico en hierro vegetal","en":"Vegan, anti-inflammatory and rich in plant iron"}',
5,0,290,9,45,9,8,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free'],
ARRAY['menstrual','follicular'],
ARRAY['maintain','energy','reduce_symptoms'],
ARRAY['anemia','endometriosis','pcos'],
ARRAY[]::text[],
'easy','under_20','low',
'{"es":["1 plátano","60g espinacas baby","250ml leche de avena","1 cda semillas de lino","1 cdta cacao puro","1 dátil"],"en":["1 banana","60g baby spinach","250ml oat milk","1 tbsp flaxseed","1 tsp pure cocoa","1 date"]}',
'{"es":["Pon todo en la batidora","Tritura 60 segundos","Sirve frío"],"en":["Add all to blender","Blend 60 seconds","Serve cold"]}'
),

('tostada_centeno_salmon',5,'breakfast','🐟',
'{"es":"Tostada de centeno con salmón y aguacate","en":"Rye toast with salmon and avocado","fr":"Tartine de seigle, saumon et avocat","it":"Toast di segale con salmone e avocado"}',
'{"es":"Omega-3 antiinflamatorios y proteína de calidad","en":"Anti-inflammatory omega-3 and quality protein"}',
3,0,380,22,26,20,6,
ARRAY['standard','mediterranean','pescatarian','anti_inflammatory','high_protein'],
ARRAY['menstrual','luteal'],
ARRAY['lose_weight','maintain','energy'],
ARRAY['endometriosis','pcos','hypertension'],
ARRAY['gluten'],
'easy','under_20','medium',
'{"es":["1 rebanada pan de centeno","60g salmón ahumado","½ aguacate","Zumo de limón","Pimienta negra"],"en":["1 slice rye bread","60g smoked salmon","½ avocado","Lemon juice","Black pepper"]}',
'{"es":["Tuesta el pan","Aplasta el aguacate con limón","Pon el salmón y termina con pimienta"],"en":["Toast the bread","Mash avocado with lemon","Top with salmon and pepper"]}'
),

('pancakes_proteicos_avena',6,'breakfast','🥞',
'{"es":"Pancakes proteicos de avena y plátano","en":"Protein oat and banana pancakes","fr":"Pancakes protéinés avoine et banane","it":"Pancake proteici di avena e banana"}',
'{"es":"Sin azúcar añadido, alta proteína, ideal post-entreno","en":"No added sugar, high protein, ideal post-workout"}',
5,10,400,32,42,10,7,
ARRAY['standard','vegetarian','high_protein'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','lose_weight','maintain','performance'],
ARRAY['pcos'],
ARRAY['egg','gluten','lactose'],
'easy','under_20','low',
'{"es":["50g copos de avena","1 plátano","2 huevos","30g proteína en polvo vainilla","½ cdta levadura química","Canela"],"en":["50g oat flakes","1 banana","2 eggs","30g vanilla protein powder","½ tsp baking powder","Cinnamon"]}',
'{"es":["Tritura todo en la batidora","Vierte porciones en sartén antiadherente","Cocina 2 min por lado a fuego medio","Sirve con fruta y yogur"],"en":["Blend everything together","Pour portions in non-stick pan","Cook 2 min per side over medium heat","Serve with fruit and yoghurt"]}'
),

('chia_pudding_coco',7,'breakfast','🥥',
'{"es":"Pudding de chía con leche de coco y mango","en":"Chia pudding with coconut milk and mango","fr":"Pudding de chia, lait de coco et mangue","it":"Pudding di chia, latte di cocco e mango"}',
'{"es":"Vegano, sin lactosa, omega-3 y fibra","en":"Vegan, lactose-free, omega-3 and fibre"}',
5,0,330,8,38,16,11,
ARRAY['vegan','vegetarian','anti_inflammatory','lactose_free','gluten_free','paleo'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','energy'],
ARRAY['endometriosis','pcos'],
ARRAY[]::text[],
'easy','under_20','medium',
'{"es":["3 cdas semillas de chía","200ml leche de coco","½ mango maduro","1 cdta sirope de arce","Coco rallado"],"en":["3 tbsp chia seeds","200ml coconut milk","½ ripe mango","1 tsp maple syrup","Grated coconut"]}',
'{"es":["Mezcla chía con leche de coco y sirope","Deja reposar 30 min o toda la noche","Sirve con mango y coco rallado"],"en":["Mix chia with coconut milk and syrup","Rest 30 min or overnight","Serve with mango and coconut"]}'
),

('tostada_paleo_huevo',8,'breakfast','🥑',
'{"es":"Aguacate machacado con huevo escalfado","en":"Smashed avocado with poached egg","fr":"Avocat écrasé et œuf poché","it":"Avocado schiacciato con uovo in camicia"}',
'{"es":"Paleo y keto, sin cereales, alta saciedad","en":"Paleo and keto, grain-free, very satiating"}',
5,5,390,18,8,32,7,
ARRAY['paleo','keto','low_carb','vegetarian','gluten_free','lactose_free','high_protein'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain'],
ARRAY['pcos','type2_diabetes'],
ARRAY['egg'],
'easy','under_20','medium',
'{"es":["1 aguacate","2 huevos","1 cda vinagre blanco","Limón, sal, pimienta","Pimentón ahumado"],"en":["1 avocado","2 eggs","1 tbsp white vinegar","Lemon, salt, pepper","Smoked paprika"]}',
'{"es":["Hierve agua con vinagre, escalfa los huevos 3 min","Aplasta el aguacate con limón y sal","Sirve los huevos sobre el aguacate","Termina con pimentón"],"en":["Boil water with vinegar, poach eggs 3 min","Mash avocado with lemon and salt","Serve eggs over avocado","Finish with paprika"]}'
),

('tortitas_boniato_lowfodmap',9,'breakfast','🥔',
'{"es":"Tortitas de boniato y avena (low FODMAP)","en":"Sweet potato and oat pancakes (low FODMAP)","fr":"Galettes patate douce et avoine (low FODMAP)","it":"Frittelle patata dolce e avena (low FODMAP)"}',
'{"es":"Aptas para intestino sensible, sin gluten ni lácteos","en":"Gut-friendly, no gluten or dairy"}',
8,10,340,12,52,9,6,
ARRAY['vegetarian','low_fodmap','gluten_free','lactose_free','anti_inflammatory'],
ARRAY['menstrual','follicular','luteal'],
ARRAY['maintain','reduce_symptoms','energy'],
ARRAY['ibs','endometriosis'],
ARRAY['egg'],
'easy','under_20','low',
'{"es":["150g boniato cocido","50g copos de avena certificada sin gluten","1 huevo","1 cdta canela","½ cdta jengibre","1 cdta sirope arce"],"en":["150g cooked sweet potato","50g certified gluten-free oats","1 egg","1 tsp cinnamon","½ tsp ginger","1 tsp maple syrup"]}',
'{"es":["Tritura el boniato con el huevo y la avena","Añade especias y sirope","Cocina porciones en sartén 2 min por lado"],"en":["Blend sweet potato with egg and oats","Add spices and syrup","Cook portions in pan 2 min per side"]}'
),

('bizcocho_calabacin_arandanos',10,'breakfast','🫐',
'{"es":"Bizcocho de calabacín y arándanos","en":"Courgette and blueberry loaf","fr":"Cake courgette et myrtilles","it":"Plumcake zucchine e mirtilli"}',
'{"es":"Esponjoso, antiinflamatorio y bajo en azúcar","en":"Fluffy, anti-inflammatory and low sugar"}',
10,35,290,9,32,14,5,
ARRAY['vegetarian','anti_inflammatory','mediterranean'],
ARRAY['follicular','luteal'],
ARRAY['maintain','energy'],
ARRAY['endometriosis'],
ARRAY['egg','gluten','nuts'],
'medium','over_60','medium',
'{"es":["150g harina de almendra","2 huevos","150g calabacín rallado","100g arándanos","50g sirope arce","1 cdta levadura","Canela"],"en":["150g almond flour","2 eggs","150g grated courgette","100g blueberries","50g maple syrup","1 tsp baking powder","Cinnamon"]}',
'{"es":["Precalienta horno 180°C","Mezcla harina, huevos, sirope y levadura","Incorpora el calabacín y arándanos","Hornea 35 min en molde forrado"],"en":["Preheat oven 180°C","Mix flour, eggs, syrup and baking powder","Fold in courgette and blueberries","Bake 35 min in lined tin"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- ☀️ ALMUERZOS (10)
-- ═══════════════════════════════════════════════════════════════════════════

('salmon_quinoa_brocoli',20,'lunch','🐠',
'{"es":"Salmón con quinoa y brócoli al vapor","en":"Salmon with quinoa and steamed broccoli","fr":"Saumon, quinoa et brocoli vapeur","it":"Salmone con quinoa e broccoli al vapore"}',
'{"es":"Plato completo: omega-3, proteína completa, fibra","en":"Complete meal: omega-3, complete protein, fibre"}',
5,18,540,38,42,18,8,
ARRAY['standard','mediterranean','pescatarian','anti_inflammatory','gluten_free','high_protein','low_carb'],
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','gain_muscle','performance'],
ARRAY['endometriosis','pcos','anemia','hypertension'],
ARRAY[]::text[],
'easy','20_to_40','medium',
'{"es":["150g salmón","80g quinoa","150g brócoli","1 cda aceite oliva","Limón, sal, pimienta"],"en":["150g salmon","80g quinoa","150g broccoli","1 tbsp olive oil","Lemon, salt, pepper"]}',
'{"es":["Cuece quinoa 15 min","Vaporiza brócoli 8 min","Dora el salmón 3-4 min por lado","Sirve con limón"],"en":["Cook quinoa 15 min","Steam broccoli 8 min","Sear salmon 3-4 min per side","Serve with lemon"]}'
),

('lentejas_verduras_hierro',21,'lunch','🍲',
'{"es":"Lentejas estofadas con verduras y limón","en":"Stewed lentils with vegetables and lemon","fr":"Lentilles mijotées aux légumes","it":"Lenticchie stufate con verdure"}',
'{"es":"Hierro vegetal absorbible con vitamina C","en":"Plant iron + vitamin C for absorption"}',
8,30,480,24,68,8,16,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','high_protein'],
ARRAY['menstrual','luteal'],
ARRAY['maintain','energy','reduce_symptoms'],
ARRAY['anemia','endometriosis','type2_diabetes'],
ARRAY[]::text[],
'easy','20_to_40','low',
'{"es":["150g lentejas pardinas","½ cebolla","1 zanahoria","1 tomate","Pimentón, comino","½ limón"],"en":["150g brown lentils","½ onion","1 carrot","1 tomato","Paprika, cumin","½ lemon"]}',
'{"es":["Sofríe cebolla y zanahoria","Añade tomate, especias y lentejas","Cuece 25 min con agua","Termina con limón"],"en":["Sauté onion and carrot","Add tomato, spices and lentils","Cook 25 min with water","Finish with lemon"]}'
),

('bowl_pollo_quinoa',22,'lunch','🍗',
'{"es":"Bowl de pollo, quinoa y verduras asadas","en":"Chicken, quinoa and roasted vegetables bowl","fr":"Bowl poulet, quinoa et légumes rôtis","it":"Bowl di pollo, quinoa e verdure"}',
'{"es":"Alta en proteína, ideal fuerza y músculo","en":"High protein, ideal for strength and muscle"}',
10,25,580,42,55,18,9,
ARRAY['standard','mediterranean','gluten_free','high_protein'],
ARRAY['follicular','ovulation'],
ARRAY['gain_muscle','maintain','performance','lose_weight'],
ARRAY['pcos'],
ARRAY[]::text[],
'easy','20_to_40','medium',
'{"es":["150g pollo","80g quinoa","150g calabacín y pimiento","1 cda aceite","Comino, pimentón"],"en":["150g chicken","80g quinoa","150g courgette and pepper","1 tbsp oil","Cumin, paprika"]}',
'{"es":["Asa verduras 25 min a 200°C","Cuece quinoa 15 min","Dora el pollo 6 min por lado","Monta el bowl"],"en":["Roast vegetables 25 min at 200°C","Cook quinoa 15 min","Sear chicken 6 min per side","Assemble bowl"]}'
),

('curry_garbanzos_vegano',23,'lunch','🍛',
'{"es":"Curry de garbanzos con espinacas y arroz basmati","en":"Chickpea and spinach curry with basmati","fr":"Curry de pois chiches, épinards et basmati","it":"Curry di ceci, spinaci e basmati"}',
'{"es":"Vegano, antiinflamatorio y muy completo","en":"Vegan, anti-inflammatory and complete"}',
8,20,510,18,78,12,14,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free'],
ARRAY['follicular','luteal'],
ARRAY['maintain','energy','reduce_symptoms'],
ARRAY['pcos','endometriosis'],
ARRAY[]::text[],
'easy','20_to_40','low',
'{"es":["1 lata garbanzos (240g)","150g espinacas","80g arroz basmati","200ml leche coco","Curry, jengibre, cúrcuma","½ cebolla"],"en":["1 can chickpeas (240g)","150g spinach","80g basmati rice","200ml coconut milk","Curry, ginger, turmeric","½ onion"]}',
'{"es":["Sofríe cebolla y especias","Añade garbanzos y leche de coco, cuece 10 min","Incorpora espinacas","Sirve con arroz cocido"],"en":["Sauté onion and spices","Add chickpeas and coconut milk, cook 10 min","Add spinach","Serve over rice"]}'
),

('ensalada_atun_huevo_keto',24,'lunch','🥗',
'{"es":"Ensalada keto de atún, huevo y aguacate","en":"Keto tuna, egg and avocado salad","fr":"Salade keto thon et avocat","it":"Insalata keto di tonno e avocado"}',
'{"es":"Baja en carbohidratos, alta en grasas saludables","en":"Low carb, healthy fats"}',
10,8,460,32,8,32,5,
ARRAY['standard','keto','low_carb','high_protein','pescatarian','gluten_free','lactose_free'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain'],
ARRAY['type2_diabetes','pcos'],
ARRAY['egg'],
'easy','under_20','medium',
'{"es":["120g atún en agua","2 huevos cocidos","½ aguacate","60g rúcula","10 aceitunas","1 cda aceite","Limón"],"en":["120g tuna in water","2 boiled eggs","½ avocado","60g rocket","10 olives","1 tbsp oil","Lemon"]}',
'{"es":["Cuece huevos 9 min","Coloca rúcula como base","Añade atún, huevos, aguacate y aceitunas","Aliña con aceite y limón"],"en":["Boil eggs 9 min","Use rocket as base","Add tuna, eggs, avocado, olives","Dress with oil and lemon"]}'
),

('cesar_pollo_low_carb',25,'lunch','🥗',
'{"es":"Ensalada César con pollo a la plancha","en":"Caesar salad with grilled chicken","fr":"Salade César au poulet grillé","it":"Insalata Cesare con pollo grigliato"}',
'{"es":"Clásico saciante y alto en proteína","en":"Classic filling and high in protein"}',
10,10,520,42,12,32,4,
ARRAY['standard','mediterranean','low_carb','high_protein'],
ARRAY['follicular','ovulation'],
ARRAY['lose_weight','gain_muscle','maintain','performance'],
ARRAY['pcos'],
ARRAY['egg','lactose','gluten'],
'easy','under_20','medium',
'{"es":["150g pechuga pollo","80g lechuga romana","30g parmesano","2 cdas salsa César ligera","Picatostes","Limón"],"en":["150g chicken breast","80g romaine lettuce","30g parmesan","2 tbsp light Caesar dressing","Croutons","Lemon"]}',
'{"es":["Sazona y dora el pollo 6 min por lado","Lava y corta la lechuga","Mezcla con salsa, parmesano y picatostes","Termina con pollo laminado"],"en":["Season and sear chicken 6 min per side","Wash and chop lettuce","Toss with dressing, parmesan and croutons","Top with sliced chicken"]}'
),

('buddha_tofu_batata',26,'lunch','🥬',
'{"es":"Buddha bowl de tofu, batata y kale","en":"Buddha bowl with tofu, sweet potato and kale","fr":"Buddha bowl tofu, patate douce et kale","it":"Buddha bowl tofu, patata dolce e kale"}',
'{"es":"Vegano, equilibrado, lleno de color y antioxidantes","en":"Vegan, balanced, full of colour and antioxidants"}',
10,30,540,26,62,18,12,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free','high_protein'],
ARRAY['menstrual','follicular','luteal'],
ARRAY['maintain','energy','reduce_symptoms','lose_weight'],
ARRAY['endometriosis','pcos','anemia'],
ARRAY['soy','sesame'],
'easy','20_to_40','medium',
'{"es":["150g tofu firme","150g batata","60g kale","60g quinoa","1 cda tahini","Limón, ajo, cúrcuma"],"en":["150g firm tofu","150g sweet potato","60g kale","60g quinoa","1 tbsp tahini","Lemon, garlic, turmeric"]}',
'{"es":["Asa la batata 25 min a 200°C","Cuece quinoa 15 min","Saltea tofu en cubos 6 min","Masajea el kale con limón","Monta el bowl con tahini"],"en":["Roast sweet potato 25 min at 200°C","Cook quinoa 15 min","Sauté tofu cubes 6 min","Massage kale with lemon","Assemble bowl with tahini"]}'
),

('pasta_integral_sardinas',27,'lunch','🍝',
'{"es":"Pasta integral con sardinas, limón y rúcula","en":"Whole-wheat pasta with sardines, lemon and rocket","fr":"Pâtes complètes, sardines, citron et roquette","it":"Pasta integrale con sarde, limone e rucola"}',
'{"es":"Plato mediterráneo, omega-3 y calcio","en":"Mediterranean dish, omega-3 and calcium"}',
5,12,560,32,62,18,10,
ARRAY['standard','mediterranean','pescatarian','anti_inflammatory','high_protein'],
ARRAY['menstrual','luteal'],
ARRAY['maintain','energy'],
ARRAY['endometriosis','anemia','hypertension'],
ARRAY['gluten'],
'easy','20_to_40','low',
'{"es":["80g pasta integral","1 lata sardinas en aceite (120g)","60g rúcula","1 limón","1 ajo","Guindilla, perejil"],"en":["80g whole-wheat pasta","1 can sardines in oil (120g)","60g rocket","1 lemon","1 garlic","Chilli, parsley"]}',
'{"es":["Cuece la pasta al dente","Sofríe ajo y guindilla con aceite de las sardinas","Añade las sardinas troceadas","Mezcla con pasta, rúcula y limón"],"en":["Cook pasta al dente","Sauté garlic and chilli in sardine oil","Add flaked sardines","Mix with pasta, rocket and lemon"]}'
),

('wrap_hummus_pavo',28,'lunch','🌯',
'{"es":"Wrap integral de hummus, pavo y verduras","en":"Whole-wheat wrap with hummus, turkey and veg","fr":"Wrap complet houmous, dinde et légumes","it":"Wrap integrale con hummus, tacchino e verdure"}',
'{"es":"Práctico, equilibrado, ideal para llevar","en":"Practical, balanced, great to take away"}',
8,0,460,32,48,14,9,
ARRAY['standard','mediterranean','high_protein'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','gain_muscle'],
ARRAY['pcos'],
ARRAY['gluten','sesame'],
'easy','under_20','low',
'{"es":["1 wrap integral","100g pavo en lonchas","3 cdas hummus","60g espinacas","½ pepino","1 zanahoria rallada"],"en":["1 whole-wheat wrap","100g turkey slices","3 tbsp hummus","60g spinach","½ cucumber","1 grated carrot"]}',
'{"es":["Unta el wrap con hummus","Coloca pavo, espinacas, pepino y zanahoria","Enrolla apretado y corta por la mitad"],"en":["Spread hummus on wrap","Add turkey, spinach, cucumber and carrot","Roll tight and cut in half"]}'
),

('ternera_salteada_paleo',29,'lunch','🥩',
'{"es":"Ternera salteada con pimientos y cebolla","en":"Beef stir-fry with peppers and onion","fr":"Bœuf sauté aux poivrons et oignon","it":"Manzo saltato con peperoni e cipolla"}',
'{"es":"Paleo, alta proteína, rica en hierro","en":"Paleo, high protein, iron-rich"}',
8,12,490,42,18,28,4,
ARRAY['standard','paleo','low_carb','high_protein','gluten_free','lactose_free'],
ARRAY['menstrual','follicular','ovulation'],
ARRAY['gain_muscle','maintain','performance'],
ARRAY['anemia','pcos'],
ARRAY[]::text[],
'easy','under_20','high',
'{"es":["180g solomillo de ternera","1 pimiento rojo","½ cebolla","2 cdas aceite oliva","Ajo, jengibre","Pimienta"],"en":["180g beef sirloin","1 red pepper","½ onion","2 tbsp olive oil","Garlic, ginger","Pepper"]}',
'{"es":["Corta la ternera en tiras","Saltea con aceite y ajo 2 min a fuego fuerte","Añade pimientos y cebolla, saltea 4 min más","Sazona y sirve"],"en":["Slice beef into strips","Stir-fry with oil and garlic 2 min on high","Add peppers and onion, stir-fry 4 min more","Season and serve"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌙 CENAS (10)
-- ═══════════════════════════════════════════════════════════════════════════

('crema_lentejas_rojas',40,'dinner','🍲',
'{"es":"Crema de lentejas rojas con cúrcuma y jengibre","en":"Red lentil soup with turmeric and ginger","fr":"Crème de lentilles corail au curcuma","it":"Crema di lenticchie rosse con curcuma"}',
'{"es":"Antiinflamatoria, reconfortante, fácil de digerir","en":"Anti-inflammatory, comforting, easy to digest"}',
5,25,350,18,52,6,12,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free','low_fodmap'],
ARRAY['menstrual','luteal'],
ARRAY['maintain','reduce_symptoms','energy'],
ARRAY['endometriosis','anemia','ibs'],
ARRAY[]::text[],
'easy','20_to_40','low',
'{"es":["150g lentejas rojas","1 zanahoria","1 cdta jengibre rallado","½ cdta cúrcuma","500ml caldo verduras"],"en":["150g red lentils","1 carrot","1 tsp grated ginger","½ tsp turmeric","500ml veg stock"]}',
'{"es":["Sofríe zanahoria y especias","Añade lentejas y caldo, cuece 20 min","Tritura hasta cremoso"],"en":["Sauté carrot and spices","Add lentils and stock, cook 20 min","Blend until creamy"]}'
),

('merluza_papillote_boniato',41,'dinner','🐠',
'{"es":"Merluza al papillote con boniato","en":"Hake en papillote with sweet potato","fr":"Merlu en papillote, patate douce","it":"Merluzzo al cartoccio, patata dolce"}',
'{"es":"Ligera, digestiva, sin grasa añadida","en":"Light, digestive, no added fat"}',
8,20,380,32,38,8,5,
ARRAY['standard','mediterranean','pescatarian','gluten_free','lactose_free','high_protein','anti_inflammatory'],
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','reduce_symptoms'],
ARRAY['endometriosis','hypertension'],
ARRAY[]::text[],
'easy','20_to_40','medium',
'{"es":["150g merluza","150g boniato","1 limón","Hierbas provenzales","1 cdta aceite"],"en":["150g hake","150g sweet potato","1 lemon","Provence herbs","1 tsp oil"]}',
'{"es":["Precalienta horno 200°C","Envuelve la merluza con limón y hierbas","Hornea con el boniato 25 min"],"en":["Preheat oven 200°C","Wrap hake with lemon and herbs","Bake with sweet potato 25 min"]}'
),

('tofu_salteado_brocoli',42,'dinner','🥦',
'{"es":"Tofu salteado con brócoli y sésamo","en":"Stir-fried tofu with broccoli and sesame","fr":"Tofu sauté, brocoli et sésame","it":"Tofu saltato con broccoli e sesamo"}',
'{"es":"Vegano, alto en proteína, rápido","en":"Vegan, high protein, quick"}',
5,12,340,22,18,18,7,
ARRAY['vegan','vegetarian','anti_inflammatory','lactose_free','high_protein','low_carb','gluten_free'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','gain_muscle','maintain'],
ARRAY['pcos','type2_diabetes'],
ARRAY['soy','sesame'],
'easy','under_20','medium',
'{"es":["200g tofu firme","150g brócoli","1 cda salsa soja","1 cda aceite sésamo","Ajo, jengibre"],"en":["200g firm tofu","150g broccoli","1 tbsp soy sauce","1 tbsp sesame oil","Garlic, ginger"]}',
'{"es":["Dora el tofu en cubos 5 min","Añade brócoli, ajo y jengibre, saltea 5 min","Riega con salsa de soja"],"en":["Brown tofu cubes 5 min","Add broccoli, garlic, ginger, stir-fry 5 min","Drizzle with soy sauce"]}'
),

('pollo_calabaza_keto',43,'dinner','🍗',
'{"es":"Pollo al horno con calabaza y romero","en":"Roast chicken with pumpkin and rosemary","fr":"Poulet rôti, courge et romarin","it":"Pollo al forno con zucca e rosmarino"}',
'{"es":"Low carb, fácil de preparar","en":"Low carb, easy to prepare"}',
5,30,420,38,18,22,5,
ARRAY['standard','mediterranean','low_carb','high_protein','gluten_free','lactose_free','anti_inflammatory'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','gain_muscle'],
ARRAY['pcos','hypertension','type2_diabetes'],
ARRAY[]::text[],
'easy','20_to_40','medium',
'{"es":["180g muslo pollo","200g calabaza","1 romero","1 cda aceite","Ajo, sal"],"en":["180g chicken thigh","200g pumpkin","1 rosemary","1 tbsp oil","Garlic, salt"]}',
'{"es":["Precalienta horno 200°C","Aliña pollo y calabaza con aceite y especias","Hornea 30 min"],"en":["Preheat oven 200°C","Dress chicken and pumpkin with oil and spices","Bake 30 min"]}'
),

('huevos_revueltos_aguacate',44,'dinner','🥑',
'{"es":"Revuelto de huevos con aguacate y rúcula","en":"Scrambled eggs with avocado and rocket","fr":"Œufs brouillés, avocat et roquette","it":"Uova strapazzate con avocado e rucola"}',
'{"es":"Cena ligera, keto, baja en carbohidratos","en":"Light dinner, keto, low carb"}',
3,5,350,20,8,28,5,
ARRAY['standard','vegetarian','keto','low_carb','high_protein','gluten_free'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain'],
ARRAY['pcos','type2_diabetes'],
ARRAY['egg'],
'easy','under_20','low',
'{"es":["3 huevos","½ aguacate","30g rúcula","1 cdta aceite","Pimentón"],"en":["3 eggs","½ avocado","30g rocket","1 tsp oil","Paprika"]}',
'{"es":["Bate los huevos","Cuájalos a fuego bajo 3 min","Sirve con rúcula y aguacate"],"en":["Beat the eggs","Cook over low heat 3 min","Serve with rocket and avocado"]}'
),

('sopa_miso_tofu_alga',45,'dinner','🍜',
'{"es":"Sopa miso con tofu y algas wakame","en":"Miso soup with tofu and wakame","fr":"Soupe miso au tofu et wakame","it":"Zuppa di miso con tofu e wakame"}',
'{"es":"Reconfortante, baja en calorías, llena de minerales","en":"Comforting, low-calorie, mineral-rich"}',
5,8,200,16,14,8,4,
ARRAY['vegan','vegetarian','anti_inflammatory','lactose_free','low_fodmap','high_protein','gluten_free'],
ARRAY['menstrual','luteal'],
ARRAY['lose_weight','reduce_symptoms','maintain'],
ARRAY['endometriosis','ibs','hypothyroid'],
ARRAY['soy'],
'easy','under_20','medium',
'{"es":["500ml agua","2 cdas pasta de miso","100g tofu firme","1 cda algas wakame","2 cebolletas"],"en":["500ml water","2 tbsp miso paste","100g firm tofu","1 tbsp wakame","2 spring onions"]}',
'{"es":["Hidrata las algas 5 min","Calienta el agua (sin hervir)","Disuelve el miso","Añade tofu en dados y wakame","Termina con cebolleta"],"en":["Soak wakame 5 min","Heat water (do not boil)","Dissolve miso","Add tofu cubes and wakame","Finish with spring onion"]}'
),

('lubina_esparragos_patata',46,'dinner','🐟',
'{"es":"Lubina al horno con espárragos y patata","en":"Roast sea bass with asparagus and potato","fr":"Bar rôti, asperges et pomme de terre","it":"Branzino al forno con asparagi e patate"}',
'{"es":"Mediterráneo, ligero y nutritivo","en":"Mediterranean, light and nutritious"}',
8,25,420,35,32,14,6,
ARRAY['standard','mediterranean','pescatarian','gluten_free','lactose_free','high_protein','anti_inflammatory'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','performance'],
ARRAY['endometriosis','hypertension','pcos'],
ARRAY[]::text[],
'easy','20_to_40','high',
'{"es":["1 lubina (200g)","150g espárragos verdes","150g patata","Limón, ajo","1 cda aceite oliva"],"en":["1 sea bass (200g)","150g green asparagus","150g potato","Lemon, garlic","1 tbsp olive oil"]}',
'{"es":["Precalienta horno 200°C","Corta patatas en rodajas finas y espárragos","Coloca el pescado encima con limón y ajo","Hornea 20-25 min"],"en":["Preheat oven 200°C","Slice potatoes thin, cut asparagus","Place fish on top with lemon and garlic","Bake 20-25 min"]}'
),

('albondigas_pavo_calabacin',47,'dinner','🍖',
'{"es":"Albóndigas de pavo con calabacín","en":"Turkey meatballs with courgette","fr":"Boulettes de dinde et courgette","it":"Polpette di tacchino con zucchina"}',
'{"es":"Alta proteína sin gluten ni lácteos","en":"High protein, no gluten or dairy"}',
10,18,400,38,18,18,5,
ARRAY['standard','paleo','low_carb','high_protein','gluten_free','lactose_free'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','lose_weight','maintain','performance'],
ARRAY['pcos','type2_diabetes'],
ARRAY['egg'],
'medium','20_to_40','medium',
'{"es":["180g pavo picado","1 huevo","1 calabacín","2 cdas almendra molida","Ajo, perejil","Aceite oliva"],"en":["180g ground turkey","1 egg","1 courgette","2 tbsp ground almond","Garlic, parsley","Olive oil"]}',
'{"es":["Mezcla pavo con huevo, almendra, ajo y perejil","Forma albóndigas pequeñas","Dora en sartén 10 min","Acompaña con calabacín salteado"],"en":["Mix turkey with egg, almond, garlic and parsley","Shape into small meatballs","Brown in pan 10 min","Serve with sautéed courgette"]}'
),

('risotto_calabaza_queso',48,'dinner','🍚',
'{"es":"Risotto de calabaza y parmesano","en":"Pumpkin and parmesan risotto","fr":"Risotto à la courge et parmesan","it":"Risotto alla zucca e parmigiano"}',
'{"es":"Cremoso, reconfortante, ideal otoño","en":"Creamy, comforting, perfect for autumn"}',
8,25,520,16,72,18,5,
ARRAY['standard','mediterranean','vegetarian','gluten_free'],
ARRAY['luteal','menstrual'],
ARRAY['maintain','energy','gain_muscle'],
ARRAY[]::text[],
ARRAY['lactose'],
'medium','20_to_40','medium',
'{"es":["80g arroz arborio","150g calabaza","500ml caldo verduras","½ cebolla","30g parmesano","1 cda aceite oliva"],"en":["80g arborio rice","150g pumpkin","500ml veg stock","½ onion","30g parmesan","1 tbsp olive oil"]}',
'{"es":["Sofríe cebolla y calabaza en cubos","Añade arroz y nacara 1 min","Incorpora caldo poco a poco removiendo 18 min","Termina con parmesano"],"en":["Sauté onion and pumpkin cubes","Add rice and toast 1 min","Add stock gradually stirring 18 min","Finish with parmesan"]}'
),

('salmon_teriyaki_arroz',49,'dinner','🍣',
'{"es":"Salmón teriyaki con arroz integral","en":"Teriyaki salmon with brown rice","fr":"Saumon teriyaki et riz complet","it":"Salmone teriyaki e riso integrale"}',
'{"es":"Asiático, sabroso y antiinflamatorio","en":"Asian, tasty and anti-inflammatory"}',
10,18,580,38,68,12,5,
ARRAY['standard','pescatarian','anti_inflammatory','high_protein'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','maintain','performance'],
ARRAY['endometriosis','pcos'],
ARRAY['soy'],
'medium','20_to_40','medium',
'{"es":["150g salmón","80g arroz integral","2 cdas salsa soja","1 cda miel","1 cdta jengibre","Sésamo"],"en":["150g salmon","80g brown rice","2 tbsp soy sauce","1 tbsp honey","1 tsp ginger","Sesame"]}',
'{"es":["Cuece el arroz integral 25 min","Mezcla soja, miel y jengibre","Marina el salmón 5 min y dóralo 4 min por lado","Glasea con la salsa","Termina con sésamo"],"en":["Cook brown rice 25 min","Mix soy, honey and ginger","Marinade salmon 5 min and sear 4 min per side","Glaze with sauce","Finish with sesame"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🍎 SNACKS (10)
-- ═══════════════════════════════════════════════════════════════════════════

('hummus_crudites',60,'morning_snack','🥕',
'{"es":"Hummus casero con bastones de zanahoria","en":"Homemade hummus with carrot sticks","fr":"Houmous maison et carotte","it":"Hummus fatto in casa e carote"}',
'{"es":"Saciante, fibra y proteína vegetal","en":"Filling, fibre and plant protein"}',
5,0,220,8,28,9,7,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free'],
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain','energy'],
ARRAY['pcos'],
ARRAY['sesame'],
'easy','under_20','low',
'{"es":["100g hummus","2 zanahorias en bastones","1 pepino en bastones"],"en":["100g hummus","2 carrots in sticks","1 cucumber in sticks"]}',
'{"es":["Sirve el hummus en un bol","Acompáñalo con las verduras"],"en":["Serve hummus in a bowl","Pair with vegetables"]}'
),

('chocolate_negro_almendras',61,'afternoon_snack','🍫',
'{"es":"Chocolate negro 85% con almendras","en":"85% dark chocolate with almonds","fr":"Chocolat noir 85% et amandes","it":"Cioccolato fondente 85% e mandorle"}',
'{"es":"Magnesio y antiinflamatorio, ideal SPM","en":"Magnesium and anti-inflammatory, ideal PMS"}',
1,0,200,5,12,15,4,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free'],
ARRAY['menstrual','luteal'],
ARRAY['maintain','reduce_symptoms'],
ARRAY['endometriosis','pcos'],
ARRAY['nuts'],
'easy','under_20','low',
'{"es":["20g chocolate negro 85%","15g almendras crudas"],"en":["20g 85% dark chocolate","15g raw almonds"]}',
'{"es":["Sirve juntos como tentempié"],"en":["Serve together as a snack"]}'
),

('manzana_mantequilla_cacahuete',62,'afternoon_snack','🍎',
'{"es":"Manzana con mantequilla de cacahuete","en":"Apple with peanut butter","fr":"Pomme et beurre de cacahuète","it":"Mela e burro di arachidi"}',
'{"es":"Carbohidrato + grasa + proteína, sacia y aporta energía","en":"Carb + fat + protein, filling and energising"}',
2,0,250,7,28,14,5,
ARRAY['vegan','vegetarian','standard','lactose_free','gluten_free'],
ARRAY['follicular','ovulation'],
ARRAY['gain_muscle','maintain','energy','performance'],
ARRAY[]::text[],
ARRAY['nuts'],
'easy','under_20','low',
'{"es":["1 manzana","2 cdas mantequilla cacahuete","Canela"],"en":["1 apple","2 tbsp peanut butter","Cinnamon"]}',
'{"es":["Corta la manzana en gajos","Sirve con mantequilla y canela"],"en":["Slice apple","Serve with butter and cinnamon"]}'
),

('yogur_proteico_canela',63,'afternoon_snack','🥛',
'{"es":"Yogur proteico con canela y nueces","en":"Protein yoghurt with cinnamon and walnuts","fr":"Yaourt protéiné, cannelle et noix","it":"Yogurt proteico, cannella e noci"}',
'{"es":"Alto en proteína, ideal post-entreno","en":"High protein, ideal post-workout"}',
2,0,240,22,12,10,2,
ARRAY['standard','vegetarian','high_protein','low_carb'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','lose_weight','maintain','performance'],
ARRAY['pcos','type2_diabetes'],
ARRAY['lactose','nuts'],
'easy','under_20','medium',
'{"es":["200g yogur griego 0%","15g nueces","Canela","1 cdta miel"],"en":["200g 0% Greek yoghurt","15g walnuts","Cinnamon","1 tsp honey"]}',
'{"es":["Sirve yogur en bol","Añade nueces, canela y miel"],"en":["Serve yoghurt in bowl","Add walnuts, cinnamon, honey"]}'
),

('dates_walnuts_simple',64,'morning_snack','🌰',
'{"es":"Dátiles rellenos de nueces","en":"Walnut-stuffed dates","fr":"Dattes farcies aux noix","it":"Datteri ripieni di noci"}',
'{"es":"Energía rápida natural, ideal pre-entreno","en":"Quick natural energy, ideal pre-workout"}',
2,0,180,3,32,6,3,
ARRAY['vegan','vegetarian','mediterranean','lactose_free','gluten_free'],
ARRAY['follicular','ovulation'],
ARRAY['energy','performance','maintain'],
ARRAY[]::text[],
ARRAY['nuts'],
'easy','under_20','low',
'{"es":["4 dátiles Medjool","8 mitades de nuez"],"en":["4 Medjool dates","8 walnut halves"]}',
'{"es":["Abre cada dátil","Rellena con 2 mitades de nuez"],"en":["Open each date","Stuff with 2 walnut halves"]}'
),

('batido_proteico_fresa',65,'afternoon_snack','🥤',
'{"es":"Batido proteico de fresa post-entreno","en":"Post-workout strawberry protein shake","fr":"Shake protéiné fraise post-entraînement","it":"Frullato proteico alla fragola post-allenamento"}',
'{"es":"Alta proteína para recuperación muscular","en":"High protein for muscle recovery"}',
3,0,210,28,18,3,3,
ARRAY['standard','vegetarian','high_protein','low_carb'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','performance','lose_weight'],
ARRAY['pcos'],
ARRAY['lactose'],
'easy','under_20','medium',
'{"es":["30g proteína whey","100g fresas","250ml leche desnatada o vegetal","Hielo"],"en":["30g whey protein","100g strawberries","250ml skimmed or plant milk","Ice"]}',
'{"es":["Pon todo en la batidora","Tritura 30 segundos","Sirve frío"],"en":["Put all in blender","Blend 30 seconds","Serve cold"]}'
),

('edamame_sal',66,'morning_snack','🫛',
'{"es":"Edamame con sal marina","en":"Edamame with sea salt","fr":"Edamame au sel marin","it":"Edamame con sale marino"}',
'{"es":"Proteína vegetal completa, ideal vegana","en":"Complete plant protein, ideal vegan"}',
2,5,180,17,14,6,8,
ARRAY['vegan','vegetarian','high_protein','low_carb','gluten_free','lactose_free','anti_inflammatory'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['gain_muscle','lose_weight','maintain'],
ARRAY['pcos'],
ARRAY['soy'],
'easy','under_20','low',
'{"es":["150g edamame con vaina","Sal marina","Limón (opcional)"],"en":["150g edamame in pods","Sea salt","Lemon (optional)"]}',
'{"es":["Hierve el edamame 4 min","Escurre y espolvorea sal","Sirve caliente o templado"],"en":["Boil edamame 4 min","Drain and sprinkle salt","Serve warm or room temp"]}'
),

('tostada_tomate_atun',67,'afternoon_snack','🍞',
'{"es":"Tostada con tomate, atún y aceite de oliva","en":"Toast with tomato, tuna and olive oil","fr":"Tartine tomate, thon et huile d''olive","it":"Toast con pomodoro, tonno e olio d''oliva"}',
'{"es":"Mediterránea, simple y completa","en":"Mediterranean, simple and complete"}',
3,2,260,18,22,12,3,
ARRAY['standard','mediterranean','pescatarian','high_protein','anti_inflammatory','lactose_free'],
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['maintain','lose_weight','energy'],
ARRAY['endometriosis','hypertension'],
ARRAY['gluten'],
'easy','under_20','low',
'{"es":["1 rebanada pan integral","½ tomate maduro","60g atún en aceite escurrido","1 cdta aceite oliva","Sal"],"en":["1 slice whole bread","½ ripe tomato","60g tuna in oil drained","1 tsp olive oil","Salt"]}',
'{"es":["Tuesta el pan","Frota con tomate y rocía con aceite","Cubre con el atún"],"en":["Toast the bread","Rub with tomato and drizzle oil","Top with tuna"]}'
),

('bolitas_cacao_dates',68,'morning_snack','⚫',
'{"es":"Bolitas energéticas de cacao y dátiles","en":"Cocoa-date energy balls","fr":"Boules énergétiques cacao et dattes","it":"Palline energetiche cacao e datteri"}',
'{"es":"Snack pre-entreno casero sin azúcar añadido","en":"Homemade pre-workout snack, no added sugar"}',
10,0,200,5,28,9,4,
ARRAY['vegan','vegetarian','mediterranean','anti_inflammatory','lactose_free','gluten_free','paleo'],
ARRAY['follicular','ovulation'],
ARRAY['energy','performance','maintain'],
ARRAY[]::text[],
ARRAY['nuts'],
'easy','under_20','low',
'{"es":["6 dátiles Medjool","30g almendras","2 cdas cacao puro","1 cdta aceite coco","Pizca de sal"],"en":["6 Medjool dates","30g almonds","2 tbsp pure cocoa","1 tsp coconut oil","Pinch of salt"]}',
'{"es":["Tritura almendras hasta polvo","Añade dátiles, cacao y aceite","Forma bolitas con las manos","Refrigera 30 min"],"en":["Process almonds to powder","Add dates, cocoa and oil","Roll into balls","Chill 30 min"]}'
),

('pepino_queso_fresco',69,'afternoon_snack','🥒',
'{"es":"Rodajas de pepino con queso fresco y eneldo","en":"Cucumber rounds with cottage cheese and dill","fr":"Concombre, fromage frais et aneth","it":"Cetriolo, ricotta ed aneto"}',
'{"es":"Ligero, refrescante, bajo en calorías","en":"Light, refreshing, low calorie"}',
5,0,140,14,8,6,2,
ARRAY['standard','vegetarian','high_protein','low_carb','gluten_free'],
ARRAY['follicular','ovulation','luteal'],
ARRAY['lose_weight','maintain'],
ARRAY['pcos','hypertension'],
ARRAY['lactose'],
'easy','under_20','low',
'{"es":["½ pepino en rodajas","100g queso fresco batido","Eneldo fresco","Pimienta"],"en":["½ cucumber in rounds","100g cottage cheese","Fresh dill","Pepper"]}',
'{"es":["Coloca rodajas de pepino en plato","Pon una cucharadita de queso fresco encima de cada una","Termina con eneldo y pimienta"],"en":["Place cucumber rounds on plate","Top each with a tsp of cottage cheese","Finish with dill and pepper"]}'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════
SELECT meal_type, COUNT(*) AS total
FROM recipes
GROUP BY meal_type
ORDER BY total DESC;
