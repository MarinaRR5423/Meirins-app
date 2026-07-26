-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Tabla workouts — base de 20 entrenamientos etiquetados
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workouts (
  id                 TEXT        PRIMARY KEY,
  display_order      INT         NOT NULL DEFAULT 0,
  workout_type       TEXT        NOT NULL,
  emoji              TEXT,
  name               JSONB       NOT NULL,
  description        JSONB,

  duration_min       INT,
  intensity          TEXT,
  est_calories       INT,

  phases             TEXT[]      DEFAULT '{}',
  fitness_levels     TEXT[]      DEFAULT '{}',
  equipment          TEXT[]      DEFAULT '{}',
  goals              TEXT[]      DEFAULT '{}',
  good_for           TEXT[]      DEFAULT '{}',
  avoid_for          TEXT[]      DEFAULT '{}',

  exercises          JSONB,
  tips               JSONB,

  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workouts_type_idx       ON workouts (workout_type);
CREATE INDEX IF NOT EXISTS workouts_phases_idx     ON workouts USING gin (phases);
CREATE INDEX IF NOT EXISTS workouts_fitness_idx    ON workouts USING gin (fitness_levels);
CREATE INDEX IF NOT EXISTS workouts_equipment_idx  ON workouts USING gin (equipment);
CREATE INDEX IF NOT EXISTS workouts_good_idx       ON workouts USING gin (good_for);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workouts_public_read" ON workouts;
CREATE POLICY "workouts_public_read" ON workouts FOR SELECT USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌙 MENSTRUAL · Recuperación + descanso activo (5)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO workouts (id,display_order,workout_type,emoji,name,description,duration_min,intensity,est_calories,phases,fitness_levels,equipment,goals,good_for,avoid_for,exercises,tips) VALUES

('yoga_restaurativo_30',1,'yoga','🧘',
'{"es":"Yoga restaurativo suave","en":"Restorative yoga","fr":"Yoga restauratif","it":"Yoga restorativo"}',
'{"es":"Posturas pasivas para liberar tensión y nutrir el sistema nervioso","en":"Passive poses to release tension and nourish nervous system"}',
30,'low',80,
ARRAY['menstrual'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['home','full_gym','basic_gym'],
ARRAY['reduce_symptoms','energy','rehab'],
ARRAY['endometriosis','pmdd','adenomyosis','anemia','hypothyroid'],
ARRAY[]::text[],
'{"es":[{"name":"Postura del niño (Balasana)","dur":"3 min"},{"name":"Torsión espinal suave","dur":"2 min c/lado"},{"name":"Piernas en la pared","dur":"5 min"},{"name":"Mariposa reclinada","dur":"5 min"},{"name":"Savasana","dur":"10 min"}],"en":[{"name":"Child''s pose (Balasana)","dur":"3 min"},{"name":"Gentle spinal twist","dur":"2 min/side"},{"name":"Legs up the wall","dur":"5 min"},{"name":"Reclined butterfly","dur":"5 min"},{"name":"Savasana","dur":"10 min"}]}',
'{"es":["Respira por la nariz, alarga la espiración","Mantén cada postura sin forzar","Usa cojines o mantas para más comodidad"],"en":["Breathe through nose, extend exhale","Hold poses without forcing","Use pillows or blankets for support"]}'
),

('paseo_suave_30',2,'cardio','🚶',
'{"es":"Paseo suave al aire libre","en":"Gentle outdoor walk","fr":"Marche douce en extérieur","it":"Camminata leggera all''aperto"}',
'{"es":"Caminata a ritmo cómodo para activar circulación sin esfuerzo","en":"Easy-pace walk to boost circulation without effort"}',
30,'low',120,
ARRAY['menstrual','luteal'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['outdoor'],
ARRAY['reduce_symptoms','energy','maintain'],
ARRAY['endometriosis','pmdd','hypertension','type2_diabetes'],
ARRAY[]::text[],
'{"es":[{"name":"Caminata a ritmo cómodo","dur":"30 min"},{"name":"Respiración profunda caminando","dur":"todo el paseo"}],"en":[{"name":"Comfortable-pace walking","dur":"30 min"},{"name":"Deep breathing while walking","dur":"whole walk"}]}',
'{"es":["Hazlo en la naturaleza si puedes","Sin auriculares: escucha tu cuerpo","Si hace frío, abrígate bien"],"en":["Do it in nature if possible","No headphones: listen to your body","Dress warmly if cold"]}'
),

('estiramientos_full_25',3,'mobility','🙆',
'{"es":"Estiramientos de cuerpo entero","en":"Full-body stretches","fr":"Étirements corps entier","it":"Stretching corpo intero"}',
'{"es":"Sesión de movilidad para aliviar dolor lumbar y caderas","en":"Mobility session to ease lower back and hip pain"}',
25,'low',60,
ARRAY['menstrual','luteal'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['home','outdoor','basic_gym'],
ARRAY['reduce_symptoms','rehab','energy'],
ARRAY['endometriosis','pmdd','adenomyosis'],
ARRAY[]::text[],
'{"es":[{"name":"Estiramiento de caderas","dur":"2 min c/lado"},{"name":"Apertura de pecho","dur":"3 min"},{"name":"Estiramiento lumbar","dur":"3 min"},{"name":"Postura del gato-vaca","dur":"3 min"},{"name":"Relajación con respiración","dur":"10 min"}],"en":[{"name":"Hip stretch","dur":"2 min/side"},{"name":"Chest opener","dur":"3 min"},{"name":"Lower back stretch","dur":"3 min"},{"name":"Cat-cow pose","dur":"3 min"},{"name":"Breathing relaxation","dur":"10 min"}]}',
'{"es":["Mueve solo hasta donde sientas suave estiramiento","Si hay dolor agudo, para","Calienta con manta térmica si es muy doloroso el primer día"],"en":["Move only into gentle stretch","Stop if sharp pain","Use heating pad if first day is very painful"]}'
),

('pilates_suave_35',4,'pilates','🤸',
'{"es":"Pilates suave de suelo","en":"Gentle mat pilates","fr":"Pilates doux au sol","it":"Pilates dolce a terra"}',
'{"es":"Fortalece core sin impacto, ideal cuando hay dolor menstrual","en":"Builds core without impact, ideal when in menstrual pain"}',
35,'low',150,
ARRAY['menstrual','luteal'],
ARRAY['occasional','regular','athlete'],
ARRAY['home','basic_gym','full_gym'],
ARRAY['reduce_symptoms','maintain','rehab'],
ARRAY['endometriosis','pmdd'],
ARRAY[]::text[],
'{"es":[{"name":"The Hundred (modificado)","sets":3,"reps":"10 resp"},{"name":"Roll Up suave","sets":3,"reps":"8"},{"name":"Single Leg Stretch","sets":2,"reps":"10 c/lado"},{"name":"Glute Bridge","sets":3,"reps":"12"},{"name":"Cat-Cow","sets":2,"reps":"10"},{"name":"Estiramiento final","dur":"5 min"}],"en":[{"name":"The Hundred (modified)","sets":3,"reps":"10 breaths"},{"name":"Gentle Roll Up","sets":3,"reps":"8"},{"name":"Single Leg Stretch","sets":2,"reps":"10/side"},{"name":"Glute Bridge","sets":3,"reps":"12"},{"name":"Cat-Cow","sets":2,"reps":"10"},{"name":"Final stretch","dur":"5 min"}]}',
'{"es":["Activa el core en cada movimiento","No forces si hay calambres","Respira lento y profundo"],"en":["Engage core every move","Don''t force if cramping","Breathe slowly and deeply"]}'
),

('paseo_naturaleza_45',5,'cardio','🌿',
'{"es":"Caminata en naturaleza","en":"Nature hike","fr":"Marche en nature","it":"Camminata in natura"}',
'{"es":"Conexión con la naturaleza, terreno suave, sin prisa","en":"Nature connection, soft terrain, no rush"}',
45,'low',180,
ARRAY['menstrual','luteal','follicular'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['outdoor'],
ARRAY['energy','maintain','reduce_symptoms'],
ARRAY['endometriosis','pmdd','hypertension'],
ARRAY[]::text[],
'{"es":[{"name":"Caminata terreno natural","dur":"45 min"},{"name":"Pausas de observación","dur":"a tu ritmo"}],"en":[{"name":"Natural terrain walk","dur":"45 min"},{"name":"Observation pauses","dur":"at your pace"}]}',
'{"es":["Sin tecnología, presencia plena","Hidrátate cada 15 min","Lleva snack si vas lejos"],"en":["No tech, full presence","Hydrate every 15 min","Bring snack if going far"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌒 FOLICULAR · Alta intensidad + fuerza (5)
-- ═══════════════════════════════════════════════════════════════════════════

('hiit_30',10,'hiit','🔥',
'{"es":"HIIT explosivo full-body","en":"Explosive full-body HIIT","fr":"HIIT explosif full-body","it":"HIIT esplosivo full-body"}',
'{"es":"Intervalos intensos para quemar grasa y mejorar condición cardiovascular","en":"Intense intervals to burn fat and improve cardio"}',
30,'high',350,
ARRAY['follicular','ovulation'],
ARRAY['regular','athlete'],
ARRAY['home','basic_gym','full_gym'],
ARRAY['lose_weight','performance','gain_muscle'],
ARRAY['pcos','type2_diabetes'],
ARRAY['pregnant','postpartum'],
'{"es":[{"name":"Burpees","sets":4,"reps":"12"},{"name":"Jump squats","sets":3,"reps":"15"},{"name":"Mountain climbers","sets":3,"dur":"45s"},{"name":"High knees","sets":3,"dur":"45s"},{"name":"Push-ups","sets":3,"reps":"12"},{"name":"Plank","sets":3,"dur":"45s"}],"en":[{"name":"Burpees","sets":4,"reps":"12"},{"name":"Jump squats","sets":3,"reps":"15"},{"name":"Mountain climbers","sets":3,"dur":"45s"},{"name":"High knees","sets":3,"dur":"45s"},{"name":"Push-ups","sets":3,"reps":"12"},{"name":"Plank","sets":3,"dur":"45s"}]}',
'{"es":["Calienta 5 min antes","Descanso 30s entre series","Si el HIIT eleva tu cortisol (SOP severo), elige fuerza moderada"],"en":["Warm up 5 min first","30s rest between sets","If HIIT raises your cortisol (severe PCOS), choose moderate strength"]}'
),

('fuerza_piernas_45',11,'strength','🦵',
'{"es":"Fuerza de piernas y glúteos","en":"Lower body strength","fr":"Force jambes et fessiers","it":"Forza gambe e glutei"}',
'{"es":"Trabajo de fuerza tradicional para tren inferior","en":"Traditional lower body strength work"}',
45,'high',300,
ARRAY['follicular','ovulation'],
ARRAY['occasional','regular','athlete'],
ARRAY['full_gym','basic_gym','home'],
ARRAY['gain_muscle','lose_weight','performance','maintain'],
ARRAY['pcos','type2_diabetes','hypothyroid'],
ARRAY[]::text[],
'{"es":[{"name":"Sentadilla con peso","sets":4,"reps":"12"},{"name":"Peso muerto rumano","sets":3,"reps":"10"},{"name":"Zancadas alternadas","sets":3,"reps":"12 c/lado"},{"name":"Hip thrust","sets":4,"reps":"15"},{"name":"Prensa de piernas","sets":3,"reps":"12"},{"name":"Elevación de pantorrillas","sets":3,"reps":"15"}],"en":[{"name":"Weighted squat","sets":4,"reps":"12"},{"name":"Romanian deadlift","sets":3,"reps":"10"},{"name":"Alternating lunges","sets":3,"reps":"12/side"},{"name":"Hip thrust","sets":4,"reps":"15"},{"name":"Leg press","sets":3,"reps":"12"},{"name":"Calf raises","sets":3,"reps":"15"}]}',
'{"es":["Aprovecha esta fase para subir cargas","Técnica primero, peso después","2 min descanso entre series fuerza"],"en":["Use this phase to add load","Technique first, weight second","2 min rest between strength sets"]}'
),

('carrera_45',12,'cardio','🏃',
'{"es":"Carrera continua aeróbica","en":"Steady-state running","fr":"Course continue aérobie","it":"Corsa continua aerobica"}',
'{"es":"Carrera a ritmo moderado-alto, base aeróbica","en":"Moderate-high pace running, aerobic base"}',
45,'high',450,
ARRAY['follicular','ovulation'],
ARRAY['occasional','regular','athlete'],
ARRAY['outdoor'],
ARRAY['lose_weight','performance','maintain','energy'],
ARRAY['pcos','type2_diabetes','hypertension'],
ARRAY['pregnant'],
'{"es":[{"name":"Calentamiento trotando","dur":"5 min"},{"name":"Carrera a ritmo moderado","dur":"30 min"},{"name":"Sprints suaves","sets":4,"dur":"30s"},{"name":"Vuelta a la calma","dur":"5 min"}],"en":[{"name":"Jog warm-up","dur":"5 min"},{"name":"Moderate-pace run","dur":"30 min"},{"name":"Light sprints","sets":4,"dur":"30s"},{"name":"Cool-down","dur":"5 min"}]}',
'{"es":["Hidrátate antes y durante","Buenas zapatillas, evita asfalto duro","Estira al terminar"],"en":["Hydrate before and during","Good shoes, avoid hard asphalt","Stretch at the end"]}'
),

('fuerza_upper_45',13,'strength','💪',
'{"es":"Fuerza tren superior","en":"Upper body strength","fr":"Force haut du corps","it":"Forza parte superiore"}',
'{"es":"Espalda, pecho, hombros y brazos. Sesión completa","en":"Back, chest, shoulders and arms. Complete session"}',
45,'high',280,
ARRAY['follicular','ovulation'],
ARRAY['occasional','regular','athlete'],
ARRAY['full_gym','basic_gym'],
ARRAY['gain_muscle','lose_weight','performance','maintain'],
ARRAY['pcos','hypothyroid','type2_diabetes'],
ARRAY[]::text[],
'{"es":[{"name":"Press banca con barra","sets":4,"reps":"10"},{"name":"Remo con polea","sets":4,"reps":"12"},{"name":"Press militar","sets":3,"reps":"10"},{"name":"Dominadas asistidas","sets":3,"reps":"8"},{"name":"Curl de bíceps","sets":3,"reps":"12"},{"name":"Fondos en banco","sets":3,"reps":"12"}],"en":[{"name":"Barbell bench press","sets":4,"reps":"10"},{"name":"Cable row","sets":4,"reps":"12"},{"name":"Overhead press","sets":3,"reps":"10"},{"name":"Assisted pull-ups","sets":3,"reps":"8"},{"name":"Biceps curl","sets":3,"reps":"12"},{"name":"Bench dips","sets":3,"reps":"12"}]}',
'{"es":["Calienta hombros 5 min antes","Apoya espalda en bancos para evitar lesiones lumbares","Postura erguida en todo momento"],"en":["Warm up shoulders 5 min","Use bench back support to avoid lower back injury","Keep upright posture always"]}'
),

('crossfit_amrap_25',14,'hiit','⚡',
'{"es":"AMRAP estilo CrossFit","en":"CrossFit-style AMRAP","fr":"AMRAP style CrossFit","it":"AMRAP stile CrossFit"}',
'{"es":"As Many Rounds As Possible: máximo número de rondas en 20 min","en":"As Many Rounds As Possible in 20 min"}',
25,'peak',380,
ARRAY['follicular','ovulation'],
ARRAY['regular','athlete'],
ARRAY['basic_gym','full_gym','home'],
ARRAY['lose_weight','gain_muscle','performance'],
ARRAY['type2_diabetes'],
ARRAY['pregnant','postpartum'],
'{"es":[{"name":"Calentamiento","dur":"5 min"},{"name":"Air squats","reps":"15"},{"name":"Push-ups","reps":"10"},{"name":"Sit-ups","reps":"15"},{"name":"Kettlebell swings","reps":"15"},{"name":"AMRAP en 20 min","dur":"20 min"}],"en":[{"name":"Warm-up","dur":"5 min"},{"name":"Air squats","reps":"15"},{"name":"Push-ups","reps":"10"},{"name":"Sit-ups","reps":"15"},{"name":"Kettlebell swings","reps":"15"},{"name":"AMRAP in 20 min","dur":"20 min"}]}',
'{"es":["Apunta tus rondas para batir marca la próxima vez","Mantén la técnica aunque te canses","Si fallas técnica, descansa 30s"],"en":["Count your rounds to beat your record","Keep technique even when tired","Rest 30s if technique fails"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌕 OVULACIÓN · Pico de rendimiento (3)
-- ═══════════════════════════════════════════════════════════════════════════

('boxeo_funcional_45',20,'hiit','🥊',
'{"es":"Boxeo funcional con bolsa","en":"Functional boxing with bag","fr":"Boxe fonctionnelle au sac","it":"Pugilato funzionale al sacco"}',
'{"es":"Combinaciones de boxeo + ejercicios funcionales","en":"Boxing combos + functional exercises"}',
45,'peak',500,
ARRAY['ovulation','follicular'],
ARRAY['regular','athlete'],
ARRAY['basic_gym','full_gym'],
ARRAY['lose_weight','performance','gain_muscle','energy'],
ARRAY['type2_diabetes'],
ARRAY['pregnant'],
'{"es":[{"name":"Calentamiento (saltar comba)","dur":"5 min"},{"name":"Combinaciones de golpes","sets":5,"dur":"3 min"},{"name":"Burpees","sets":3,"reps":"12"},{"name":"Sprint en sitio","sets":4,"dur":"30s"},{"name":"Vuelta a la calma","dur":"5 min"}],"en":[{"name":"Warm-up (jump rope)","dur":"5 min"},{"name":"Punch combos","sets":5,"dur":"3 min"},{"name":"Burpees","sets":3,"reps":"12"},{"name":"Sprint in place","sets":4,"dur":"30s"},{"name":"Cool-down","dur":"5 min"}]}',
'{"es":["Protege manos con vendas y guantes","Mantén el core activado","Hidrátate cada 10 min"],"en":["Protect hands with wraps and gloves","Engage core","Hydrate every 10 min"]}'
),

('fuerza_full_60',21,'strength','💯',
'{"es":"Fuerza full-body completa","en":"Complete full-body strength","fr":"Force full-body complète","it":"Forza full-body completa"}',
'{"es":"Sesión larga con todos los grupos musculares","en":"Long session covering all muscle groups"}',
60,'high',420,
ARRAY['ovulation','follicular'],
ARRAY['regular','athlete'],
ARRAY['full_gym','basic_gym'],
ARRAY['gain_muscle','lose_weight','performance'],
ARRAY['pcos','hypothyroid'],
ARRAY[]::text[],
'{"es":[{"name":"Sentadilla","sets":5,"reps":"5"},{"name":"Peso muerto","sets":5,"reps":"5"},{"name":"Press banca","sets":4,"reps":"6"},{"name":"Press militar","sets":4,"reps":"8"},{"name":"Remo con barra","sets":4,"reps":"8"},{"name":"Hip thrust","sets":3,"reps":"10"}],"en":[{"name":"Squat","sets":5,"reps":"5"},{"name":"Deadlift","sets":5,"reps":"5"},{"name":"Bench press","sets":4,"reps":"6"},{"name":"Overhead press","sets":4,"reps":"8"},{"name":"Barbell row","sets":4,"reps":"8"},{"name":"Hip thrust","sets":3,"reps":"10"}]}',
'{"es":["Esta es tu mejor sesión del mes","Carga cerca del 80-85% de tu 1RM","Descanso de 2-3 min entre series pesadas"],"en":["This is your best session of the month","Load 80-85% of your 1RM","2-3 min rest between heavy sets"]}'
),

('hiit_explosivo_25',22,'hiit','💥',
'{"es":"HIIT explosivo de pico","en":"Peak explosive HIIT","fr":"HIIT explosif de pic","it":"HIIT esplosivo di picco"}',
'{"es":"Tabata 20s on/10s off, intensidad máxima","en":"Tabata 20s on/10s off, peak intensity"}',
25,'peak',380,
ARRAY['ovulation'],
ARRAY['regular','athlete'],
ARRAY['home','basic_gym','full_gym','outdoor'],
ARRAY['lose_weight','performance'],
ARRAY['type2_diabetes'],
ARRAY['pregnant','postpartum'],
'{"es":[{"name":"Calentamiento","dur":"5 min"},{"name":"Burpees Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Jump squats Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Mountain climbers Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Vuelta a la calma","dur":"5 min"}],"en":[{"name":"Warm-up","dur":"5 min"},{"name":"Burpees Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Jump squats Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Mountain climbers Tabata","sets":8,"dur":"20s on/10s off"},{"name":"Cool-down","dur":"5 min"}]}',
'{"es":["Da el 100% en los 20s on","Recupera bien en los 10s off","Hidrata bien antes y después"],"en":["Give 100% in the 20s on","Recover well in the 10s off","Hydrate well before and after"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌘 LÚTEAL · Intensidad moderada + bienestar (5)
-- ═══════════════════════════════════════════════════════════════════════════

('pilates_intermedio_45',30,'pilates','🤸',
'{"es":"Pilates intermedio reformer/suelo","en":"Intermediate Pilates","fr":"Pilates intermédiaire","it":"Pilates intermedio"}',
'{"es":"Trabajo de core y movilidad con resistencia","en":"Core and mobility work with resistance"}',
45,'medium',220,
ARRAY['luteal','follicular'],
ARRAY['occasional','regular','athlete'],
ARRAY['home','basic_gym','full_gym'],
ARRAY['maintain','reduce_symptoms','gain_muscle'],
ARRAY['endometriosis','pcos','pmdd'],
ARRAY[]::text[],
'{"es":[{"name":"Roll Up","sets":3,"reps":"10"},{"name":"Single Leg Stretch","sets":3,"reps":"12 c/lado"},{"name":"Teaser","sets":3,"reps":"8"},{"name":"Side Plank","sets":3,"dur":"30s c/lado"},{"name":"Bridge","sets":3,"reps":"15"},{"name":"Swimming","sets":2,"dur":"45s"}],"en":[{"name":"Roll Up","sets":3,"reps":"10"},{"name":"Single Leg Stretch","sets":3,"reps":"12/side"},{"name":"Teaser","sets":3,"reps":"8"},{"name":"Side Plank","sets":3,"dur":"30s/side"},{"name":"Bridge","sets":3,"reps":"15"},{"name":"Swimming","sets":2,"dur":"45s"}]}',
'{"es":["Mantén el ombligo hacia la columna","No retengas la respiración","Calidad sobre cantidad"],"en":["Pull navel to spine","Don''t hold breath","Quality over quantity"]}'
),

('fuerza_moderada_40',31,'strength','🏋️',
'{"es":"Fuerza moderada full-body","en":"Moderate full-body strength","fr":"Force modérée full-body","it":"Forza moderata full-body"}',
'{"es":"Pesos moderados, foco en técnica y volumen","en":"Moderate weights, focus on technique and volume"}',
40,'medium',260,
ARRAY['luteal','follicular'],
ARRAY['occasional','regular','athlete'],
ARRAY['full_gym','basic_gym','home'],
ARRAY['maintain','gain_muscle','lose_weight'],
ARRAY['pcos','hypothyroid','type2_diabetes'],
ARRAY[]::text[],
'{"es":[{"name":"Goblet squat","sets":3,"reps":"15"},{"name":"Press mancuernas","sets":3,"reps":"12"},{"name":"Remo mancuerna","sets":3,"reps":"12 c/lado"},{"name":"Romanian deadlift mancuernas","sets":3,"reps":"12"},{"name":"Plancha","sets":3,"dur":"45s"}],"en":[{"name":"Goblet squat","sets":3,"reps":"15"},{"name":"Dumbbell press","sets":3,"reps":"12"},{"name":"Dumbbell row","sets":3,"reps":"12/side"},{"name":"Dumbbell RDL","sets":3,"reps":"12"},{"name":"Plank","sets":3,"dur":"45s"}]}',
'{"es":["Reduce un 10-15% el peso vs fase folicular","Si tienes SOP, mantén intensidad moderada para no elevar cortisol","Más volumen, menos intensidad"],"en":["Drop 10-15% weight vs follicular","With PCOS, keep intensity moderate to avoid cortisol spike","More volume, less intensity"]}'
),

('yoga_flow_40',32,'yoga','🧘',
'{"es":"Yoga flow vinyasa medio","en":"Vinyasa yoga flow","fr":"Yoga flow vinyasa","it":"Yoga flow vinyasa"}',
'{"es":"Flujo continuo de posturas para fuerza y flexibilidad","en":"Continuous flow for strength and flexibility"}',
40,'medium',200,
ARRAY['luteal','follicular','menstrual'],
ARRAY['occasional','regular','athlete'],
ARRAY['home','outdoor','basic_gym'],
ARRAY['reduce_symptoms','maintain','energy'],
ARRAY['endometriosis','pcos','pmdd','anxiety'],
ARRAY[]::text[],
'{"es":[{"name":"Saludo al sol","sets":5,"dur":"5 ciclos"},{"name":"Guerrero I-II-III","sets":3,"dur":"30s c/lado"},{"name":"Postura del árbol","sets":2,"dur":"30s c/lado"},{"name":"Camello","sets":2,"dur":"30s"},{"name":"Postura del niño","dur":"3 min"},{"name":"Savasana","dur":"5 min"}],"en":[{"name":"Sun salutation","sets":5,"dur":"5 rounds"},{"name":"Warrior I-II-III","sets":3,"dur":"30s/side"},{"name":"Tree pose","sets":2,"dur":"30s/side"},{"name":"Camel","sets":2,"dur":"30s"},{"name":"Child''s pose","dur":"3 min"},{"name":"Savasana","dur":"5 min"}]}',
'{"es":["Sincroniza movimiento y respiración","Modifica si sientes cansancio","Termina siempre con savasana"],"en":["Sync movement and breath","Modify if you feel tired","Always finish with savasana"]}'
),

('natacion_suave_45',33,'cardio','🏊',
'{"es":"Natación suave continua","en":"Easy continuous swimming","fr":"Natation douce continue","it":"Nuoto leggero continuo"}',
'{"es":"Cardio sin impacto, ideal para articulaciones","en":"Low-impact cardio, ideal for joints"}',
45,'medium',350,
ARRAY['luteal','menstrual','follicular'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['outdoor','full_gym'],
ARRAY['maintain','energy','reduce_symptoms','rehab'],
ARRAY['endometriosis','hypertension','anemia'],
ARRAY[]::text[],
'{"es":[{"name":"Calentamiento crol suave","dur":"5 min"},{"name":"Estilo crol moderado","dur":"15 min"},{"name":"Espalda","dur":"10 min"},{"name":"Braza relajada","dur":"10 min"},{"name":"Estiramientos en agua","dur":"5 min"}],"en":[{"name":"Easy freestyle warm-up","dur":"5 min"},{"name":"Moderate freestyle","dur":"15 min"},{"name":"Backstroke","dur":"10 min"},{"name":"Easy breaststroke","dur":"10 min"},{"name":"Water stretches","dur":"5 min"}]}',
'{"es":["Hidrátate también en piscina","Gafas cómodas para no forzar el cuello","Si hay calambres, sal y estírate"],"en":["Hydrate even in the pool","Comfortable goggles to avoid neck strain","If cramping, get out and stretch"]}'
),

('caminata_rapida_40',34,'cardio','🚶‍♀️',
'{"es":"Caminata rápida con desnivel","en":"Brisk walk with incline","fr":"Marche rapide avec dénivelé","it":"Camminata veloce con dislivello"}',
'{"es":"Cardio moderado, quema grasa sin estresar","en":"Moderate cardio, fat burning without stress"}',
40,'medium',280,
ARRAY['luteal','follicular','menstrual'],
ARRAY['sedentary','occasional','regular','athlete'],
ARRAY['outdoor','full_gym'],
ARRAY['lose_weight','maintain','reduce_symptoms','energy'],
ARRAY['pcos','type2_diabetes','hypertension'],
ARRAY[]::text[],
'{"es":[{"name":"Calentamiento ritmo cómodo","dur":"5 min"},{"name":"Caminata rápida llano","dur":"15 min"},{"name":"Caminata con cuesta","dur":"15 min"},{"name":"Enfriamiento","dur":"5 min"}],"en":[{"name":"Comfortable warm-up","dur":"5 min"},{"name":"Brisk walk flat","dur":"15 min"},{"name":"Incline walking","dur":"15 min"},{"name":"Cool-down","dur":"5 min"}]}',
'{"es":["Mantén una conversación = ritmo correcto","Inclina cinta a 5-8% para más intensidad","Buena para empezar si eres sedentaria"],"en":["Conversational pace = right intensity","Set incline 5-8% for more intensity","Good starting point if sedentary"]}'
),


-- ═══════════════════════════════════════════════════════════════════════════
-- 🌱 SUAVES (sedentarias / rehab / cualquier fase) (2)
-- ═══════════════════════════════════════════════════════════════════════════

('movilidad_principiante_20',40,'mobility','🌱',
'{"es":"Movilidad básica para principiantes","en":"Beginner mobility","fr":"Mobilité débutante","it":"Mobilità per principianti"}',
'{"es":"Sesión introductoria, sin equipamiento","en":"Beginner-friendly intro session, no equipment"}',
20,'low',60,
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['sedentary','occasional'],
ARRAY['home','outdoor'],
ARRAY['rehab','energy','maintain'],
ARRAY['endometriosis','anemia','hypothyroid'],
ARRAY[]::text[],
'{"es":[{"name":"Movilización articular","dur":"5 min"},{"name":"Estiramientos básicos","dur":"10 min"},{"name":"Respiración diafragmática","dur":"5 min"}],"en":[{"name":"Joint mobility","dur":"5 min"},{"name":"Basic stretches","dur":"10 min"},{"name":"Diaphragmatic breathing","dur":"5 min"}]}',
'{"es":["No fuerces nada el primer día","Mejor 10 min cada día que 2h una vez","Empieza despacio y construye hábito"],"en":["Don''t force anything day 1","Better 10 min daily than 2h once","Start slow, build habit"]}'
),

('embarazo_seguro_30',41,'mobility','🤰',
'{"es":"Movilidad y fuerza segura en embarazo","en":"Pregnancy-safe mobility and strength","fr":"Mobilité et force grossesse","it":"Mobilità e forza in gravidanza"}',
'{"es":"Ejercicios adaptados para todas las etapas del embarazo","en":"Exercises adapted to all pregnancy stages"}',
30,'low',120,
ARRAY['menstrual','follicular','ovulation','luteal'],
ARRAY['sedentary','occasional','regular'],
ARRAY['home','basic_gym'],
ARRAY['maintain','energy','reduce_symptoms'],
ARRAY['pregnant','postpartum'],
ARRAY[]::text[],
'{"es":[{"name":"Calentamiento gato-vaca","sets":2,"reps":"10"},{"name":"Sentadilla apoyada","sets":3,"reps":"12"},{"name":"Pelvic tilts","sets":3,"reps":"15"},{"name":"Glute bridge bajo","sets":3,"reps":"12"},{"name":"Caminata suave","dur":"10 min"},{"name":"Respiración pélvica","dur":"5 min"}],"en":[{"name":"Cat-cow warm-up","sets":2,"reps":"10"},{"name":"Supported squat","sets":3,"reps":"12"},{"name":"Pelvic tilts","sets":3,"reps":"15"},{"name":"Low glute bridge","sets":3,"reps":"12"},{"name":"Easy walk","dur":"10 min"},{"name":"Pelvic breathing","dur":"5 min"}]}',
'{"es":["Consulta siempre con tu matrona antes","Evita ejercicios tumbada boca arriba 2º y 3er trimestre","Hidrátate bien y para si sientes mareo"],"en":["Always consult midwife first","Avoid lying on back 2nd-3rd trimester","Hydrate well, stop if dizzy"]}'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════
SELECT workout_type, COUNT(*) AS total
FROM workouts
GROUP BY workout_type
ORDER BY total DESC;
