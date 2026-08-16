/**
 * useHealthKitCycleImport
 *
 * Lector de datos menstruales de Apple HealthKit.
 * Separado de useHealthData para que el permiso de MenstrualFlow se pida
 * solo cuando la usuaria lo solicita explícitamente, no al conectar
 * workouts/sueño por primera vez.
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
let AppleHealthKit = null;
if (Platform.OS === 'ios') {
  try {
    const m = require('react-native-health');
    AppleHealthKit = m.default ?? m;
  } catch (_) {}
}

// ── Permisos de ciclo — solo lectura, nunca escritura ────────────────────────
function getCycleReadPermissions() {
  if (!AppleHealthKit) return [];
  const P = AppleHealthKit.Constants?.Permissions ?? {};
  return [
    P.MenstrualFlow            ?? 'MenstrualFlow',
    P.IntermenstrualBleeding   ?? 'IntermenstrualBleeding',
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Inicializa HealthKit con solo los permisos de ciclo. */
function initCycleKit() {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(
      { permissions: { read: getCycleReadPermissions(), write: [] } },
      (err) => { if (err) reject(err); else resolve(); },
    );
  });
}

/** Lee todas las muestras de MenstrualFlow de los últimos `years` años. */
function fetchMenstrualSamples(years = 5) {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    AppleHealthKit.getSamples(
      {
        type: 'MenstrualFlow',
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        ascending: true,
      },
      (err, results) => {
        if (err || !results?.length) { resolve([]); return; }
        resolve(results);
      },
    );
  });
}

/** Lee muestras de IntermenstrualBleeding (spotting) de los últimos `years` años. */
function fetchSpottingSamples(years = 5) {
  return new Promise((resolve) => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    AppleHealthKit.getSamples(
      {
        type: 'IntermenstrualBleeding',
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        ascending: true,
      },
      (err, results) => {
        if (err || !results?.length) { resolve([]); return; }
        resolve(results);
      },
    );
  });
}

/**
 * Agrupa muestras de MenstrualFlow (días individuales) en períodos.
 * Gap > 2 días entre muestras = nuevo período.
 * Devuelve [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }]
 */
function groupIntoPeriods(samples) {
  if (!samples.length) return [];

  // Extraer fecha única por muestra (ignorar hora)
  const days = [
    ...new Set(
      samples.map(s => (s.startDate ?? s.value?.startDate ?? '').split('T')[0])
    ),
  ]
    .filter(Boolean)
    .sort();

  if (!days.length) return [];

  const GAP_DAYS = 2; // días de silencio para considerar un nuevo período
  const periods = [];
  let start = days[0];
  let prev = days[0];

  for (let i = 1; i < days.length; i++) {
    const curr = days[i];
    const diff = (new Date(curr) - new Date(prev)) / 86_400_000;

    if (diff > GAP_DAYS) {
      // Cierra el período actual y abre uno nuevo
      periods.push({ start, end: prev });
      start = curr;
    }
    prev = curr;
  }

  // Último período abierto
  periods.push({ start, end: prev });

  // Descartar períodos de 1 día aislado (pueden ser spotting mal clasificado)
  return periods.filter(p => {
    const days = (new Date(p.end) - new Date(p.start)) / 86_400_000 + 1;
    return days >= 1; // mínimo 1 día (períodos cortos son válidos)
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
  const available = Platform.OS === 'ios' && !!AppleHealthKit;

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
      await initCycleKit();
    } catch (e) {
      // iOS no distingue "denegado" de "error" en el callback — lo tratamos como denegado
      setStatus('error');
      setError('Permiso denegado o HealthKit no disponible.');
      return;
    }

    setStatus('reading');

    try {
      const [menstrual, spotting] = await Promise.all([
        fetchMenstrualSamples(5),
        fetchSpottingSamples(5),
      ]);

      // Usamos solo MenstrualFlow para construir períodos.
      // Las muestras de spotting las incorporamos si caen dentro del rango de un período.
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
