/**
 * calendarSync.js — sincronización de entrenamientos con el calendario
 *
 * Dos estrategias:
 * 1. EXPO GO / iOS 17+: genera un fichero .ics y lo comparte via Share sheet.
 * El usuario pulsa "Añadir al Calendario" en iOS → funciona siempre.
 * 2. BUILD NATIVO: usa expo-calendar para sincronización automática silenciosa.
 */
import { Platform, Share } from 'react-native';
import Constants from 'expo-constants';
import { PHASES } from '../data/phases';

// ── Detección de entorno ──────────────────────────────────────────────────────
export const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Mapping: JS weekday (0=Sun…6=Sat) → índice en week[] de PHASES
const JS_TO_WEEK = [6, 0, 1, 2, 3, 4, 5];

/** Devuelve el entreno del día (o null si es descanso). */
export function getWorkoutForDate(phase, dateStr) {
 const phaseData = PHASES[phase];
 if (!phaseData?.week) return null;
 const jsDay = new Date(dateStr + 'T12:00:00').getDay();
 const wIdx = JS_TO_WEEK[jsDay];
 const w = phaseData.week[wIdx];
 return w?.on ? w : null;
}

/** Parsea "30'" → 30 minutos. */
function parseDuration(durStr) {
 if (!durStr) return 45;
 const m = durStr.match(/\d+/);
 return m ? parseInt(m[0]) : 45;
}

/** Próximos N días a partir de hoy (inclusive). */
function nextDays(n = 7) {
 return Array.from({ length: n }, (_, i) => {
 const d = new Date();
 d.setDate(d.getDate() + i);
 return d.toISOString().split('T')[0];
 });
}

// ── ICS generator ─────────────────────────────────────────────────────────────

function toICSDate(dateStr, hour) {
 // Formato ICS sin zona horaria: YYYYMMDDTHHMMSS
 const [y, m, d] = dateStr.split('-');
 const hh = String(hour).padStart(2, '0');
 return `${y}${m}${d}T${hh}0000`;
}

function escapeICS(str) {
 return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildICSEvent({ workout, dateStr, hour }) {
 const durationMin = parseDuration(workout.dur);
 const startDT = toICSDate(dateStr, hour);
 // Calcular hora de fin
 const startH = parseInt(hour);
 const endTotalMin = startH * 60 + durationMin;
 const endH = String(Math.floor(endTotalMin / 60) % 24).padStart(2, '0');
 const endM = String(endTotalMin % 60).padStart(2, '0');
 const [y, m, d] = dateStr.split('-');
 const endDT = `${y}${m}${d}T${endH}${endM}00`;

 const exercises = workout.exercises?.length
 ? workout.exercises.map(e => {
 const detail = e.sets ? ` ${e.sets}×${e.reps || e.dur || ''}` : (e.dur ? ` ${e.dur}` : '');
 return `• ${e.name}${detail}`;
 }).join('\n')
 : '';

 const uid = `meirins-${dateStr.replace(/-/g, '')}-${startDT}@meirins.app`;

 return [
 'BEGIN:VEVENT',
 `UID:${uid}`,
 `DTSTART:${startDT}`,
 `DTEND:${endDT}`,
 `SUMMARY:${escapeICS(workout.ico + '' + workout.name)}`,
 exercises ? `DESCRIPTION:${escapeICS(exercises)}` : '',
 'BEGIN:VALARM',
 'TRIGGER:-PT15M',
 'ACTION:DISPLAY',
 'DESCRIPTION:Entreno Blumm',
 'END:VALARM',
 'END:VEVENT',
 ].filter(Boolean).join('\r\n');
}

function buildICS(events) {
 return [
 'BEGIN:VCALENDAR',
 'VERSION:2.0',
 'PRODID:-//Blumm//Workout Calendar//ES',
 'CALSCALE:GREGORIAN',
 'METHOD:PUBLISH',
 'X-WR-CALNAME:Blumm ',
 ...events,
 'END:VCALENDAR',
 ].join('\r\n');
}

// ── Export ICS (funciona en Expo Go e iOS 17+) ────────────────────────────────

/**
 * Genera un .ics con los entrenamientos de la semana y lo comparte.
 * En iOS: Share sheet ofrece "Añadir al Calendario" automáticamente.
 */
export async function exportWeekICS({ phase, trainDays = [], hour = 7 }) {
 const dates = nextDays(7);
 const events = [];

 for (const dateStr of dates) {
 const jsDay = new Date(dateStr + 'T12:00:00').getDay();
 if (!trainDays.includes(jsDay)) continue;
 const workout = getWorkoutForDate(phase, dateStr);
 if (!workout) continue;
 events.push(buildICSEvent({ workout, dateStr, hour }));
 }

 if (events.length === 0) {
 throw new Error('NO_WORKOUTS_THIS_WEEK');
 }

 const icsContent = buildICS(events);

 // Intentar compartir como fichero con expo-sharing (abre share sheet nativo)
 try {
 const FileSystem = require('expo-file-system');
 const Sharing = require('expo-sharing');

 const tmpPath = FileSystem.cacheDirectory + 'meirins_entrenamientos.ics';
 await FileSystem.writeAsStringAsync(tmpPath, icsContent, { encoding: FileSystem.EncodingType.UTF8 });

 const canShare = await Sharing.isAvailableAsync();
 if (canShare) {
 await Sharing.shareAsync(tmpPath, {
 mimeType: 'text/calendar',
 UTI: 'public.calendar',
 dialogTitle: 'Añadir entrenamientos al calendario',
 });
 return { method: 'ics_file', eventsCount: events.length };
 }
 } catch (e) {
 console.warn('expo-sharing falló, usando Share nativo:', e.message);
 }

 // Fallback: Share nativo con el texto ICS
 await Share.share({
 message: icsContent,
 title: 'Blumm — Entrenamientos de la semana',
 });
 return { method: 'ics_share', eventsCount: events.length };
}

// ── Sincronización directa con expo-calendar (build nativo, no Expo Go) ───────

export async function requestCalendarPermission() {
 if (Platform.OS === 'web' || IS_EXPO_GO) return false;
 try {
 const Calendar = require('expo-calendar');
 const { status } = await Calendar.requestCalendarPermissionsAsync();
 return status === 'granted';
 } catch (e) {
 console.warn('Calendar perm error:', e.message);
 return false;
 }
}

async function getOrCreateCalendarId() {
 const Calendar = require('expo-calendar');
 try {
 const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
 const ours = cals.find(c => c.title === 'Blumm ');
 if (ours) return ours.id;
 } catch { /* ignorar */ }
 try {
 const def = await Calendar.getDefaultCalendarAsync();
 if (def?.id) return def.id;
 } catch { /* ignorar */ }
 const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
 const writable = cals.find(c => c.allowsModifications);
 if (writable) return writable.id;
 throw new Error('NO_WRITABLE_CALENDAR');
}

export async function syncWeekToCalendar({ phase, trainDays = [], hour = 7, calendarEvents = {} }) {
 if (Platform.OS === 'web' || IS_EXPO_GO) throw new Error('USE_ICS');

 const granted = await requestCalendarPermission();
 if (!granted) throw new Error('PERMISSION_DENIED');

 const Calendar = require('expo-calendar');
 const calendarId = await getOrCreateCalendarId();
 const dates = nextDays(7);
 const updated = { ...calendarEvents };

 for (const dateStr of dates) {
 const jsDay = new Date(dateStr + 'T12:00:00').getDay();
 if (!trainDays.includes(jsDay)) continue;
 const workout = getWorkoutForDate(phase, dateStr);
 if (!workout) continue;

 try {
 const durationMin = parseDuration(workout.dur);
 const startDate = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:00:00`);
 const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
 const exercises = workout.exercises?.map(e => {
 const d = e.sets ? ` ${e.sets}×${e.reps || e.dur || ''}` : (e.dur || '');
 return `• ${e.name}${d}`;
 }).join('\n') || '';

 const eventData = {
 title: `${workout.ico} ${workout.name}`,
 startDate, endDate,
 notes: exercises,
 calendarId,
 alarms: [{ relativeOffset: -15 }],
 };

 const existingId = calendarEvents[dateStr];
 let eventId;
 if (existingId) {
 try { await Calendar.updateEventAsync(existingId, eventData); eventId = existingId; }
 catch { eventId = await Calendar.createEventAsync(calendarId, eventData); }
 } else {
 eventId = await Calendar.createEventAsync(calendarId, eventData);
 }
 if (eventId) updated[dateStr] = eventId;
 } catch (e) {
 console.warn(`Error evento ${dateStr}:`, e.message);
 }
 }
 return updated;
}

export async function removeAllCalendarEvents(calendarEvents = {}) {
 if (Platform.OS === 'web' || IS_EXPO_GO) return;
 try {
 const Calendar = require('expo-calendar');
 await Promise.all(Object.values(calendarEvents).map(id =>
 Calendar.deleteEventAsync(id).catch(() => {})
 ));
 } catch { /* ignorar */ }
}
