import * as Sentry from '@sentry/react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || '';
const SENTRY_DSN = 'https://8aa4e6f9d4853c87825e35c1e97ae2f2@o4511859999834112.ingest.de.sentry.io/4511860152598608';

const ANALYTICS_ENABLED = !!POSTHOG_KEY || !!SENTRY_DSN;

let _posthog = null;

/**
 * Envuelve el componente raíz con el error boundary de Sentry.
 * Llamar en el export default de App.js: export default wrapWithSentry(App)
 */
export const wrapWithSentry = Sentry.wrap;

/**
 * Inicialización — llamar una vez al arrancar la app (useEffect en App.js).
 */
export function initAnalytics() {
 try {
 Sentry.init({
 dsn: SENTRY_DSN,
 tracesSampleRate: 0.2,
 enableAutoSessionTracking: true,
 enableNativeNagger: false,
 });
 } catch (e) {
 console.warn('Sentry init failed:', e.message);
 }
}

/** Permite al PostHogProvider registrar su cliente activo */
export function setPostHogClient(client) {
 _posthog = client;
}

/**
 * Identifica al usuario (después del login).
 * Nunca pasar traits identificables (email, peso, fechas de ciclo, etc.):
 * Blumm maneja datos de salud sensibles y no deben quedar asociados a la
 * identidad real de la usuaria en PostHog/Sentry sin consentimiento explícito.
 */
export function identifyUser(userId) {
 if (!ANALYTICS_ENABLED) return;
 try {
 Sentry.setUser({ id: userId });
 _posthog?.identify(userId);
 } catch { /* ignore */ }
}

/** Trackea un evento del producto */
export function trackEvent(eventName, properties = {}) {
 if (!ANALYTICS_ENABLED) return;
 try {
 _posthog?.capture(eventName, properties);
 } catch { /* ignore */ }
}

/** Trackea una vista de pantalla */
export function trackScreen(screenName, properties = {}) {
 if (!ANALYTICS_ENABLED) return;
 try {
 _posthog?.screen(screenName, properties);
 } catch { /* ignore */ }
}

/** Captura un error manualmente */
export function captureError(error, context = {}) {
 if (!ANALYTICS_ENABLED) {
 console.warn('[captureError]', error?.message || error, context);
 return;
 }
 try {
 Sentry.captureException(error, { extra: context });
 } catch { /* ignore */ }
}

/** Limpia el usuario (logout) */
export function resetAnalytics() {
 if (!ANALYTICS_ENABLED) return;
 try {
 Sentry.setUser(null);
 _posthog?.reset();
 } catch { /* ignore */ }
}

export const Events = {
 ONBOARDING_STARTED: 'onboarding_started',
 ONBOARDING_COMPLETED: 'onboarding_completed',
 ONBOARDING_STEP_VIEW: 'onboarding_step_view',

 RECIPE_FAVORITED: 'recipe_favorited',
 RECIPE_SKIPPED: 'recipe_skipped',
 RECIPE_MARKED_DONE: 'recipe_marked_done',
 WORKOUT_FAVORITED: 'workout_favorited',
 WORKOUT_SKIPPED: 'workout_skipped',
 WORKOUT_COMPLETED: 'workout_completed',

 WEIGHT_LOGGED: 'weight_logged',
 SLEEP_LOGGED: 'sleep_logged',
 CYCLE_DATE_SET: 'cycle_date_set',

 CALENDAR_SYNCED: 'calendar_synced',
 NOTIFICATIONS_ENABLED: 'notifications_enabled',

 PROFILE_DIET_CHANGED: 'profile_diet_changed',
 PROFILE_CONDITIONS_SET: 'profile_conditions_set',
 AVATAR_UPLOADED: 'avatar_uploaded',

 ACCOUNT_DELETED: 'account_deleted',
 USER_SIGNED_OUT: 'user_signed_out',

 PROGRAM_SELECTOR_OPENED: 'program_selector_opened',
 PROGRAM_SELECTED: 'program_selected',
};
