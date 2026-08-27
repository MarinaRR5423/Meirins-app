/**
 * nutriTipsPhase.js
 * Consejos de la nutricionista por fase del ciclo.
 * Lógica de rotación:
 *   - Fases normales:   tipIndex = dayOfPhase % tips.length
 *   - Premenopausia:    tipIndex = Math.floor(daysSinceStart / 7) % tips.length  (1 tip/semana)
 *   - Tip con conditionalGoal solo se muestra si el perfil cumple la condición.
 */

export const NUTRI_PHASE_TIPS = {

  // ─── MENSTRUAL (4 tips) ────────────────────────────────────────────
  menstrual: [
    {
      id: 'men_iron',
      focus: ['HIERRO', 'VITAMINA C'],
      phrase: 'El hierro es tu gran aliado ahora.',
      bullets: [
        { text: 'Lentejas, espinacas, semillas de calabaza', isAvoid: false },
        { text: 'Combina con vitamina C para mejor absorción', isAvoid: false },
        { text: 'Chocolate negro (>70%) para el magnesio', isAvoid: false },
      ],
    },
    {
      id: 'men_magnesium',
      focus: ['MAGNESIO', 'ANTIINFLAMATORIO'],
      phrase: 'El magnesio ayuda a reducir calambres y la tensión muscular.',
      bullets: [
        { text: 'Nueces, semillas, legumbres', isAvoid: false },
        { text: 'Cacao puro, avena', isAvoid: false },
        { text: 'Plátano y aguacate', isAvoid: false },
      ],
    },
    {
      id: 'men_vitc',
      focus: ['VITAMINA C', 'HIERRO'],
      phrase: 'Potencia la absorción del hierro combinando bien los alimentos.',
      bullets: [
        { text: 'Pimiento rojo, kiwi, naranja, fresas', isAvoid: false },
        { text: 'Combínalos con legumbres o carnes en la misma comida', isAvoid: false },
      ],
    },
    {
      id: 'men_coffee',
      focus: ['HIERRO', 'ABSORCIÓN'],
      phrase: 'Evita café y té justo durante las comidas: dificultan la absorción del hierro.',
      bullets: [
        { text: 'Espera al menos 1 hora antes o después de comer', isAvoid: false },
        { text: 'Café y té durante las comidas principales', isAvoid: true },
        { text: 'Lácteos junto a alimentos ricos en hierro', isAvoid: true },
      ],
    },
    {
      id: 'men_fertility_iron',
      focus: ['HIERRO', 'FERTILIDAD'],
      phrase: 'Un buen nivel de hierro es clave para preparar el endometrio en cada ciclo.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Lentejas, alubias, tofu, espinacas', isAvoid: false },
        { text: 'Combina con vitamina C para mejor absorción', isAvoid: false },
        { text: 'Alcohol y cafeína en exceso (reducen absorción)', isAvoid: true },
      ],
    },
  ],

  // ─── FOLICULAR (5 tips) ────────────────────────────────────────────
  follicular: [
    {
      id: 'fol_carbs',
      focus: ['CARBOHIDRATOS', 'ENERGÍA'],
      phrase: 'Son tu principal fuente de energía. Esta fase es ideal para entrenar bien.',
      bullets: [
        { text: 'Arroz, pasta, patatas, avena', isAvoid: false },
        { text: 'Pan integral y legumbres', isAvoid: false },
        { text: 'Azúcares añadidos y cereales refinados', isAvoid: true },
      ],
    },
    {
      id: 'fol_protein',
      focus: ['PROTEÍNAS', 'RECUPERACIÓN'],
      phrase: 'Ayudan a reparar y construir músculo. Perfectas si entrenas esta fase.',
      bullets: [
        { text: 'Pollo, pavo, huevos', isAvoid: false },
        { text: 'Legumbres, tofu, tempeh', isAvoid: false },
        { text: 'Pescado azul y blanco', isAvoid: false },
      ],
    },
    {
      id: 'fol_fats',
      focus: ['OMEGA-3', 'HORMONAS'],
      phrase: 'Las grasas saludables son necesarias para el correcto funcionamiento hormonal.',
      bullets: [
        { text: 'Aceite de oliva virgen extra', isAvoid: false },
        { text: 'Frutos secos, semillas, aguacate', isAvoid: false },
        { text: 'Pescado azul', isAvoid: false },
        { text: 'Ultraprocesados ricos en grasas poco saludables', isAvoid: true },
      ],
    },
    {
      id: 'fol_vitd',
      focus: ['VITAMINA D', 'HUESOS'],
      phrase: 'Fundamental para los huesos, la inmunidad y el estado de ánimo.',
      bullets: [
        { text: '15-20 minutos de sol al día', isAvoid: false },
        { text: 'Pescado azul, huevos', isAvoid: false },
        { text: 'Setas expuestas al sol', isAvoid: false },
      ],
    },
    {
      id: 'fol_vitb',
      focus: ['VITAMINA B', 'ENERGÍA'],
      phrase: 'Las vitaminas B son clave para la energía, el sistema nervioso y la síntesis hormonal.',
      bullets: [
        { text: 'Cereales integrales, legumbres', isAvoid: false },
        { text: 'Huevos, lácteos', isAvoid: false },
        { text: 'Verduras de hoja verde', isAvoid: false },
      ],
    },
    {
      id: 'fol_fertility_folate',
      focus: ['FOLATO', 'B9', 'FERTILIDAD'],
      phrase: 'El folato es el nutriente más importante antes de quedarte embarazada. Empieza a priorizar ahora.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Espinacas, acelgas, brócoli, aguacate', isAvoid: false },
        { text: 'Legumbres (lentejas, garbanzos)', isAvoid: false },
        { text: 'Considera un suplemento de ácido fólico con tu médica', isAvoid: false },
        { text: 'Alcohol (interfiere con la absorción del folato)', isAvoid: true },
      ],
    },
    {
      id: 'fol_fertility_omega3',
      focus: ['OMEGA-3', 'FERTILIDAD', 'HORMONAS'],
      phrase: 'El omega-3 mejora la calidad ovocitaria y regula las prostaglandinas del ciclo.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Salmón, sardinas, caballa (2-3 veces/semana)', isAvoid: false },
        { text: 'Nueces, semillas de chía y lino', isAvoid: false },
        { text: 'Pescados con alto mercurio en exceso (atún rojo, pez espada)', isAvoid: true },
      ],
    },
  ],

  // ─── OVULATORIA (7 tips, T6 solo embarazo) ────────────────────────
  // ─── FERTILIDAD: tips extra condicionales a goal 'fertility' ──────
  // Se intercalan en la rotación normal cuando la usuaria tiene ese goal.
  // Cada fase recibe 1-2 tips extra de fertilidad para enriquecer la rotación.

  ovulation: [
    {
      id: 'ovu_protein',
      focus: ['PROTEÍNAS', 'ENERGÍA'],
      phrase: 'Esta fase de alta energía pide proteína de calidad para aguantar el ritmo.',
      bullets: [
        { text: 'Carnes magras, pescado, marisco', isAvoid: false },
        { text: 'Huevos', isAvoid: false },
        { text: 'Legumbres, tofu', isAvoid: false },
      ],
    },
    {
      id: 'ovu_carbs',
      focus: ['CARBOHIDRATOS', 'GLUCEMIA'],
      phrase: 'Los CH de calidad mantienen niveles estables de glucosa y aportan fibra y minerales.',
      bullets: [
        { text: 'Cereales integrales, legumbres', isAvoid: false },
        { text: 'Frutas y verduras', isAvoid: false },
        { text: 'Productos con azúcares añadidos', isAvoid: true },
      ],
    },
    {
      id: 'ovu_zinc',
      focus: ['ZINC', 'FERTILIDAD'],
      phrase: 'El zinc apoya la ovulación y la salud reproductiva.',
      bullets: [
        { text: 'Marisco, ostras', isAvoid: false },
        { text: 'Semillas de calabaza', isAvoid: false },
        { text: 'Carnes magras y legumbres', isAvoid: false },
      ],
    },
    {
      id: 'ovu_fats',
      focus: ['OMEGA-3', 'CORAZÓN'],
      phrase: 'Las grasas saludables contribuyen al funcionamiento del organismo y a la salud reproductiva.',
      bullets: [
        { text: 'Aceite de oliva virgen extra', isAvoid: false },
        { text: 'Frutos secos, semillas, aguacate, pescado azul', isAvoid: false },
        { text: 'Bollería industrial y ultraprocesados', isAvoid: true },
        { text: 'Grasas trans y grasas saturadas en exceso', isAvoid: true },
      ],
    },
    {
      id: 'ovu_selenium',
      focus: ['SELENIO', 'ANTIOXIDANTE'],
      phrase: 'El selenio protege las células y apoya la función tiroidea.',
      bullets: [
        { text: '2-3 nueces de Brasil al día', isAvoid: false },
        { text: 'Atún, salmón, sardinas', isAvoid: false },
        { text: 'Huevos, semillas de girasol', isAvoid: false },
      ],
    },
    {
      id: 'ovu_folate',
      focus: ['FOLATO', 'B9'],
      phrase: 'El folato es esencial para el desarrollo del tubo neural.',
      conditionalGoal: 'embarazo',
      bullets: [
        { text: 'Espinacas, acelgas, brócoli', isAvoid: false },
        { text: 'Legumbres, aguacate', isAvoid: false },
        { text: 'Hígado con moderación', isAvoid: false },
      ],
    },
    {
      id: 'ovu_vitc',
      focus: ['VITAMINA C', 'INMUNIDAD'],
      phrase: 'Refuerza la inmunidad y mejora la absorción del hierro no hemo.',
      bullets: [
        { text: 'Pimiento rojo, kiwi, naranja, fresas', isAvoid: false },
        { text: 'Brócoli, coles de Bruselas', isAvoid: false },
      ],
    },
    {
      id: 'ovu_fertility_zinc',
      focus: ['ZINC', 'FERTILIDAD', 'OVULACIÓN'],
      phrase: 'La ovulación es el momento clave. El zinc apoya directamente la calidad del óvulo.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Ostras, marisco, carnes magras', isAvoid: false },
        { text: 'Semillas de calabaza, legumbres', isAvoid: false },
        { text: 'Alcohol y tabaco (afectan la calidad ovocitaria)', isAvoid: true },
        { text: 'Ultraprocesados y azúcares añadidos', isAvoid: true },
      ],
    },
    {
      id: 'ovu_fertility_antioxidants',
      focus: ['ANTIOXIDANTES', 'FERTILIDAD'],
      phrase: 'Los antioxidantes protegen los óvulos del estrés oxidativo. Esta fase es la más importante.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Frutos rojos, tomate, zanahoria', isAvoid: false },
        { text: 'Frutos secos, semillas, aceite de oliva virgen', isAvoid: false },
        { text: 'Vitamina E: almendras, avellanas, espinacas', isAvoid: false },
        { text: 'Azúcar refinado y alcohol', isAvoid: true },
      ],
    },
  ],

  // ─── LÚTEA (7 tips) ────────────────────────────────────────────────
  luteal: [
    {
      id: 'lut_trypt',
      focus: ['TRIPTÓFANO', 'SEROTONINA'],
      phrase: 'El triptófano es precursor de la serotonina: ayuda a mantener el buen humor.',
      bullets: [
        { text: 'Pavo, pollo, huevos', isAvoid: false },
        { text: 'Plátano, avena', isAvoid: false },
        { text: 'Frutos secos, semillas', isAvoid: false },
      ],
    },
    {
      id: 'lut_carbs',
      focus: ['CARBOHIDRATOS', 'ANTOJOS'],
      phrase: 'Los CH complejos aportan energía sostenida y ayudan a controlar los antojos.',
      bullets: [
        { text: 'Cereales integrales, legumbres', isAvoid: false },
        { text: 'Patata, boniato, avena', isAvoid: false },
        { text: 'Azúcares añadidos y cereales refinados', isAvoid: true },
      ],
    },
    {
      id: 'lut_calcium',
      focus: ['CALCIO', 'VITAMINA D'],
      phrase: 'El calcio y la vitamina D pueden reducir síntomas del SPM como irritabilidad y retención.',
      bullets: [
        { text: 'Lácteos, bebidas vegetales enriquecidas', isAvoid: false },
        { text: 'Sardinas o salmón con espinas', isAvoid: false },
        { text: 'Brócoli, col rizada', isAvoid: false },
      ],
    },
    {
      id: 'lut_magnesium',
      focus: ['MAGNESIO', 'SPM'],
      phrase: 'El magnesio es aliado contra calambres, hinchazón y el mal humor premenstrual.',
      bullets: [
        { text: 'Chocolate negro >70%', isAvoid: false },
        { text: 'Legumbres, frutos secos', isAvoid: false },
        { text: 'Aguacate, plátano, espinacas', isAvoid: false },
      ],
    },
    {
      id: 'lut_vitb6',
      focus: ['VITAMINA B6', 'HORMONAS'],
      phrase: 'La vitamina B6 regula el estado de ánimo y reduce síntomas del SPM.',
      bullets: [
        { text: 'Pollo, salmón, atún', isAvoid: false },
        { text: 'Patata, boniato', isAvoid: false },
        { text: 'Plátano, garbanzos, pistacho', isAvoid: false },
      ],
    },
    {
      id: 'lut_fiber',
      focus: ['FIBRA', 'ESTRÓGENOS'],
      phrase: 'La fibra favorece la eliminación de estrógenos y reduce la retención de líquidos.',
      bullets: [
        { text: 'Verduras de hoja verde', isAvoid: false },
        { text: 'Legumbres, cereales integrales', isAvoid: false },
        { text: 'Frutas con piel', isAvoid: false },
      ],
    },
    {
      id: 'lut_omega3',
      focus: ['OMEGA-3', 'ANTIINFLAMATORIO'],
      phrase: 'El omega-3 tiene efecto antiinflamatorio: reduce el dolor y la inflamación del SPM.',
      bullets: [
        { text: 'Salmón, sardinas, caballa', isAvoid: false },
        { text: 'Nueces', isAvoid: false },
        { text: 'Semillas de chía y lino', isAvoid: false },
      ],
    },
    {
      id: 'lut_fertility_progesterone',
      focus: ['PROGESTERONA', 'FERTILIDAD', 'IMPLANTACIÓN'],
      phrase: 'La fase lútea es clave para la implantación. Nutre tu cuerpo para sostener el nivel de progesterona.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Vitamina B6: pollo, salmón, garbanzos, plátano', isAvoid: false },
        { text: 'Zinc: semillas de calabaza, legumbres', isAvoid: false },
        { text: 'Vitamina C: pimiento, kiwi, fresas (apoya el cuerpo lúteo)', isAvoid: false },
        { text: 'Alcohol y cafeína en exceso', isAvoid: true },
      ],
    },
    {
      id: 'lut_fertility_stress',
      focus: ['CORTISOL', 'FERTILIDAD', 'ESTRÉS'],
      phrase: 'El estrés eleva el cortisol y puede interferir con la progesterona. Esta semana, prioriza el descanso.',
      conditionalGoal: 'fertility',
      bullets: [
        { text: 'Magnesio: chocolate negro, frutos secos, legumbres', isAvoid: false },
        { text: 'Adaptógenos suaves: caldo de huesos, cúrcuma', isAvoid: false },
        { text: 'Cafeína en exceso (>2 cafés/día)', isAvoid: true },
        { text: 'Ayuno prolongado o déficit calórico severo', isAvoid: true },
      ],
    },
  ],

  // ─── PREMENOPAUSIA (5 tips, 1 por semana) ─────────────────────────
  perimenopausal: [
    {
      id: 'peri_energy',
      focus: ['ENERGÍA', 'METABOLISMO'],
      phrase: 'El metabolismo puede cambiar. El objetivo es adaptarse, no comer menos.',
      bullets: [
        { text: 'Elige alimentos nutritivos y saciantes', isAvoid: false },
        { text: 'Mantén un estilo de vida activo', isAvoid: false },
        { text: 'Exceso de ultraprocesados', isAvoid: true },
      ],
    },
    {
      id: 'peri_calcium',
      focus: ['CALCIO', 'VITAMINA D', 'HUESOS'],
      phrase: 'La pérdida de masa ósea se acelera. Protege tus huesos desde ahora.',
      bullets: [
        { text: 'Lácteos, bebidas vegetales enriquecidas', isAvoid: false },
        { text: 'Sardinas con espinas', isAvoid: false },
        { text: 'Brócoli, col, sol diario', isAvoid: false },
      ],
    },
    {
      id: 'peri_phyto',
      focus: ['FITOESTRÓGENOS', 'SOFOCOS'],
      phrase: 'Los fitoestrógenos tienen acción similar a los estrógenos y pueden aliviar sofocos.',
      bullets: [
        { text: 'Soja, tofu, tempeh, edamame', isAvoid: false },
        { text: 'Semillas de lino', isAvoid: false },
        { text: 'Legumbres, cereales integrales', isAvoid: false },
      ],
    },
    {
      id: 'peri_fats',
      focus: ['OMEGA-3', 'CORAZÓN'],
      phrase: 'El riesgo cardiovascular puede aumentar. Elige grasas de calidad.',
      bullets: [
        { text: 'Aceite de oliva virgen extra', isAvoid: false },
        { text: 'Frutos secos, semillas, aguacate, pescado azul', isAvoid: false },
        { text: 'Omega-3: nueces, semillas de chía y lino', isAvoid: false },
        { text: 'Grasas saturadas en exceso', isAvoid: true },
        { text: 'Alimentos ultraprocesados', isAvoid: true },
      ],
    },
    {
      id: 'peri_trypt',
      focus: ['TRIPTÓFANO', 'ÁNIMO'],
      phrase: 'El estado de ánimo puede verse afectado por los cambios hormonales.',
      bullets: [
        { text: 'Pavo, huevos, lácteos', isAvoid: false },
        { text: 'Plátano, aguacate, nueces', isAvoid: false },
        { text: 'Chocolate negro >70%', isAvoid: false },
      ],
    },
  ],
};

// ─── TIPS DE SUEÑO — solo para goal 'fertility' ───────────────────────────────
// Se muestran como un bloque adicional en NutriScreen debajo del tip del día.
export const FERTILITY_SLEEP_TIPS = [
  {
    id: 'sleep_melatonin',
    focus: ['SUEÑO', 'MELATONINA', 'FERTILIDAD'],
    phrase: 'La melatonina protege los óvulos del estrés oxidativo y regula tu ciclo.',
    bullets: [
      { text: 'Duerme en oscuridad total — la melatonina se produce en la oscuridad', isAvoid: false },
      { text: 'Apaga pantallas 1h antes de dormir', isAvoid: false },
      { text: 'Alimentos ricos en triptófano antes de dormir: pavo, plátano, avena', isAvoid: false },
      { text: 'Pantallas con luz azul hasta tarde', isAvoid: true },
    ],
  },
  {
    id: 'sleep_cortisol',
    focus: ['SUEÑO', 'CORTISOL', 'HORMONAS'],
    phrase: 'Dormir menos de 7h eleva el cortisol y puede alterar la ovulación. El sueño es parte del tratamiento.',
    bullets: [
      { text: 'Busca entre 7-9h de sueño cada noche', isAvoid: false },
      { text: 'Mantén horarios regulares, también el fin de semana', isAvoid: false },
      { text: 'Magnesio por la noche: frutos secos, chocolate negro', isAvoid: false },
      { text: 'Alcohol por la noche (fragmenta el sueño)', isAvoid: true },
    ],
  },
  {
    id: 'sleep_temperature',
    focus: ['SUEÑO', 'TEMPERATURA', 'PROGESTERONA'],
    phrase: 'Tu temperatura corporal varía con el ciclo. Adaptar el ambiente de sueño mejora la calidad del descanso.',
    bullets: [
      { text: 'En fase lútea la temperatura sube 0,2–0,5 °C: ventila el dormitorio', isAvoid: false },
      { text: 'Ducha templada antes de dormir para bajar la temperatura corporal', isAvoid: false },
      { text: 'Infusiones relajantes sin cafeína: manzanilla, valeriana', isAvoid: false },
      { text: 'Cafeína después de las 14:00h', isAvoid: true },
    ],
  },
];

/**
 * Devuelve el tip de sueño del día para usuarias con goal fertility.
 * Rota semanalmente para no repetirse demasiado.
 */
export function getFertilitySleepTip(pi) {
  if (!pi) return FERTILITY_SLEEP_TIPS[0];
  const week = Math.floor((pi.day ?? 0) / 7);
  return FERTILITY_SLEEP_TIPS[week % FERTILITY_SLEEP_TIPS.length];
}

/**
 * Calcula el día dentro de la fase actual (0-indexed).
 * @param {object} pi — phase info: { day, phase, cycleLen, menstrualEnd }
 */
function getDayOfPhase(pi) {
  if (!pi) return 0;
  const { day = 1, phase, menstrualEnd = 5 } = pi;
  switch (phase) {
    case 'menstrual':   return day - 1;                     // días 1..menstrualEnd
    case 'follicular':  return day - (menstrualEnd + 1);    // días menstrualEnd+1..13
    case 'ovulation':   return day - 14;                    // días 14..16
    case 'luteal':      return day - 17;                    // días 17..cycleLen
    default:            return 0;
  }
}

/**
 * Devuelve el tip del día para la fase actual.
 * @param {object} pi              — phase info del ciclo
 * @param {object} profileExtended — perfil extendido (para conditionalGoal y lifeStage)
 * @returns {{ focus, phrase, bullets } | null}
 */
export function getCurrentNutriTip(pi, profileExtended) {
  const lifeStage = profileExtended?.lifeStage;
  const isPerimenopausal = lifeStage === 'perimenopausal' || lifeStage === 'menopause';

  if (isPerimenopausal) {
    const tips = NUTRI_PHASE_TIPS.perimenopausal;
    // 1 tip por semana — usamos el día del ciclo como proxy de días transcurridos
    const week = Math.floor((pi?.day ?? 0) / 7);
    return tips[week % tips.length] ?? tips[0];
  }

  const phase = pi?.phase;
  if (!phase) return null;

  let tips = NUTRI_PHASE_TIPS[phase] ?? [];

  // Filtrar tips condicionales que no aplican al perfil
  const goals = profileExtended?.goals ?? {};
  const hasGoal = (g) => goals[g] === true || goals[g] === 1 || profileExtended?.goal === g;
  tips = tips.filter(t => !t.conditionalGoal || hasGoal(t.conditionalGoal));

  if (!tips.length) return null;

  const dayOfPhase = Math.max(0, getDayOfPhase(pi));
  return tips[dayOfPhase % tips.length];
}
