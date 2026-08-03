-- workouts_parte4.sql — STRENGTH (4)
BEGIN;
INSERT INTO workouts (id, display_order, workout_type, emoji, name, description, duration_min, intensity, est_calories, phases, fitness_levels, equipment, goals, good_for, avoid_for, exercises, tips) VALUES

('fuerza_gluteos_40', 37, 'strength', 'Dumbbell',
 '{"es":"Fuerza de gluteos","en":"Glute strength","fr":"Force des fessiers","it":"Forza glutei"}',
 '{"es":"Sesion especifica de gluteos con progresion de carga para tonificar y fortalecer","en":"Targeted glute session with load progression to tone and strengthen"}',
 40, 'medium', 185,
 ARRAY['follicular','ovulatory'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['tone','lose_weight','posture','athletic_performance'], ARRAY['pcos','back_pain','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Activacion: puente de gluteos x20 y clamshell x15"},{"dur":"8 min","name":"Sentadilla goblet 4x12"},{"dur":"8 min","name":"Hip thrust con peso corporal o barra 4x15"},{"dur":"6 min","name":"Peso muerto rumano con mancuernas 3x12"},{"dur":"6 min","name":"Patada de gluteo en cuadrupedia 3x15 c/lado"},{"dur":"4 min","name":"Estiramiento de gluteos y piriforme"},{"dur":"3 min","name":"Foam roller en gluteos"}],"en":[{"dur":"5 min","name":"Activation: glute bridge x20 and clamshell x15"},{"dur":"8 min","name":"Goblet squat 4x12"},{"dur":"8 min","name":"Hip thrust bodyweight or barbell 4x15"},{"dur":"6 min","name":"Dumbbell Romanian deadlift 3x12"},{"dur":"6 min","name":"Quadruped glute kickback 3x15/side"},{"dur":"4 min","name":"Glute and piriformis stretch"},{"dur":"3 min","name":"Foam roll glutes"}]}',
 '{"es":["Activa los gluteos conscientemente antes de cada rep","El hip thrust es el ejercicio mas eficaz para el gluteo mayor","Progresa el peso cada 2 semanas si completas las series sin dificultad"],"en":["Consciously activate glutes before each rep","Hip thrust is the most effective exercise for the glute max","Progress weight every 2 weeks if you complete sets without difficulty"]}'),

('fuerza_core_30', 38, 'strength', 'Shield',
 '{"es":"Fuerza de core","en":"Core strength","fr":"Force du core","it":"Forza del core"}',
 '{"es":"Trabajo profundo de musculatura abdominal, lumbar y pelvica para una base solida","en":"Deep work on abdominal, lumbar and pelvic muscles for a solid foundation"}',
 30, 'medium', 150,
 ARRAY['follicular','ovulatory','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['tone','posture','rehab'], ARRAY['back_pain','diastasis','incontinence','pcos'], ARRAY['pregnant'],
 '{"es":[{"dur":"3 min","name":"Activacion de suelo pelvico y transverso"},{"dur":"5 min","name":"Plancha frontal progresiva 3x30-45s"},{"dur":"5 min","name":"Plancha lateral 3x20s c/lado"},{"dur":"5 min","name":"Dead bug 3x10 c/lado"},{"dur":"5 min","name":"Bird dog 3x10 c/lado"},{"dur":"4 min","name":"Pallof press o rotacion con banda"},{"dur":"3 min","name":"Estiramiento lumbar y cat-cow"}],"en":[{"dur":"3 min","name":"Pelvic floor and transverse abdominis activation"},{"dur":"5 min","name":"Front plank progression 3x30-45s"},{"dur":"5 min","name":"Side plank 3x20s per side"},{"dur":"5 min","name":"Dead bug 3x10 per side"},{"dur":"5 min","name":"Bird dog 3x10 per side"},{"dur":"4 min","name":"Pallof press or band rotation"},{"dur":"3 min","name":"Lumbar stretch and cat-cow"}]}',
 '{"es":["El core incluye transverso, multifidos y suelo pelvico, no solo el recto abdominal","Si tienes diastasis, evita los crunches clasicos","Exhala en el esfuerzo, inhala al ceder"],"en":["Core includes transverse, multifidus and pelvic floor, not just rectus abdominis","If you have diastasis, avoid traditional crunches","Exhale on effort, inhale on release"]}'),

('fuerza_funcional_45', 39, 'strength', 'Dumbbell',
 '{"es":"Fuerza funcional","en":"Functional strength","fr":"Force fonctionnelle","it":"Forza funzionale"}',
 '{"es":"Movimientos multiarticulares que replican gestos del dia a dia para una fuerza aplicada","en":"Multi-joint movements that replicate daily gestures for applied strength"}',
 45, 'medium', 220,
 ARRAY['follicular','ovulatory'], ARRAY['occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['tone','athletic_performance','posture','lose_weight'], ARRAY['pcos','hypothyroid','back_pain'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Calentamiento dinamico"},{"dur":"8 min","name":"Sentadilla + press de hombros 4x10"},{"dur":"8 min","name":"Peso muerto + remo con mancuerna 4x10"},{"dur":"7 min","name":"Zancada inversa + curl de biceps 3x10 c/lado"},{"dur":"7 min","name":"Flexiones + remo en plancha 3x8"},{"dur":"5 min","name":"Turkish get-up o cargada funcional 3x5 c/lado"},{"dur":"5 min","name":"Estiramiento cuerpo completo"}],"en":[{"dur":"5 min","name":"Dynamic warm-up"},{"dur":"8 min","name":"Squat + shoulder press 4x10"},{"dur":"8 min","name":"Deadlift + dumbbell row 4x10"},{"dur":"7 min","name":"Reverse lunge + bicep curl 3x10/side"},{"dur":"7 min","name":"Push-up + plank row 3x8"},{"dur":"5 min","name":"Turkish get-up or functional carry 3x5/side"},{"dur":"5 min","name":"Full-body stretch"}]}',
 '{"es":["Prioriza tecnica sobre peso","Los movimientos compuestos dan mas beneficio hormonal que los aislados","Descansa 60-90 seg entre series"],"en":["Prioritize technique over weight","Compound movements give more hormonal benefit than isolation exercises","Rest 60-90 sec between sets"]}'),

('fuerza_cuerpo_completo_50', 40, 'strength', 'Dumbbell',
 '{"es":"Fuerza cuerpo completo","en":"Full body strength","fr":"Force corps entier","it":"Forza corpo intero"}',
 '{"es":"Sesion completa de tren superior e inferior para maxima eficiencia cuando entrenas pocos dias","en":"Complete upper and lower body session for maximum efficiency when training few days a week"}',
 50, 'medium', 240,
 ARRAY['follicular','ovulatory'], ARRAY['occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['tone','lose_weight','athletic_performance','posture'], ARRAY['pcos','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Calentamiento articular"},{"dur":"10 min","name":"Sentadilla trasera o goblet 4x10"},{"dur":"8 min","name":"Press de banca o flexiones 4x10"},{"dur":"8 min","name":"Peso muerto convencional 4x8"},{"dur":"7 min","name":"Remo con barra o mancuernas 4x10"},{"dur":"7 min","name":"Zancada + press de hombro 3x10 c/lado"},{"dur":"5 min","name":"Estiramiento y foam roller"}],"en":[{"dur":"5 min","name":"Joint warm-up"},{"dur":"10 min","name":"Back squat or goblet squat 4x10"},{"dur":"8 min","name":"Bench press or push-ups 4x10"},{"dur":"8 min","name":"Conventional deadlift 4x8"},{"dur":"7 min","name":"Barbell or dumbbell row 4x10"},{"dur":"7 min","name":"Lunge + shoulder press 3x10/side"},{"dur":"5 min","name":"Stretch and foam roll"}]}',
 '{"es":["Ideal si entrenas 2-3 dias a la semana","Registra el peso para progresar semana a semana","Descansa 2 min entre series de ejercicios grandes"],"en":["Ideal if you train 2-3 days a week","Track the weight used to progress week by week","Rest 2 min between sets of big compound exercises"]}');

COMMIT;
