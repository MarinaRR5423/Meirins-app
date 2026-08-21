// ─── useHealthData ────────────────────────────────────────────────────────────
// Unified health hook: iOS (HealthKit via @kingstinct/react-native-healthkit)
//                      Android (Health Connect via react-native-health-connect)
//
// @kingstinct/react-native-healthkit v14+ requiere Nueva Arquitectura (Nitro).
// Graceful fallback: si el paquete no carga, devuelve isAvailable=false.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Lazy native imports ───────────────────────────────────────────────────────
let HealthKit = null;
let HealthConnect = null;

if (Platform.OS === 'ios') {
  try {
    HealthKit = require('@kingstinct/react-native-healthkit').default;
  } catch (_) {}
}

// TODO: descomentar cuando Expo SDK actualice a Kotlin 2.x
// if (Platform.OS === 'android') {
//   try { HealthConnect = require('react-native-health-connect'); } catch (_) {}
// }

// ── HK identifiers ───────────────────────────────────────────────────────────
const HK = {
  Workout:        'HKWorkoutTypeIdentifier',
  HeartRate:      'HKQuantityTypeIdentifierHeartRate',
  RestingHR:      'HKQuantityTypeIdentifierRestingHeartRate',
  HRV:            'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  Steps:          'HKQuantityTypeIdentifierStepCount',
  ActiveEnergy:   'HKQuantityTypeIdentifierActiveEnergyBurned',
  Distance:       'HKQuantityTypeIdentifierDistanceWalkingRunning',
  Sleep:          'HKCategoryTypeIdentifierSleepAnalysis',
};

// ── Workout type map (HKWorkoutActivityType → app type) ───────────────────────
const HK_TYPE_MAP = {
  HKWorkoutActivityTypeRunning:                    'running',
  HKWorkoutActivityTypeWalking:                    'walking',
  HKWorkoutActivityTypeCycling:                    'cycling',
  HKWorkoutActivityTypeSwimming:                   'swimming',
  HKWorkoutActivityTypeSwimmingPool:               'swimming',
  HKWorkoutActivityTypeSwimmingOpenWater:          'swimming',
  HKWorkoutActivityTypeFunctionalStrengthTraining: 'strength',
  HKWorkoutActivityTypeTraditionalStrengthTraining:'strength',
  HKWorkoutActivityTypeCoreTraining:               'strength',
  HKWorkoutActivityTypeCrossTraining:              'strength',
  HKWorkoutActivityTypeStairClimbing:              'strength',
  HKWorkoutActivityTypeYoga:                       'yoga',
  HKWorkoutActivityTypePilates:                    'pilates',
  HKWorkoutActivityTypeMindAndBody:                'yoga',
  HKWorkoutActivityTypeHighIntensityIntervalTraining: 'hiit',
  HKWorkoutActivityTypeJumpRope:                   'hiit',
  HKWorkoutActivityTypeDance:                      'dance',
  HKWorkoutActivityTypeElliptical:                 'cardio',
};

// HKCategoryValueSleepAnalysis numeric values
const SLEEP_ASLEEP = new Set([1, 3, 4, 5]); // asleep / core / deep / rem
const SLEEP_DEEP   = 4;
const SLEEP_REM    = 5;
const SLEEP_INBED  = 0;

const STORAGE_KEY      = '@meirins_health_connected';
const SLEEP_HISTORY_KEY = '@meirins_sleep_history';

// ─────────────────────────────────────────────────────────────────────────────
export function useHealthData() {
  const [isAvailable, setIsAvailable]   = useState(false);
  const [isConnected, setIsConnected]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [lastSync, setLastSync]         = useState(null);
  const [lastWorkout, setLastWorkout]   = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [lastSleep, setLastSleep]       = useState(null);
  const [sleepHistory, setSleepHistory] = useState([]);

  // ── Init on mount ───────────────────────────────────────────────────────────
  useEffect(() => { initHealth(); }, []);

  const initHealth = async () => {
    // Cargar historial de sueño cacheado al arrancar
    try {
      const cached = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
      if (cached) {
        const history = JSON.parse(cached);
        setSleepHistory(history);
        if (history.length > 0) setLastSleep(history[0]);
      }
    } catch (_) {}

    if (Platform.OS === 'ios' && HealthKit) {
      setIsAvailable(true);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        try {
          // @kingstinct solo necesita requestAuthorization — no hay initHealthKit
          await HealthKit.requestAuthorization(Object.values(HK), []);
          setIsConnected(true);
          await _performSync();
        } catch (e) {
          console.warn('[useHealthData] initHealth error:', e);
        }
      }
    } else if (Platform.OS === 'android' && HealthConnect) {
      try {
        const status = await HealthConnect.getSdkStatus();
        const avail = status === HealthConnect.SdkAvailabilityStatus?.SDK_AVAILABLE;
        setIsAvailable(avail);
        if (avail) {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved === 'true') {
            setIsConnected(true);
            await _performSync();
          }
        }
      } catch (_) { setIsAvailable(false); }
    }
  };

  // ── Request permissions (connect) ───────────────────────────────────────────
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'ios' && HealthKit) {
      try {
        await HealthKit.requestAuthorization(Object.values(HK), []);
        setIsConnected(true);
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        await _performSync();
        return true;
      } catch (_) { return false; }
    }

    if (Platform.OS === 'android' && HealthConnect) {
      try {
        const granted = await HealthConnect.requestPermission([
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'ExerciseSession' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'RestingHeartRate' },
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
          { accessType: 'read', recordType: 'Distance' },
        ]);
        const ok = granted.every(p => p.granted);
        setIsConnected(ok);
        if (ok) {
          await AsyncStorage.setItem(STORAGE_KEY, 'true');
          await _performSync();
        }
        return ok;
      } catch (_) { return false; }
    }

    return false;
  }, []);

  // ── Disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    setIsConnected(false);
    setLastWorkout(null);
    setRecentWorkouts([]);
    setTodayMetrics(null);
    setLastSleep(null);
    setLastSync(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Public sync ─────────────────────────────────────────────────────────────
  const syncData = useCallback(async () => {
    setIsLoading(true);
    try { await _performSync(); }
    catch (e) { console.warn('[useHealthData] sync error:', e); }
    finally { setIsLoading(false); }
  }, []);

  // ── Internal sync dispatcher ────────────────────────────────────────────────
  const _performSync = async () => {
    if (Platform.OS === 'ios' && HealthKit) await _syncIOS();
    else if (Platform.OS === 'android' && HealthConnect) await _syncAndroid();
    setLastSync(new Date().toISOString());
  };

  // ── iOS sync ────────────────────────────────────────────────────────────────
  const _syncIOS = async () => {
    const now        = new Date();
    const thirtyAgo  = new Date(Date.now() - 30 * 86_400_000);
    const eightAgo   = new Date(Date.now() - 8  * 86_400_000);
    const yesterday  = new Date(Date.now() - 86_400_000);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    // ── Workouts ──────────────────────────────────────────────────────────────
    try {
      const rawWorkouts = await HealthKit.queryWorkoutSamples({
        from: thirtyAgo,
        to:   now,
        ascending: false,
        limit: 30,
      });

      if (rawWorkouts?.length) {
        const workouts = rawWorkouts.map(w => ({
          id:        w.startDate instanceof Date ? w.startDate.toISOString() : w.startDate,
          date:      (w.startDate instanceof Date ? w.startDate : new Date(w.startDate)).toISOString().split('T')[0],
          startTime: w.startDate instanceof Date ? w.startDate.toISOString() : w.startDate,
          endTime:   w.endDate   instanceof Date ? w.endDate.toISOString()   : w.endDate,
          type:      HK_TYPE_MAP[w.workoutActivityType] ?? 'other',
          name:      w.workoutActivityType?.replace('HKWorkoutActivityType', '') ?? 'Workout',
          duration:  Math.round((w.duration ?? 0) / 60),
          calories:  w.totalEnergyBurned?.quantity ? Math.round(w.totalEnergyBurned.quantity) : null,
          distance:  w.totalDistance?.quantity     ? Math.round(w.totalDistance.quantity / 10) / 100 : null,
          avgHR: null, maxHR: null,
        }));

        // Enriquecer el último workout con HR
        const last = workouts[0];
        try {
          const hrSamples = await HealthKit.queryQuantitySamples(HK.HeartRate, {
            from: new Date(last.startTime),
            to:   new Date(last.endTime),
            ascending: false,
            limit: 200,
          });
          if (hrSamples?.length) {
            const vals = hrSamples.map(r => r.quantity).filter(Boolean);
            last.avgHR = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
            last.maxHR = Math.max(...vals);
          }
        } catch (_) {}

        setLastWorkout(last);
        setRecentWorkouts([last, ...workouts.slice(1, 10)]);
      }
    } catch (e) { console.warn('[useHealthData] workouts error:', e); }

    // ── Sleep (7-day history + cache) ─────────────────────────────────────────
    try {
      const sleepSamples = await HealthKit.queryCategorySamples(HK.Sleep, {
        from: eightAgo,
        to:   now,
        ascending: true,
      });

      if (sleepSamples?.length) {
        const msRange = (arr) =>
          arr.reduce((s, r) => {
            const start = r.startDate instanceof Date ? r.startDate : new Date(r.startDate);
            const end   = r.endDate   instanceof Date ? r.endDate   : new Date(r.endDate);
            return s + (end - start);
          }, 0);

        // Agrupar por noche (samples que terminan antes del mediodía = noche anterior)
        const nights = {};
        for (const r of sleepSamples) {
          const end = r.endDate instanceof Date ? r.endDate : new Date(r.endDate);
          const key = end.getHours() < 12
            ? new Date(end - 86_400_000).toISOString().split('T')[0]
            : end.toISOString().split('T')[0];
          if (!nights[key]) nights[key] = [];
          nights[key].push(r);
        }

        const history = Object.entries(nights)
          .map(([date, samples]) => {
            const asleep = samples.filter(r => SLEEP_ASLEEP.has(r.value));
            const deep   = samples.filter(r => r.value === SLEEP_DEEP);
            const rem    = samples.filter(r => r.value === SLEEP_REM);
            const inBed  = samples.filter(r => r.value === SLEEP_INBED);
            const totalH = Math.round(msRange(asleep) / 360_000) / 10;

            const allSorted = [...samples].sort((a, b) =>
              new Date(a.startDate) - new Date(b.startDate));
            const bedtime = allSorted[0]?.startDate ?? null;
            const bedtimeStr = bedtime instanceof Date ? bedtime.toISOString() : bedtime;

            const asleepSorted = [...asleep].sort((a, b) =>
              new Date(a.startDate) - new Date(b.startDate));
            let interruptions = 0;
            for (let i = 1; i < asleepSorted.length; i++) {
              const gap = new Date(asleepSorted[i].startDate) - new Date(asleepSorted[i - 1].endDate);
              if (gap > 5 * 60_000) interruptions++;
            }

            return {
              date,
              duration:    Math.round(msRange(asleep) / 360_000) / 10,
              deepSleep:   Math.round(msRange(deep)   / 360_000) / 10,
              remSleep:    Math.round(msRange(rem)     / 360_000) / 10,
              inBed:       Math.round(msRange(inBed)   / 360_000) / 10,
              bedtime:     bedtimeStr,
              interruptions,
            };
          })
          .filter(n => n.duration > 0)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 7);

        setSleepHistory(history);
        if (history.length > 0) setLastSleep(history[0]);
        try { await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(history)); } catch (_) {}
      }
    } catch (e) { console.warn('[useHealthData] sleep error:', e); }

    // ── Steps ─────────────────────────────────────────────────────────────────
    try {
      const stepSamples = await HealthKit.queryQuantitySamples(HK.Steps, {
        from: todayStart,
        to:   now,
      });
      if (stepSamples?.length) {
        const total = Math.round(stepSamples.reduce((s, r) => s + (r.quantity ?? 0), 0));
        setTodayMetrics(p => ({ ...(p ?? {}), steps: total }));
      }
    } catch (_) {}

    // ── Resting HR ────────────────────────────────────────────────────────────
    try {
      const hrSamples = await HealthKit.queryQuantitySamples(HK.RestingHR, {
        from: yesterday,
        to:   now,
        ascending: false,
        limit: 1,
      });
      if (hrSamples?.length) {
        setTodayMetrics(p => ({ ...(p ?? {}), restingHR: Math.round(hrSamples[0].quantity) }));
      }
    } catch (_) {}

    // ── Active calories ───────────────────────────────────────────────────────
    try {
      const calSamples = await HealthKit.queryQuantitySamples(HK.ActiveEnergy, {
        from: todayStart,
        to:   now,
      });
      if (calSamples?.length) {
        const total = Math.round(calSamples.reduce((s, r) => s + (r.quantity ?? 0), 0));
        setTodayMetrics(p => ({ ...(p ?? {}), activeCalories: total }));
      }
    } catch (_) {}

    // ── HRV ───────────────────────────────────────────────────────────────────
    try {
      const hrvSamples = await HealthKit.queryQuantitySamples(HK.HRV, {
        from: yesterday,
        to:   now,
        ascending: false,
        limit: 1,
      });
      if (hrvSamples?.length) {
        setTodayMetrics(p => ({ ...(p ?? {}), hrv: Math.round(hrvSamples[0].quantity) }));
      }
    } catch (_) {}
  };

  // ── Android sync ─────────────────────────────────────────────────────────────
  const _syncAndroid = async () => {
    const now        = new Date();
    const thirtyAgo  = new Date(Date.now() - 30 * 86_400_000);
    const yesterday  = new Date(Date.now() - 86_400_000);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const range30    = { operator: 'between', startTime: thirtyAgo.toISOString(),  endTime: now.toISOString() };
    const rangeYes   = { operator: 'between', startTime: yesterday.toISOString(),  endTime: now.toISOString() };
    const rangeToday = { operator: 'between', startTime: todayStart.toISOString(), endTime: now.toISOString() };

    const HC_TYPE_MAP = {
      EXERCISE_TYPE_RUNNING:              'running',
      EXERCISE_TYPE_WALKING:              'walking',
      EXERCISE_TYPE_BIKING:               'cycling',
      EXERCISE_TYPE_BIKING_STATIONARY:    'cycling',
      EXERCISE_TYPE_SWIMMING_POOL:        'swimming',
      EXERCISE_TYPE_SWIMMING_OPEN_WATER:  'swimming',
      EXERCISE_TYPE_STRENGTH_TRAINING:    'strength',
      EXERCISE_TYPE_YOGA:                 'yoga',
      EXERCISE_TYPE_PILATES:              'pilates',
      EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING: 'hiit',
      EXERCISE_TYPE_DANCING:              'dance',
      EXERCISE_TYPE_RUNNING_TREADMILL:    'running',
      EXERCISE_TYPE_ELLIPTICAL:           'cardio',
    };

    try {
      const { records } = await HealthConnect.readRecords('ExerciseSession', { timeRangeFilter: range30 });
      if (records?.length) {
        const workouts = records
          .map(w => ({
            id:        w.startTime,
            date:      w.startTime.split('T')[0],
            startTime: w.startTime,
            endTime:   w.endTime,
            type:      HC_TYPE_MAP[`EXERCISE_TYPE_${w.exerciseType}`] ?? 'other',
            name:      w.title ?? w.exerciseType ?? 'Workout',
            duration:  Math.round((new Date(w.endTime) - new Date(w.startTime)) / 60_000),
            calories:  null,
            distance:  w.distance?.inMeters ? Math.round(w.distance.inMeters / 10) / 100 : null,
            avgHR: null, maxHR: null,
          }))
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setLastWorkout(workouts[0]);
        setRecentWorkouts(workouts.slice(0, 10));
      }
    } catch (_) {}

    try {
      const { records } = await HealthConnect.readRecords('SleepSession', { timeRangeFilter: rangeYes });
      if (records?.length) {
        const last = records[records.length - 1];
        const durMs = new Date(last.endTime) - new Date(last.startTime);
        const stages = last.stages ?? [];
        const stageMs = (type) =>
          stages.filter(s => s.stage === type)
            .reduce((sum, s) => sum + (new Date(s.endTime) - new Date(s.startTime)), 0);
        setLastSleep({
          date:      last.startTime.split('T')[0],
          duration:  Math.round(durMs / 360_000) / 10,
          deepSleep: Math.round(stageMs('SLEEP_STAGE_DEEP') / 360_000) / 10,
          remSleep:  Math.round(stageMs('SLEEP_STAGE_REM')  / 360_000) / 10,
          inBed: null,
        });
      }
    } catch (_) {}

    try {
      const { records } = await HealthConnect.readRecords('Steps', { timeRangeFilter: rangeToday });
      if (records?.length) {
        const total = records.reduce((s, r) => s + (r.count ?? 0), 0);
        setTodayMetrics(p => ({ ...(p ?? {}), steps: total }));
      }
    } catch (_) {}

    try {
      const { records } = await HealthConnect.readRecords('RestingHeartRate', { timeRangeFilter: rangeYes });
      if (records?.length) {
        setTodayMetrics(p => ({ ...(p ?? {}), restingHR: Math.round(records[records.length - 1].beatsPerMinute) }));
      }
    } catch (_) {}

    try {
      const { records } = await HealthConnect.readRecords('ActiveCaloriesBurned', { timeRangeFilter: rangeToday });
      if (records?.length) {
        const total = Math.round(records.reduce((s, r) => s + (r.energy?.inKilocalories ?? 0), 0));
        setTodayMetrics(p => ({ ...(p ?? {}), activeCalories: total }));
      }
    } catch (_) {}
  };

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    isAvailable,
    isConnected,
    isLoading,
    lastSync,
    lastWorkout,
    recentWorkouts,
    todayMetrics,
    lastSleep,
    sleepHistory,
    requestPermissions,
    syncData,
    disconnect,
  };
}
