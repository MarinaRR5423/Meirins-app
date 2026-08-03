-- workouts_parte3.sql — CARDIO (4) + HIIT (2)
BEGIN;
INSERT INTO workouts (id, display_order, workout_type, emoji, name, description, duration_min, intensity, est_calories, phases, fitness_levels, equipment, goals, good_for, avoid_for, exercises, tips) VALUES

('bicicleta_estatica_45', 31, 'cardio', 'Bike',
 '{"es":"Bicicleta estatica","en":"Stationary bike","fr":"Velo stationnaire","it":"Bici stazionaria"}',
 '{"es":"Cardio de bajo impacto articular pero alta demanda cardiovascular en bicicleta estatica","en":"Low joint-impact but high cardiovascular demand on a stationary bike"}',
 45, 'medium', 280,
 ARRAY['follicular','ovulatory'], ARRAY['occasional','regular','athlete'], ARRAY['full_gym','basic_gym'],
 ARRAY['lose_weight','cardio','energy','athletic_performance'], ARRAY['knee_pain','joint_pain','pcos','hypothyroid'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Pedaleo suave de calentamiento"},{"dur":"10 min","name":"Resistencia media constante"},{"dur":"10 min","name":"Intervalos: 1 min fuerte / 1 min suave x5"},{"dur":"10 min","name":"Resistencia media-alta sostenida"},{"dur":"5 min","name":"Vuelta a la calma pedaleo suave"},{"dur":"5 min","name":"Estiramiento de cuadriceps e isquios"}],"en":[{"dur":"5 min","name":"Easy warm-up pedaling"},{"dur":"10 min","name":"Steady medium resistance"},{"dur":"10 min","name":"Intervals: 1 min hard / 1 min easy x5"},{"dur":"10 min","name":"Sustained medium-high resistance"},{"dur":"5 min","name":"Cool-down easy pedaling"},{"dur":"5 min","name":"Quad and hamstring stretch"}]}',
 '{"es":["Ajusta el asiento para que la rodilla quede ligeramente doblada al fondo del pedaleo","Mantén el core activo y la espalda recta","Bebe agua cada 15 minutos"],"en":["Set the seat so your knee is slightly bent at the bottom of the stroke","Keep your core engaged and back straight","Drink water every 15 minutes"]}'),

('baile_cardio_30', 32, 'cardio', 'Music',
 '{"es":"Baile cardio","en":"Cardio dance","fr":"Cardio danse","it":"Ballo cardio"}',
 '{"es":"Rutina de baile de alta energia para quemar calorias mientras te diviertes","en":"High-energy dance routine to burn calories while having fun"}',
 30, 'medium', 210,
 ARRAY['follicular','ovulatory'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym'],
 ARRAY['lose_weight','energy','mood','cardio'], ARRAY['depression','anxiety','fatigue','pcos'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Marcha en el sitio y balanceos de brazos"},{"dur":"5 min","name":"Paso basico de merengue con giros"},{"dur":"5 min","name":"Salsa sencilla: paso adelante-atras"},{"dur":"5 min","name":"Movimientos de cadera afro"},{"dur":"5 min","name":"Coreografia combinada a ritmo"},{"dur":"5 min","name":"Vuelta a la calma con movimiento suave"}],"en":[{"dur":"5 min","name":"March in place and arm swings"},{"dur":"5 min","name":"Basic merengue step with turns"},{"dur":"5 min","name":"Simple salsa: step forward-back"},{"dur":"5 min","name":"Afro hip movements"},{"dur":"5 min","name":"Combined choreography at tempo"},{"dur":"5 min","name":"Cool-down with gentle movement"}]}',
 '{"es":["Pon musica que te encante para subir la motivacion","No te preocupes por los pasos perfectos, disfruta","Descalza o con zapatillas ligeras"],"en":["Play music you love to boost motivation","Don''t worry about perfect steps, just enjoy","Barefoot or in light sneakers"]}'),

('saltar_cuerda_20', 33, 'cardio', 'Activity',
 '{"es":"Saltar a la cuerda","en":"Jump rope","fr":"Corde a sauter","it":"Salto con la corda"}',
 '{"es":"Cardio de alta intensidad y bajo coste para maximizar la quema calorica en poco tiempo","en":"High-intensity low-cost cardio to maximise calorie burn in a short time"}',
 20, 'high', 230,
 ARRAY['ovulatory','follicular'], ARRAY['occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['lose_weight','cardio','athletic_performance'], ARRAY['pcos','fatigue'], ARRAY['pregnant','joint_pain','knee_pain','osteoporosis'],
 '{"es":[{"dur":"3 min","name":"Salto basico continuo (calentamiento)"},{"dur":"2 min","name":"Descanso activo: marcha en sitio"},{"dur":"3 min","name":"Salto alterno de pies (trote)"},{"dur":"2 min","name":"Descanso activo"},{"dur":"3 min","name":"Salto rapido o doble vuelta"},{"dur":"2 min","name":"Descanso activo"},{"dur":"3 min","name":"Sprint final: maxima velocidad"},{"dur":"2 min","name":"Estiramiento de gemelos y cuadriceps"}],"en":[{"dur":"3 min","name":"Basic continuous jump (warm-up)"},{"dur":"2 min","name":"Active rest: march in place"},{"dur":"3 min","name":"Alternating foot jump (jog)"},{"dur":"2 min","name":"Active rest"},{"dur":"3 min","name":"Fast jump or double-under"},{"dur":"2 min","name":"Active rest"},{"dur":"3 min","name":"Final sprint: maximum speed"},{"dur":"2 min","name":"Calf and quad stretch"}]}',
 '{"es":["Usa calzado con buena amortiguacion","Aterriza sobre el antepi, no con el talon","Si llevas tiempo sin saltar, empieza con 1 min e incrementa poco a poco"],"en":["Wear well-cushioned shoes","Land on the ball of your foot, not your heel","If you haven''t jumped in a while, start with 1 min and build up"]}'),

('cardio_embarazo_30', 34, 'cardio', 'Heart',
 '{"es":"Cardio seguro embarazo","en":"Pregnancy-safe cardio","fr":"Cardio grossesse","it":"Cardio gravidanza"}',
 '{"es":"Cardio suave y seguro adaptado para el segundo y tercer trimestre de embarazo","en":"Gentle and safe cardio adapted for the second and third trimester of pregnancy"}',
 30, 'low', 120,
 ARRAY['follicular','ovulatory','luteal','menstrual'], ARRAY['sedentary','occasional','regular'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['energy','reduce_symptoms'], ARRAY['pregnant'], ARRAY['postpartum'],
 '{"es":[{"dur":"5 min","name":"Marcha en el sitio con balanceo de brazos"},{"dur":"5 min","name":"Step lateral suave"},{"dur":"5 min","name":"Marcha con elevacion de rodillas baja"},{"dur":"5 min","name":"Movimiento de brazos sentada en pelota"},{"dur":"5 min","name":"Marcha con giro de tronco suave"},{"dur":"5 min","name":"Vuelta a la calma y respiracion abdominal"}],"en":[{"dur":"5 min","name":"March in place with arm swing"},{"dur":"5 min","name":"Gentle side step"},{"dur":"5 min","name":"Low-knee march"},{"dur":"5 min","name":"Seated arm movement on ball"},{"dur":"5 min","name":"March with gentle trunk rotation"},{"dur":"5 min","name":"Cool-down and abdominal breathing"}]}',
 '{"es":["Mantén el ritmo conversacional: si no puedes hablar, baja la intensidad","Para si sientes mareo, contracciones o perdida de liquido","Consulta siempre a tu ginecóloga antes de hacer ejercicio en el embarazo"],"en":["Keep conversational pace: if you can''t talk, lower the intensity","Stop if you feel dizziness, contractions or fluid loss","Always consult your OB before exercising during pregnancy"]}'),

('hiit_bajo_impacto_25', 35, 'hiit', 'Zap',
 '{"es":"HIIT bajo impacto","en":"Low-impact HIIT","fr":"HIIT faible impact","it":"HIIT basso impatto"}',
 '{"es":"Alta intensidad sin saltos ni impacto articular, ideal para articulaciones sensibles o fase lutea","en":"High intensity without jumps or joint impact, ideal for sensitive joints or luteal phase"}',
 25, 'medium', 190,
 ARRAY['follicular','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['lose_weight','tone','energy','cardio'], ARRAY['knee_pain','joint_pain','pcos','hypothyroid','back_pain'], ARRAY['pregnant'],
 '{"es":[{"dur":"3 min","name":"Calentamiento: marcha con brazos"},{"dur":"40 seg","name":"Sentadilla lenta con pausa"},{"dur":"20 seg","name":"Descanso"},{"dur":"40 seg","name":"Step lateral rapido"},{"dur":"20 seg","name":"Descanso"},{"dur":"40 seg","name":"Zancada alternante sin salto"},{"dur":"20 seg","name":"Descanso"},{"dur":"40 seg","name":"Plancha con toque de hombro"},{"dur":"20 seg","name":"Descanso"},{"dur":"40 seg","name":"Puente de gluteos pulsado"},{"dur":"20 seg","name":"Descanso: repite 3 rondas"},{"dur":"3 min","name":"Vuelta a la calma y estiramiento"}],"en":[{"dur":"3 min","name":"Warm-up: march with arms"},{"dur":"40 sec","name":"Slow squat with pause"},{"dur":"20 sec","name":"Rest"},{"dur":"40 sec","name":"Fast lateral step"},{"dur":"20 sec","name":"Rest"},{"dur":"40 sec","name":"Alternating lunge no jump"},{"dur":"20 sec","name":"Rest"},{"dur":"40 sec","name":"Plank shoulder tap"},{"dur":"20 sec","name":"Rest"},{"dur":"40 sec","name":"Pulsed glute bridge"},{"dur":"20 sec","name":"Rest: repeat 3 rounds"},{"dur":"3 min","name":"Cool-down and stretch"}]}',
 '{"es":["Pon el foco en la intensidad del esfuerzo, no en los saltos","Mantén el core activo durante toda la sesion","Ajusta la velocidad para no perder la tecnica"],"en":["Focus on effort intensity, not jumps","Keep your core engaged throughout","Adjust speed to maintain technique"]}'),

('tabata_20', 36, 'hiit', 'Flame',
 '{"es":"Tabata","en":"Tabata","fr":"Tabata","it":"Tabata"}',
 '{"es":"Protocolo Tabata original: 8 rondas de 20 seg de trabajo maximo y 10 seg de descanso","en":"Original Tabata protocol: 8 rounds of 20 sec max work and 10 sec rest"}',
 20, 'high', 240,
 ARRAY['ovulatory'], ARRAY['regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['lose_weight','athletic_performance','cardio','tone'], ARRAY['pcos','fatigue'], ARRAY['pregnant','joint_pain','knee_pain','osteoporosis'],
 '{"es":[{"dur":"3 min","name":"Calentamiento dinamico obligatorio"},{"dur":"4 min","name":"Bloque 1: Burpees 8x(20s trabajo/10s descanso)"},{"dur":"1 min","name":"Descanso activo"},{"dur":"4 min","name":"Bloque 2: Sentadillas de salto 8x(20s/10s)"},{"dur":"1 min","name":"Descanso activo"},{"dur":"4 min","name":"Bloque 3: Mountain climbers 8x(20s/10s)"},{"dur":"3 min","name":"Vuelta a la calma y estiramiento"}],"en":[{"dur":"3 min","name":"Mandatory dynamic warm-up"},{"dur":"4 min","name":"Block 1: Burpees 8x(20s work/10s rest)"},{"dur":"1 min","name":"Active rest"},{"dur":"4 min","name":"Block 2: Jump squats 8x(20s/10s)"},{"dur":"1 min","name":"Active rest"},{"dur":"4 min","name":"Block 3: Mountain climbers 8x(20s/10s)"},{"dur":"3 min","name":"Cool-down and stretch"}]}',
 '{"es":["El trabajo debe ser al maximo: si puedes hablar, no es Tabata","Nunca te saltes el calentamiento","Una sesion de Tabata a la semana es suficiente"],"en":["Work must be at maximum: if you can talk, it''s not Tabata","Never skip the warm-up","One Tabata session per week is enough"]}');

COMMIT;
