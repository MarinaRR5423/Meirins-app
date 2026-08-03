-- workouts_parte2.sql — PILATES (2) + MOBILITY (4)
BEGIN;
INSERT INTO workouts (id, display_order, workout_type, emoji, name, description, duration_min, intensity, est_calories, phases, fitness_levels, equipment, goals, good_for, avoid_for, exercises, tips) VALUES

('pilates_suelo_40', 25, 'pilates', 'Target',
 '{"es":"Pilates de suelo","en":"Mat pilates","fr":"Pilates au sol","it":"Pilates a terra"}',
 '{"es":"Trabajo de core, control y alineacion en esterilla para todas las fases del ciclo","en":"Core work, control and alignment on the mat for all cycle phases"}',
 40, 'medium', 140,
 ARRAY['follicular','ovulatory','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['tone','posture','rehab'], ARRAY['back_pain','diastasis','pcos','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"3 min","name":"Respiracion lateral y activacion de core"},{"dur":"5 min","name":"Cien (The Hundred)"},{"dur":"5 min","name":"Rolling like a ball"},{"dur":"5 min c/lado","name":"Serie de pierna unica"},{"dur":"5 min","name":"Tijeras y bicicleta"},{"dur":"4 min","name":"Side kick series"},{"dur":"3 min","name":"Natacion (Swimming)"}],"en":[{"dur":"3 min","name":"Lateral breathing and core activation"},{"dur":"5 min","name":"The Hundred"},{"dur":"5 min","name":"Rolling like a ball"},{"dur":"5 min/side","name":"Single leg series"},{"dur":"5 min","name":"Scissors and bicycle"},{"dur":"4 min","name":"Side kick series"},{"dur":"3 min","name":"Swimming"}]}',
 '{"es":["Activa el suelo pelvico antes de cada ejercicio","Mantén la columna neutra salvo que el ejercicio exija lo contrario","Calidad de movimiento por encima de cantidad"],"en":["Activate the pelvic floor before each exercise","Keep neutral spine unless the movement requires otherwise","Quality over quantity in every rep"]}'),

('pilates_postparto_30', 26, 'pilates', 'Heart',
 '{"es":"Pilates postparto","en":"Postnatal pilates","fr":"Pilates postnatal","it":"Pilates postnatale"}',
 '{"es":"Recuperacion progresiva del suelo pelvico y el core tras el parto","en":"Progressive recovery of pelvic floor and core after childbirth"}',
 30, 'low', 90,
 ARRAY['menstrual','follicular','luteal'], ARRAY['sedentary','occasional','regular'], ARRAY['home'],
 ARRAY['rehab','tone','energy'], ARRAY['postpartum','diastasis','back_pain','incontinence'], ARRAY['pregnant'],
 '{"es":[{"dur":"5 min","name":"Respiracion diafragmatica y suelo pelvico"},{"dur":"5 min","name":"Puente de gluteos con kegel"},{"dur":"5 min","name":"Elevacion de pierna en cuadrupedia"},{"dur":"5 min","name":"Plancha modificada en rodillas"},{"dur":"5 min","name":"Curl abdominal progresivo"},{"dur":"5 min","name":"Estiramiento de caderas y columna"}],"en":[{"dur":"5 min","name":"Diaphragmatic breathing and pelvic floor"},{"dur":"5 min","name":"Glute bridge with kegel"},{"dur":"5 min","name":"Quadruped leg raise"},{"dur":"5 min","name":"Modified knee plank"},{"dur":"5 min","name":"Progressive abdominal curl"},{"dur":"5 min","name":"Hip and spine stretch"}]}',
 '{"es":["Consulta a tu matrona antes de empezar","Para si sientes presion hacia abajo o perdidas","Avanza despacio: el suelo pelvico marca el ritmo"],"en":["Check with your midwife before starting","Stop if you feel downward pressure or leaking","Progress slowly: the pelvic floor sets the pace"]}'),

('movilidad_caderas_25', 27, 'mobility', 'Move',
 '{"es":"Movilidad de caderas","en":"Hip mobility","fr":"Mobilite des hanches","it":"Mobilita delle anche"}',
 '{"es":"Trabajo especifico de apertura y movilidad de caderas para aliviar tension pelvica","en":"Targeted hip opening and mobility to relieve pelvic tension"}',
 25, 'low', 65,
 ARRAY['menstrual','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['reduce_symptoms','rehab','posture'], ARRAY['endometriosis','dysmenorrhea','back_pain','adenomyosis','pcos'], ARRAY[]::text[],
 '{"es":[{"dur":"3 min c/lado","name":"90-90 estiramiento de caderas"},{"dur":"3 min c/lado","name":"Paloma en el suelo"},{"dur":"2 min","name":"Mariposa activa"},{"dur":"2 min c/lado","name":"Zancada baja con rotacion"},{"dur":"3 min","name":"Circulos de cadera en cuadrupedia"},{"dur":"3 min","name":"Happy baby (Ananda Balasana)"}],"en":[{"dur":"3 min/side","name":"90-90 hip stretch"},{"dur":"3 min/side","name":"Floor pigeon"},{"dur":"2 min","name":"Active butterfly"},{"dur":"2 min/side","name":"Low lunge with rotation"},{"dur":"3 min","name":"Quadruped hip circles"},{"dur":"3 min","name":"Happy baby (Ananda Balasana)"}]}',
 '{"es":["Respira en cada postura para liberar tension","No fuerces la apertura, dejate caer con la gravedad","Ideal antes de dormir en dias de dolor menstrual"],"en":["Breathe into each pose to release tension","Don''t force the opening, let gravity do the work","Ideal before sleep on days of menstrual pain"]}'),

('movilidad_hombros_20', 28, 'mobility', 'RotateCcw',
 '{"es":"Movilidad de hombros y cuello","en":"Shoulder and neck mobility","fr":"Mobilite epaules et nuque","it":"Mobilita spalle e collo"}',
 '{"es":"Liberacion de tension cervical y escapular acumulada por estres o trabajo sedentario","en":"Release of cervical and scapular tension from stress or sedentary work"}',
 20, 'low', 50,
 ARRAY['menstrual','follicular','ovulatory','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['stress','posture','rehab','energy'], ARRAY['neck_pain','fibromyalgia','anxiety','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"3 min","name":"Rotaciones lentas de cuello"},{"dur":"3 min","name":"Circulos de hombro y elevaciones"},{"dur":"3 min c/lado","name":"Estiramiento del trapecio sentada"},{"dur":"3 min","name":"Apertura de pecho con manos entrelazadas"},{"dur":"2 min c/lado","name":"Agujas enhebradas (Thread the needle)"},{"dur":"3 min","name":"Relajacion de cuello en decubito"}],"en":[{"dur":"3 min","name":"Slow neck rotations"},{"dur":"3 min","name":"Shoulder rolls and shrugs"},{"dur":"3 min/side","name":"Seated trapezius stretch"},{"dur":"3 min","name":"Chest opener with clasped hands"},{"dur":"2 min/side","name":"Thread the needle"},{"dur":"3 min","name":"Neck release lying down"}]}',
 '{"es":["Mueve el cuello despacio, sin tiron","Para si sientes hormigueo en los brazos","Ideal como pausa activa a mitad del dia"],"en":["Move the neck slowly, no jerking","Stop if you feel tingling in the arms","Great as an active break during the day"]}'),

('stretching_nocturno_20', 29, 'mobility', 'Moon',
 '{"es":"Stretching nocturno","en":"Evening stretch","fr":"Etirements du soir","it":"Stretching serale"}',
 '{"es":"Rutina suave para bajar la activacion y preparar el cuerpo para el sueno","en":"Gentle routine to wind down and prepare the body for sleep"}',
 20, 'low', 50,
 ARRAY['luteal','menstrual'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home'],
 ARRAY['stress','reduce_symptoms','sleep'], ARRAY['pmdd','insomnia','anxiety','fibromyalgia'], ARRAY[]::text[],
 '{"es":[{"dur":"3 min","name":"Respiracion 4-7-8 tumbada"},{"dur":"3 min c/lado","name":"Torsion supina"},{"dur":"3 min","name":"Piernas en la pared (Viparita Karani)"},{"dur":"3 min","name":"Mariposa reclinada"},{"dur":"5 min","name":"Relajacion progresiva muscular"}],"en":[{"dur":"3 min","name":"4-7-8 breathing lying down"},{"dur":"3 min/side","name":"Supine spinal twist"},{"dur":"3 min","name":"Legs up the wall (Viparita Karani)"},{"dur":"3 min","name":"Reclined butterfly"},{"dur":"5 min","name":"Progressive muscle relaxation"}]}',
 '{"es":["Hazlo con luz tenue o en penumbra","Sin pantallas durante ni 30 min despues","Puedes usar un antifaz al terminar"],"en":["Do it in dim or low light","No screens during or 30 min after","You can use an eye mask when you finish"]}'),

('movilidad_completa_30', 30, 'mobility', 'RefreshCcw',
 '{"es":"Movilidad articular completa","en":"Full joint mobility","fr":"Mobilite articulaire complete","it":"Mobilita articolare completa"}',
 '{"es":"Recorrido articular de todo el cuerpo para mejorar rango de movimiento y reducir rigidez","en":"Full-body joint circuit to improve range of motion and reduce stiffness"}',
 30, 'low', 70,
 ARRAY['menstrual','follicular','ovulatory','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['rehab','posture','energy','reduce_symptoms'], ARRAY['fibromyalgia','arthritis','chronic_pain','back_pain','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"3 min","name":"Rotaciones de tobillo y muneca"},{"dur":"3 min","name":"Circulos de rodilla y cadera"},{"dur":"3 min","name":"Rotaciones de columna de pie"},{"dur":"4 min","name":"Circulos de hombro y cuello"},{"dur":"4 min","name":"Cat-cow y extension de columna"},{"dur":"4 min","name":"Apertura de caderas en el suelo"},{"dur":"4 min","name":"Estiramiento global cuerpo completo"}],"en":[{"dur":"3 min","name":"Ankle and wrist circles"},{"dur":"3 min","name":"Knee and hip circles"},{"dur":"3 min","name":"Standing spinal rotations"},{"dur":"4 min","name":"Shoulder and neck circles"},{"dur":"4 min","name":"Cat-cow and spinal extension"},{"dur":"4 min","name":"Floor hip opening"},{"dur":"4 min","name":"Full-body global stretch"}]}',
 '{"es":["Mueve cada articulacion en todos sus rangos","Sin rebotes, movimiento controlado","Ideal como calentamiento o rutina matutina"],"en":["Move each joint through its full range","No bouncing, controlled movement","Great as a warm-up or morning daily routine"]}');

COMMIT;
