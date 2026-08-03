-- workouts_parte1.sql — YOGA (4 workouts)
BEGIN;
INSERT INTO workouts (id, display_order, workout_type, emoji, name, description, duration_min, intensity, est_calories, phases, fitness_levels, equipment, goals, good_for, avoid_for, exercises, tips) VALUES

('yoga_energizante_40', 21, 'yoga', '🌟',
 '{"es":"Yoga energizante","en":"Energizing yoga","fr":"Yoga energisant","it":"Yoga energizzante"}',
 '{"es":"Secuencias dinamicas para activar el cuerpo y elevar la energia","en":"Dynamic sequences to activate the body and boost energy"}',
 40, 'medium', 130,
 ARRAY['follicular','ovulatory'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['energy','tone','lose_weight'], ARRAY['fatigue','pcos','hypothyroid','depression'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Saludo al sol A (3 rondas)"},{"dur":"3 min c/lado","name":"Guerrero I y II"},{"dur":"2 min c/lado","name":"Postura del triangulo"},{"dur":"3 min","name":"Perro boca abajo con pedaleo"},{"dur":"2 min","name":"Barco (Navasana)"},{"dur":"5 min","name":"Savasana"}],"en":[{"dur":"5 min","name":"Sun salutation A (3 rounds)"},{"dur":"3 min/side","name":"Warrior I and II"},{"dur":"2 min/side","name":"Triangle pose"},{"dur":"3 min","name":"Downward dog with pedaling"},{"dur":"2 min","name":"Boat pose (Navasana)"},{"dur":"5 min","name":"Savasana"}]}',
 '{"es":["Sincroniza el movimiento con la respiracion","Muevete con intencion, no con prisa","Hidratate bien antes y despues"],"en":["Sync movement with breath","Move with intention, not speed","Hydrate well before and after"]}'),

('yoga_luteal_35', 22, 'yoga', '🌙',
 '{"es":"Yoga fase lutea","en":"Luteal phase yoga","fr":"Yoga phase lutéale","it":"Yoga fase luteale"}',
 '{"es":"Posturas suaves y restauradoras para acompanar la fase lutea y calmar el sistema nervioso","en":"Gentle restorative poses to support the luteal phase and calm the nervous system"}',
 35, 'low', 90,
 ARRAY['luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['reduce_symptoms','energy','stress'], ARRAY['pmdd','endometriosis','adenomyosis','anxiety','pms'], ARRAY[]::text[],
 '{"es":[{"dur":"4 min","name":"Postura del gato-vaca"},{"dur":"3 min c/lado","name":"Media luna reclinada"},{"dur":"5 min","name":"Paloma suave"},{"dur":"4 min","name":"Torsion reclinada"},{"dur":"4 min","name":"Mariposa reclinada"},{"dur":"8 min","name":"Savasana con bolster"}],"en":[{"dur":"4 min","name":"Cat-cow flow"},{"dur":"3 min/side","name":"Reclined half moon"},{"dur":"5 min","name":"Gentle pigeon pose"},{"dur":"4 min","name":"Reclined spinal twist"},{"dur":"4 min","name":"Reclined butterfly"},{"dur":"8 min","name":"Supported savasana"}]}',
 '{"es":["Evita las inversiones en fase lutea tardia","Respira lento: 5 seg inhalacion, 7 espiracion","Pon musica suave de fondo"],"en":["Avoid inversions in late luteal phase","Breathe slowly: 5s inhale, 7s exhale","Play soft background music"]}'),

('yin_yoga_45', 23, 'yoga', '🕯',
 '{"es":"Yin yoga","en":"Yin yoga","fr":"Yin yoga","it":"Yin yoga"}',
 '{"es":"Posturas pasivas de larga duracion para soltar tejido conectivo y calmar el sistema nervioso","en":"Long-held passive poses to release connective tissue and calm the nervous system"}',
 45, 'low', 80,
 ARRAY['menstrual','luteal'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['reduce_symptoms','stress','rehab'], ARRAY['endometriosis','pmdd','adenomyosis','fibromyalgia','anxiety','chronic_pain'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Mariposa (Baddha Konasana)"},{"dur":"5 min c/lado","name":"Dragon (estiramiento psoas)"},{"dur":"5 min c/lado","name":"Cuadrado (variacion paloma)"},{"dur":"5 min","name":"Oruga (flexion sentada)"},{"dur":"5 min","name":"Torsion supina c/lado"},{"dur":"5 min","name":"Savasana profunda"}],"en":[{"dur":"5 min","name":"Butterfly (Baddha Konasana)"},{"dur":"5 min/side","name":"Dragon (psoas stretch)"},{"dur":"5 min/side","name":"Square pose (pigeon variation)"},{"dur":"5 min","name":"Caterpillar (seated forward fold)"},{"dur":"5 min","name":"Supine twist each side"},{"dur":"5 min","name":"Deep savasana"}]}',
 '{"es":["Aguanta el discomfort sin llegar al dolor","Entra y sal de las posturas despacio","El yin trabaja con tejido conectivo, no con musculo"],"en":["Stay in discomfort without reaching pain","Enter and exit poses slowly","Yin targets connective tissue, not muscle"]}'),

('yoga_hormonal_40', 24, 'yoga', '🌸',
 '{"es":"Yoga hormonal","en":"Hormonal yoga","fr":"Yoga hormonal","it":"Yoga ormonale"}',
 '{"es":"Secuencia disenada para estimular el sistema endocrino y equilibrar hormonas naturalmente","en":"Sequence designed to stimulate the endocrine system and naturally balance hormones"}',
 40, 'low', 100,
 ARRAY['luteal','menstrual','follicular'], ARRAY['sedentary','occasional','regular','athlete'], ARRAY['home','full_gym','basic_gym'],
 ARRAY['reduce_symptoms','energy','balance'], ARRAY['pcos','hypothyroid','endometriosis','pmdd','amenorrhea'], ARRAY[]::text[],
 '{"es":[{"dur":"5 min","name":"Respiracion kapalabhati suave (10 rondas)"},{"dur":"5 min","name":"Torsion abdominal sentada"},{"dur":"5 min","name":"Cobra (Bhujangasana)"},{"dur":"5 min c/lado","name":"Guerrero III con giro"},{"dur":"5 min","name":"Puente de hombros (Setu Bandhasana)"},{"dur":"5 min","name":"Pez (Matsyasana)"},{"dur":"5 min","name":"Savasana con visualizacion"}],"en":[{"dur":"5 min","name":"Gentle kapalabhati breathing (10 rounds)"},{"dur":"5 min","name":"Seated abdominal twist"},{"dur":"5 min","name":"Cobra (Bhujangasana)"},{"dur":"5 min/side","name":"Warrior III with twist"},{"dur":"5 min","name":"Bridge pose (Setu Bandhasana)"},{"dur":"5 min","name":"Fish pose (Matsyasana)"},{"dur":"5 min","name":"Savasana with visualization"}]}',
 '{"es":["Practica en ayunas o 2h despues de comer","Constancia diaria 3 meses para ver cambios hormonales","Consulta a tu medico si tienes SOP severo o tiroides medicada"],"en":["Practice fasted or 2h after eating","Daily consistency for 3 months to see hormonal changes","Consult your doctor if you have severe PCOS or medicated thyroid"]}');

COMMIT;
