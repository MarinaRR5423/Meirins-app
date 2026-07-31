/**
 * notifications.js — sistema de notificaciones locales de Meirins
 *
 * Tipos:
 * 1. CICLO — aviso X días antes del inicio del siguiente período
 * 2. ENTRENO — recordatorio diario en los días de entreno configurados
 * 3. HIDRATACIÓN — recordatorio diario de beber agua
 *
 * Todas son notificaciones LOCALES (no requieren servidor).
 * Se reprograman automáticamente cuando cambia el perfil.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// ── Identificadores de canal (Android) ───────────────────────────────────────
const CHANNEL_CYCLE = 'meirins-cycle';
const CHANNEL_WORKOUT = 'meirins-workout';
const CHANNEL_HYDRATION = 'meirins-hydration';

// ── Identificadores de notificación (para cancelar/actualizar) ────────────────
export const NOTIF_IDS = {
 CYCLE_WARNING: 'cycle-warning',
 CYCLE_TODAY: 'cycle-today',
 HYDRATION: 'hydration-daily',
 // Workout IDs se generan dinámicamente: 'workout-YYYY-MM-DD'
};

// ── Configuración del handler ────────────────────────────────────────────────
Notifications.setNotificationHandler({
 handleNotification: async () => ({
 shouldShowAlert: true,
 shouldPlaySound: true,
 shouldSetBadge: false,
 }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Permisos
// ─────────────────────────────────────────────────────────────────────────────

async function ensureAndroidChannels() {
 if (Platform.OS !== 'android') return;
 await Promise.all([
 Notifications.setNotificationChannelAsync(CHANNEL_CYCLE, {
 name: 'Ciclo menstrual',
 importance: Notifications.AndroidImportance.HIGH,
 vibrationPattern: [0, 250, 250, 250],
 lightColor: '#EC4899',
 }),
 Notifications.setNotificationChannelAsync(CHANNEL_WORKOUT, {
 name: 'Entrenamientos',
 importance: Notifications.AndroidImportance.DEFAULT,
 lightColor: '#429FE7',
 }),
 Notifications.setNotificationChannelAsync(CHANNEL_HYDRATION, {
 name: 'Hidratación',
 importance: Notifications.AndroidImportance.LOW,
 lightColor: '#06B6D4',
 }),
 ]);
}

export async function requestNotificationPermission() {
 if (Platform.OS === 'web') return false;

 // Canales Android deben existir antes de programar notificaciones
 await ensureAndroidChannels();

 const { status: existing } = await Notifications.getPermissionsAsync();
 if (existing === 'granted') return true;

 const { status } = await Notifications.requestPermissionsAsync();
 return status === 'granted';
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Cancela todas las notificaciones programadas de Meirins */
export async function cancelAllMeirinsNotifications() {
 const scheduled = await Notifications.getAllScheduledNotificationsAsync();
 const meirins = scheduled.filter(n => n.identifier?.startsWith('meirins-') || n.identifier?.startsWith('workout-') || n.identifier?.startsWith('cycle-') || n.identifier?.startsWith('hydration-'));
 await Promise.all(meirins.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Cancela un grupo de notificaciones por prefijo */
async function cancelByPrefix(prefix) {
 const scheduled = await Notifications.getAllScheduledNotificationsAsync();
 await Promise.all(
 scheduled
 .filter(n => n.identifier?.startsWith(prefix))
 .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
 );
}

/** Construye la fecha de trigger a partir de una fecha y hora */
function buildTrigger(dateStr, hour, minute = 0) {
 const d = new Date(dateStr + 'T12:00:00');
 d.setHours(hour, minute, 0, 0);
 // Solo programar si es en el futuro
 if (d.getTime() <= Date.now()) return null;
 return { type: 'date', date: d };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. NOTIFICACIONES DE CICLO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Programa los avisos del próximo período.
 *
 * @param {string} lastPeriod 'YYYY-MM-DD' inicio del último período
 * @param {number} cycleLength duración del ciclo en días
 * @param {number} daysWarning días de antelación para el aviso (default: 2)
 * @param {object} texts { warning, today } textos multilingüe
 */
export async function scheduleCycleNotifications(lastPeriod, cycleLength = 28, daysWarning = 2, texts = {}) {
 if (!lastPeriod) return;
 await cancelByPrefix('cycle-');

 // Calcular fecha del próximo período
 const last = new Date(lastPeriod + 'T12:00:00');
 const nextDate = new Date(last);
 nextDate.setDate(last.getDate() + cycleLength);

 const nextStr = nextDate.toISOString().split('T')[0];
 const warnDate = new Date(nextDate);
 warnDate.setDate(nextDate.getDate() - daysWarning);
 const warnStr = warnDate.toISOString().split('T')[0];

 const warningTrigger = buildTrigger(warnStr, 9); // 9:00 AM
 const todayTrigger = buildTrigger(nextStr, 8); // 8:00 AM día de inicio

 const warningText = texts.warning || {
 title: 'Tu ciclo se acerca',
 body: `Tu período podría empezar en ${daysWarning} días. Prepárate con calma.`,
 };
 const todayText = texts.today || {
 title: 'Primer día de ciclo',
 body: 'Hoy empieza tu período. Cuídate y escucha tu cuerpo.',
 };

 if (warningTrigger) {
 await Notifications.scheduleNotificationAsync({
 identifier: NOTIF_IDS.CYCLE_WARNING,
 content: { ...warningText, channelId: CHANNEL_CYCLE },
 trigger: warningTrigger,
 });
 }

 if (todayTrigger) {
 await Notifications.scheduleNotificationAsync({
 identifier: NOTIF_IDS.CYCLE_TODAY,
 content: { ...todayText, channelId: CHANNEL_CYCLE },
 trigger: todayTrigger,
 });
 }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NOTIFICACIONES DE ENTRENO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Programa recordatorios para los próximos 14 días de entreno.
 *
 * @param {number[]} trainDays días JS de entreno [0-6]
 * @param {number} hour hora de la notificación (default: 8)
 * @param {object} texts { title, body } textos multilingüe
 */
export async function scheduleWorkoutNotifications(trainDays = [], hour = 8, texts = {}) {
 await cancelByPrefix('workout-');
 if (!trainDays.length) return;

 const title = texts.title || ' ¡Hoy toca entrenar!';
 const body = texts.body || 'Tu sesión de hoy está lista. ¡A por ello!';

 // Programar para los próximos 14 días
 const promises = [];
 for (let i = 0; i <= 14; i++) {
 const d = new Date();
 d.setDate(d.getDate() + i);
 const jsDay = d.getDay();
 const dateStr = d.toISOString().split('T')[0];

 if (!trainDays.includes(jsDay)) continue;

 const trigger = buildTrigger(dateStr, hour);
 if (!trigger) continue;

 promises.push(
 Notifications.scheduleNotificationAsync({
 identifier: `workout-${dateStr}`,
 content: { title, body, channelId: CHANNEL_WORKOUT, data: { screen: 'Gimnasio' } },
 trigger,
 })
 );
 }

 await Promise.all(promises);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. NOTIFICACIÓN DE HIDRATACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Programa un recordatorio diario de hidratación.
 *
 * @param {number} hour hora del recordatorio (default: 12)
 * @param {object} texts { title, body }
 */
export async function scheduleHydrationNotification(hour = 12, texts = {}) {
 await cancelByPrefix('hydration-');

 const title = texts.title || ' ¿Has bebido agua hoy?';
 const body = texts.body || 'Mantenerte hidratada mejora tu energía, concentración y síntomas del ciclo.';

 // Repetición diaria a la misma hora
 await Notifications.scheduleNotificationAsync({
 identifier: NOTIF_IDS.HYDRATION,
 content: { title, body, channelId: CHANNEL_HYDRATION },
 trigger: {
 hour,
 minute: 0,
 repeats: true, // se repite cada día
 },
 });
}

// ─────────────────────────────────────────────────────────────────────────────
// API principal — reprogramar todo desde el perfil
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sincroniza todas las notificaciones con el perfil actual.
 * Llamar cuando cambie: lastPeriod, trainDays, o preferencias de notificación.
 *
 * @param {object} profile
 * lastPeriod, cycleLength, trainDays,
 * notifSettings: { cycle, workout, hydration, workoutHour, cycleWarningDays, hydrationHour }
 * @param {string} lang idioma actual
 */
export async function syncNotifications(profile, lang = 'es') {
 const granted = await requestNotificationPermission();
 if (!granted) return false;

 const s = profile.notifSettings || {};

 // Textos multilingüe
 const T = {
 es: {
 cycleWarning: { title: 'Tu ciclo se acerca', body: `Tu período podría empezar en ${s.cycleWarningDays || 2} días. Prepárate con calma.` },
 cycleToday: { title: 'Primer día de ciclo', body: 'Hoy empieza tu período. Cuídate y escucha tu cuerpo.' },
 workout: { title: '¡Hoy toca entrenar!', body: 'Tu sesión de hoy está lista. ¡A por ello!' },
 hydration: { title: '¿Has bebido agua hoy?', body: 'Mantenerte hidratada mejora tu energía y los síntomas del ciclo.' },
 },
 en: {
 cycleWarning: { title: 'Your cycle is approaching', body: `Your period may start in ${s.cycleWarningDays || 2} days. Take it easy.` },
 cycleToday: { title: 'First day of your cycle', body: 'Your period starts today. Take care and listen to your body.' },
 workout: { title: 'Time to work out!', body: 'Your session is ready. Let\'s go!' },
 hydration: { title: 'Have you drunk water today?', body: 'Staying hydrated improves your energy and cycle symptoms.' },
 },
 fr: {
 cycleWarning: { title: 'Ton cycle approche', body: `Tes règles pourraient commencer dans ${s.cycleWarningDays || 2} jours. Prends soin de toi.` },
 cycleToday: { title: 'Premier jour de cycle', body: 'Tes règles commencent aujourd\'hui. Prends soin de toi.' },
 workout: { title: 'C\'est l\'heure de s\'entraîner !', body: 'Ta séance du jour est prête. En avant !' },
 hydration: { title: 'As-tu bu de l\'eau aujourd\'hui ?', body: 'Rester hydratée améliore ton énergie et tes symptômes.' },
 },
 it: {
 cycleWarning: { title: 'Il tuo ciclo si avvicina', body: `Il tuo periodo potrebbe iniziare tra ${s.cycleWarningDays || 2} giorni.` },
 cycleToday: { title: 'Primo giorno del ciclo', body: 'Oggi inizia il tuo periodo. Prenditi cura di te.' },
 workout: { title: 'Oggi si allena!', body: 'La tua sessione è pronta. Dai tutto!' },
 hydration: { title: 'Hai bevuto acqua oggi?', body: 'Rimanere idratata migliora la tua energia e i sintomi del ciclo.' },
 },
 };
 const t = T[lang] || T.es;

 const results = { cycle: false, workout: false, hydration: false };

 // Ciclo
 if (s.cycle !== false && profile.lastPeriod) {
 await scheduleCycleNotifications(
 profile.lastPeriod,
 profile.cycleLength || 28,
 s.cycleWarningDays || 2,
 { warning: t.cycleWarning, today: t.cycleToday },
 );
 results.cycle = true;
 } else {
 await cancelByPrefix('cycle-');
 }

 // Entreno
 if (s.workout !== false && profile.trainDays?.length) {
 await scheduleWorkoutNotifications(
 profile.trainDays,
 s.workoutHour || 8,
 { title: t.workout.title, body: t.workout.body },
 );
 results.workout = true;
 } else {
 await cancelByPrefix('workout-');
 }

 // Hidratación
 if (s.hydration !== false) {
 await scheduleHydrationNotification(
 s.hydrationHour || 12,
 { title: t.hydration.title, body: t.hydration.body },
 );
 results.hydration = true;
 } else {
 await cancelByPrefix('hydration-');
 }

 return results;
}
