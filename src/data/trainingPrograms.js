/**
 * trainingPrograms.js — catálogo de programas de entrenamiento guiados.
 *
 * Contenido paramétrico: las sesiones se componen de segmentos (correr X min,
 * caminar X min, repetir N veces…) o ejercicios (sentadilla 3×12). Los textos
 * salen de los catálogos LBL/EX en 4 idiomas, así que añadir un programa nuevo
 * no requiere traducir prosa.
 *
 * Progreso de la usuaria → profile_extended.activeProgram = { id, started, done }
 * (done = nº de sesiones completadas; semana/sesión se derivan).
 */

// ── Etiquetas de segmentos ────────────────────────────────────────────────────
export const LBL = {
 wu: { es: 'Calentamiento andando', en: 'Warm-up walk', fr: 'Échauffement en marchant', it: 'Riscaldamento camminando' },
 cd: { es: 'Vuelta a la calma', en: 'Cool-down', fr: 'Retour au calme', it: 'Defaticamento' },
 run: { es: 'Correr', en: 'Run', fr: 'Courir', it: 'Correre' },
 run_easy: { es: 'Trote suave', en: 'Easy jog', fr: 'Footing léger', it: 'Corsa leggera' },
 run_fast: { es: 'Ritmo rápido', en: 'Fast pace', fr: 'Allure rapide', it: 'Ritmo veloce' },
 walk: { es: 'Caminar', en: 'Walk', fr: 'Marcher', it: 'Camminare' },
 walk_fast: { es: 'Caminar rápido', en: 'Brisk walk', fr: 'Marche rapide', it: 'Camminata veloce' },
 stretch: { es: 'Estiramientos', en: 'Stretching', fr: 'Étirements', it: 'Stretching' },
 breath: { es: 'Respiración diafragmática', en: 'Diaphragmatic breathing', fr: 'Respiration diaphragmatique', it: 'Respirazione diaframmatica' },
 swim_breath:{ es: 'Respiración en el agua', en: 'Water breathing drills', fr: 'Respiration dans l\'eau', it: 'Respirazione in acqua' },
 swim_float:{ es: 'Flotación y deslizamiento', en: 'Floating & gliding', fr: 'Flottaison et glisse', it: 'Galleggiamento e scivolamento' },
 swim_kick: { es: 'Batida con tabla', en: 'Kick with board', fr: 'Battements avec planche', it: 'Gambata con tavoletta' },
 swim_arms: { es: 'Brazos de crol con tabla', en: 'Crawl arms with board', fr: 'Bras de crawl avec planche', it: 'Bracciata stile libero con tavoletta' },
 swim_crawl:{ es: 'Crol', en: 'Front crawl', fr: 'Crawl', it: 'Stile libero' },
 swim_back: { es: 'Espalda suave', en: 'Easy backstroke', fr: 'Dos léger', it: 'Dorso leggero' },
 swim_rest: { es: 'Descanso en el borde', en: 'Rest at the wall', fr: 'Repos au mur', it: 'Riposo al bordo' },
 hiit_work: { es: 'Alta intensidad', en: 'High intensity', fr: 'Haute intensité', it: 'Alta intensità' },
 hiit_rest: { es: 'Recuperación', en: 'Recovery', fr: 'Récupération', it: 'Recupero' },
 mob_hips: { es: 'Movilidad de cadera', en: 'Hip mobility', fr: 'Mobilité des hanches', it: 'Mobilità delle anche' },
 mob_spine: { es: 'Movilidad de columna', en: 'Spine mobility', fr: 'Mobilité du dos', it: 'Mobilità della colonna' },
 squat_hold:{ es: 'Sentadilla profunda mantenida', en: 'Deep squat hold', fr: 'Squat profond maintenu', it: 'Squat profondo mantenuto' },
 // ── Movilidad / relajación (programa fisio) ─────────────────────────────────
 child_pose: { es: 'Postura del niño', en: "Child's pose", fr: "Posture de l'enfant", it: 'Postura del bambino' },
 happy_baby: { es: 'Happy baby', en: 'Happy baby', fr: 'Happy baby', it: 'Happy baby' },
 supine_twist:{ es: 'Torsión supina', en: 'Supine twist', fr: 'Torsion allongée', it: 'Torsione supina' },
 sphinx:      { es: 'Esfinge', en: 'Sphinx', fr: 'Sphinx', it: 'Sfinge' },
 hip_circles: { es: 'Círculos de cadera', en: 'Hip circles', fr: 'Cercles de bassin', it: 'Cerchi fianchi' },
 spine_rotation:{ es: 'Rotación de columna', en: 'Spine rotation', fr: 'Rotation du dos', it: 'Rotazione colonna' },
 ankle_circles:{ es: 'Movilidad de tobillo', en: 'Ankle mobility', fr: 'Mobilité des chevilles', it: 'Mobilità caviglia' },
 arm_circles: { es: 'Círculos de brazos', en: 'Arm circles', fr: 'Cercles de bras', it: 'Cerchi braccia' },
 shoulder_circles:{ es: 'Círculos de hombros', en: 'Shoulder circles', fr: "Cercles d'épaules", it: 'Cerchi spalle' },
};

// ── Catálogo de ejercicios ────────────────────────────────────────────────────
export const EX = {
 squat: { es: 'Sentadilla', en: 'Squat', fr: 'Squat', it: 'Squat' },
 goblet: { es: 'Sentadilla goblet', en: 'Goblet squat', fr: 'Goblet squat', it: 'Goblet squat' },
 rdl: { es: 'Peso muerto rumano', en: 'Romanian deadlift', fr: 'Soulevé de terre roumain', it: 'Stacco rumeno' },
 lunge: { es: 'Zancada', en: 'Lunge', fr: 'Fente', it: 'Affondo' },
 pushup: { es: 'Flexión (rodillas si hace falta)', en: 'Push-up (knees if needed)', fr: 'Pompe (genoux si besoin)', it: 'Piegamento (ginocchia se serve)' },
 row: { es: 'Remo (mancuerna o banda)', en: 'Row (dumbbell or band)', fr: 'Rowing (haltère ou élastique)', it: 'Rematore (manubrio o elastico)' },
 press: { es: 'Press de hombros', en: 'Shoulder press', fr: 'Développé épaules', it: 'Lento avanti' },
 plank: { es: 'Plancha', en: 'Plank', fr: 'Planche', it: 'Plank' },
 side_plank: { es: 'Plancha lateral', en: 'Side plank', fr: 'Planche latérale', it: 'Plank laterale' },
 bridge: { es: 'Puente de glúteos', en: 'Glute bridge', fr: 'Pont fessier', it: 'Ponte glutei' },
 hip_thrust: { es: 'Hip thrust', en: 'Hip thrust', fr: 'Hip thrust', it: 'Hip thrust' },
 step_up: { es: 'Subida al cajón', en: 'Step-up', fr: 'Montée sur step', it: 'Step-up' },
 dead_bug: { es: 'Dead bug', en: 'Dead bug', fr: 'Dead bug', it: 'Dead bug' },
 bird_dog: { es: 'Bird dog', en: 'Bird dog', fr: 'Bird dog', it: 'Bird dog' },
 cat_cow: { es: 'Gato-vaca', en: 'Cat-cow', fr: 'Chat-vache', it: 'Gatto-mucca' },
 kegel: { es: 'Kegel (suelo pélvico)', en: 'Kegel (pelvic floor)', fr: 'Kegel (périnée)', it: 'Kegel (pavimento pelvico)' },
 calf_raise: { es: 'Elevación de talones', en: 'Calf raise', fr: 'Élévation des mollets', it: 'Sollevamento polpacci' },
 jump_soft: { es: 'Saltos suaves', en: 'Soft jumps', fr: 'Petits sauts', it: 'Salti leggeri' },
 balance: { es: 'Equilibrio a una pierna', en: 'Single-leg balance', fr: 'Équilibre sur une jambe', it: 'Equilibrio su una gamba' },
 burpee: { es: 'Burpee (versión adaptada ok)', en: 'Burpee (modified ok)', fr: 'Burpee (version adaptée ok)', it: 'Burpee (versione adattata ok)' },
 mtn_climber:{ es: 'Escalador', en: 'Mountain climber', fr: 'Mountain climber', it: 'Mountain climber' },
 jumping_jack:{ es: 'Jumping jacks', en: 'Jumping jacks', fr: 'Jumping jacks', it: 'Jumping jacks' },
 high_knees: { es: 'Rodillas altas', en: 'High knees', fr: 'Montées de genoux', it: 'Ginocchia alte' },
 // ── Ejercicios programa fisio sedentaria ──────────────────────────────────────
 wall_pushup:  { es: 'Flexión en pared', en: 'Wall push-up', fr: 'Pompe contre le mur', it: 'Piegamento al muro' },
 knee_plank:   { es: 'Plancha sobre rodillas', en: 'Knee plank', fr: 'Planche sur genoux', it: 'Plank sulle ginocchia' },
 lunge_thoracic:{ es: 'Fente + rotación torácica', en: 'Lunge + thoracic rotation', fr: 'Fente + rotation thoracique', it: 'Affondo + rotazione toracica' },
 quad_hip_open:{ es: 'Apertura de cadera en cuadrupedia', en: 'Hip opening in quadruped', fr: 'Ouverture hanche en quadrupédie', it: 'Apertura anca in quadrupedia' },
 single_bridge:{ es: 'Puente de glúteos a 1 pierna', en: 'Single-leg glute bridge', fr: 'Pont fessier 1 jambe', it: 'Ponte glutei 1 gamba' },
 reverse_lunge:{ es: 'Zancada hacia atrás', en: 'Reverse lunge', fr: 'Fente arrière', it: 'Affondo indietro' },
 jump_squat:   { es: 'Sentadilla con salto', en: 'Jump squat', fr: 'Squat sauté', it: 'Squat con salto' },
 lateral_band: { es: 'Marcha lateral con banda', en: 'Lateral band walk', fr: 'Marche latérale avec élastique', it: 'Marcia laterale con elastico' },
 incline_pushup:{ es: 'Flexión inclinada', en: 'Incline push-up', fr: 'Pompe inclinée', it: 'Piegamento inclinato' },
 dips:         { es: 'Fondos de tríceps', en: 'Triceps dips', fr: 'Dips triceps', it: 'Dips tricipiti' },
 hip_abduction:{ es: 'Abducción de cadera', en: 'Hip abduction', fr: 'Abduction des hanches', it: 'Abduzione anca' },
};

// ── Helpers de construcción ───────────────────────────────────────────────────
const S = (t, m) => ({ t, m }); // segmento simple: tipo + minutos
const R = (x, of) => ({ x, of }); // repetir x veces
const E = (e, sets, reps, secs) => ({ e, sets, reps, secs }); // ejercicio
const seg = (...items) => ({ seg: items });
const exs = (...items) => ({ ex: items });

// Sesión C25K estándar: wu 5' + intervalos + cd 5'
const c25k = (...mid) => seg(S('wu', 5), ...mid, S('cd', 5));

// ── LOS 9 PROGRAMAS ───────────────────────────────────────────────────────────
export const PROGRAMS = [
 {
 id: 'run_0_5k', emoji: '', cat: 'run', level: 'beginner', spw: 3,
 name: { es: 'De 0 a 5K', en: 'Couch to 5K', fr: 'De 0 à 5 km', it: 'Da 0 a 5K' },
 desc: {
 es: 'Aprende a correr desde cero en 8 semanas alternando caminar y correr. Al final correrás 30 minutos seguidos (~5 km).',
 en: 'Learn to run from scratch in 8 weeks alternating walking and running. By the end you\'ll run 30 minutes non-stop (~5 km).',
 fr: 'Apprends à courir de zéro en 8 semaines en alternant marche et course. À la fin tu courras 30 minutes sans t\'arrêter (~5 km).',
 it: 'Impara a correre da zero in 8 settimane alternando camminata e corsa. Alla fine correrai 30 minuti di fila (~5 km).',
 },
 weeks: [
 { all: c25k(R(8, [S('run', 1), S('walk', 2)])) },
 { all: c25k(R(6, [S('run', 2), S('walk', 2)])) },
 { all: c25k(R(5, [S('run', 3), S('walk', 2)])) },
 { all: c25k(R(4, [S('run', 5), S('walk', 2)])) },
 { all: c25k(R(3, [S('run', 8), S('walk', 2)])) },
 { all: c25k(R(2, [S('run', 12), S('walk', 3)])) },
 { all: c25k(S('run', 20)) },
 { list: [c25k(S('run', 25)), c25k(S('run', 28)), c25k(S('run', 30))] },
 ],
 },
 {
 id: 'swim_beginner', emoji: '', cat: 'swim', level: 'beginner', spw: 2,
 name: { es: 'Natación desde cero', en: 'Swimming from scratch', fr: 'Natation de zéro', it: 'Nuoto da zero' },
 desc: {
 es: 'De no saber nadar (o casi) a nadar 400 m de crol seguidos en 6 semanas. Respiración, flotación, técnica y resistencia.',
 en: 'From barely swimming to 400 m of continuous crawl in 6 weeks. Breathing, floating, technique and endurance.',
 fr: 'De presque rien à 400 m de crawl en continu en 6 semaines. Respiration, flottaison, technique et endurance.',
 it: 'Da quasi zero a 400 m di stile libero continuo in 6 settimane. Respirazione, galleggiamento, tecnica e resistenza.',
 },
 weeks: [
 { all: seg(S('swim_breath', 10), S('swim_float', 10), S('swim_kick', 10)) },
 { all: seg(S('swim_breath', 5), S('swim_kick', 10), S('swim_arms', 10), S('swim_float', 5)) },
 { all: seg(S('swim_kick', 5), R(8, [S('swim_crawl', 1), S('swim_rest', 1)]), S('swim_back', 5)) },
 { all: seg(S('swim_kick', 5), R(6, [S('swim_crawl', 2), S('swim_rest', 1)]), S('swim_back', 5)) },
 { all: seg(S('swim_kick', 5), R(4, [S('swim_crawl', 4), S('swim_rest', 1)]), S('swim_back', 5)) },
 { list: [
 seg(S('swim_kick', 5), R(2, [S('swim_crawl', 8), S('swim_rest', 2)]), S('swim_back', 5)),
 seg(S('swim_kick', 5), S('swim_crawl', 15), S('swim_back', 5)),
 ] },
 ],
 },
 {
 id: 'postpartum_return', emoji: '', cat: 'strength', level: 'beginner', spw: 3,
 forLifeStage: 'postpartum',
 name: { es: 'Posparto: vuelta segura', en: 'Postpartum: safe return', fr: 'Post-partum : retour en douceur', it: 'Post parto: ritorno sicuro' },
 desc: {
 es: 'Vuelta progresiva al deporte tras el parto: suelo pélvico → core profundo → fuerza → impacto. Empieza solo con el alta médica (≥6-8 semanas posparto).',
 en: 'Progressive return to sport after birth: pelvic floor → deep core → strength → impact. Start only with medical clearance (≥6-8 weeks postpartum).',
 fr: 'Retour progressif au sport après l\'accouchement : périnée → core profond → force → impact. Commence uniquement avec l\'accord médical (≥6-8 semaines).',
 it: 'Ritorno progressivo allo sport dopo il parto: pavimento pelvico → core profondo → forza → impatto. Inizia solo con l\'ok medico (≥6-8 settimane).',
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
 ],
 },
 {
 id: 'cycle_strength', emoji: '', cat: 'strength', level: 'intermediate', spw: 3,
 name: { es: 'Fuerza con tu ciclo', en: 'Strength with your cycle', fr: 'Force avec ton cycle', it: 'Forza con il tuo ciclo' },
 desc: {
 es: '4 semanas de fuerza sincronizadas con tu ciclo: suave en la menstruación, carga progresiva en la folicular, máxima en la ovulación y técnica en la lútea. Empiézalo el primer día de tu regla.',
 en: '4 weeks of strength synced with your cycle: gentle during your period, progressive load in follicular, max effort at ovulation and technique in luteal. Start it on day 1 of your period.',
 fr: '4 semaines de force synchronisées avec ton cycle : doux pendant les règles, charge progressive en folliculaire, max à l\'ovulation, technique en lutéale. Commence le 1er jour de tes règles.',
 it: '4 settimane di forza sincronizzate con il ciclo: leggera durante il ciclo, carico progressivo in follicolare, massimo all\'ovulazione, tecnica in luteale. Inizia il 1º giorno del ciclo.',
 },
 weeks: [
 { all: { mix: [S('mob_spine', 8), S('mob_hips', 8), E('squat', 2, 10), E('bridge', 2, 12), E('bird_dog', 2, 8), S('stretch', 8)] } },
 { all: { mix: [E('goblet', 3, 10), E('rdl', 3, 10), E('pushup', 3, 8), E('row', 3, 10), E('plank', 3, null, 30)] } },
 { all: { mix: [E('goblet', 4, 8), E('hip_thrust', 4, 8), E('press', 3, 8), E('lunge', 3, 8), E('jump_soft', 3, 8)] } },
 { all: { mix: [E('squat', 3, 12), E('rdl', 3, 12), E('row', 3, 12), E('dead_bug', 3, 10), S('stretch', 10)] } },
 ],
 },
 {
 id: 'strength_beginner', emoji: '', cat: 'strength', level: 'beginner', spw: 3,
 name: { es: 'Fuerza desde cero', en: 'Strength from scratch', fr: 'Force de zéro', it: 'Forza da zero' },
 desc: {
 es: 'Aprende los patrones básicos de fuerza en 8 semanas: sentadilla, bisagra de cadera, empuje y tracción. De tu peso corporal a entrenar con carga.',
 en: 'Learn the basic strength patterns in 8 weeks: squat, hip hinge, push and pull. From bodyweight to training with load.',
 fr: 'Apprends les mouvements de base en 8 semaines : squat, charnière de hanche, poussée et tirage. Du poids du corps à la charge.',
 it: 'Impara gli schemi base della forza in 8 settimane: squat, hip hinge, spinta e trazione. Dal corpo libero al carico.',
 },
 weeks: [
 { all: { mix: [E('squat', 2, 10), E('bridge', 2, 12), E('pushup', 2, 6), E('bird_dog', 2, 8), S('stretch', 5)] } },
 { all: { mix: [E('squat', 3, 10), E('bridge', 3, 12), E('pushup', 3, 6), E('row', 2, 10), E('plank', 2, null, 20)] } },
 { all: { mix: [E('squat', 3, 12), E('rdl', 2, 10), E('pushup', 3, 8), E('row', 3, 10), E('plank', 3, null, 25)] } },
 { all: { mix: [E('goblet', 3, 10), E('rdl', 3, 10), E('press', 2, 10), E('row', 3, 10), E('dead_bug', 2, 10)] } },
 { all: { mix: [E('goblet', 3, 10), E('rdl', 3, 12), E('press', 3, 10), E('lunge', 2, 8), E('plank', 3, null, 30)] } },
 { all: { mix: [E('goblet', 3, 12), E('hip_thrust', 3, 10), E('press', 3, 10), E('lunge', 3, 8), E('side_plank', 2, null, 20)] } },
 { all: { mix: [E('goblet', 4, 10), E('hip_thrust', 3, 12), E('pushup', 3, 10), E('row', 4, 10), E('plank', 3, null, 40)] } },
 { all: { mix: [E('goblet', 4, 12), E('hip_thrust', 4, 12), E('press', 3, 12), E('lunge', 3, 10), E('side_plank', 3, null, 30)] } },
 ],
 },
 {
 id: 'strength_40plus', emoji: '', cat: 'strength', level: 'beginner', spw: 3,
 forStages: ['perimenopause', 'menopause', 'postmenopause'],
 name: { es: 'Fuerza 40+ (huesos y músculo)', en: 'Strength 40+ (bones & muscle)', fr: 'Force 40+ (os et muscles)', it: 'Forza 40+ (ossa e muscoli)' },
 desc: {
 es: 'Programa de 8 semanas para perimenopausia y menopausia: fuerza progresiva + impacto suave + equilibrio para proteger densidad ósea y masa muscular.',
 en: '8-week programme for perimenopause and menopause: progressive strength + gentle impact + balance to protect bone density and muscle mass.',
 fr: 'Programme de 8 semaines pour la périménopause et la ménopause : force progressive + impact doux + équilibre pour protéger os et muscles.',
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
 {
 id: 'run_5k_10k', emoji: '', cat: 'run', level: 'intermediate', spw: 3,
 name: { es: 'De 5K a 10K', en: 'From 5K to 10K', fr: 'De 5 à 10 km', it: 'Da 5K a 10K' },
 desc: {
 es: 'Si ya corres 5 km, en 6 semanas llegarás a 10. Tres sesiones: rodaje suave, intervalos y tirada larga progresiva.',
 en: 'If you already run 5 km, you\'ll reach 10 in 6 weeks. Three sessions: easy run, intervals and a progressive long run.',
 fr: 'Si tu cours déjà 5 km, tu atteindras 10 km en 6 semaines. Trois séances : footing, fractionné et sortie longue progressive.',
 it: 'Se già corri 5 km, in 6 settimane arriverai a 10. Tre sessioni: corsa facile, ripetute e lungo progressivo.',
 },
 weeks: [
 { list: [c25k(S('run_easy', 25)), c25k(R(5, [S('run_fast', 3), S('run_easy', 2)])), c25k(S('run_easy', 35))] },
 { list: [c25k(S('run_easy', 25)), c25k(R(5, [S('run_fast', 3), S('run_easy', 2)])), c25k(S('run_easy', 40))] },
 { list: [c25k(S('run_easy', 30)), c25k(R(4, [S('run_fast', 5), S('run_easy', 2)])), c25k(S('run_easy', 45))] },
 { list: [c25k(S('run_easy', 30)), c25k(R(4, [S('run_fast', 5), S('run_easy', 2)])), c25k(S('run_easy', 50))] },
 { list: [c25k(S('run_easy', 30)), c25k(R(3, [S('run_fast', 8), S('run_easy', 3)])), c25k(S('run_easy', 55))] },
 { list: [c25k(S('run_easy', 25)), c25k(R(3, [S('run_fast', 5), S('run_easy', 2)])), c25k(S('run_easy', 60))] },
 ],
 },
 {
 id: 'mobility_pelvic', emoji: '', cat: 'mobility', level: 'beginner', spw: 5,
 name: { es: 'Movilidad y suelo pélvico', en: 'Mobility & pelvic floor', fr: 'Mobilité et périnée', it: 'Mobilità e pavimento pelvico' },
 desc: {
 es: '10-15 minutos al día, 5 días a la semana, durante 4 semanas: cadera, columna y suelo pélvico. Ideal como complemento de cualquier otro entreno.',
 en: '10-15 minutes a day, 5 days a week, for 4 weeks: hips, spine and pelvic floor. A perfect add-on to any other training.',
 fr: '10-15 minutes par jour, 5 jours par semaine, pendant 4 semaines : hanches, dos et périnée. Le complément idéal de tout entraînement.',
 it: '10-15 minuti al giorno, 5 giorni a settimana, per 4 settimane: anche, colonna e pavimento pelvico. Complemento ideale a qualsiasi allenamento.',
 },
 weeks: [
 { all: { mix: [S('breath', 3), E('cat_cow', 2, 10), S('mob_hips', 4), E('kegel', 2, 10)] } },
 { all: { mix: [S('breath', 3), E('cat_cow', 2, 12), S('mob_hips', 5), E('kegel', 3, 10), S('squat_hold', 1)] } },
 { all: { mix: [S('breath', 3), S('mob_spine', 5), S('mob_hips', 5), E('kegel', 3, 12), S('squat_hold', 2)] } },
 { all: { mix: [S('mob_spine', 5), S('mob_hips', 6), E('kegel', 3, 15), S('squat_hold', 2), S('stretch', 3)] } },
 ],
 },
 {
 id: 'hiit_progressive', emoji: '', cat: 'hiit', level: 'intermediate', spw: 3,
 name: { es: 'HIIT progresivo', en: 'Progressive HIIT', fr: 'HIIT progressif', it: 'HIIT progressivo' },
 desc: {
 es: '6 semanas de HIIT que crece contigo: de 6 intervalos de 20 segundos a 10 de 40. Sesiones de 20-30 minutos para tonificar con poco tiempo.',
 en: '6 weeks of HIIT that grows with you: from 6×20-second intervals to 10×40. 20-30 minute sessions to tone up with little time.',
 fr: '6 semaines de HIIT qui progresse avec toi : de 6 intervalles de 20 s à 10 de 40 s. Séances de 20-30 minutes.',
 it: '6 settimane di HIIT che cresce con te: da 6 intervalli di 20 secondi a 10 da 40. Sessioni di 20-30 minuti.',
 },
 // Bloque HIIT: jumping jacks, sentadilla, escalador, rodillas altas, burpee
 weeks: [
 { all: { mix: [S('wu', 5), ...hiitBlock(6, 20, 40), S('stretch', 5)] } },
 { all: { mix: [S('wu', 5), ...hiitBlock(8, 20, 40), S('stretch', 5)] } },
 { all: { mix: [S('wu', 5), ...hiitBlock(8, 30, 30), S('stretch', 5)] } },
 { all: { mix: [S('wu', 5), ...hiitBlock(10, 30, 30), S('stretch', 5)] } },
 { all: { mix: [S('wu', 5), ...hiitBlock(8, 40, 20), S('stretch', 5)] } },
 { all: { mix: [S('wu', 5), ...hiitBlock(10, 40, 20), S('stretch', 5)] } },
 ],
 },

 // ── Programa fisio: mujer sedentaria (1 séance/semaine, ~14 séances = 3 meses) ─
 {
 id: 'physio_sedentaire', emoji: 'Sprout', cat: 'strength', level: 'beginner', spw: 1,
 phaseRotation: true, // sesión determinada por fase del ciclo
 name: {
  es: 'Sedentaria (3 meses)',
  en: 'Sedentary (3 months)',
  fr: 'Sédentaire (3 mois)',
  it: 'Sedentaria (3 mesi)',
 },
 desc: {
  es: 'Programa para mujeres sedentarias: 1 sesión/semana adaptada a tu fase del ciclo. ~14 sesiones para completar el programa en 3 meses.',
  en: 'Programme for sedentary women: 1 session/week adapted to your cycle phase. ~14 sessions to complete in 3 months.',
  fr: 'Programme pour femmes sédentaires : 1 séance/semaine adaptée à ta phase du cycle. ~14 séances pour compléter le programme en 3 mois.',
  it: 'Programma per donne sedentarie: 1 sessione/settimana adattata alla tua fase del ciclo. ~14 sessioni per completare il programma in 3 mesi.',
 },
 phases: {
  // ─ Menstrual: 4 séances (détente, marche, haut, bas) ────────────────────────
  menstrual: {
   note: {
    es: 'Fase menstrual: movimiento muy suave. Escucha tu cuerpo.',
    en: 'Menstrual phase: very gentle movement. Listen to your body.',
    fr: 'Phase menstruelle : mouvement très doux. Écoute ton corps.',
    it: 'Fase mestruale: movimento molto dolce. Ascolta il tuo corpo.',
   },
   sessions: [
    {
     label: { es: 'Relajación suave', en: 'Gentle relaxation', fr: 'Relaxation douce', it: 'Rilassamento dolce' },
     spec: { mix: [
      S('breath', 3),
      E('cat_cow', 1, 10),
      S('child_pose', 2),
      S('happy_baby', 2),
      S('supine_twist', 2),
      S('sphinx', 2),
      S('breath', 5),
     ] },
    },
    {
     label: { es: 'Marcha activa', en: 'Brisk walk', fr: 'Marche active', it: 'Camminata attiva' },
     spec: { seg: [S('walk', 5), S('walk_fast', 20), S('walk', 5)] },
    },
    {
     label: { es: 'Parte alta', en: 'Upper body', fr: 'Haut du corps', it: 'Parte superiore' },
     spec: { mix: [
      S('breath', 2),
      S('shoulder_circles', 2),
      E('cat_cow', 1, 10),
      E('lunge_thoracic', 1, 10),
      R(3, [E('wall_pushup', 1, 12), E('row', 1, 10), E('bird_dog', 1, 8), E('knee_plank', 1, null, 20)]),
      S('child_pose', 2),
     ] },
    },
    {
     label: { es: 'Parte baja', en: 'Lower body', fr: 'Bas du corps', it: 'Parte inferiore' },
     spec: { mix: [
      S('walk', 2),
      S('hip_circles', 2),
      S('spine_rotation', 2),
      R(2, [E('bridge', 1, 12), E('squat', 1, 10), E('quad_hip_open', 1, 20)]),
      S('breath', 3),
     ] },
    },
   ],
  },

  // ─ Follicular: 3 séances (haut, bas, cardio ludique) ────────────────────────
  follicular: {
   note: {
    es: 'Fase folicular: energía creciente. Botellitas de 0,5 L como peso.',
    en: 'Follicular phase: growing energy. Water bottles (0.5 L) as weights.',
    fr: 'Phase folliculaire : énergie croissante. Bouteilles d\'eau (0,5 L) comme poids.',
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
     spec: { seg: [S('walk', 5), S('walk_fast', 25), S('walk', 5)] },
    },
   ],
  },

  // ─ Ovulatory: 3 séances (bas, haut, cardio intervalos) ─────────────────────
  ovulatory: {
   note: {
    es: 'Fase ovulatoria: pico de energía. Añade 2-5 kg si te sientes con fuerza.',
    en: 'Ovulatory phase: energy peak. Add 2-5 kg if you feel strong.',
    fr: 'Phase ovulatoire : pic d\'énergie. Ajouter 2-5 kg si tu te sens bien.',
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
     spec: { seg: [S('walk', 5), R(7, [S('run_fast', 1), S('walk', 1)]), S('walk', 5)] },
    },
   ],
  },

  // ─ Luteal: 4 séances (haut, bas, cardio fácil, si síntomas) ─────────────────
  luteal: {
   note: {
    es: 'Fase lútea: reduce la intensidad. Si hay síntomas, opta por la sesión de movilidad.',
    en: 'Luteal phase: reduce intensity. If symptoms appear, choose the mobility session.',
    fr: 'Phase lutéale : réduis l\'intensité. Si symptômes, opte pour la séance mobilité.',
    it: 'Fase luteale: riduci l\'intensità. Se ci sono sintomi, scegli la sessione di mobilità.',
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
     label: { es: 'Movilidad (si hay síntomas)', en: 'Mobility (if symptoms)', fr: 'Mobilité (si symptômes)', it: 'Mobilità (se sintomi)' },
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

// ── API ───────────────────────────────────────────────────────────────────────

/** Sesiones totales de un programa */
export function totalSessions(p) {
 if (p.phaseRotation) {
  return Object.values(p.phases).reduce((s, ph) => s + ph.sessions.length, 0);
 }
 return p.weeks.reduce((sum, w) => sum + (w.list ? w.list.length : p.spw), 0);
}

/** Devuelve { week (1-based), idx (1-based), spec } de la sesión nº n (0-based) */
export function getSession(p, n) {
 if (p.phaseRotation) return null; // programas de rotación por fase usan getPhaseSession
 let i = n;
 for (let w = 0; w < p.weeks.length; w++) {
 const sessions = p.weeks[w].list || Array(p.spw).fill(p.weeks[w].all);
 if (i < sessions.length) return { week: w + 1, idx: i + 1, perWeek: sessions.length, spec: sessions[i] };
 i -= sessions.length;
 }
 return null;
}

/** Para programas phaseRotation: devuelve la sesión correspondiente a la fase actual.
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

/** Formatea un item (segmento, repetición o ejercicio) a texto legible */
export function formatItem(item, lang = 'es') {
 const L = (o) => o?.[lang] || o?.es || '';
 if (item.e) {
 const name = L(EX[item.e]);
 if (item.secs) return `${name} — ${item.sets}×${item.secs}"`;
 return `${name} — ${item.sets}×${item.reps}`;
 }
 if (item.x) {
 const inner = item.of.map(s => formatItem(s, lang)).join(' + ');
 return `${item.x} × (${inner})`;
 }
 const name = L(LBL[item.t]);
 if (item.s) return `${name} ${item.s}"`;
 return item.m ? `${name} ${item.m}'` : name;
}

/** Lista de líneas legibles de una sesión */
export function formatSession(spec, lang = 'es') {
 const items = spec.seg || spec.mix || spec.ex || [];
 return items.map(it => formatItem(it, lang));
}

/** Duración aproximada de una sesión en minutos */
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
 beginner: { es: 'Principiante', en: 'Beginner', fr: 'Débutante', it: 'Principiante' },
 intermediate: { es: 'Intermedio', en: 'Intermediate', fr: 'Intermédiaire', it: 'Intermedio' },
};

/** Estado del programa activo de la usuaria (null si no hay o está terminado) */
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

/** Días JS (0-6) de la semana en los que toca sesión del programa:
 * los primeros N días de entreno de la usuaria (N = sesiones/semana del programa) */
export function getProgramDays(program, trainDays = []) {
 const days = [...trainDays].sort((a, b) => a - b);
 return days.slice(0, Math.min(program.spw, days.length));
}

/** Sesión nº n del programa en formato tarjeta "Sesión de hoy" */
export function programSessionToCard(state, lang = 'es', n = null) {
 const { program, total, isPhaseProgram } = state;
 const L = (o) => o?.[lang] || o?.es || '';
 if (isPhaseProgram) {
  const ps = state.session;
  if (!ps) return null;
  return {
   id: `program_${program.id}_${ps.phase}`,
   isProgram: true,
   name: `${L(program.name)} · ${L(ps.label)}`,
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
 name: `${L(program.name)} · ${wkLabel} ${sess.week}/${program.weeks.length}`,
 ico: program.emoji,
 dur: `${sessionMinutes(sess.spec)}'`,
 duration: sessionMinutes(sess.spec),
 exercises: formatSession(sess.spec, lang).map(line => ({ name: line, reps: '' })),
 tips: [],
 on: true,
 };
}

/** ¿Es recomendado para esta usuaria? (badge "Para ti") */
export function isRecommended(p, profileExtended = {}) {
 const lifeStage = profileExtended.lifeStage || '';
 const sportGoal = profileExtended.goals?.sport || '';
 const sports = profileExtended.sportProfile?.currentSports || [];
 if (p.forLifeStage && p.forLifeStage === lifeStage) return true;
 if (p.forStages?.includes(lifeStage)) return true;
 if (p.id === 'run_0_5k' && sportGoal === 'resume') return true;
 if (p.id === 'run_5k_10k' && (sportGoal === 'competition' || sports.includes('running'))) return true;
 if (p.id === 'strength_beginner' && sportGoal === 'muscle') return true;
 if (p.id === 'hiit_progressive' && sportGoal === 'tone') return true;
 if (p.id === 'cycle_strength' && sportGoal === 'muscle') return true;
 if (p.id === 'swim_beginner' && sports.includes('swimming')) return true;
 if (p.id === 'physio_sedentaire' && ['sedentary', 'light'].includes(profileExtended?.fitnessLevel)) return true;
 return false;
}
