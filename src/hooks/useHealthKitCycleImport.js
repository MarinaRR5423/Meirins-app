/**
 * useHealthKitCycleImport
 *
 * Lector de datos menstruales de Apple HealthKit.
 * Usa @kingstinct/react-native-healthkit (v14) que soporta HKCategoryType
 * incluyendo MenstrualFlow e IntermenstrualBleeding.
 *
 * Separado de useHealthData para que el permiso de MenstrualFlow se pida
 * solo cuando la usuaria lo solicita explícitamente.
 *
 * Plataforma: iOS únicamente. En Android devuelve { available: false }.
 *
 * Flujo:
 *   1. requestAndImport()  → muestra el diálogo de permisos de iOS
 *   2. Si se concede       → lee hasta 5 años de MenstrualFlow
 *   3. Agrupa días consecutivos en períodos (gap > 2 días = nuevo período)
 *   4. Devuelve preview    → { periods: [{start,end}], months }
 *   5. confirm()           → llama a importPeriods() de useCycleData
 */

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

// ── Import condicional — falla silenciosamente en Android / Expo Go ───────────
let HealthKit = null;
if (Platform.OS === 'ios') {
  try {
    HealthKit = require('@kingstinct/react-native-healthkit').default;
  } catch (_) {}
}

// Identificadores de HKCategoryType para ciclo
const HK_MENSTRUAL_FLOW = 'HKCategoryTypeIdentifierMenstrualFlow';
const HK_INTERMENSTRUAL = 'HKCategoryTypeIdentifierIntermenstrualBleeding';

/** Solicita autorización de lectura para datos de ciclo. */
async function requestCyclePermissions() {
  if (!HealthKit) throw new Error('HealthKit no disponible');
  // @kingstinct/react-native-healthkit v14 usa API posicional: (read[], write[])
  await HealthKit.requestAuthorization(
    [HK_MENSTRUAL_FLOW, HK_INTERMENSTRUAL], // lectura
    [],                                      // escritura
  );
}

/** Lee muestras de MenstrualFlow de los últimos `years` años. */
async function fetchMenstrualSamples(years = 5) {
  if (!HealthKit) return [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);

  try {
    const samples = await HealthKit.queryCategorySamples(
      HK_MENSTRUAL_FLOW,
      {
        from: startDate,
        to: new Date(),
        ascending: true,
        limit: 1000,
      },
    );
    return samples ?? [];
  } catch {
    return [];
  }
}

/** Lee muestras de IntermenstrualBleeding (spotting) de los últimos `years` años. */
async function fetchSpottingSamples(years = 5) {
  if (!HealthKit) return [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);

  try {
    const samples = await HealthKit.queryCategorySamples(
      HK_INTERMENSTRUAL,
      {
        from: startDate,
        to: new Date(),
        ascending: true,
        limit: 1000,
      },
    );
    return samples ?? [];
  } catch {
    return [];
  }
}

/**
 * Agrupa muestras de MenstrualFlow (días individuales) en períodos.
 * Gap > 2 días entre muestras = nuevo período.
 * Devuelve [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }]
 */
function groupIntoPeriods(samples) {
  if (!samples.length) return [];

  // @kingstinct/react-native-healthkit devuelve { startDate: Date, endDate: Date, value: number }
  const days = [
    ...new Set(
      samples.map(s => {
        const d = s.startDate instanceof Date ? s.startDate : new Date(s.startDate);
        return d.toISOString().split('T')[0];
      })
    ),
  ]
    .filter(Boolean)
    .sort();

  if (!days.length) return [];

  const GAP_DAYS = 2;
  const periods = [];
  let start = days[0];
  let prev = days[0];

  for (let i = 1; i < days.length; i++) {
    const curr = days[i];
    const diff = (new Date(curr) - new Date(prev)) / 86_400_000;

    if (diff > GAP_DAYS) {
      periods.push({ start, end: prev });
      start = curr;
    }
    prev = curr;
  }
  periods.push({ start, end: prev });

  // Mínimo 1 día (períodos muy cortos pueden ser spotting)
  return periods.filter(p => {
    const len = (new Date(p.end) - new Date(p.start)) / 86_400_000 + 1;
    return len >= 1;
  });
}

/** Calcula cuántos meses cubre el array de períodos. */
function monthsCovered(periods) {
  if (!periods.length) return 0;
  const oldest = periods[0].start;
  const newest = periods[periods.length - 1].end;
  const diff = (new Date(newest) - new Date(oldest)) / (30.44 * 86_400_000);
  return Math.round(diff);
}

// ─────────────────────────────────────────────────────────────────────────────

export function useHealthKitCycleImport({ onImport }) {
  const available = Platform.OS === 'ios' && !!HealthKit;

  const [status, setStatus]     = useState('idle');
  // 'idle' | 'requesting' | 'reading' | 'preview' | 'importing' | 'done' | 'error'

  const [preview, setPreview]   = useState(null);
  // { periods: [{start,end}], months: number }

  const [error, setError]       = useState(null);
  const [pendingPeriods, setPending] = useState([]);

  /** Paso 1: pide permisos y lee datos. Muestra el preview. */
  const requestAndRead = useCallback(async () => {
    if (!available) { setError('HealthKit no disponible en este dispositivo.'); return; }

    setStatus('requesting');
    setError(null);

    try {
      await requestCyclePermissions();
    } catch (e) {
      console.warn('[HealthKit] requestAuthorization error:', e?.message ?? e);
      setStatus('error');
      setError('Permiso denegado o HealthKit no disponible.');
      return;
    }

    setStatus('reading');

    try {
      const [menstrual] = await Promise.all([
        fetchMenstrualSamples(5),
        fetchSpottingSamples(5), // leemos spotting pero no lo usamos para agrupar
      ]);

      const periods = groupIntoPeriods(menstrual);

      if (!periods.length) {
        setStatus('error');
        setError('No encontramos datos de ciclo en Apple Salud.');
        return;
      }

      setPending(periods);
      setPreview({ periods, months: monthsCovered(periods) });
      setStatus('preview');
    } catch (e) {
      setStatus('error');
      setError('Error al leer Apple Salud. Inténtalo de nuevo.');
    }
  }, [available]);

  /** Paso 2: confirma la importación y escribe en Supabase via useCycleData. */
  const confirm = useCallback(async () => {
    if (!pendingPeriods.length) return;

    setStatus('importing');
    try {
      await onImport(pendingPeriods, 'healthkit');
      setStatus('done');
      setPreview(null);
      setPending([]);
    } catch (e) {
      setStatus('error');
      setError('Error al guardar los datos. Inténtalo de nuevo.');
    }
  }, [pendingPeriods, onImport]);

  /** Cancela y resetea. */
  const reset = useCallback(() => {
    setStatus('idle');
    setPreview(null);
    setPending([]);
    setError(null);
  }, []);

  return {
    available,
    status,
    preview,
    error,
    requestAndRead,
    confirm,
    reset,
  };
}
