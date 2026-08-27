/**
 * trainingPrograms.js â€” catÃ¡logo de programas de entrenamiento guiados.
 *
 * Contenido paramÃ©trico: las sesiones se componen de segmentos (correr X min,
 * caminar X min, repetir N vecesâ€¦) o ejercicios (sentadilla 3Ã—12). Los textos
 * salen de los catÃ¡logos LBL/EX en 4 idiomas, asÃ­ que aÃ±adir un programa nuevo
 * no requiere traducir prosa.
 *
 * Progreso de la usuaria â†’ profile_extended.activeProgram = { id, started, done }
 * (done = nÂº de sesiones completadas; semana/sesiÃ³n se derivan).
 */

// â”€â”€ Etiquetas de segmentos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LBL = {
 wu: { es: 'Calentamiento andando', en: 'Warm-up walk', fr: 'Ã‰chauffement en marchant', it: 'Riscaldamento camminando' },
 cd: { es: 'Vuelta a la calma', en: 'Cool-down', fr: 'Retour au calme', it: 'Defaticamento' },
 run: { es: 'Correr', en: 'Run', fr: 'Courir', it: 'Correre' },
 run_easy: { es: 'Trote suave', en: 'Easy jog', fr: 'Footing lÃ©ger', it: 'Corsa leggera' },
 run_fast: { es: 'Ritmo rÃ¡pido', en: 'Fast pace', fr: 'Allure rapide', it: 'Ritmo veloce' },
 walk: { es: 'Caminar', en: 'Walk', fr: 'Marcher', it: 'Camminare' },
 walk_fast: { es: 'Caminar rÃ¡pido', en: 'Brisk walk', fr: 'Marche rapide', it: 'Camminata veloce' },
 stretch: { es: 'Estiramientos', en: 'Stretching', fr: 'Ã‰tirements', it: 'Stretching' },
 breath: { es: 'RespiraciÃ³n diafragmÃ¡tica', en: 'Diaphragmatic breathing', fr: 'Respiration diaphragmatique', it: 'Respirazione diaframmatica' },
 swim_breath:{ es: 'RespiraciÃ³n en el agua', en: 'Water breathing drills', fr: 'Respiration dans l\'eau', it: 'Respirazione in acqua' },
 swim_float:{ es: 'FlotaciÃ³n y deslizamiento', en: 'Floating & gliding', fr: 'Flottaison et glisse', it: 'Galleggiamento e scivolamento' },
 swim_kick: { es: 'Batida con tabla', en: 'Kick with board', fr: 'Battements avec planche', it: 'Gambata con tavoletta' },
 swim_arms: { es: 'Brazos de crol con tabla', en: 'Crawl arms with board', fr: 'Bras de crawl avec planche', it: 'Bracciata stile libero con tavoletta' },
 swim_crawl:{ es: 'Crol', en: 'Front crawl', fr: 'Crawl', it: 'Stile libero' },
 swim_back: { es: 'Espalda suave', en: 'Easy backstroke', fr: 'Dos lÃ©ger', it: 'Dorso leggero' },
 swim_rest: { es: 'Descanso en el borde', en: 'Rest at the wall', fr: 'Repos au mur', it: 'Riposo al bordo' },
 hiit_work: { es: 'Alta intensidad', en: 'High intensity', fr: 'Haute intensitÃ©', it: 'Alta intensitÃ ' },
 hiit_rest: { es: 'RecuperaciÃ³n', en: 'Recovery', fr: 'RÃ©cupÃ©ration', it: 'Recupero' },
 mob_hips: { es: 'Movilidad de cadera', en: 'Hip mobility', fr: 'MobilitÃ© des hanches', it: 'MobilitÃ  delle anche' },
 mob_spine: { es: 'Movilidad de columna', en: 'Spine mobility', fr: 'MobilitÃ© du dos', it: 'MobilitÃ  della colonna' },
 squat_hold:{ es: 'Sentadilla profunda mantenida', en: 'Deep squat hold', fr: 'Squat profond maintenu', it: 'Squat profondo mantenuto' },
 // â”€â”€ Movilidad / relajaciÃ³n (programa fisio) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 child_pose: { es: 'Postura del niÃ±o', en: "Child's pose", fr: "Posture de l'enfant", it: 'Postura del bambino' },
 happy_baby: { es: 'Happy baby', en: 'Happy baby', fr: 'Happy baby', it: 'Happy baby' },
 supine_twist:{ es: 'TorsiÃ³n supina', en: 'Supine twist', fr: 'Torsion allongÃ©e', it: 'Torsione supina' },
 sphinx:      { es: 'Esfinge', en: 'Sphinx', fr: 'Sphinx', it: 'Sfinge' },
 hip_circles: { es: 'CÃ­rculos de cadera', en: 'Hip circles', fr: 'Cercles de bassin', it: 'Cerchi fianchi' },
 spine_rotation:{ es: 'RotaciÃ³n de columna', en: 'Spine rotation', fr: 'Rotation du dos', it: 'Rotazione colonna' },
 ankle_circles:{ es: 'Movilidad de tobillo', en: 'Ankle mobility', fr: 'MobilitÃ© des chevilles', it: 'MobilitÃ  caviglia' },
 arm_circles: { es: 'CÃ­rculos de brazos', en: 'Arm circles', fr: 'Cercles de bras', it: 'Cerchi braccia' },
 shoulder_circles:{ es: 'CÃ­rculos de hombros', en: 'Shoulder circles', fr: "Cercles d'Ã©paules", it: 'Cerchi spalle' },
 // â”€â”€ Etiquetas programas Ocasional y Activa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 breath_chair:  { es: 'RespiraciÃ³n con piernas en silla', en: 'Breathing with legs on chair', fr: 'Respiration avec jambes sur chaise', it: 'Respirazione con gambe sulla sedia' },
 leg_rock:      { es: 'Balanceo de piernas (tumbada)', en: 'Leg rock (lying)', fr: 'Bascule de jambes (allongÃ©e)', it: 'Oscillazione gambe (sdraiata)' },
 thoracic_rot:  { es: 'RotaciÃ³n torÃ¡cica', en: 'Thoracic rotation', fr: 'Rotation thoracique', it: 'Rotazione toracica' },
 low_lunge:     { es: 'Zancada baja', en: 'Low lunge', fr: 'Fente basse', it: 'Affondo basso' },
 toe_walk:      { es: 'Marcha de puntillas', en: 'Toe walk', fr: 'Marche sur les pointes', it: 'Camminata sulle punte' },
 cross_seated:  { es: 'TorsiÃ³n sentada en sastre', en: 'Seated spinal twist', fr: 'Torsion du rachis en tailleur', it: 'Torsione seduta in posizione a gambe incrociate' },
 child_sides:   { es: 'Postura del niÃ±o (brazos a los lados)', en: "Child's pose (arms to each side)", fr: "Posture de l'enfant (bras Ã  droite, Ã  gauche)", it: 'Postura del bambino (braccia sui lati)' },
 endurance_cardio:{ es: 'Cardio libre (bici / nataciÃ³n / footing / marcha rÃ¡pida)', en: 'Free cardio (cycling / swimming / easy jog / brisk walk)', fr: 'Cardio libre (vÃ©lo / natation / footing / marche rapide)', it: 'Cardio libero (bici / nuoto / footing / camminata rapida)' },
};

// â”€â”€ CatÃ¡logo de ejercicios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EX = {
 squat: { es: 'Sentadilla', en: 'Squat', fr: 'Squat', it: 'Squat' },
 goblet: { es: 'Sentadilla goblet', en: 'Goblet squat', fr: 'Goblet squat', it: 'Goblet squat' },
 rdl: { es: 'Peso muerto rumano', en: 'Romanian deadlift', fr: 'SoulevÃ© de terre roumain', it: 'Stacco rumeno' },
 lunge: { es: 'Zancada', en: 'Lunge', fr: 'Fente', it: 'Affondo' },
 pushup: { es: 'FlexiÃ³n (rodillas si hace falta)', en: 'Push-up (knees if needed)', fr: 'Pompe (genoux si besoin)', it: 'Piegamento (ginocchia se serve)' },
 row: { es: 'Remo (mancuerna o banda)', en: 'Row (dumbbell or band)', fr: 'Rowing (haltÃ¨re ou Ã©lastique)', it: 'Rematore (manubrio o elastico)' },
 press: { es: 'Press de hombros', en: 'Shoulder press', fr: 'DÃ©veloppÃ© Ã©paules', it: 'Lento avanti' },
 plank: { es: 'Plancha', en: 'Plank', fr: 'Planche', it: 'Plank' },
 side_plank: { es: 'Plancha lateral', en: 'Side plank', fr: 'Planche latÃ©rale', it: 'Plank laterale' },
 bridge: { es: 'Puente de glÃºteos', en: 'Glute bridge', fr: 'Pont fessier', it: 'Ponte glutei' },
 hip_thrust: { es: 'Hip thrust', en: 'Hip thrust', fr: 'Hip thrust', it: 'Hip thrust' },
 step_up: { es: 'Subida al cajÃ³n', en: 'Step-up', fr: 'MontÃ©e sur step', it: 'Step-up' },
 dead_bug: { es: 'Dead bug', en: 'Dead bug', fr: 'Dead bug', it: 'Dead bug' },
 bird_dog: { es: 'Bird dog', en: 'Bird dog', fr: 'Bird dog', it: 'Bird dog' },
 cat_cow: { es: 'Gato-vaca', en: 'Cat-cow', fr: 'Chat-vache', it: 'Gatto-mucca' },
 kegel: { es: 'Kegel (suelo pÃ©lvico)', en: 'Kegel (pelvic floor)', fr: 'Kegel (pÃ©rinÃ©e)', it: 'Kegel (pavimento pelvico)' },
 calf_raise: { es: 'ElevaciÃ³n de talones', en: 'Calf raise', fr: 'Ã‰lÃ©vation des mollets', it: 'Sollevamento polpacci' },
 jump_soft: { es: 'Saltos suaves', en: 'Soft jumps', fr: 'Petits sauts', it: 'Salti leggeri' },
 balance: { es: 'Equilibrio a una pierna', en: 'Single-leg balance', fr: 'Ã‰quilibre sur une jambe', it: 'Equilibrio su una gamba' },
 burpee: { es: 'Burpee (versiÃ³n adaptada ok)', en: 'Burpee (modified ok)', fr: 'Burpee (version adaptÃ©e ok)', it: 'Burpee (versione adattata ok)' },
 mtn_climber:{ es: 'Escalador', en: 'Mountain climber', fr: 'Mountain climber', it: 'Mountain climber' },
 jumping_jack:{ es: 'Jumping jacks', en: 'Jumping jacks', fr: 'Jumping jacks', it: 'Jumping jacks' },
 high_knees: { es: 'Rodillas altas', en: 'High knees', fr: 'MontÃ©es de genoux', it: 'Ginocchia alte' },
 // â”€â”€ Ejercicios programa fisio sedentaria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 wall_pushup:  { es: 'FlexiÃ³n en pared', en: 'Wall push-up', fr: 'Pompe contre le mur', it: 'Piegamento al muro' },
 knee_plank:   { es: 'Plancha sobre rodillas', en: 'Knee plank', fr: 'Planche sur genoux', it: 'Plank sulle ginocchia' },
 lunge_thoracic:{ es: 'Fente + rotaciÃ³n torÃ¡cica', en: 'Lunge + thoracic rotation', fr: 'Fente + rotation thoracique', it: 'Affondo + rotazione toracica' },
 quad_hip_open:{ es: 'Apertura de cadera en cuadrupedia', en: 'Hip opening in quadruped', fr: 'Ouverture hanche en quadrupÃ©die', it: 'Apertura anca in quadrupedia' },
 single_bridge:{ es: 'Puente de glÃºteos a 1 pierna', en: 'Single-leg glute bridge', fr: 'Pont fessier 1 jambe', it: 'Ponte glutei 1 gamba' },
 reverse_lunge:{ es: 'Zancada hacia atrÃ¡s', en: 'Reverse lunge', fr: 'Fente arriÃ¨re', it: 'Affondo indietro' },
 jump_squat:   { es: 'Sentadilla con salto', en: 'Jump squat', fr: 'Squat sautÃ©', it: 'Squat con salto' },
 lateral_band: { es: 'Marcha lateral con banda', en: 'Lateral band walk', fr: 'Marche latÃ©rale avec Ã©lastique', it: 'Marcia laterale con elastico' },
 incline_pushup:{ es: 'FlexiÃ³n inclinada', en: 'Incline push-up', fr: 'Pompe inclinÃ©e', it: 'Piegamento inclinato' },
 dips:         { es: 'Fondos de trÃ­ceps', en: 'Triceps dips', fr: 'Dips triceps', it: 'Dips tricipiti' },
 hip_abduction:{ es: 'AbducciÃ³n de cadera', en: 'Hip abduction', fr: 'Abduction des hanches', it: 'Abduzione anca' },
 // â”€â”€ Ejercicios programas Ocasional y Activa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 superman:       { es: 'Superman', en: 'Superman', fr: 'Superman', it: 'Superman' },
 updown_dog:     { es: 'Perro cara arriba / cara abajo', en: 'Upward / downward dog', fr: 'Chien tÃªte en haut / tÃªte en bas', it: 'Cane faccia su / giÃ¹' },
 worlds_greatest:{ es: "World's greatest stretch (por lado)", en: "World's greatest stretch (per side)", fr: "World's greatest stretch (par cÃ´tÃ©)", it: "World's greatest stretch (per lato)" },
 pistol_chair:   { es: 'Sentadilla pistol con silla', en: 'Chair-assisted pistol squat', fr: 'Pistol squat avec chaise', it: 'Pistol squat con sedia' },
 step_up_knee:   { es: 'Subida al cajÃ³n + rodilla arriba', en: 'Step-up + knee drive', fr: 'MontÃ©e sur step + montÃ©e de genou', it: 'Step-up + ginocchio su' },
 squat_calf:     { es: 'Sentadilla + elevaciÃ³n de talones', en: 'Squat + calf raise', fr: 'Squat + montÃ©e sur les pointes', it: 'Squat + sollevamento polpacci' },
 knee_pushup:    { es: 'FlexiÃ³n sobre rodillas', en: 'Knee push-up', fr: 'Pompe sur les genoux', it: 'Piegamento sulle ginocchia' },
 deadlift:       { es: 'Peso muerto', en: 'Deadlift', fr: 'SoulevÃ© de terre', it: 'Stacco da terra' },
 // programa activa
 bulgarian_lunge:{ es: 'Sentadilla bÃºlgara (por lado)', en: 'Bulgarian split squat (per side)', fr: 'Fente bulgare (par cÃ´tÃ©)', it: 'Squat bulgaro (per lato)' },
 good_morning:   { es: 'Good morning', en: 'Good morning', fr: 'Good morning', it: 'Good morning' },
 active_side_plank:{ es: 'Plancha lateral activa (codo-rodilla)', en: 'Active side plank (elbow-knee)', fr: 'Gainage latÃ©ral actif (coude-genou)', it: 'Plank laterale attivo (gomito-ginocchio)' },
 jump_lunge:     { es: 'Zancada con salto (por lado)', en: 'Jump lunge (per side)', fr: 'Fente sautÃ©e (par cÃ´tÃ©)', it: 'Affondo con salto (per lato)' },
 lateral_lunge:  { es: 'Zancada lateral (por lado)', en: 'Lateral lunge (per side)', fr: 'Fente latÃ©rale (par cÃ´tÃ©)', it: 'Affondo laterale (per lato)' },
 leg_curl_chair: { es: 'Leg curl en silla (por lado)', en: 'Chair leg curl (per side)', fr: 'Leg curl unilatÃ©ral sur chaise (par cÃ´tÃ©)', it: 'Leg curl sulla sedia (per lato)' },
 box_jump:       { es: 'Salto al cajÃ³n', en: 'Box jump', fr: 'Box jump', it: 'Box jump' },
 med_ball_slam:  { es: 'Lanzamiento al suelo (medicine ball)', en: 'Med ball slam', fr: 'Med ball slam', it: 'Med ball slam' },
 bicep_curl:     { es: 'Curl de bÃ­ceps (por lado)', en: 'Bicep curl (per side)', fr: 'Curl biceps (par cÃ´tÃ©)', it: 'Curl bicipiti (per lato)' },
 med_ball_throw: { es: 'Lanzamiento de medicine ball', en: 'Medicine ball throw', fr: 'LancÃ© de medicine ball', it: 'Lancio medicine ball' },
 kb_swing:       { es: 'Kettlebell swing', en: 'Kettlebell swing', fr: 'Kettlebell swing', it: 'Kettlebell swing' },
 vertical_pull:  { es: 'JalÃ³n vertical / dominadas', en: 'Vertical pull / lat pulldown', fr: 'Tirage vertical', it: 'Tirata verticale' },
 horizontal_row: { es: 'Remo horizontal', en: 'Horizontal row', fr: 'Tirage horizontal', it: 'Rematore orizzontale' },
 static_lunge:   { es: 'Zancada estÃ¡tica mantenida (por lado)', en: 'Static lunge hold (per side)', fr: 'Fente statique maintenue (par cÃ´tÃ©)', it: 'Affondo statico (per lato)' },
 balance_arms:   { es: 'Equilibrio a 1 pierna + cÃ­rculos de brazos', en: 'Single-leg balance + arm circles', fr: 'Ã‰quilibre unipodal + cercles de bras', it: 'Equilibrio + cerchi braccia' },
 wall_angels:    { es: 'Wall angels', en: 'Wall angels', fr: 'Wall angels', it: 'Wall angels' },
 sumo_squat:     { es: 'Sentadilla sumo', en: 'Sumo squat', fr: 'Squat sumo', it: 'Squat sumo' },
 hip_90_90:      { es: 'OscilaciÃ³n de cadera 90/90 (por lado)', en: 'Hip 90/90 rock (per side)', fr: 'Bascule de hanche 90/90 (par cÃ´tÃ©)', it: 'Oscillazione anca 90/90 (per lato)' },
 open_book:      { es: 'Libro abierto (por lado)', en: 'Open book stretch (per side)', fr: 'Ã‰tirement du livre ouvert (par cÃ´tÃ©)', it: 'Libro aperto (per lato)' },
 side_plank_abd: { es: 'Plancha lateral con abducciÃ³n', en: 'Side plank with abduction', fr: 'Gainage latÃ©ral avec abduction', it: 'Plank laterale con abduzione' },
};

// â”€â”€ Helpers de construcciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const S = (t, m) => ({ t, m }); // segmento simple: tipo + minutos
const R = (x, of) => ({ x, of }); // repetir x veces
const E = (e, sets, reps, secs) => ({ e, sets, reps, secs }); // ejercicio
const seg = (...items) => ({ seg: items });
const exs = (...items) => ({ ex: items });

// SesiÃ³n C25K estÃ¡ndar: wu 5' + intervalos + cd 5'
const c25k = (...mid) => seg(S('wu', 5), ...mid, S('cd', 5));

// â”€â”€ PROGRAMAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PROGRAMS = [
 {
 id: 'pre_partum', emoji: '', level: 'beginner', spw: 3,
 showIf: 'pregnant',
 forLifeStage: 'pregnant',
 name: { es: 'Preparto activo', en: 'Active pregnancy', fr: 'Grossesse active', it: 'Gravidanza attiva' },
 desc: {
  es: '4 semanas de ejercicio seguro durante el embarazo: suelo pélvico, movilidad, fuerza suave y caminar. Consulta a tu médico antes de empezar.',
  en: '4 weeks of safe pregnancy exercise: pelvic floor, mobility, gentle strength and walking. Check with your doctor before starting.',
  fr: '4 semaines d\'exercice sûr pendant la grossesse : périnée, mobilité, force douce et marche. Consultez votre médecin avant de commencer.',
  it: '4 settimane di esercizio sicuro in gravidanza: pavimento pelvico, mobilità, forza leggera e camminata. Consulta il medico prima di iniziare.',
 },
 weeks: [
  { all: { mix: [S('breath', 5), E('kegel', 3, 10), E('cat_cow', 2, 10), S('walk', 20)] } },
  { all: { mix: [S('breath', 5), E('kegel', 3, 12), E('bird_dog', 2, 8), E('squat', 2, 10), S('walk', 20)] } },
  { all: { mix: [E('kegel', 3, 12), E('squat', 3, 10), E('bridge', 2, 12), E('cat_cow', 2, 10), S('walk', 25)] } },
  { all: { mix: [E('kegel', 3, 15), E('squat', 3, 12), E('bird_dog', 2, 10), E('bridge', 2, 12), S('walk', 25)] } },
 ],
 },
 {
 id: 'postpartum_return', emoji: '', level: 'beginner', spw: 3,
 showIf: 'postpartum',
 forLifeStage: 'postpartum',
 name: { es: 'Posparto: vuelta segura', en: 'Postpartum: safe return', fr: 'Post-partum : retour en douceur', it: 'Post parto: ritorno sicuro' },
 desc: {
 es: 'Vuelta progresiva al deporte tras el parto: suelo pÃ©lvico â†’ core profundo â†’ fuerza â†’ impacto. Empieza solo con el alta mÃ©dica (â‰¥6-8 semanas posparto).',
 en: 'Progressive return to sport after birth: pelvic floor â†’ deep core â†’ strength â†’ impact. Start only with medical clearance (â‰¥6-8 weeks postpartum).',
 fr: 'Retour progressif au sport aprÃ¨s l\'accouchement : pÃ©rinÃ©e â†’ core profond â†’ force â†’ impact. Commence uniquement avec l\'accord mÃ©dical (â‰¥6-8 semaines).',
 it: 'Ritorno progressivo allo sport dopo il parto: pavimento pelvico â†’ core profondo â†’ forza â†’ impatto. Inizia solo con l\'ok medico (â‰¥6-8 settimane).',
 },
 weeks: [
 { all: { mix: [S('breath', 5), E('kegel', 3, 10), E('cat_cow', 2, 10), S('walk', 15)] } },
 { all: { mix: [S('breath', 5), E('kegel', 3, 12), E('dead_bug', 2, 8), S('walk', 20)] } },
 { all: { mix: [E('kegel', 3, 12), E('dead_bug', 3, 10), E('bird_dog', 3, 8), E('bridge', 3, 10), S('walk', 20)] } },
 { all: { mix: [E('kegel', 3, 15), E('dead_bug', 3, 12), E('bird_dog', 3, 10), E('bridge', 3, 12), S('walk', 25)] } },
 { all: { mix: [E('squat', 3, 10), E('lunge', 2, 8), E('row', 3, 10), E('bridge', 3, 12), S('walk_fast', 25)] } },
 { all: { mix: [E('squat', 3, 12), E('lunge', 3, 8), E('row', 3, 12), E('side_plank', 2, null, 20), S('walk_fast', 30)] } },
 { all: { mix: [E('squat', 3, 12), E('calf_raise', 3, 15), E('jump_soft', 2, 10), S('wu', 5), R(6, [S('run', 1), S('walk', 2)])] } },
 { all: { mix: [E('squat', 3, 15), E('jump_soft', 3, 10), S('wu', 5), R(8, [S('run', 1), S('walk', 1)])] } },
 { all: { mix: [E('goblet', 3, 10), E('hip_thrust', 3, 12), E('press', 2, 10), E('lunge', 2, 10), R(5, [S('run', 2), S('walk', 1)])] } },
 { all: { mix: [E('goblet', 3, 12), E('hip_thrust', 3, 12), E('row', 3, 10), E('side_plank', 2, null, 25), R(6, [S('run', 2), S('walk', 1)])] } },
 { all: { mix: [E('goblet', 4, 10), E('rdl', 3, 10), E('press', 3, 10), E('lunge', 3, 10), R(8, [S('run', 2), S('walk', 1)])] } },
 { all: { mix: [E('goblet', 4, 12), E('hip_thrust', 4, 12), E('press', 3, 12), E('lunge', 3, 12), R(10, [S('run', 2), S('walk', 1)])] } },
 ],
 },
 {
 id: 'strength_40plus', emoji: '', level: 'intermediate', spw: 3,
 showIf: 'age40plus',
 forStages: ['perimenopause', 'menopause', 'postmenopause'],
 name: { es: 'Fuerza 40+ (huesos y mÃºsculo)', en: 'Strength 40+ (bones & muscle)', fr: 'Force 40+ (os et muscles)', it: 'Forza 40+ (ossa e muscoli)' },
 desc: {
 es: 'Programa de 8 semanas para perimenopausia y menopausia: fuerza progresiva + impacto suave + equilibrio para proteger densidad Ã³sea y masa muscular.',
 en: '8-week programme for perimenopause and menopause: progressive strength + gentle impact + balance to protect bone density and muscle mass.',
 fr: 'Programme de 8 semaines pour la pÃ©rimÃ©nopause et la mÃ©nopause : force progressive + impact doux + Ã©quilibre pour protÃ©ger os et muscles.',
 it: 'Programma di 8 settimane per perimenopausa e menopausa: forza progressiva + impatto leggero + equilibrio per proteggere ossa e muscoli.',
 },
 weeks: [
 { all: { mix: [E('squat', 2, 10), E('bridge', 2, 12), E('calf_raise', 2, 12), E('balance', 2, null, 20), S('walk_fast', 10)] } },
 { all: { mix: [E('squat', 3, 10), E('row', 2, 10), E('calf_raise', 3, 12), E('balance', 3, null, 20), S('walk_fast', 10)] } },
 { all: { mix: [E('goblet', 3, 10), E('rdl', 2, 10), E('press', 2, 10), E('step_up', 2, 8), E('balance', 3, null, 30)] } },
 { all: { mix: [E('goblet', 3, 10), E('rdl', 3, 10), E('press', 3, 10), E('step_up', 3, 8), E('jump_soft', 2, 8)] } },
 { all: { mix: [E('goblet', 3, 12), E('hip_thrust', 3, 10), E('row', 3, 12), E('jump_soft', 2, 10), E('balance', 3, null, 30)] } },
 { all: { mix: [E('goblet', 4, 10), E('hip_thrust', 3, 12), E('press', 3, 10), E('step_up', 3, 10), E('jump_soft', 3, 10)] } },
 { all: { mix: [E('goblet', 4, 10), E('rdl', 3, 12), E('row', 4, 10), E('jump_soft', 3, 10), E('plank', 2, null, 30)] } },
 { all: { mix: [E('goblet', 4, 12), E('hip_thrust', 4, 12), E('press', 3, 12), E('step_up', 3, 10), E('side_plank', 2, null, 25)] } },
 ],
 },

 // â”€â”€ Programa activa: 3 sesiones/semana sincronizadas con el ciclo (~3 meses) â”€â”€â”€
 {
  id: 'physio_active_plus', emoji: 'Zap', level: 'advanced', spw: 3,
  phaseRotation: true,
  name: {
   es: 'Activa',
   en: 'Active',
   fr: 'Active',
   it: 'Attiva',
  },
  desc: {
   es: 'Programa para mujeres activas: 3 sesiones/semana adaptadas a tu fase del ciclo. Fuerza, potencia y cardio progresivos en ~3 meses.',
   en: 'Programme for active women: 3 sessions/week adapted to your cycle phase. Progressive strength, power and cardio over ~3 months.',
   fr: 'Programme pour femmes actives : 3 sÃ©ances/semaine adaptÃ©es Ã  ta phase du cycle. Force, puissance et cardio progressifs en ~3 mois.',
   it: 'Programma per donne attive: 3 sessioni/settimana adattate alla tua fase del ciclo. Forza, potenza e cardio progressivi in ~3 mesi.',
  },
  phases: {

   // â”€â”€ Menstrual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   menstrual: {
    note: {
     es: 'El objetivo es recuperarte y mantener tus capacidades. Ponle Ã©nfasis a la movilidad y la tÃ©cnica.',
     en: 'The goal is to recover and maintain your capacities. Focus on mobility and technique.',
     fr: 'L\'objectif est de rÃ©cupÃ©rer et maintenir tes capacitÃ©s. Mets l\'accent sur la mobilitÃ© et la technique.',
     it: 'L\'obiettivo Ã¨ recuperare e mantenere le capacitÃ . Dai prioritÃ  alla mobilitÃ  e alla tecnica.',
    },
    sessions: [
     {
      label: { es: 'Refuerzo suave cuerpo entero', en: 'Light full-body strength', fr: 'Renfo lÃ©ger corps entier', it: 'Rinforzo leggero corpo intero' },
      spec: { mix: [
       // Calentamiento
       E('cat_cow', 1, 10),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('squat', 1, 12),
        E('bridge', 1, 12),
        E('horizontal_row', 1, 12),
        E('reverse_lunge', 1, 10),
        E('incline_pushup', 1, 10),
        E('bird_dog', 1, 8),
        E('balance', 1, null, 30),
        E('press', 1, 10),
       ]),
       // Vuelta a la calma
       S('hip_circles', 2),
       S('arm_circles', 2),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Cardio: endurance 45-60 min', en: 'Cardio: endurance 45-60 min', fr: 'Endurance fondamentale 45-60 min', it: 'Cardio: resistenza 45-60 min' },
      spec: { seg: [S('endurance_cardio', 50)] },
     },
     {
      label: { es: 'Pilates / yoga / movilidad', en: 'Pilates / yoga / mobility', fr: 'Pilates / yoga / mobilitÃ©', it: 'Pilates / yoga / mobilitÃ ' },
      spec: { mix: [
       S('breath', 3),
       E('cat_cow', 1, 15),
       E('lunge_thoracic', 1, 10),
       E('updown_dog', 1, 10),
       E('bridge', 1, 15),
       E('dead_bug', 1, 10),
       S('supine_twist', 4),
       S('child_pose', 1),
       S('breath_chair', 5),
      ] },
     },
    ],
   },

   // â”€â”€ Follicular â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   follicular: {
    note: {
     es: 'Desarrolla fuerza, potencia y capacidad cardiovascular.',
     en: 'Build strength, power and cardiovascular capacity.',
     fr: 'DÃ©veloppe force, puissance et capacitÃ©s cardiovasculaires.',
     it: 'Sviluppa forza, potenza e capacitÃ  cardiovascolare.',
    },
    sessions: [
     {
      label: { es: 'Parte inferior', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
      spec: { mix: [
       // Calentamiento
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       E('jump_squat', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('lateral_lunge', 1, 12),
        E('reverse_lunge', 1, 12),
        E('jump_squat', 1, 12),
        E('single_bridge', 1, 10),
        E('mtn_climber', 1, null, 20),
       ]),
       // Vuelta a la calma
       S('supine_twist', 2),
       E('cat_cow', 1, 10),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Parte superior', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
      spec: { mix: [
       // Calentamiento
       E('bird_dog', 1, 10),
       E('cat_cow', 1, 10),
       E('jumping_jack', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('horizontal_row', 1, 10),
        E('dips', 1, 10),
        E('press', 1, 10),
        E('superman', 1, 10),
        E('mtn_climber', 1, 10),
        E('pushup', 1, 6),
       ]),
       // Vuelta a la calma
       S('cross_seated', 2),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Cardio fraccionado', en: 'Interval cardio', fr: 'FractionnÃ©', it: 'Cardio a intervalli' },
      spec: { seg: [
       S('walk_fast', 10),
       R(8, [S('hiit_work', 1), S('hiit_rest', 1.5)]),
       S('walk', 10),
      ] },
     },
    ],
   },

   // â”€â”€ Ovulatory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ovulatory: {
    note: {
     es: 'Aprovecha este perÃ­odo para trabajar intensidad, potencia y velocidad.',
     en: 'Exploit this period to work on intensity, power and speed.',
     fr: 'Exploite cette pÃ©riode pour travailler intensitÃ©, puissance et vitesse.',
     it: 'Sfrutta questo periodo per lavorare su intensitÃ , potenza e velocitÃ .',
    },
    sessions: [
     {
      label: { es: 'Parte inferior intensa', en: 'Intense lower body', fr: 'Bas du corps intensif', it: 'Parte inferiore intensa' },
      spec: { mix: [
       // Calentamiento
       E('cat_cow', 1, 10),
       E('worlds_greatest', 1, 10),
       E('jumping_jack', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('jump_squat', 1, 12),
        E('pistol_chair', 1, 6),
        E('step_up_knee', 1, 12),
        E('single_bridge', 1, 12),
        E('mtn_climber', 1, null, 20),
       ]),
       // Vuelta a la calma
       S('supine_twist', 2),
       E('updown_dog', 1, 10),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Parte superior intensa', en: 'Intense upper body', fr: 'Haut du corps intensif', it: 'Parte superiore intensa' },
      spec: { mix: [
       // Calentamiento
       E('cat_cow', 1, 10),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('med_ball_slam', 1, 10),
        E('bicep_curl', 1, 10),
        E('med_ball_throw', 1, 10),
        E('kb_swing', 1, 10),
        E('horizontal_row', 1, 10),
        E('side_plank_abd', 1, null, 15),
       ]),
       // Vuelta a la calma
       S('child_sides', 2),
       S('breath_chair', 3),
      ] },
     },
     {
      label: { es: 'Cardio fraccionado intenso', en: 'Intense interval cardio', fr: 'FractionnÃ© intensif', it: 'Cardio intervalli intenso' },
      spec: { seg: [
       S('walk_fast', 10),
       R(10, [S('hiit_work', 1), S('hiit_rest', 1)]),
       S('walk', 10),
      ] },
     },
    ],
   },

   // â”€â”€ Luteal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   luteal: {
    note: {
     es: 'MantÃ©n tus avances y favorece la recuperaciÃ³n al final de la fase.',
     en: 'Maintain your gains and favour recovery towards the end of the phase.',
     fr: 'Maintiens tes acquis et favorise la rÃ©cupÃ©ration en fin de phase.',
     it: 'Mantieni i progressi e favorisci il recupero a fine fase.',
    },
    sessions: [
     {
      label: { es: 'Refuerzo global', en: 'Global strength', fr: 'Renforcement global', it: 'Rinforzo globale' },
      spec: { mix: [
       // Calentamiento
       E('high_knees', 1, null, 90),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('squat', 1, 15),
        E('bridge', 1, 12),
        E('vertical_pull', 1, 12),
        E('horizontal_row', 1, 12),
        E('static_lunge', 1, 10, 10),
        E('incline_pushup', 1, 10),
        E('lateral_band', 1, 20),
        E('balance_arms', 1, null, 30),
        E('press', 1, 12),
       ]),
       // Vuelta a la calma
       E('cat_cow', 1, 10),
       S('child_pose', 1),
       S('breath_chair', 3),
      ] },
     },
     {
      label: { es: 'Movilidad y recuperaciÃ³n (fin de fase / SPM)', en: 'Mobility & recovery (end of phase / PMS)', fr: 'MobilitÃ© et rÃ©cupÃ©ration (fin de phase / SPM)', it: 'MobilitÃ  e recupero (fine fase / SPM)' },
      spec: { mix: [
       E('cat_cow', 1, 10),
       E('bird_dog', 1, 10),
       E('worlds_greatest', 1, 10),
       E('lunge_thoracic', 1, 10),
       E('wall_angels', 1, 10),
       E('sumo_squat', 1, 10),
       E('hip_90_90', 1, 10),
       E('open_book', 1, 10),
       S('child_sides', 2),
       S('breath', 3),
      ] },
     },
     {
      label: { es: 'Cardio: endurance 45-60 min', en: 'Cardio: endurance 45-60 min', fr: 'Endurance fondamentale 45-60 min', it: 'Cardio: resistenza 45-60 min' },
      spec: { seg: [S('endurance_cardio', 50)] },
     },
    ],
   },
  },
 },

 // â”€â”€ Programa muy activa: 4+ sesiones/semana sincronizadas con el ciclo (~3 meses) â”€
 {
  id: 'physio_active_advanced', emoji: 'Trophy', level: 'advanced', spw: 4,
  phaseRotation: true,
  name: {
   es: 'Muy activa',
   en: 'Very active',
   fr: 'TrÃ¨s active (3 mois)',
   it: 'Molto attiva',
  },
  desc: {
   es: 'Programa para mujeres muy activas: 4+ sesiones/semana adaptadas a tu fase del ciclo. Fuerza, potencia y cardio de alta intensidad progresivos en ~3 meses.',
   en: 'Programme for very active women: 4+ sessions/week adapted to your cycle phase. Progressive strength, power and high-intensity cardio over ~3 months.',
   fr: 'Programme pour femmes trÃ¨s actives : 4+ sÃ©ances/semaine adaptÃ©es Ã  ta phase du cycle. Force, puissance et cardio haute intensitÃ© progressifs en ~3 mois.',
   it: 'Programma per donne molto attive: 4+ sessioni/settimana adattate alla tua fase del ciclo. Forza, potenza e cardio ad alta intensitÃ  progressivi in ~3 mesi.',
  },
  phases: {

   // â”€â”€ Menstrual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   menstrual: {
    note: {
     es: 'El objetivo es recuperarte y mantener tus capacidades. Pon el Ã©nfasis en la movilidad y la tÃ©cnica.',
     en: 'The goal is to recover and maintain your capacities. Focus on mobility and technique.',
     fr: 'L\'objectif est de rÃ©cupÃ©rer et maintenir tes capacitÃ©s. Mets l\'accent sur la mobilitÃ© et la technique.',
     it: 'L\'obiettivo Ã¨ recuperare e mantenere le capacitÃ . Dai prioritÃ  alla mobilitÃ  e alla tecnica.',
    },
    sessions: [
     {
      label: { es: 'Refuerzo suave cuerpo entero', en: 'Light full-body strength', fr: 'Renfo lÃ©ger corps entier', it: 'Rinforzo leggero corpo intero' },
      spec: { mix: [
       E('cat_cow', 1, 10),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       R(3, [
        E('squat', 1, 15),
        E('bridge', 1, 15),
        E('row', 1, 15),
        E('reverse_lunge', 1, 10),
        E('incline_pushup', 1, 10),
        E('bird_dog', 1, 8),
        E('balance', 1, null, 30),
        E('press', 1, 15),
       ]),
       S('hip_circles', 2),
       S('arm_circles', 2),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Cardio: endurance 45-60 min', en: 'Cardio: endurance 45-60 min', fr: 'Endurance fondamentale 45-60 min', it: 'Cardio: resistenza 45-60 min' },
      spec: { seg: [S('endurance_cardio', 50)] },
     },
     {
      label: { es: 'Pilates / yoga / movilidad', en: 'Pilates / yoga / mobility', fr: 'Pilates / yoga / mobilitÃ©', it: 'Pilates / yoga / mobilitÃ ' },
      spec: { mix: [
       S('breath', 3),
       E('cat_cow', 1, 15),
       E('open_book', 1, 10),
       E('bird_dog', 1, 15),
       E('updown_dog', 1, 10),
       E('hip_90_90', 1, 10),
       E('dead_bug', 1, 10),
       S('leg_rock', 2),
       E('bridge', 1, 15),
       S('hip_circles', 2),
       S('child_sides', 2),
      ] },
     },
    ],
   },

   // â”€â”€ Follicular â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   follicular: {
    note: {
     es: 'Desarrolla fuerza, potencia y capacidades cardiovasculares.',
     en: 'Build strength, power and cardiovascular capacity.',
     fr: 'DÃ©veloppe force, puissance et capacitÃ©s cardiovasculaires.',
     it: 'Sviluppa forza, potenza e capacitÃ  cardiovascolare.',
    },
    sessions: [
     {
      label: { es: 'Parte inferior', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
      spec: { mix: [
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       E('jump_squat', 1, 10),
       E('updown_dog', 1, 10),
       R(3, [
        E('bulgarian_lunge', 1, 10),
        E('good_morning', 1, 10),
        E('pistol_chair', 1, 10),
        E('active_side_plank', 1, 10),
        S('toe_walk', 1),
        E('lunge_thoracic', 1, 10),
       ]),
       S('supine_twist', 2),
       E('cat_cow', 1, 10),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Parte superior', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
      spec: { mix: [
       E('bird_dog', 1, 10),
       E('cat_cow', 1, 10),
       E('jumping_jack', 1, 10),
       R(3, [
        E('horizontal_row', 1, 10),
        E('dips', 1, 10),
        E('press', 1, 10),
        E('superman', 1, 10),
        E('mtn_climber', 1, 10),
        E('pushup', 1, 6),
       ]),
       S('cross_seated', 2),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Cardio fraccionado', en: 'Interval cardio', fr: 'FractionnÃ©', it: 'Cardio a intervalli' },
      spec: { seg: [
       S('walk_fast', 10),
       R(10, [S('hiit_work', 1), S('hiit_rest', 1.5)]),
       S('walk', 10),
      ] },
     },
    ],
   },

   // â”€â”€ Ovulatory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ovulatory: {
    note: {
     es: 'Aprovecha este perÃ­odo para trabajar intensidad, potencia y velocidad.',
     en: 'Exploit this period to work on intensity, power and speed.',
     fr: 'Exploite cette pÃ©riode pour travailler intensitÃ©, puissance et vitesse.',
     it: 'Sfrutta questo periodo per lavorare su intensitÃ , potenza e velocitÃ .',
    },
    sessions: [
     {
      label: { es: 'Parte inferior intensa', en: 'Intense lower body', fr: 'Bas du corps intensif', it: 'Parte inferiore intensa' },
      spec: { mix: [
       E('cat_cow', 1, 10),
       E('worlds_greatest', 1, 10),
       E('jumping_jack', 1, 10),
       R(3, [
        E('jump_lunge', 1, 12),
        E('mtn_climber', 1, null, 30),
        E('lateral_lunge', 1, 12),
        E('burpee', 1, 6),
        E('single_bridge', 1, 12),
        E('box_jump', 1, 10),
       ]),
       S('supine_twist', 2),
       E('updown_dog', 1, 10),
       S('child_pose', 1),
      ] },
     },
     {
      label: { es: 'Parte superior intensa', en: 'Intense upper body', fr: 'Haut du corps intensif', it: 'Parte superiore intensa' },
      spec: { mix: [
       E('cat_cow', 1, 10),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       R(3, [
        E('med_ball_slam', 1, 10),
        E('bicep_curl', 1, 10),
        E('med_ball_throw', 1, 10),
        E('kb_swing', 1, 10),
        E('horizontal_row', 1, 10),
        E('side_plank_abd', 1, null, 20),
       ]),
       S('child_sides', 2),
       S('breath_chair', 3),
      ] },
     },
     {
      label: { es: 'Cardio fraccionado intenso', en: 'Intense interval cardio', fr: 'FractionnÃ© intensif', it: 'Cardio intervalli intenso' },
      spec: { seg: [
       S('walk_fast', 10),
       R(8, [S('hiit_work', 2), S('hiit_rest', 2)]),
       S('walk', 10),
      ] },
     },
    ],
   },

   // â”€â”€ Luteal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   luteal: {
    note: {
     es: 'MantÃ©n tus avances y favorece la recuperaciÃ³n al final de la fase.',
     en: 'Maintain your gains and favour recovery towards the end of the phase.',
     fr: 'Maintiens tes acquis et favorise la rÃ©cupÃ©ration en fin de phase.',
     it: 'Mantieni i progressi e favorisci il recupero a fine fase.',
    },
    sessions: [
     {
      label: { es: 'Refuerzo global', en: 'Global strength', fr: 'Renforcement global', it: 'Rinforzo globale' },
      spec: { mix: [
       E('high_knees', 1, null, 90),
       E('superman', 1, 10),
       E('worlds_greatest', 1, 10),
       R(3, [
        E('squat', 1, 15),
        E('single_bridge', 1, 10),
        E('vertical_pull', 1, 12),
        E('horizontal_row', 1, 12),
        E('static_lunge', 1, 10, 10),
        E('incline_pushup', 1, 10),
        E('lateral_band', 1, 20),
        E('balance_arms', 1, null, 30),
        E('press', 1, 12),
       ]),
       E('cat_cow', 1, 10),
       S('child_pose', 1),
       S('breath_chair', 3),
      ] },
     },
     {
      label: { es: 'Movilidad y recuperaciÃ³n (fin de fase / SPM)', en: 'Mobility & recovery (end of phase / PMS)', fr: 'MobilitÃ© et rÃ©cupÃ©ration (fin de phase / SPM)', it: 'MobilitÃ  e recupero (fine fase / SPM)' },
      spec: { mix: [
       E('cat_cow', 1, 10),
       E('bird_dog', 1, 10),
       E('worlds_greatest', 1, 10),
       E('lunge_thoracic', 1, 10),
       E('wall_angels', 1, 10),
       E('sumo_squat', 1, 10),
       E('hip_90_90', 1, 10),
       E('open_book', 1, 10),
       S('child_sides', 2),
       S('breath', 3),
      ] },
     },
     {
      label: { es: 'Cardio: endurance 45-60 min', en: 'Cardio: endurance 45-60 min', fr: 'Endurance fondamentale 45-60 min', it: 'Cardio: resistenza 45-60 min' },
      spec: { seg: [S('endurance_cardio', 50)] },
     },
    ],
   },
  },
 },

 // â”€â”€ Programa activa: 1-2 sesiones/semana sincronizadas con el ciclo (~3 meses) â”€
 {
  id: 'physio_active', emoji: 'Flame', level: 'intermediate', spw: 2,
  phaseRotation: true,
  name: {
   es: 'Ocasional',
   en: 'Occasional',
   fr: 'Occasionnelle',
   it: 'Occasionale',
  },
  desc: {
   es: 'Programa para mujeres que se mueven de vez en cuando: 1-2 sesiones/semana adaptadas a tu fase del ciclo. Fuerza, cardio y movilidad progresivos en ~3 meses.',
   en: 'Programme for women who exercise occasionally: 1-2 sessions/week adapted to your cycle phase. Progressive strength, cardio and mobility over ~3 months.',
   fr: 'Programme pour femmes qui bougent de temps en temps : 1-2 sÃ©ances/semaine adaptÃ©es Ã  ta phase du cycle. Force, cardio et mobilitÃ© progressifs en ~3 mois.',
   it: 'Programma per donne che si muovono ogni tanto: 1-2 sessioni/settimana adattate alla tua fase del ciclo. Forza, cardio e mobilitÃ  progressivi in ~3 mesi.',
  },
  phases: {

   // â”€â”€ Menstrual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   menstrual: {
    note: {
     es: 'Adapta la intensidad a tus sensaciones. Incluso una sesiÃ³n corta es mejor que nada.',
     en: 'Adapt intensity to how you feel. Even a short session is better than nothing.',
     fr: 'Adapte l\'intensitÃ© Ã  tes sensations. MÃªme une petite sÃ©ance vaut mieux que rien.',
     it: 'Adatta l\'intensitÃ  alle tue sensazioni. Anche una sessione breve Ã¨ meglio di niente.',
    },
    sessions: [
     {
      label: { es: 'Fuerza suave', en: 'Gentle strength', fr: 'Force douce', it: 'Forza dolce' },
      spec: { mix: [
       // Calentamiento
       E('high_knees', 1, null, 120),
       S('hip_circles', 2),
       S('arm_circles', 2),
       E('cat_cow', 1, 20),
       // Circuito Ã—2-3
       R(2, [
        E('squat', 1, 12),
        E('bridge', 1, 15),
        E('press', 1, 15),
        E('superman', 1, 15),
        E('wall_pushup', 1, 10),
        E('balance', 1, null, 20),
       ]),
       // Vuelta a la calma
       S('child_pose', 2),
       S('leg_rock', 2),
       S('breath', 5),
      ] },
     },
     {
      label: { es: 'Movilidad suave (si regla dolorosa)', en: 'Gentle mobility (if painful period)', fr: 'MobilitÃ© douce (si rÃ¨gles douloureuses)', it: 'MobilitÃ  dolce (se ciclo doloroso)' },
      spec: { mix: [
       S('breath_chair', 5),
       E('cat_cow', 1, 12),
       E('updown_dog', 1, 10),
       E('worlds_greatest', 1, 10),
       E('hip_90_90', 1, 10),
       E('lunge_thoracic', 1, 10),
       E('bird_dog', 1, 12),
       S('child_sides', 2),
      ] },
     },
     {
      label: { es: 'Marcha activa', en: 'Brisk walk', fr: 'Marche active', it: 'Camminata attiva' },
      spec: { seg: [S('walk', 5), S('walk_fast', 20), S('walk', 5)] },
     },
    ],
   },

   // â”€â”€ Follicular â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   follicular: {
    note: {
     es: 'Desarrolla progresivamente tu fuerza, resistencia y coordinaciÃ³n. Puedes aÃ±adir peso o elÃ¡stico.',
     en: 'Progressively build strength, endurance and coordination. You can add weights or a band.',
     fr: 'DÃ©veloppe progressivement ta force, ton endurance et ta coordination. PossibilitÃ© d\'ajouter poids ou Ã©lastique.',
     it: 'Sviluppa progressivamente forza, resistenza e coordinazione. Puoi aggiungere pesi o elastico.',
    },
    sessions: [
     {
      label: { es: 'Fuerza completa', en: 'Full-body strength', fr: 'Force complÃ¨te', it: 'Forza completa' },
      spec: { mix: [
       // Calentamiento
       E('updown_dog', 1, 10),
       E('jumping_jack', 1, 10),
       E('worlds_greatest', 1, 10),
       E('superman', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('squat', 1, 12),
        E('reverse_lunge', 1, 10),
        E('bridge', 1, 12),
        E('step_up', 1, 10),
        E('knee_pushup', 1, 10),
        E('press', 1, 12),
        E('dead_bug', 1, 5),
        E('row', 1, 12),
       ]),
       // Vuelta a la calma
       E('cat_cow', 1, 10),
       S('breath_chair', 5),
      ] },
     },
     {
      label: { es: 'Cardio fraccionado (principiante)', en: 'Beginner interval cardio', fr: 'Cardio fractionnÃ© dÃ©butant', it: 'Cardio a intervalli (principiante)' },
      spec: { seg: [
       S('walk_fast', 10),
       R(5, [S('hiit_work', 1), S('hiit_rest', 2)]),
       S('walk', 10),
      ] },
     },
    ],
   },

   // â”€â”€ Ovulatory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ovulatory: {
    note: {
     es: 'Si te sientes en forma, es la fase donde puedes proponer a tu cuerpo las sesiones mÃ¡s estimulantes.',
     en: 'If you feel good, this is the phase to push your body with the most stimulating sessions.',
     fr: 'Si tu te sens en forme, c\'est la phase oÃ¹ tu peux proposer Ã  ton corps les sÃ©ances les plus stimulantes.',
     it: 'Se ti senti in forma, Ã¨ la fase in cui puoi proporre al tuo corpo le sessioni piÃ¹ stimolanti.',
    },
    sessions: [
     {
      label: { es: 'Fuerza intensa', en: 'Intense strength', fr: 'Force intense', it: 'Forza intensa' },
      spec: { mix: [
       // Calentamiento
       E('updown_dog', 1, 10),
       E('high_knees', 1, 10),
       E('worlds_greatest', 1, 10),
       E('superman', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('jump_squat', 1, 15),
        E('reverse_lunge', 1, 10),
        E('pistol_chair', 1, 10),
        E('step_up_knee', 1, 10),
        E('mtn_climber', 1, 10),
        E('press', 1, 15),
        E('dead_bug', 1, 5),
        E('row', 1, 15),
        E('incline_pushup', 1, 10),
       ]),
       // Vuelta a la calma
       E('cat_cow', 1, 10),
       S('breath_chair', 5),
      ] },
     },
     {
      label: { es: 'Cardio dinÃ¡mico', en: 'Dynamic cardio', fr: 'Cardio dynamique', it: 'Cardio dinamico' },
      spec: { seg: [
       // Calentamiento 10 min
       S('walk_fast', 5),
       S('mob_hips', 3),
       S('arm_circles', 2),
       // Bloques HIIT: 8Ã—(1min rÃ¡pido / 1min recuperaciÃ³n)
       R(8, [S('hiit_work', 1), S('hiit_rest', 1)]),
       // Cardio continuo moderado
       S('walk_fast', 10),
       // Vuelta a la calma
       E('cat_cow', 1, 10),
       S('breath', 3),
      ] },
     },
    ],
   },

   // â”€â”€ Luteal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   luteal: {
    note: {
     es: 'El objetivo es mantener tus avances. Adapta la sesiÃ³n segÃºn cÃ³mo te encuentres.',
     en: 'The goal is to maintain your gains. Adjust the session according to how you feel.',
     fr: 'L\'objectif est de maintenir tes acquis. Adapte la sÃ©ance en fonction de ton ressenti.',
     it: 'L\'obiettivo Ã¨ mantenere i tuoi progressi. Adatta la sessione in base a come ti senti.',
    },
    sessions: [
     {
      label: { es: 'Fuerza de mantenimiento', en: 'Maintenance strength', fr: 'Force de maintien', it: 'Forza di mantenimento' },
      spec: { mix: [
       // Calentamiento
       E('high_knees', 1, null, 120),
       E('cat_cow', 1, 10),
       S('breath', 3),
       E('superman', 1, 10),
       // Circuito Ã—3
       R(3, [
        E('squat_calf', 1, 10),
        E('bridge', 1, 15),
        E('plank', 1, null, 45),
        E('side_plank', 1, null, 15),
        E('lateral_band', 1, 20),
        E('balance', 1, null, 20),
        E('deadlift', 1, 10),
        E('incline_pushup', 1, 10),
       ]),
       // Vuelta a la calma
       S('hip_circles', 2),
       S('arm_circles', 2),
       S('breath', 3),
      ] },
     },
     {
      label: { es: 'Cardio moderado + movilidad', en: 'Moderate cardio + mobility', fr: 'Cardio modÃ©rÃ© + mobilitÃ©', it: 'Cardio moderato + mobilitÃ ' },
      spec: { mix: [
       S('walk_fast', 25),
       S('thoracic_rot', 3),
       S('low_lunge', 3),
       S('supine_twist', 3),
       E('worlds_greatest', 1, 10),
       S('child_pose', 2),
      ] },
     },
    ],
   },
  },
 },

 // â”€â”€ Programa fisio: mujer sedentaria (1 sÃ©ance/semaine, ~14 sÃ©ances = 3 meses) â”€
 {
 id: 'physio_sedentaire', emoji: 'Sprout', level: 'beginner', spw: 1,
 phaseRotation: true, // sesiÃ³n determinada por fase del ciclo
 name: {
  es: 'Sedentaria',
  en: 'Sedentary',
  fr: 'SÃ©dentaire (3 mois)',
  it: 'Sedentaria',
 },
 desc: {
  es: 'Programa para mujeres sedentarias: 1 sesiÃ³n/semana adaptada a tu fase del ciclo. ~14 sesiones para completar el programa en 3 meses.',
  en: 'Programme for sedentary women: 1 session/week adapted to your cycle phase. ~14 sessions to complete in 3 months.',
  fr: 'Programme pour femmes sÃ©dentaires : 1 sÃ©ance/semaine adaptÃ©e Ã  ta phase du cycle. ~14 sÃ©ances pour complÃ©ter le programme en 3 mois.',
  it: 'Programma per donne sedentarie: 1 sessione/settimana adattata alla tua fase del ciclo. ~14 sessioni per completare il programma in 3 mesi.',
 },
 phases: {
  // â”€ Menstrual: 4 sÃ©ances (dÃ©tente, marche, haut, bas) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  menstrual: {
   note: {
    es: 'Fase menstrual: movimiento muy suave. Escucha tu cuerpo.',
    en: 'Menstrual phase: very gentle movement. Listen to your body.',
    fr: 'Phase menstruelle : mouvement trÃ¨s doux. Ã‰coute ton corps.',
    it: 'Fase mestruale: movimento molto dolce. Ascolta il tuo corpo.',
   },
   sessions: [
    {
     label: { es: 'RelajaciÃ³n suave', en: 'Gentle relaxation', fr: 'Relaxation douce', it: 'Rilassamento dolce' },
     spec: { mix: [
      S('breath', 3),
      E('cat_cow', 1, 10),
      S('child_pose', 2),
      E('hip_90_90', 1, 10),
      S('happy_baby', 2),
      S('supine_twist', 2),
      S('sphinx', 2),
      S('breath_chair', 5),
     ] },
    },
    {
     label: { es: 'Marcha activa', en: 'Brisk walk', fr: 'Marche active', it: 'Camminata attiva' },
     spec: { seg: [S('walk', 5), S('walk_fast', 10), S('walk', 5)] },
    },
    {
     label: { es: 'Parte alta', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
     spec: { mix: [
      S('breath', 2),
      S('shoulder_circles', 2),
      E('cat_cow', 1, 10),
      E('lunge_thoracic', 1, 10),
      R(3, [E('wall_pushup', 1, 12), E('row', 1, 10), E('bird_dog', 1, 16), E('knee_plank', 1, null, 20)]),
      S('child_pose', 2),
     ] },
    },
    {
     label: { es: 'Parte baja', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
     spec: { mix: [
      S('walk', 1),
      S('hip_circles', 2),
      S('leg_rock', 2),
      R(2, [E('bridge', 1, 12), E('squat', 1, 10), E('quad_hip_open', 1, 20), E('side_plank', 1, null, 10)]),
      S('breath', 3),
     ] },
    },
   ],
  },

  // â”€ Follicular: 3 sÃ©ances (haut, bas, cardio ludique) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  follicular: {
   note: {
    es: 'Fase folicular: energÃ­a creciente. Botellitas de 0,5 L como peso.',
    en: 'Follicular phase: growing energy. Water bottles (0.5 L) as weights.',
    fr: 'Phase folliculaire : Ã©nergie croissante. Bouteilles d\'eau (0,5 L) comme poids.',
    it: 'Fase follicolare: energia in aumento. Bottiglie da 0,5 L come pesi.',
   },
   sessions: [
    {
     label: { es: 'Parte alta', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
     spec: { mix: [
      S('walk', 2),
      S('arm_circles', 2),
      R(3, [E('press', 1, 20), E('knee_plank', 1, null, 25), E('row', 1, 10), E('pushup', 1, 10)]),
      E('cat_cow', 1, 20),
     ] },
    },
    {
     label: { es: 'Parte baja', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
     spec: { mix: [
      E('high_knees', 1, null, 60),
      S('mob_hips', 2),
      R(3, [E('single_bridge', 1, 10), E('reverse_lunge', 1, 10), E('squat', 1, 10), E('bird_dog', 1, 10), E('step_up', 1, 10)]),
      S('child_pose', 2),
     ] },
    },
    {
     label: { es: 'Cardio libre', en: 'Free cardio', fr: 'Cardio ludique', it: 'Cardio libero' },
     spec: { seg: [S('endurance_cardio', 35)] },
    },
   ],
  },

  // â”€ Ovulatory: 3 sÃ©ances (bas, haut, cardio intervalos) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ovulatory: {
   note: {
    es: 'Fase ovulatoria: pico de energÃ­a. AÃ±ade 2-5 kg si te sientes con fuerza.',
    en: 'Ovulatory phase: energy peak. Add 2-5 kg if you feel strong.',
    fr: 'Phase ovulatoire : pic d\'Ã©nergie. Ajouter 2-5 kg si tu te sens bien.',
    it: 'Fase ovulatoria: picco di energia. Aggiungi 2-5 kg se ti senti forte.',
   },
   sessions: [
    {
     label: { es: 'Parte baja', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
     spec: { mix: [
      E('high_knees', 1, null, 120),
      E('jumping_jack', 1, null, 120),
      E('lunge_thoracic', 1, 20),
      R(3, [E('reverse_lunge', 1, 10), E('jump_squat', 1, 15), E('lateral_band', 1, 20), E('single_bridge', 1, 20), E('calf_raise', 1, 20)]),
      E('cat_cow', 1, 15),
     ] },
    },
    {
     label: { es: 'Parte alta', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
     spec: { mix: [
      E('bird_dog', 1, 20),
      E('jumping_jack', 1, null, 120),
      E('cat_cow', 1, 20),
      R(3, [E('pushup', 1, 15), E('row', 1, 15), E('dips', 1, 15), E('side_plank', 1, null, 30)]),
      S('supine_twist', 2),
     ] },
    },
    {
     label: { es: 'Cardio intervalos', en: 'Interval cardio', fr: 'Cardio intervalles', it: 'Cardio a intervalli' },
     spec: { seg: [S('walk', 5), R(6, [S('run_fast', 1), S('walk', 1)]), S('walk', 5)] },
    },
   ],
  },

  // â”€ Luteal: 4 sÃ©ances (haut, bas, cardio fÃ¡cil, si sÃ­ntomas) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  luteal: {
   note: {
    es: 'Fase lÃºtea: reduce la intensidad. Si hay sÃ­ntomas, opta por la sesiÃ³n de movilidad.',
    en: 'Luteal phase: reduce intensity. If symptoms appear, choose the mobility session.',
    fr: 'Phase lutÃ©ale : rÃ©duis l\'intensitÃ©. Si symptÃ´mes, opte pour la sÃ©ance mobilitÃ©.',
    it: 'Fase luteale: riduci l\'intensitÃ . Se ci sono sintomi, scegli la sessione di mobilitÃ .',
   },
   sessions: [
    {
     label: { es: 'Parte alta', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
     spec: { mix: [
      S('walk', 2),
      E('cat_cow', 1, 20),
      R(3, [E('incline_pushup', 1, 10), E('knee_plank', 1, null, 25), E('row', 1, 10), E('plank', 1, null, 20), E('pushup', 1, 10)]),
      S('breath', 3),
     ] },
    },
    {
     label: { es: 'Parte baja', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
     spec: { mix: [
      E('high_knees', 1, null, 60),
      S('mob_hips', 2),
      R(3, [E('bridge', 1, 10), E('hip_abduction', 1, 10), E('squat', 1, 10), E('balance', 1, null, 30), E('calf_raise', 1, 10)]),
      S('child_pose', 2),
     ] },
    },
    {
     label: { es: 'Cardio suave', en: 'Easy cardio', fr: 'Cardio facile', it: 'Cardio leggero' },
     spec: { seg: [S('walk_fast', 30)] },
    },
    {
     label: { es: 'Movilidad (si hay sÃ­ntomas)', en: 'Mobility (if symptoms)', fr: 'MobilitÃ© (si symptÃ´mes)', it: 'MobilitÃ  (se sintomi)' },
     spec: { mix: [
      S('ankle_circles', 2),
      E('cat_cow', 1, 10),
      E('lunge_thoracic', 1, 10),
      S('supine_twist', 2),
      S('mob_hips', 2),
      S('child_pose', 2),
      S('breath', 3),
     ] },
    },
   ],
  },
 },
 },
];

// Bloque HIIT: n rondas de trabajo/descanso en segundos (como segmento repetido)
function hiitBlock(rounds, workSec, restSec) {
 return [{ x: rounds, of: [{ t: 'hiit_work', s: workSec }, { t: 'hiit_rest', s: restSec }] }];
}

// â”€â”€ API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Sesiones totales de un programa */
export function totalSessions(p) {
 if (p.phaseRotation) {
  return Object.values(p.phases).reduce((s, ph) => s + ph.sessions.length, 0);
 }
 return p.weeks.reduce((sum, w) => sum + (w.list ? w.list.length : p.spw), 0);
}

/** Devuelve { week (1-based), idx (1-based), spec } de la sesiÃ³n nÂº n (0-based) */
export function getSession(p, n) {
 if (p.phaseRotation) return null; // programas de rotaciÃ³n por fase usan getPhaseSession
 let i = n;
 for (let w = 0; w < p.weeks.length; w++) {
 const sessions = p.weeks[w].list || Array(p.spw).fill(p.weeks[w].all);
 if (i < sessions.length) return { week: w + 1, idx: i + 1, perWeek: sessions.length, spec: sessions[i] };
 i -= sessions.length;
 }
 return null;
}

/** Para programas phaseRotation: devuelve la sesiÃ³n correspondiente a la fase actual.
 * pp = phase progress map { menstrual: 0, follicular: 1, ... } guardado en activeProgram.pp */
export function getPhaseSession(p, phase = 'follicular', pp = {}) {
 if (!p.phaseRotation) return null;
 const phaseDef = p.phases[phase];
 if (!phaseDef?.sessions?.length) return null;
 const done = pp[phase] || 0;
 const idx = done % phaseDef.sessions.length;
 const session = phaseDef.sessions[idx];
 return {
  phase,
  idx: idx + 1,
  totalInPhase: phaseDef.sessions.length,
  phasesDone: done,
  spec: session.spec,
  label: session.label,
  note: phaseDef.note,
 };
}

/** Formatea un item (segmento, repeticiÃ³n o ejercicio) a texto legible */
export function formatItem(item, lang = 'es') {
 const L = (o) => o?.[lang] || o?.es || '';
 if (item.e) {
 const name = L(EX[item.e]);
 if (item.secs) return `${name} â€” ${item.sets}Ã—${item.secs}"`;
 return `${name} â€” ${item.sets}Ã—${item.reps}`;
 }
 if (item.x) {
 const inner = item.of.map(s => formatItem(s, lang)).join(' + ');
 return `${item.x} Ã— (${inner})`;
 }
 const name = L(LBL[item.t]);
 if (item.s) return `${name} ${item.s}"`;
 return item.m ? `${name} ${item.m}'` : name;
}

/** Lista de lÃ­neas legibles de una sesiÃ³n */
export function formatSession(spec, lang = 'es') {
 const items = spec.seg || spec.mix || spec.ex || [];
 return items.map(it => formatItem(it, lang));
}

/** DuraciÃ³n aproximada de una sesiÃ³n en minutos */
export function sessionMinutes(spec) {
 const items = spec.seg || spec.mix || spec.ex || [];
 const one = (it) => {
 if (it.e) return (it.sets || 1) * 1.5; // ~1,5 min por serie
 if (it.x) return it.x * it.of.reduce((s, i) => s + one(i), 0);
 if (it.s) return it.s / 60;
 return it.m || 0;
 };
 return Math.round(items.reduce((s, it) => s + one(it), 0));
}

/** Nivel en texto */
export const LEVEL_LABEL = {
 beginner: { es: 'Principiante', en: 'Beginner', fr: 'DÃ©butante', it: 'Principiante' },
 intermediate: { es: 'Intermedio', en: 'Intermediate', fr: 'IntermÃ©diaire', it: 'Intermedio' },
};

/** Estado del programa activo de la usuaria (null si no hay o estÃ¡ terminado) */
export function getActiveProgramState(profileExtended, phase = 'follicular') {
 const active = profileExtended?.activeProgram;
 if (!active) return null;
 const program = PROGRAMS.find(p => p.id === active.id);
 if (!program) return null;
 const total = totalSessions(program);
 const done = active.done || 0;
 if (done >= total) return null;
 if (program.phaseRotation) {
  const ps = getPhaseSession(program, phase, active.pp || {});
  return { program, active, total, done, session: ps, isPhaseProgram: true };
 }
 return { program, active, total, done, session: getSession(program, done) };
}

/** DÃ­as JS (0-6) de la semana en los que toca sesiÃ³n del programa:
 * los primeros N dÃ­as de entreno de la usuaria (N = sesiones/semana del programa) */
export function getProgramDays(program, trainDays = []) {
 const days = [...trainDays].sort((a, b) => a - b);
 return days.slice(0, Math.min(program.spw, days.length));
}

/** SesiÃ³n nÂº n del programa en formato tarjeta "SesiÃ³n de hoy" */
export function programSessionToCard(state, lang = 'es', n = null) {
 const { program, total, isPhaseProgram } = state;
 const L = (o) => o?.[lang] || o?.es || '';
 if (isPhaseProgram) {
  const ps = state.session;
  if (!ps) return null;
  return {
   id: `program_${program.id}_${ps.phase}`,
   isProgram: true,
   name: `${L(program.name)} Â· ${L(ps.label)}`,
   ico: program.emoji,
   dur: `${sessionMinutes(ps.spec)}'`,
   duration: sessionMinutes(ps.spec),
   exercises: formatSession(ps.spec, lang).map(line => ({ name: line, reps: '' })),
   tips: ps.note ? [L(ps.note)] : [],
   on: true,
  };
 }
 const idx = n == null ? state.done : n;
 if (idx >= total) return null;
 const sess = getSession(program, idx);
 if (!sess) return null;
 const wkLabel = { es: 'Sem', en: 'Wk', fr: 'Sem', it: 'Sett' }[lang] || 'Sem';
 return {
 id: `program_${program.id}_${idx}`,
 isProgram: true,
 name: `${L(program.name)} Â· ${wkLabel} ${sess.week}/${program.weeks.length}`,
 ico: program.emoji,
 dur: `${sessionMinutes(sess.spec)}'`,
 duration: sessionMinutes(sess.spec),
 exercises: formatSession(sess.spec, lang).map(line => ({ name: line, reps: '' })),
 tips: [],
 on: true,
 };
}

/**
 * Â¿Debe mostrarse este programa a esta usuaria?
 * showIf: 'postpartum' â†’ solo si lifeStage === 'postpartum'
 * showIf: 'age40plus'  â†’ solo si la usuaria tiene â‰¥ 40 aÃ±os
 */
export function isVisible(p, profileExtended = {}, age = null) {
 if (!p.showIf) return true;
 if (p.showIf === 'postpartum') return (profileExtended.lifeStage || '') === 'postpartum';
 if (p.showIf === 'age40plus') return age != null && age >= 40;
 return true;
}

/** Â¿Es recomendado para esta usuaria? (badge "Para ti") */
export function isRecommended(p, profileExtended = {}) {
 const lifeStage = profileExtended.lifeStage || '';
 const sportGoal = profileExtended.goals?.sport || '';
 const sports = profileExtended.sportProfile?.currentSports || [];
 if (p.forLifeStage && p.forLifeStage === lifeStage) return true;
 if (p.forStages?.includes(lifeStage)) return true;
 if (p.id === 'run_0_5k' && sportGoal === 'resume') return true;
 if (p.id === 'run_5k_10k' && (sportGoal === 'competition' || sports.includes('running'))) return true;
 if (p.id === 'strength_beginner' && sportGoal === 'muscle') return true;
 if (p.id === 'swim_beginner' && sports.includes('swimming')) return true;
 if (p.id === 'physio_sedentaire' && ['sedentary', 'light'].includes(profileExtended?.fitnessLevel)) return true;
 if (p.id === 'physio_active_advanced' && profileExtended?.fitnessLevel === 'very_active') return true;
 return false;
}

