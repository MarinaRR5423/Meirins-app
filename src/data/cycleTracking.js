/**
 * cycleTracking.js — catálogo de categorías y opciones de tracking diario del ciclo.
 *
 * Estructura del log guardado en profileExtended.cycleLog:
 * {
 *   '2026-06-08': {
 *     flow:          'moderate',
 *     spotting:      'brown',
 *     feelings:      ['happy', 'tired'],
 *     pain:          ['cramps'],
 *     pms:           ['cloudy'],
 *     sleep_quality: 'good',
 *     energy:        'ok',
 *     mind:          ['focused'],
 *     appetite:      'normal',
 *     digestion:     ['nausea'],
 *     skin:          ['clear'],
 *     libido:        'high',
 *     cervical:      'watery',
 *     temperature:   'normal',
 *     social:        ['sociable'],
 *     sex:           ['protected'],
 *     hygiene:       ['tampon'],
 *     rhinitis:      ['mild'],
 *     note:          'Texto libre...'
 *   }
 * }
 */

export const CYCLE_CATEGORIES = [
  // ── PERIODO ─────────────────────────────────────────────────────────────────
  {
    id: 'flow',
    color: '#EF4444',
    multi: false,
    label: { es: 'Flujo', en: 'Flow', fr: 'Flux', it: 'Flusso' },
    options: [
      { id: 'light',    icon: '💧',    label: { es: 'Ligero',   en: 'Light',    fr: 'Léger',    it: 'Leggero' } },
      { id: 'moderate', icon: '💧💧',   label: { es: 'Moderado', en: 'Moderate', fr: 'Modéré',   it: 'Moderato' } },
      { id: 'heavy',    icon: '💧💧💧',  label: { es: 'Fuerte',   en: 'Heavy',    fr: 'Abondant', it: 'Abbondante' } },
    ],
  },
  {
    id: 'spotting',
    color: '#EF4444',
    multi: false,
    label: { es: 'Manchado', en: 'Spotting', fr: 'Spotting', it: 'Spotting' },
    options: [
      { id: 'red',   icon: '🔴', label: { es: 'Rojo',   en: 'Red',   fr: 'Rouge', it: 'Rosso' } },
      { id: 'brown', icon: '🟤', label: { es: 'Marrón', en: 'Brown', fr: 'Brun',  it: 'Marrone' } },
      { id: 'pink',  icon: '🌸', label: { es: 'Rosa',   en: 'Pink',  fr: 'Rose',  it: 'Rosa' } },
    ],
  },

  // ── SENSACIONES ─────────────────────────────────────────────────────────────
  {
    id: 'feelings',
    color: '#F59E0B',
    multi: true,
    label: { es: 'Sentimientos', en: 'Feelings', fr: 'Sentiments', it: 'Sentimenti' },
    options: [
      { id: 'happy',     icon: '😊', label: { es: 'Feliz',     en: 'Happy',     fr: 'Heureuse',  it: 'Felice' } },
      { id: 'anxious',   icon: '😰', label: { es: 'Ansiosa',   en: 'Anxious',   fr: 'Anxieuse',  it: 'Ansiosa' } },
      { id: 'sad',       icon: '😢', label: { es: 'Triste',    en: 'Sad',       fr: 'Triste',    it: 'Triste' } },
      { id: 'angry',     icon: '😡', label: { es: 'Irritada',  en: 'Irritable', fr: 'Irritée',   it: 'Irritata' } },
      { id: 'calm',      icon: '😌', label: { es: 'Tranquila', en: 'Calm',      fr: 'Calme',     it: 'Calma' } },
      { id: 'sensitive', icon: '🥺', label: { es: 'Sensible',  en: 'Sensitive', fr: 'Sensible',  it: 'Sensibile' } },
    ],
  },

  // ── DOLOR ───────────────────────────────────────────────────────────────────
  {
    id: 'pain',
    color: '#3B82F6',
    multi: true,
    label: { es: 'Dolor', en: 'Pain', fr: 'Douleur', it: 'Dolore' },
    options: [
      { id: 'none',      icon: '🙂', label: { es: 'Sin dolor',           en: 'Pain-free',        fr: 'Sans douleur',    it: 'Senza dolore' } },
      { id: 'cramps',    icon: '⚡', label: { es: 'Cólicos',             en: 'Cramps',           fr: 'Crampes',         it: 'Crampi' } },
      { id: 'ovulation', icon: '🥚', label: { es: 'Ovulación',           en: 'Ovulation',        fr: 'Ovulation',       it: 'Ovulazione' } },
      { id: 'breast',    icon: '💗', label: { es: 'Sensibilidad mamaria', en: 'Breast tenderness', fr: 'Seins sensibles', it: 'Seno sensibile' } },
      { id: 'headache',  icon: '🤕', label: { es: 'Dolor de cabeza',     en: 'Headache',         fr: 'Mal de tête',     it: 'Mal di testa' } },
      { id: 'back',      icon: '🧍', label: { es: 'Dolor lumbar',        en: 'Back pain',        fr: 'Mal de dos',      it: 'Mal di schiena' } },
    ],
  },

  // ── SPM ─────────────────────────────────────────────────────────────────────
  {
    id: 'pms',
    color: '#F97316',
    multi: true,
    label: { es: 'SPM', en: 'PMS', fr: 'SPM', it: 'PMS' },
    options: [
      { id: 'cloudy',   icon: '☁️', label: { es: 'Bajón',      en: 'Low mood', fr: 'Coup de mou',   it: 'Umore basso' } },
      { id: 'bloating', icon: '🎈', label: { es: 'Hinchazón',  en: 'Bloating', fr: 'Ballonnements', it: 'Gonfiore' } },
      { id: 'cravings', icon: '🍫', label: { es: 'Antojos',    en: 'Cravings', fr: 'Fringales',     it: 'Voglie' } },
      { id: 'acne',     icon: '🔴', label: { es: 'Acné',       en: 'Acne',     fr: 'Acné',          it: 'Acne' } },
    ],
  },

  // ── SUEÑO ───────────────────────────────────────────────────────────────────
  {
    id: 'sleep_quality',
    color: '#6366F1',
    multi: false,
    label: { es: 'Sueño', en: 'Sleep', fr: 'Sommeil', it: 'Sonno' },
    options: [
      { id: 'poor',  icon: '😫', label: { es: 'Mal',       en: 'Poor',      fr: 'Mauvais',    it: 'Pessimo' } },
      { id: 'ok',    icon: '😐', label: { es: 'Regular',   en: 'OK',        fr: 'Passable',   it: 'Così così' } },
      { id: 'good',  icon: '😊', label: { es: 'Bien',      en: 'Good',      fr: 'Bien',       it: 'Bene' } },
      { id: 'great', icon: '😴', label: { es: 'Muy bien',  en: 'Great',     fr: 'Très bien',  it: 'Ottimo' } },
    ],
  },

  // ── ENERGÍA ─────────────────────────────────────────────────────────────────
  {
    id: 'energy',
    color: '#F97316',
    multi: false,
    label: { es: 'Energía', en: 'Energy', fr: 'Énergie', it: 'Energia' },
    options: [
      { id: 'exhausted', icon: '😴', label: { es: 'Agotamiento', en: 'Exhausted', fr: 'Épuisée',   it: 'Esausta' } },
      { id: 'tired',     icon: '😪', label: { es: 'Cansancio',   en: 'Tired',     fr: 'Fatiguée',  it: 'Stanca' } },
      { id: 'ok',        icon: '🙂', label: { es: 'OK',          en: 'OK',        fr: 'OK',        it: 'OK' } },
      { id: 'energetic', icon: '⚡', label: { es: 'Con energía', en: 'Energetic', fr: 'Énergique', it: 'Energica' } },
    ],
  },

  // ── MENTE ───────────────────────────────────────────────────────────────────
  {
    id: 'mind',
    color: '#8B5CF6',
    multi: true,
    label: { es: 'Mente', en: 'Mind', fr: 'Mental', it: 'Mente' },
    options: [
      { id: 'focused',   icon: '🎯', label: { es: 'Concentrada',   en: 'Focused',     fr: 'Concentrée',     it: 'Concentrata' } },
      { id: 'foggy',     icon: '🌫️', label: { es: 'Niebla mental', en: 'Brain fog',   fr: 'Brouillard',     it: 'Annebbiata' } },
      { id: 'forgetful', icon: '🧠', label: { es: 'Poca memoria',  en: 'Forgetful',   fr: "Tête en l'air",  it: 'Distratta' } },
      { id: 'stressed',  icon: '😖', label: { es: 'Estresada',     en: 'Stressed',    fr: 'Stressée',       it: 'Stressata' } },
    ],
  },

  // ── APETITO ─────────────────────────────────────────────────────────────────
  {
    id: 'appetite',
    color: '#10B981',
    multi: false,
    label: { es: 'Apetito', en: 'Appetite', fr: 'Appétit', it: 'Appetito' },
    options: [
      { id: 'none',     icon: '🚫', label: { es: 'Sin hambre',    en: 'No appetite',  fr: 'Pas faim',       it: 'Senza fame' } },
      { id: 'normal',   icon: '🍽️', label: { es: 'Normal',        en: 'Normal',       fr: 'Normal',         it: 'Normale' } },
      { id: 'extra',    icon: '🍴', label: { es: 'Hambre extra',  en: 'Extra hungry', fr: 'Très faim',      it: 'Fame extra' } },
      { id: 'cravings', icon: '🍫', label: { es: 'Antojos',       en: 'Cravings',     fr: 'Envies',         it: 'Voglie' } },
    ],
  },

  // ── DIGESTIÓN ───────────────────────────────────────────────────────────────
  {
    id: 'digestion',
    color: '#10B981',
    multi: true,
    label: { es: 'Digestión', en: 'Digestion', fr: 'Digestion', it: 'Digestione' },
    options: [
      { id: 'good',         icon: '✅', label: { es: 'Bien',           en: 'Good',         fr: 'Bien',           it: 'Bene' } },
      { id: 'nausea',       icon: '🤢', label: { es: 'Náuseas',        en: 'Nausea',       fr: 'Nausées',        it: 'Nausea' } },
      { id: 'constipation', icon: '😣', label: { es: 'Estreñimiento',  en: 'Constipation', fr: 'Constipation',   it: 'Stitichezza' } },
      { id: 'diarrhea',     icon: '💨', label: { es: 'Diarrea',        en: 'Diarrhea',     fr: 'Diarrhée',       it: 'Diarrea' } },
    ],
  },

  // ── PIEL ────────────────────────────────────────────────────────────────────
  {
    id: 'skin',
    color: '#F59E0B',
    multi: true,
    label: { es: 'Piel', en: 'Skin', fr: 'Peau', it: 'Pelle' },
    options: [
      { id: 'clear', icon: '✨', label: { es: 'Clara',   en: 'Clear',  fr: 'Nette',   it: 'Luminosa' } },
      { id: 'oily',  icon: '💦', label: { es: 'Grasa',   en: 'Oily',   fr: 'Grasse',  it: 'Grassa' } },
      { id: 'dry',   icon: '🏜️', label: { es: 'Seca',    en: 'Dry',    fr: 'Sèche',   it: 'Secca' } },
      { id: 'acne',  icon: '🔴', label: { es: 'Acné',    en: 'Acne',   fr: 'Acné',    it: 'Acne' } },
    ],
  },

  // ── LIBIDO ──────────────────────────────────────────────────────────────────
  {
    id: 'libido',
    color: '#EC4899',
    multi: false,
    label: { es: 'Libido', en: 'Libido', fr: 'Libido', it: 'Libido' },
    options: [
      { id: 'low',       icon: '❄️', label: { es: 'Baja',      en: 'Low',       fr: 'Faible',      it: 'Bassa' } },
      { id: 'normal',    icon: '💛', label: { es: 'Normal',    en: 'Normal',    fr: 'Normale',     it: 'Normale' } },
      { id: 'high',      icon: '🔥', label: { es: 'Alta',      en: 'High',      fr: 'Élevée',      it: 'Alta' } },
      { id: 'very_high', icon: '💥', label: { es: 'Muy alta',  en: 'Very high', fr: 'Très élevée', it: 'Molto alta' } },
    ],
  },

  // ── FLUJO VAGINAL ───────────────────────────────────────────────────────────
  {
    id: 'cervical',
    color: '#A157C9',
    multi: false,
    label: { es: 'Flujo vaginal', en: 'Cervical mucus', fr: 'Glaire cervicale', it: 'Muco cervicale' },
    options: [
      { id: 'dry',      icon: '🏜️', label: { es: 'Seco',      en: 'Dry',       fr: 'Sec',       it: 'Secco' } },
      { id: 'sticky',   icon: '🍯', label: { es: 'Cremoso',   en: 'Sticky',    fr: 'Collant',   it: 'Appiccicoso' } },
      { id: 'watery',   icon: '💧', label: { es: 'Acuoso',    en: 'Watery',    fr: 'Aqueux',    it: 'Acquoso' } },
      { id: 'elastic',  icon: '🥚', label: { es: 'Elástico',  en: 'Stretchy',  fr: 'Élastique', it: 'Elastico' } },
    ],
  },

  // ── TEMPERATURA BASAL ───────────────────────────────────────────────────────
  {
    id: 'temperature',
    color: '#A157C9',
    multi: false,
    label: { es: 'Temperatura basal', en: 'Basal temp.', fr: 'Temp. basale', it: 'Temp. basale' },
    options: [
      { id: 'low',    icon: '🌡️', label: { es: 'Baja',   en: 'Low',    fr: 'Basse',   it: 'Bassa' } },
      { id: 'normal', icon: '🌡️', label: { es: 'Normal', en: 'Normal', fr: 'Normale', it: 'Normale' } },
      { id: 'high',   icon: '🌡️', label: { es: 'Alta',   en: 'High',   fr: 'Élevée',  it: 'Alta' } },
    ],
  },

  // ── VIDA SOCIAL ─────────────────────────────────────────────────────────────
  {
    id: 'social',
    color: '#F97316',
    multi: true,
    label: { es: 'Vida social', en: 'Social', fr: 'Vie sociale', it: 'Vita sociale' },
    options: [
      { id: 'sociable',  icon: '💬', label: { es: 'Sociable',     en: 'Sociable',    fr: 'Sociable',    it: 'Socievole' } },
      { id: 'introvert', icon: '🔒', label: { es: 'Introvertida', en: 'Introverted', fr: 'Introvertie', it: 'Introversa' } },
      { id: 'supported', icon: '💞', label: { es: 'Apoyada',      en: 'Supported',   fr: 'Soutenue',    it: 'Supportata' } },
    ],
  },

  // ── VIDA SEXUAL ─────────────────────────────────────────────────────────────
  {
    id: 'sex',
    color: '#10B981',
    multi: true,
    label: { es: 'Vida sexual', en: 'Sex life', fr: 'Vie sexuelle', it: 'Vita sessuale' },
    options: [
      { id: 'none',          icon: '🚫', label: { es: 'No tuve',          en: "Didn't have",   fr: 'Pas eu',        it: 'Non ho avuto' } },
      { id: 'protected',     icon: '☂️', label: { es: 'Con protección',   en: 'Protected',     fr: 'Protégé',       it: 'Protetto' } },
      { id: 'unprotected',   icon: '⛱️', label: { es: 'Sin protección',   en: 'Unprotected',   fr: 'Non protégé',   it: 'Non protetto' } },
      { id: 'masturbation',  icon: '💗', label: { es: 'Masturbación',     en: 'Masturbation',  fr: 'Masturbation',  it: 'Masturbazione' } },
    ],
  },

  // ── HIGIENE ─────────────────────────────────────────────────────────────────
  {
    id: 'hygiene',
    color: '#EF4444',
    multi: true,
    label: { es: 'Higiene íntima', en: 'Intimate hygiene', fr: 'Hygiène intime', it: 'Igiene intima' },
    options: [
      { id: 'tampon',     icon: '🩸', label: { es: 'Tampón',           en: 'Tampon',           fr: 'Tampon',        it: 'Tampone' } },
      { id: 'pad',        icon: '🩹', label: { es: 'Toalla higiénica', en: 'Pad',              fr: 'Serviette',     it: 'Assorbente' } },
      { id: 'pantyliner', icon: '🌸', label: { es: 'Protector diario', en: 'Pantyliner',       fr: 'Protège-slip',  it: 'Salvaslip' } },
      { id: 'cup',        icon: '🥃', label: { es: 'Copa menstrual',   en: 'Cup',              fr: 'Cup',           it: 'Coppetta' } },
      { id: 'pantie',     icon: '🩲', label: { es: 'Braga menstrual',  en: 'Period underwear', fr: 'Culotte',       it: 'Slip' } },
    ],
  },

  // ── RINITIS ─────────────────────────────────────────────────────────────────
  {
    id: 'rhinitis',
    color: '#6B7280',
    multi: false,
    label: { es: 'Rinitis', en: 'Rhinitis', fr: 'Rhinite', it: 'Rinite' },
    options: [
      { id: 'none',     icon: '✅', label: { es: 'Sin síntomas', en: 'No symptoms', fr: 'Sans symptômes', it: 'Nessun sintomo' } },
      { id: 'mild',     icon: '🤧', label: { es: 'Leve',         en: 'Mild',        fr: 'Légère',         it: 'Lieve' } },
      { id: 'moderate', icon: '😤', label: { es: 'Moderada',     en: 'Moderate',    fr: 'Modérée',        it: 'Moderata' } },
      { id: 'strong',   icon: '😮‍💨', label: { es: 'Intensa',      en: 'Intense',     fr: 'Intense',        it: 'Intensa' } },
    ],
  },
];
