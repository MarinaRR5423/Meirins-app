/**
 * cycleTracking.js — catálogo de categorías y opciones de tracking diario del ciclo.
 *
 * Estructura del log guardado en profileExtended.cycleLog:
 * {
 * '2026-06-08': {
 * flow: 'moderate', // single value
 * spotting: 'brown', // single value
 * feelings: ['happy', 'tired'], // array
 * pain: ['cramps'], // array
 * pms: ['cloudy'], // array
 * sleep_quality: 'good',
 * hygiene: ['tampon'],
 * mind: ['focused'],
 * social: ['sociable'],
 * sex: ['protected'],
 * energy: 'ok',
 * note: 'Texto libre...'
 * }
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
 { id: 'light', icon: '', label: { es: 'Ligero', en: 'Light', fr: 'Léger', it: 'Leggero' } },
 { id: 'moderate', icon: '', label: { es: 'Moderado', en: 'Moderate', fr: 'Modéré', it: 'Moderato' } },
 { id: 'heavy', icon: '', label: { es: 'Fuerte', en: 'Heavy', fr: 'Abondant', it: 'Abbondante' } },
 ],
 },
 {
 id: 'spotting',
 color: '#EF4444',
 multi: false,
 label: { es: 'Manchado', en: 'Spotting', fr: 'Spotting', it: 'Spotting' },
 options: [
 { id: 'red', icon: '', label: { es: 'Rojo', en: 'Red', fr: 'Rouge', it: 'Rosso' } },
 { id: 'brown', icon: '', label: { es: 'Marrón', en: 'Brown', fr: 'Brun', it: 'Marrone' } },
 { id: 'pink', icon: '', label: { es: 'Rosa', en: 'Pink', fr: 'Rose', it: 'Rosa' } },
 ],
 },

 // ── SENSACIONES ─────────────────────────────────────────────────────────────
 {
 id: 'feelings',
 color: '#F59E0B',
 multi: true,
 label: { es: 'Sentimientos', en: 'Feelings', fr: 'Sentiments', it: 'Sentimenti' },
 options: [
 { id: 'happy', icon: '', label: { es: 'Feliz', en: 'Happy', fr: 'Heureuse', it: 'Felice' } },
 { id: 'anxious', icon: '', label: { es: 'Ansiosa', en: 'Anxious', fr: 'Anxieuse', it: 'Ansiosa' } },
 { id: 'sad', icon: '', label: { es: 'Triste', en: 'Sad', fr: 'Triste', it: 'Triste' } },
 { id: 'angry', icon: '', label: { es: 'Irritada', en: 'Irritable', fr: 'Irritée', it: 'Irritata' } },
 { id: 'calm', icon: '', label: { es: 'Tranquila', en: 'Calm', fr: 'Calme', it: 'Calma' } },
 { id: 'sensitive',icon: '', label: { es: 'Sensible', en: 'Sensitive', fr: 'Sensible', it: 'Sensibile' } },
 ],
 },

 // ── DOLOR ───────────────────────────────────────────────────────────────────
 {
 id: 'pain',
 color: '#3B82F6',
 multi: true,
 label: { es: 'Dolor', en: 'Pain', fr: 'Douleur', it: 'Dolore' },
 options: [
 { id: 'none', icon: '', label: { es: 'Sin dolor', en: 'Pain-free', fr: 'Sans douleur', it: 'Senza dolore' } },
 { id: 'cramps', icon: '', label: { es: 'Cólicos', en: 'Cramps', fr: 'Crampes', it: 'Crampi' } },
 { id: 'ovulation', icon: '', label: { es: 'Ovulación', en: 'Ovulation', fr: 'Ovulation', it: 'Ovulazione' } },
 { id: 'breast', icon: '', label: { es: 'Sensibilidad mamaria', en: 'Breast tenderness', fr: 'Seins sensibles', it: 'Seno sensibile' } },
 { id: 'headache', icon: '', label: { es: 'Dolor de cabeza', en: 'Headache', fr: 'Mal de tête', it: 'Mal di testa' } },
 { id: 'back', icon: '', label: { es: 'Dolor lumbar', en: 'Back pain', fr: 'Mal de dos', it: 'Mal di schiena' } },
 ],
 },

 // ── SPM ─────────────────────────────────────────────────────────────────────
 {
 id: 'pms',
 color: '#F97316',
 multi: true,
 label: { es: 'SPM', en: 'PMS', fr: 'SPM', it: 'PMS' },
 options: [
 { id: 'cloudy', icon: '', label: { es: 'Bajón', en: 'Low mood', fr: 'Coup de mou', it: 'Umore basso' } },
 { id: 'bloating', icon: '', label: { es: 'Hinchazón', en: 'Bloating', fr: 'Ballonnements', it: 'Gonfiore' } },
 { id: 'cravings', icon: '', label: { es: 'Antojos', en: 'Cravings', fr: 'Fringales', it: 'Voglie' } },
 { id: 'acne', icon: '', label: { es: 'Acné', en: 'Acne', fr: 'Acné', it: 'Acne' } },
 ],
 },

 // ── RINITIS ─────────────────────────────────────────────────────────────────
 {
 id: 'rhinitis',
 multi: true,
 label: { es: 'Rinitis', en: 'Rhinitis', fr: 'Rhinite', it: 'Rinite' },
 options: [
 { id: 'none', label: { es: 'Sin síntomas', en: 'No symptoms', fr: 'Sans symptômes', it: 'Nessun sintomo' } },
 { id: 'mild', label: { es: 'Leve', en: 'Mild', fr: 'Légère', it: 'Lieve' } },
 { id: 'moderate', label: { es: 'Moderada', en: 'Moderate', fr: 'Modérée', it: 'Moderata' } },
 { id: 'strong', label: { es: 'Intensa', en: 'Intense', fr: 'Intense', it: 'Intensa' } },
 ],
 },

 // ── ENERGÍA ─────────────────────────────────────────────────────────────────
 {
 id: 'energy',
 color: '#F97316',
 multi: false,
 label: { es: 'Energía', en: 'Energy', fr: 'Énergie', it: 'Energia' },
 options: [
 { id: 'exhausted', icon: '', label: { es: 'Agotamiento', en: 'Exhausted', fr: 'Épuisée', it: 'Esausta' } },
 { id: 'tired', icon: '', label: { es: 'Cansancio', en: 'Tired', fr: 'Fatiguée', it: 'Stanca' } },
 { id: 'ok', icon: '', label: { es: 'OK', en: 'OK', fr: 'OK', it: 'OK' } },
 { id: 'energetic', icon: '', label: { es: 'Con energía', en: 'Energetic', fr: 'Énergique',it: 'Energica' } },
 ],
 },

 // ── MENTE ───────────────────────────────────────────────────────────────────
 {
 id: 'mind',
 color: '#F97316',
 multi: true,
 label: { es: 'Mente', en: 'Mind', fr: 'Mental', it: 'Mente' },
 options: [
 { id: 'focused', icon: '', label: { es: 'Concentrada', en: 'Focused', fr: 'Concentrée', it: 'Concentrata' } },
 { id: 'foggy', icon: '', label: { es: 'Niebla mental', en: 'Brain fog', fr: 'Brouillard', it: 'Annebbiata' } },
 { id: 'forgetful', icon: '', label: { es: 'Poca memoria', en: 'Forgetful', fr: 'Tête en l\'air', it: 'Distratta' } },
 { id: 'stressed', icon: '', label: { es: 'Estresada', en: 'Stressed', fr: 'Stressée', it: 'Stressata' } },
 ],
 },

 // ── VIDA SOCIAL ─────────────────────────────────────────────────────────────
 {
 id: 'social',
 color: '#F97316',
 multi: true,
 label: { es: 'Vida social', en: 'Social', fr: 'Vie sociale', it: 'Vita sociale' },
 options: [
 { id: 'sociable', icon: '', label: { es: 'Sociable', en: 'Sociable', fr: 'Sociable', it: 'Socievole' } },
 { id: 'introvert', icon: '', label: { es: 'Introvertida',en: 'Introverted', fr: 'Introvertie', it: 'Introversa' } },
 { id: 'supported', icon: '', label: { es: 'Apoyada', en: 'Supported', fr: 'Soutenue', it: 'Supportata' } },
 ],
 },

 // ── VIDA SEXUAL ─────────────────────────────────────────────────────────────
 {
 id: 'sex',
 color: '#10B981',
 multi: true,
 label: { es: 'Vida sexual', en: 'Sex life', fr: 'Vie sexuelle', it: 'Vita sessuale' },
 options: [
 { id: 'none', icon: '', label: { es: 'No tuve', en: 'Didn\'t have', fr: 'Pas eu', it: 'Non ho avuto' } },
 { id: 'protected', icon: '', label: { es: 'Con protección', en: 'Protected', fr: 'Protégé', it: 'Protetto' } },
 { id: 'unprotected', icon: '', label: { es: 'Sin protección', en: 'Unprotected', fr: 'Non protégé', it: 'Non protetto' } },
 { id: 'masturbation',icon: '', label: { es: 'Masturbación', en: 'Masturbation', fr: 'Masturbation', it: 'Masturbazione' } },
 ],
 },

 // ── HIGIENE ─────────────────────────────────────────────────────────────────
 {
 id: 'hygiene',
 color: '#EF4444',
 multi: true,
 label: { es: 'Higiene íntima', en: 'Intimate hygiene', fr: 'Hygiène intime', it: 'Igiene intima' },
 options: [
 { id: 'tampon', icon: '', label: { es: 'Tampón', en: 'Tampon', fr: 'Tampon', it: 'Tampone' } },
 { id: 'pad', icon: '', label: { es: 'Toalla higiénica', en: 'Pad', fr: 'Serviette', it: 'Assorbente' } },
 { id: 'pantyliner', icon: '', label: { es: 'Protector diario', en: 'Pantyliner', fr: 'Protège-slip',it: 'Salvaslip' } },
 { id: 'cup', icon: '', label: { es: 'Copa menstrual', en: 'Cup', fr: 'Cup', it: 'Coppetta' } },
 { id: 'pantie', icon: '', label: { es: 'Braga menstrual', en: 'Period underwear', fr: 'Culotte', it: 'Slip' } },
 ],
 },
];
