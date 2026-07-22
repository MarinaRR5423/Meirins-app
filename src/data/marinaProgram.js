// ─── Programa personalizado de Marina (Alan, abril 2026) ──────────────────────

// ── NUTRICIÓN (menús estáticos eliminados — contenido 100% desde Supabase) ─────

const MENU_A_UNUSED = {
  label: { es: 'Día A', en: 'Day A', fr: 'Jour A', it: 'Giorno A' },
  tag:   { es: 'Lun · Mié · Vie', en: 'Mon · Wed · Fri', fr: 'Lun · Mer · Ven', it: 'Lun · Mer · Ven' },
  color: '#DBEAFE',
  textColor: '#1D4ED8',
  meals: [
    {
      id: 'desayuno',
      ico: '🌅',
      label: 'Desayuno',
      // Target 320 kcal · HC 40g · PRT 16g · Grasas 11g (20% de 1600 kcal)
      items: {
        es: ['150 g de queso fresco 0 % MG', '20 g de copos de avena', '1 cucharadita de semillas de chía', '1 fruta pequeña (manzana pequeña o kiwi)'],
        en: ['150 g 0% fat cottage cheese', '20 g oat flakes', '1 tsp chia seeds', '1 small fruit (small apple or kiwi)'],
        fr: ['150 g de fromage blanc 0 % MG', '20 g de flocons d\'avoine', '1 cuillère à café de graines de chia', '1 petit fruit (petite pomme ou kiwi)'],
        it: ['150 g di fiocchi di latte 0% grassi', '20 g di fiocchi d\'avena', '1 cucchiaino di semi di chia', '1 frutto piccolo (mela piccola o kiwi)'],
      },
    },
    {
      id: 'snack_manana',
      ico: '🍎',
      label: 'Snack de la mañana',
      items: {
        es: ['1 yogur natural (100 g)', '10 almendras'],
        en: ['1 plain yoghurt (100 g)', '10 almonds'],
        fr: ['1 yaourt nature (100 g)', '10 amandes'],
        it: ['1 yogurt naturale (100 g)', '10 mandorle'],
      },
    },
    {
      id: 'almuerzo',
      ico: '☀️',
      label: 'Almuerzo',
      items: {
        es: ['120 g de pechuga de pollo a la plancha', '150 g de verduras cocidas (brócoli, judías verdes)', '100 g de arroz integral cocido', '1 cucharada de aceite de oliva', '1 fruta fresca'],
        en: ['120 g grilled chicken breast', '150 g cooked vegetables (broccoli, green beans)', '100 g cooked brown rice', '1 tbsp olive oil', '1 fresh fruit'],
        fr: ['120 g de blanc de poulet grillé', '150 g de légumes cuits (brocoli, haricots verts)', '100 g de riz complet cuit', '1 cuillère à soupe d\'huile d\'olive', '1 fruit frais'],
        it: ['120 g di petto di pollo alla griglia', '150 g di verdure cotte (broccoli, fagiolini)', '100 g di riso integrale cotto', '1 cucchiaio di olio d\'oliva', '1 frutto fresco'],
      },
    },
    {
      id: 'snack_tarde',
      ico: '🍊',
      label: 'Snack de la tarde',
      // Target 160 kcal · HC 20g · PRT 8g · Grasas 5g (10% de 1600 kcal)
      items: {
        es: ['1 fruta mediana (naranja o pera)', '80 g de yogur griego 0 % MG'],
        en: ['1 medium fruit (orange or pear)', '80 g 0% Greek yoghurt'],
        fr: ['1 fruit moyen (orange ou poire)', '80 g de yaourt grec 0 % MG'],
        it: ['1 frutto medio (arancia o pera)', '80 g di yogurt greco 0% grassi'],
      },
    },
    {
      id: 'cena',
      ico: '🌙',
      label: 'Cena',
      items: {
        es: ['2 huevos duros o en tortilla', '150 g de verduras variadas (pisto, calabacín salteado)', '50 g de pan integral', '1 cucharadita de aceite de oliva', '1 yogur natural'],
        en: ['2 hard-boiled or scrambled eggs', '150 g mixed vegetables (ratatouille, sautéed courgette)', '50 g wholegrain bread', '1 tsp olive oil', '1 plain yoghurt'],
        fr: ['2 œufs durs ou en omelette', '150 g de légumes variés (ratatouille, courgette sautée)', '50 g de pain complet', '1 cuillère à café d\'huile d\'olive', '1 yaourt nature'],
        it: ['2 uova sode o strapazzate', '150 g di verdure miste (ratatouille, zucchine saltate)', '50 g di pane integrale', '1 cucchiaino di olio d\'oliva', '1 yogurt naturale'],
      },
      recipe: {
        title: { es: 'Tortilla de espinacas y tomate', en: 'Spinach and tomato frittata', fr: 'Omelette épinards-tomate', it: 'Frittata di spinaci e pomodoro' },
        ingredients: {
          es: ['2 huevos', '1 puñado de espinacas', '1 tomate', 'Hierbas aromáticas', '1 cucharadita de aceite de oliva'],
          en: ['2 eggs', '1 handful of spinach', '1 tomato', 'Aromatic herbs', '1 tsp olive oil'],
          fr: ['2 œufs', '1 poignée d\'épinards', '1 tomate', 'Herbes aromatiques', '1 cuillère à café d\'huile d\'olive'],
          it: ['2 uova', '1 manciata di spinaci', '1 pomodoro', 'Erbe aromatiche', '1 cucchiaino di olio d\'oliva'],
        },
        steps: {
          es: ['Batir los huevos, salar ligeramente.', 'Saltear las espinacas y el tomate en dados 2 min.', 'Verter los huevos sobre las verduras y cocinar a fuego suave 3 min.', 'Servir con 50 g de pan integral.'],
          en: ['Beat the eggs and season lightly.', 'Sauté the spinach and diced tomato for 2 min.', 'Pour the eggs over the vegetables and cook on low heat for 3 min.', 'Serve with 50 g wholegrain bread.'],
          fr: ['Battre les œufs et saler légèrement.', 'Faire revenir les épinards et la tomate en dés 2 min.', 'Verser les œufs sur les légumes et cuire à feu doux 3 min.', 'Servir avec 50 g de pain complet.'],
          it: ['Sbattere le uova e salare leggermente.', 'Saltare gli spinaci e il pomodoro a dadini per 2 min.', 'Versare le uova sulle verdure e cuocere a fuoco dolce 3 min.', 'Servire con 50 g di pane integrale.'],
        },
      },
    },
  ],
};

const MENU_B_UNUSED = {
  label: { es: 'Día B', en: 'Day B', fr: 'Jour B', it: 'Giorno B' },
  tag:   { es: 'Mar · Jue · Sáb', en: 'Tue · Thu · Sat', fr: 'Mar · Jeu · Sam', it: 'Mar · Gio · Sab' },
  color: '#DCFCE7',
  textColor: '#15803D',
  meals: [
    {
      id: 'desayuno',
      ico: '🌅',
      label: 'Desayuno',
      // Target 320 kcal · HC 40g · PRT 16g · Grasas 11g (20% de 1600 kcal)
      items: {
        es: ['2 rebanadas de pan integral (50 g)', '2 huevos revueltos', '1 fruta fresca pequeña', '1 café o té sin azúcar'],
        en: ['2 slices of wholegrain bread (50 g)', '2 scrambled eggs', '1 small fresh fruit', '1 coffee or unsweetened tea'],
        fr: ['2 tranches de pain complet (50 g)', '2 œufs brouillés', '1 petit fruit frais', '1 café ou thé sans sucre'],
        it: ['2 fette di pane integrale (50 g)', '2 uova strapazzate', '1 piccolo frutto fresco', '1 caffè o tè senza zucchero'],
      },
    },
    {
      id: 'snack_manana',
      ico: '🥝',
      label: 'Snack de la mañana',
      // Target 160 kcal · HC 20g · PRT 8g · Grasas 5g (10% de 1600 kcal)
      items: {
        es: ['1 fruta (kiwi o mandarina)', '6 nueces'],
        en: ['1 fruit (kiwi or clementine)', '6 walnuts'],
        fr: ['1 fruit (kiwi ou mandarine)', '6 noix'],
        it: ['1 frutto (kiwi o mandarino)', '6 noci'],
      },
    },
    {
      id: 'almuerzo',
      ico: '☀️',
      label: 'Almuerzo',
      items: {
        es: ['120 g de filete de pescado (bacalao, salmón o merluza)', '150 g de verduras al vapor (zanahorias, calabacín)', '100 g de quinoa cocida', '1 cucharada de aceite de colza', '1 yogur natural'],
        en: ['120 g fish fillet (cod, salmon or hake)', '150 g steamed vegetables (carrots, courgette)', '100 g cooked quinoa', '1 tbsp rapeseed oil', '1 plain yoghurt'],
        fr: ['120 g de filet de poisson (cabillaud, saumon ou merlu)', '150 g de légumes vapeur (carottes, courgette)', '100 g de quinoa cuit', '1 cuillère à soupe d\'huile de colza', '1 yaourt nature'],
        it: ['120 g di filetto di pesce (merluzzo, salmone o nasello)', '150 g di verdure al vapore (carote, zucchine)', '100 g di quinoa cotta', '1 cucchiaio di olio di colza', '1 yogurt naturale'],
      },
      recipe: {
        title: { es: 'Filete de pescado al vapor', en: 'Steamed fish fillet', fr: 'Filet de poisson vapeur', it: 'Filetto di pesce al vapore' },
        ingredients: {
          es: ['120 g de pescado blanco o salmón', 'Zumo de limón', 'Hierbas frescas', '150 g de verduras al vapor'],
          en: ['120 g white fish or salmon', 'Lemon juice', 'Fresh herbs', '150 g steamed vegetables'],
          fr: ['120 g de poisson blanc ou saumon', 'Jus de citron', 'Herbes fraîches', '150 g de légumes vapeur'],
          it: ['120 g di pesce bianco o salmone', 'Succo di limone', 'Erbe fresche', '150 g di verdure al vapore'],
        },
        steps: {
          es: ['Sazonar el filete con limón y hierbas.', 'Cocinar al vapor 12–15 min según el grosor.', 'Mientras tanto, cocer las verduras al vapor.', 'Servir con 100 g de quinoa cocida y 1 cs de aceite de colza.'],
          en: ['Season the fillet with lemon and herbs.', 'Steam for 12–15 min depending on thickness.', 'Meanwhile, steam the vegetables.', 'Serve with 100 g cooked quinoa and 1 tbsp rapeseed oil.'],
          fr: ['Assaisonner le filet avec citron et herbes.', 'Cuire à la vapeur 12–15 min selon l\'épaisseur.', 'Pendant ce temps, cuire les légumes à la vapeur.', 'Servir avec 100 g de quinoa cuit et 1 cs d\'huile de colza.'],
          it: ['Condire il filetto con limone ed erbe.', 'Cuocere al vapore 12–15 min secondo lo spessore.', 'Nel frattempo cuocere le verdure al vapore.', 'Servire con 100 g di quinoa cotta e 1 cucchiaio di olio di colza.'],
        },
      },
    },
    {
      id: 'snack_tarde',
      ico: '🫐',
      label: 'Snack de la tarde',
      // Target 160 kcal · HC 20g · PRT 8g · Grasas 5g (10% de 1600 kcal)
      items: {
        es: ['1 compota sin azúcar añadido', '80 g de yogur griego 0 % MG', '10 g de almendras'],
        en: ['1 sugar-free compote', '80 g 0% Greek yoghurt', '10 g almonds'],
        fr: ['1 compote sans sucre ajouté', '80 g de yaourt grec 0 % MG', '10 g d\'amandes'],
        it: ['1 composta senza zuccheri aggiunti', '80 g di yogurt greco 0% grassi', '10 g di mandorle'],
      },
    },
    {
      id: 'cena',
      ico: '🌙',
      label: 'Cena',
      // Target 400 kcal · HC 50g · PRT 20g · Grasas 13g (25% de 1600 kcal)
      items: {
        es: ['100 g de garbanzos o lentejas (cocidos)', '150 g de verduras salteadas', '1 huevo duro', '40 g de pan integral', '1 cucharadita de aceite de oliva'],
        en: ['100 g cooked chickpeas or lentils', '150 g mixed sautéed vegetables', '1 hard-boiled egg', '40 g wholegrain bread', '1 tsp olive oil'],
        fr: ['100 g de pois chiches ou lentilles cuits', '150 g de légumes sautés variés', '1 œuf dur', '40 g de pain complet', '1 c. à café d\'huile d\'olive'],
        it: ['100 g di ceci o lenticchie cotti', '150 g di verdure saltate miste', '1 uovo sodo', '40 g di pane integrale', '1 cucchiaino di olio d\'oliva'],
      },
      recipe: {
        title: { es: 'Salteado de verduras y garbanzos', en: 'Chickpea and vegetable stir-fry', fr: 'Sauté de légumes et pois chiches', it: 'Saltato di verdure e ceci' },
        ingredients: {
          es: ['100 g de garbanzos cocidos', '150 g de verduras variadas', 'Especias (comino, pimentón)', '1 cucharadita de aceite de oliva', '1 huevo duro'],
          en: ['100 g cooked chickpeas', '150 g mixed vegetables', 'Spices (cumin, paprika)', '1 tsp olive oil', '1 hard-boiled egg'],
          fr: ['100 g de pois chiches cuits', '150 g de légumes variés', 'Épices (cumin, paprika)', '1 cuillère à café d\'huile d\'olive', '1 œuf dur'],
          it: ['100 g di ceci cotti', '150 g di verdure miste', 'Spezie (cumino, paprika)', '1 cucchiaino di olio d\'oliva', '1 uovo sodo'],
        },
        steps: {
          es: ['Saltear las verduras en dados 5 min a fuego vivo.', 'Añadir los garbanzos y mezclar.', 'Sazonar con las especias, cocinar 3 min más.', 'Servir con el huevo duro y 1 fruta fresca.'],
          en: ['Sauté the diced vegetables for 5 min over high heat.', 'Add the chickpeas and mix.', 'Season with spices and cook for 3 more min.', 'Serve with the hard-boiled egg and 1 fresh fruit.'],
          fr: ['Faire sauter les légumes en dés 5 min à feu vif.', 'Ajouter les pois chiches et mélanger.', 'Assaisonner avec les épices, cuire 3 min de plus.', 'Servir avec l\'œuf dur et 1 fruit frais.'],
          it: ['Saltare le verdure a dadini 5 min a fuoco vivo.', 'Aggiungere i ceci e mescolare.', 'Condire con le spezie, cuocere altri 3 min.', 'Servire con l\'uovo sodo e 1 frutto fresco.'],
        },
      },
    },
  ],
};

const MENU_FREE_UNUSED = {
  label: { es: 'Día libre', en: 'Free day', fr: 'Journée libre', it: 'Giorno libero' },
  tag:   { es: 'Domingo', en: 'Sunday', fr: 'Dimanche', it: 'Domenica' },
  color: '#FEF3C7',
  textColor: '#92400E',
  meals: [
    {
      id: 'placer',
      ico: '😊',
      label: 'Comida placer',
      items: {
        es: ['Brunch o plato familiar — sin excesos', 'Escucha tu hambre y tus ganas', 'Tómate tu tiempo para disfrutar'],
        en: ['Brunch or family meal — no excess', 'Listen to your hunger and cravings', 'Take your time to enjoy'],
        fr: ['Brunch ou plat familial — sans excès', 'Écoute ta faim et tes envies', 'Prends le temps de savourer'],
        it: ['Brunch o pasto in famiglia — senza eccessi', 'Ascolta la tua fame e i tuoi desideri', 'Prenditi il tempo per goderti il pasto'],
      },
    },
    {
      id: 'snacks',
      ico: '🍇',
      label: 'Snacks ligeros',
      items: {
        es: ['Frutas frescas de temporada', 'Yogur natural'],
        en: ['Fresh seasonal fruits', 'Plain yoghurt'],
        fr: ['Fruits frais de saison', 'Yaourt nature'],
        it: ['Frutta fresca di stagione', 'Yogurt naturale'],
      },
    },
    {
      id: 'actividad',
      ico: '🚶',
      label: 'Actividad suave',
      items: {
        es: ['Paseo o caminata en la naturaleza', 'Yoga suave o estiramientos', 'Sin obligación — escucha tu cuerpo'],
        en: ['Walk or nature hike', 'Gentle yoga or stretching', 'No obligation — listen to your body'],
        fr: ['Promenade ou marche en nature', 'Yoga doux ou étirements', 'Sans obligation — écoute ton corps'],
        it: ['Passeggiata o camminata nella natura', 'Yoga dolce o stretching', 'Senza obblighi — ascolta il tuo corpo'],
      },
    },
  ],
};

export const TIPS_NUTRI = {
  es: ['Prepara tus comidas con antelación para ahorrar tiempo.', 'Varía las verduras según la temporada.', 'Bebe agua en cada comida.', 'Si tienes hambre, aumenta las verduras o añade una sopa casera.'],
  en: ['Prepare your meals in advance to save time.', 'Vary your vegetables according to the season.', 'Drink water with every meal.', 'If you are hungry, increase the vegetables or add a home-made soup.'],
  fr: ['Prépare tes repas à l\'avance pour gagner du temps.', 'Varie les légumes selon la saison.', 'Bois de l\'eau à chaque repas.', 'Si tu as faim, augmente les légumes ou ajoute une soupe maison.'],
  it: ['Prepara i pasti in anticipo per risparmiare tempo.', 'Varia le verdure in base alla stagione.', 'Bevi acqua ad ogni pasto.', 'Se hai fame, aumenta le verdure o aggiungi una zuppa fatta in casa.'],
};

// ── Detect whether a menu/session is the old Supabase flat-string format ────────
// Old format: menu.label is a plain string (e.g. 'Día A')
// New format: menu.label is a multilingual object (e.g. { es: 'Día A', en: 'Day A', fr: 'Jour A' })
function isLegacyMenu(menu) {
  return menu && typeof menu.label === 'string';
}
function isLegacySession(session) {
  return session && typeof session.name === 'string';
}

// ── Helper: flatten a multilingual field to current language ──────────────────
function loc(field, lang) {
  if (!field || typeof field === 'string') return field;
  if (Array.isArray(field)) return field;
  return field[lang] ?? field.es ?? field;
}


export function resolveTips(tips, lang) {
  if (!tips) return tips;
  if (Array.isArray(tips)) return tips[0] && typeof tips[0] === 'string' ? tips : tips; // legacy flat array
  return tips[lang] ?? tips.es ?? tips;
}

// ── PROGRAMA DEPORTIVO ────────────────────────────────────────────────────────

// Lun=1 → Carrera · Mar=2 → Fuerza · Jue=4 → Carrera · Vie=5 → Fuerza
export function getSessionType(jsDay) {
  if ([1, 4].includes(jsDay)) return 'running';
  if ([2, 5].includes(jsDay)) return 'renfo';
  return 'rest';
}

export const SESSION_RUNNING = {
  type: 'running',
  ico: '🏃',
  name:      { es: 'Carrera a pie',      en: 'Running',          fr: 'Course à pied'        },
  duration:  '30–45 min',
  color:     '#DBEAFE',
  textColor: '#1D4ED8',
  phases: [
    {
      label:    { es: 'Calentamiento',   en: 'Warm-up',          fr: 'Échauffement'          },
      duration: '10 min',
      detail:   { es: 'Ritmo lento, caminata rápida', en: 'Slow pace, brisk walk', fr: 'Rythme lent, marche rapide' },
    },
    {
      label:    { es: 'Parte principal', en: 'Main set',          fr: 'Partie principale'     },
      duration: '15–25 min',
      detail:   {
        es: 'Opción A: Ritmo moderado continuo\nOpción B: Intervalos — 1 min rápido / 2 min lento × 6',
        en: 'Option A: Steady moderate pace\nOption B: Intervals — 1 min fast / 2 min slow × 6',
        fr: 'Option A : Rythme modéré continu\nOption B : Intervalles — 1 min rapide / 2 min lent × 6',
      },
    },
    {
      label:    { es: 'Vuelta a la calma', en: 'Cool-down',       fr: 'Retour au calme'       },
      duration: '10 min',
      detail:   { es: 'Ritmo muy suave, estiramientos de piernas', en: 'Very easy pace, leg stretches', fr: 'Rythme très doux, étirements des jambes' },
    },
  ],
  tips: {
    es: ['Aumenta la distancia un 5–10 % cada semana.', 'Varía los recorridos: parque, ciudad, sendero.', 'Anota tu tiempo, distancia y sensaciones.', 'Bebe agua antes, durante y después.'],
    en: ['Increase distance by 5–10% each week.', 'Vary your routes: park, city, trail.', 'Record your time, distance and how you felt.', 'Drink water before, during and after.'],
    fr: ['Augmente la distance de 5–10 % chaque semaine.', 'Varie les parcours : parc, ville, sentier.', 'Note ton temps, ta distance et tes sensations.', 'Bois de l\'eau avant, pendant et après.'],
  },
};

export const SESSION_RENFO = {
  type: 'renfo',
  ico: '💪',
  name:         { es: 'Fuerza muscular completa', en: 'Full-body strength',    fr: 'Force musculaire complète' },
  duration:     '45–55 min',
  color:        '#DCFCE7',
  textColor:    '#15803D',
  warmup:       { es: 'Jumping jacks + rodillas al pecho (5–10 min)', en: 'Jumping jacks + knees to chest (5–10 min)', fr: 'Jumping jacks + genoux poitrine (5–10 min)' },
  circuits:     3,
  restBetween:  { es: '1–2 min de descanso entre circuitos', en: '1–2 min rest between circuits', fr: '1–2 min de repos entre les circuits' },
  cooldown:     { es: '5 min de estiramientos', en: '5 min stretching', fr: '5 min d\'étirements' },
  exercises: [
    { name: { es: 'Sentadillas',        en: 'Squats',                  fr: 'Squats'              }, detail: { es: 'con peso o goma elástica',          en: 'with weight or resistance band', fr: 'avec poids ou élastique'      }, sets: 3, reps: 15 },
    { name: { es: 'Flexiones',          en: 'Push-ups',                fr: 'Pompes'              }, detail: { es: 'de rodillas o completas',            en: 'on knees or full',               fr: 'sur les genoux ou complètes'  }, sets: 3, reps: 12 },
    { name: { es: 'Remo con elástica',  en: 'Resistance band row',     fr: 'Tirade élastique'    }, detail: { es: 'espalda recta, codos pegados',       en: 'straight back, elbows in',       fr: 'dos droit, coudes serrés'     }, sets: 3, reps: 15 },
    { name: { es: 'Zancadas alternas',  en: 'Alternating lunges',      fr: 'Fentes alternées'    }, detail: { es: 'paso adelante',                     en: 'step forward',                   fr: 'pas en avant'                 }, sets: 3, reps: '12/pierna' },
    { name: { es: 'Plancha',            en: 'Plank',                   fr: 'Gainage'             }, detail: { es: 'plancha frontal',                   en: 'front plank',                    fr: 'gainage frontal'              }, sets: 3, dur: '30–40 seg' },
    { name: { es: 'Hip thrust',         en: 'Hip thrust',              fr: 'Hip thrust'          }, detail: { es: 'puente de glúteos en el suelo',     en: 'glute bridge on the floor',      fr: 'pont fessier au sol'          }, sets: 3, reps: 15 },
  ],
  variations: {
    es: ['Sentadillas con salto · Flexiones elevadas', 'Circuitos por tiempo: 40 seg esfuerzo / 20 seg descanso', 'Añadir abdominales o plancha lateral', 'Burpees · Mountain climbers', 'Aumentar repeticiones o series según tu nivel'],
    en: ['Jump squats · Elevated push-ups', 'Timed circuits: 40 sec effort / 20 sec rest', 'Add ab work or side plank', 'Burpees · Mountain climbers', 'Increase reps or sets according to your level'],
    fr: ['Squats sautés · Pompes surélevées', 'Circuits par temps : 40 sec effort / 20 sec repos', 'Ajouter des abdos ou gainage latéral', 'Burpees · Mountain climbers', 'Augmenter les répétitions ou séries selon ton niveau'],
  },
  tips: {
    es: ['Adapta la duración e intensidad según cómo te encuentres.', 'Márcate un pequeño objetivo cada semana (ej: 5 flexiones más).', 'Usa las gomas elásticas para añadir resistencia.'],
    en: ['Adapt the duration and intensity to how you feel.', 'Set yourself a small goal each week (e.g. 5 more push-ups).', 'Use resistance bands to add challenge.'],
    fr: ['Adapte la durée et l\'intensité selon comment tu te sens.', 'Fixe-toi un petit objectif chaque semaine (ex : 5 pompes de plus).', 'Utilise les élastiques pour ajouter de la résistance.'],
  },
};

// resolveSession: handles three cases:
//   1. Multilingual object (static file) → flatten to lang
//   2. Flat strings already in user's lang (from program_content table) → return as-is
//   3. Null/undefined → fall back to staticSession
export function resolveSession(supaSession, lang, staticSession) {
  const session = supaSession ?? (staticSession ?? null);
  if (!session) return null;
  // Case 2: flat strings — name is already a string (not a multilingual object)
  if (typeof session.name === 'string') return session;
  // Case 1: multilingual object → flatten
  return {
    ...session,
    name:        loc(session.name,        lang),
    warmup:      loc(session.warmup,      lang),
    restBetween: loc(session.restBetween, lang),
    cooldown:    loc(session.cooldown,    lang),
    tips:        loc(session.tips,        lang),
    variations:  loc(session.variations,  lang),
    phases: session.phases?.map(ph => ({
      ...ph,
      label:  loc(ph.label,  lang),
      detail: loc(ph.detail, lang),
    })),
    exercises: session.exercises?.map(ex => ({
      ...ex,
      name:   loc(ex.name,   lang),
      detail: loc(ex.detail, lang),
    })),
  };
}

export const WEEK_SCHEDULE = [
  { dow: 1, label: 'Lun', session: 'running' },
  { dow: 2, label: 'Mar', session: 'renfo'   },
  { dow: 3, label: 'Mié', session: 'rest'    },
  { dow: 4, label: 'Jue', session: 'running' },
  { dow: 5, label: 'Vie', session: 'renfo'   },
  { dow: 6, label: 'Sáb', session: 'rest'    },
  { dow: 0, label: 'Dom', session: 'rest'    },
];
