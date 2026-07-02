// ─── useHealthData ────────────────────────────────────────────────────────────
// Unified health hook: iOS (HealthKit via react-native-health)
//                      Android (Health Connect via react-native-health-connect)
//
// Graceful fallback: if packages are not installed yet the hook returns
// isAvailable=false and all data as null — the UI shows a "connect" banner.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Lazy native imports ───────────────────────────────────────────────────────
// iOS  : react-native-health  → instalar cuando haya cuenta Apple Developer
// Android: react-native-health-connect → requiere Kotlin 2.x (Expo SDK 55+)
let AppleHealthKit = null;
let HealthConnect  = null;

if (Platform.OS === 'ios') {
  try { const m = require('react-native-health'); AppleHealthKit = m.default ?? m; } catch (_) {}
}

// TODO (tarea #2): descomentar cuando Expo SDK actualice a Kotlin 2.x
// if (Platform.OS === 'android') {
//   try { HealthConnect = require('react-native-health-connect'); } catch (_) {}
// }

// ── Workout type normalisation ────────────────────────────────────────────────
const HK_TYPE_MAP = {
  Running: 'running', Walking: 'walking', Cycling: 'cycling',
  Swimming: 'swimming',
  FunctionalStrengthTraining: 'strength',
  TraditionalStrengthTraining: 'strength',
  CoreTraining: 'strength', CrossTraining: 'strength',
  Yoga: 'yoga', Pilates: 'pilates',
  HighIntensityIntervalTraining: 'hiit', JumpRope: 'hiit',
  Dance: 'dance', MindAndBody: 'yoga',
  StairClimbing: 'strength', Elliptical: 'cardio',
};

const HC_TYPE_MAP = {
  EXERCISE_TYPE_RUNNING: 'running',
  EXERCISE_TYPE_WALKING: 'walking',
  EXERCISE_TYPE_BIKING: 'cycling',
  EXERCISE_TYPE_BIKING_STATIONARY: 'cycling',
  EXERCISE_TYPE_SWIMMING_POOL: 'swimming',
  EXERCISE_TYPE_SWIMMING_OPEN_WATER: 'swimming',
  EXERCISE_TYPE_STRENGTH_TRAINING: 'strength',
  EXERCISE_TYPE_YOGA: 'yoga',
  EXERCISE_TYPE_PILATES: 'pilates',
  EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING: 'hiit',
  EXERCISE_TYPE_DANCING: 'dance',
  EXERCISE_TYPE_RUNNING_TREADMILL: 'running',
  EXERCISE_TYPE_ELLIPTICAL: 'cardio',
};

const STORAGE_KEY       = '@meirins_health_connected';
const SLEEP_HISTORY_KEY = '@meirins_sleep_history';

// ─────────────────────────────────────────────────────────────────────────────
export function useHealthData() {
  const [isAvailable,    setIsAvailable]    = useState(false);
  const [isConnected,    setIsConnected]    = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [lastSync,       setLastSync]       = useState(null);
  const [lastWorkout,    setLastWorkout]    = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayMetrics,   setTodayMetrics]   = useState(null);
  const [lastSleep,      setLastSleep]      = useState(null);
  const [sleepHistory,   setSleepHistory]   = useState([]);

  // ── Init on mount ───────────────────────────────────────────────────────────
  useEffect(() => { initHealth(); }, []);

  const initHealth = async () => {
    // Load cached sleep history on every startup regardless of HealthKit status
    try {
      const cached = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
      if (cached) {
        const history = JSON.parse(cached);
        setSleepHistory(history);
        if (history.length > 0) setLastSleep(history[0]);
      }
    } catch (_) {}

    if (Platform.OS === 'ios' && AppleHealthKit) {
      setIsAvailable(true);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        try {
          // HealthKit requires re-initialization on every app launch before any API calls
          await new Promise((resolve, reject) => {
            AppleHealthKit.initHealthKit({
              permissions: {
                read: [
                  AppleHealthKit.Constants?.Permissions?.SleepAnalysis      ?? 'SleepAnalysis',
                  AppleHealthKit.Constants?.Permissions?.Workout             ?? 'Workout',
                  AppleHealthKit.Constants?.Permissions?.HeartRate           ?? 'HeartRate',
                  AppleHealthKit.Constants?.Permissions?.RestingHeartRate    ?? 'RestingHeartRate',
                  AppleHealthKit.Constants?.Permissions?.HeartRateVariabilitySDNN ?? 'HeartRateVariabilitySDNN',
                  AppleHealthKit.Constants?.Permissions?.StepCount           ?? 'StepCount',
                  AppleHealthKit.Constants?.Permissions?.ActiveEnergyBurned  ?? 'ActiveEnergyBurned',
                  AppleHealthKit.Constants?.Permissions?.DistanceWalkingRunning ?? 'DistanceWalkingRunning',
                ],
                write: [],
              },
            }, (err) => { if (err) reject(err); else resolve(); });
          });
          setIsConnected(true);
          await _performSync();
        } catch (e) {
          console.warn('[useHealthData] initHealth error:', e);
        }
      }
    } else if (Platform.OS === 'android' && HealthConnect) {
      try {
        const status = await HealthConnect.getSdkStatus();
        const avail  = status === HealthConnect.SdkAvailabilityStatus?.SDK_AVAILABLE;
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
    if (Platform.OS === 'ios' && AppleHealthKit) {
      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit({
          permissions: {
            read: [
              AppleHealthKit.Constants?.Permissions?.SleepAnalysis      ?? 'SleepAnalysis',
              AppleHealthKit.Constants?.Permissions?.Workout             ?? 'Workout',
              AppleHealthKit.Constants?.Permissions?.HeartRate           ?? 'HeartRate',
              AppleHealthKit.Constants?.Permissions?.RestingHeartRate    ?? 'RestingHeartRate',
              AppleHealthKit.Constants?.Permissions?.HeartRateVariabilitySDNN ?? 'HeartRateVariabilitySDNN',
              AppleHealthKit.Constants?.Permissions?.StepCount           ?? 'StepCount',
              AppleHealthKit.Constants?.Permissions?.ActiveEnergyBurned  ?? 'ActiveEnergyBurned',
              AppleHealthKit.Constants?.Permissions?.DistanceWalkingRunning ?? 'DistanceWalkingRunning',
            ],
            write: [],
          },
        }, async (err) => {
          if (err) { resolve(false); return; }
          setIsConnected(true);
          await AsyncStorage.setItem(STORAGE_KEY, 'true');
          await _performSync();
          resolve(true);
        });
      });
    }

    if (Platform.OS === 'android' && HealthConnect) {
      try {
        const granted = await HealthConnect.requestPermission([
          { accessType: 'read', recordType: 'SleepSession'           },
          { accessType: 'read', recordType: 'ExerciseSession'        },
          { accessType: 'read', recordType: 'HeartRate'              },
          { accessType: 'read', recordType: 'RestingHeartRate'       },
          { accessType: 'read', recordType: 'Steps'                  },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned'   },
          { accessType: 'read', recordType: 'Distance'               },
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

  // ── Public sync (called by UI button) ───────────────────────────────────────
  const syncData = useCallback(async () => {
    setIsLoading(true);
    try   { await _performSync(); }
    catch (e) { console.warn('[useHealthData] sync error:', e); }
    finally   { setIsLoading(false); }
  }, []);

  // ── Internal sync dispatcher ────────────────────────────────────────────────
  const _performSync = async () => {
    if (Platform.OS === 'ios' && AppleHealthKit)    await _syncIOS();
    else if (Platform.OS === 'android' && HealthConnect) await _syncAndroid();
    setLastSync(new Date().toISOString());
  };

  // ── iOS sync ────────────────────────────────────────────────────────────────
  const _syncIOS = async () => {
    const now          = new Date();
    const thirtyAgo    = new Date(Date.now() - 30 * 86_400_000);
    const twoDaysAgo   = new Date(Date.now() -  2 * 86_400_000);
    const yesterdayStr = new Date(Date.now() -      86_400_000).toISOString();
    const todayStart   = new Date(); todayStart.setHours(0, 0, 0, 0);

    // ── Workouts ────────────────────────────────────────────────────────────
    const workouts = await new Promise(resolve => {
      AppleHealthKit.getSamples(
        { type: 'Workout', startDate: thirtyAgo.toISOString(), endDate: now.toISOString() },
        (err, results) => {
          if (err || !results?.length) { resolve([]); return; }
          const mapped = results
            .map(w => ({
              id:        w.startDate,
              date:      w.startDate?.split('T')[0],
              startTime: w.startDate,
              endTime:   w.endDate,
              type:      HK_TYPE_MAP[w.activityName] ?? 'other',
              name:      w.activityName ?? 'Workout',
              duration:  Math.round((w.duration ?? 0) / 60),
              calories:  w.totalEnergyBurned ? Math.round(w.totalEnergyBurned) : null,
              distance:  w.totalDistance     ? Math.round(w.totalDistance / 10) / 100 : null,
              avgHR: null, maxHR: null,
            }))
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
          resolve(mapped);
        },
      );
    });

    if (workouts.length) {
      // Enrich last workout with HR
      const last = workouts[0];
      const hr = await new Promise(resolve => {
        AppleHealthKit.getHeartRateSamples(
          { startDate: last.startTime, endDate: last.endTime, ascending: false },
          (err, results) => {
            if (err || !results?.length) { resolve(null); return; }
            const vals = results.map(r => r.value).filter(Boolean);
            if (!vals.length) { resolve(null); return; }
            resolve({
              avgHR: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
              maxHR: Math.max(...vals),
            });
          },
        );
      });
      const enriched = { ...last, ...(hr ?? {}) };
      setLastWorkout(enriched);
      setRecentWorkouts([enriched, ...workouts.slice(1, 10)]);
    }

    // ── Sleep (7-day history + cache) ───────────────────────────────────────
    const eightDaysAgo = new Date(Date.now() - 8 * 86_400_000);
    await new Promise(resolve => {
      AppleHealthKit.getSleepSamples(
        { startDate: eightDaysAgo.toISOString(), endDate: now.toISOString() },
        async (err, results) => {
          if (err || !results?.length) { resolve(); return; }

          const msRange = (arr) =>
            arr.reduce((s, r) => s + (new Date(r.endDate) - new Date(r.startDate)), 0);

          // Group samples by night — samples ending before noon belong to previous day's night
          const nights = {};
          for (const r of results) {
            const end = new Date(r.endDate);
            const key = end.getHours() < 12
              ? new Date(end - 86_400_000).toISOString().split('T')[0]
              : end.toISOString().split('T')[0];
            if (!nights[key]) nights[key] = [];
            nights[key].push(r);
          }

          const history = Object.entries(nights)
            .map(([date, samples]) => {
              const asleep = samples.filter(r => ['ASLEEP','CORE','DEEP','REM'].includes(r.value));
              const deep   = samples.filter(r => r.value === 'DEEP');
              const rem    = samples.filter(r => r.value === 'REM');
              const inBed  = samples.filter(r => r.value === 'INBED');
              const totalH = Math.round(msRange(asleep) / 360_000) / 10;

              // Hora de acostarse = startDate más temprano de todos los samples de esa noche
              const allSorted = [...samples].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
              const bedtime = allSorted[0]?.startDate ?? null;

              // Interrupciones = gaps > 5 min entre samples de sueño consecutivos
              const asleepSorted = [...asleep].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
              let interruptions = 0;
              for (let i = 1; i < asleepSorted.length; i++) {
                const gap = new Date(asleepSorted[i].startDate) - new Date(asleepSorted[i - 1].endDate);
                if (gap > 5 * 60_000) interruptions++;
              }

              return {
                date,
                duration:      totalH,
                deepSleep:     Math.round(msRange(deep)  / 360_000) / 10,
                remSleep:      Math.round(msRange(rem)   / 360_000) / 10,
                inBed:         Math.round(msRange(inBed) / 360_000) / 10,
                bedtime,
                interruptions,
              };
            })
            .filter(n => n.duration > 0)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 7);

          setSleepHistory(history);
          if (history.length > 0) setLastSleep(history[0]);
          try { await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(history)); } catch (_) {}
          resolve();
        },
      );
    });

    // ── Steps ───────────────────────────────────────────────────────────────
    await new Promise(resolve => {
      AppleHealthKit.getStepCount(
        { startDate: todayStart.toISOString(), endDate: now.toISOString() },
        (err, result) => {
          if (!err && result?.value)
            setTodayMetrics(p => ({ ...(p ?? {}), steps: Math.round(result.value) }));
          resolve();
        },
      );
    });

    // ── Resting HR ───────────────────────────────────────────────────────────
    await new Promise(resolve => {
      AppleHealthKit.getRestingHeartRate(
        { startDate: yesterdayStr, endDate: now.toISOString() },
        (err, result) => {
          if (!err && result?.value)
            setTodayMetrics(p => ({ ...(p ?? {}), restingHR: Math.round(result.value) }));
          resolve();
        },
      );
    });

    // ── Active calories ──────────────────────────────────────────────────────
    await new Promise(resolve => {
      AppleHealthKit.getActiveEnergyBurned(
        { startDate: todayStart.toISOString(), endDate: now.toISOString() },
        (err, results) => {
          if (!err && results?.length) {
            const total = Math.round(results.reduce((s, r) => s + (r.value ?? 0), 0));
            setTodayMetrics(p => ({ ...(p ?? {}), activeCalories: total }));
          }
          resolve();
        },
      );
    });

    // ── HRV ─────────────────────────────────────────────────────────────────
    await new Promise(resolve => {
      AppleHealthKit.getHeartRateVariabilitySamples(
        { startDate: yesterdayStr, endDate: now.toISOString(), ascending: false },
        (err, results) => {
          if (!err && results?.length)
            setTodayMetrics(p => ({ ...(p ?? {}), hrv: Math.round(results[0].value) }));
          resolve();
        },
      );
    });
  };

  // ── Android sync ────────────────────────────────────────────────────────────
  const _syncAndroid = async () => {
    const now         = new Date();
    const thirtyAgo   = new Date(Date.now() - 30 * 86_400_000);
    const yesterday   = new Date(Date.now() -      86_400_000);
    const todayStart  = new Date(); todayStart.setHours(0, 0, 0, 0);

    const range30 = { operator: 'between', startTime: thirtyAgo.toISOString(),  endTime: now.toISOString() };
    const rangeYes = { operator: 'between', startTime: yesterday.toISOString(), endTime: now.toISOString() };
    const rangeToday = { operator: 'between', startTime: todayStart.toISOString(), endTime: now.toISOString() };

    // ── Workouts ─────────────────────────────────────────────────────────────
    try {
      const { records } = await HealthConnect.readRecords('ExerciseSession', { timeRangeFilter: range30 });
      if (records?.length) {
        const workouts = records
          .map(w => {
            const durMs = new Date(w.endTime) - new Date(w.startTime);
            return {
              id:        w.startTime,
              date:      w.startTime.split('T')[0],
              startTime: w.startTime,
              endTime:   w.endTime,
              type:      HC_TYPE_MAP[`EXERCISE_TYPE_${w.exerciseType}`] ?? 'other',
              name:      w.title ?? w.exerciseType ?? 'Workout',
              duration:  Math.round(durMs / 60_000),
              calories:  null,
              distance:  w.distance?.inMeters ? Math.round(w.distance.inMeters / 10) / 100 : null,
              avgHR: null, maxHR: null,
            };
          })
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setLastWorkout(workouts[0]);
        setRecentWorkouts(workouts.slice(0, 10));
      }
    } catch (_) {}

    // ── Sleep ────────────────────────────────────────────────────────────────
    try {
      const { records } = await HealthConnect.readRecords('SleepSession', { timeRangeFilter: rangeYes });
      if (records?.length) {
        const last    = records[records.length - 1];
        const durMs   = new Date(last.endTime) - new Date(last.startTime);
        const stages  = last.stages ?? [];
        const stageMs = (type) =>
          stages.filter(s => s.stage === type)
            .reduce((sum, s) => sum + (new Date(s.endTime) - new Date(s.startTime)), 0);
        setLastSleep({
          date:      last.startTime.split('T')[0],
          duration:  Math.round(durMs / 360_000) / 10,
          deepSleep: Math.round(stageMs('SLEEP_STAGE_DEEP') / 360_000) / 10,
          remSleep:  Math.round(stageMs('SLEEP_STAGE_REM')  / 360_000) / 10,
          inBed:     null,
        });
      }
    } catch (_) {}

    // ── Steps ────────────────────────────────────────────────────────────────
    try {
      const { records } = await HealthConnect.readRecords('Steps', { timeRangeFilter: rangeToday });
      if (records?.length) {
        const total = records.reduce((s, r) => s + (r.count ?? 0), 0);
        setTodayMetrics(p => ({ ...(p ?? {}), steps: total }));
      }
    } catch (_) {}

    // ── Resting HR ───────────────────────────────────────────────────────────
    try {
      const { records } = await HealthConnect.readRecords('RestingHeartRate', { timeRangeFilter: rangeYes });
      if (records?.length) {
        const last = records[records.length - 1];
        setTodayMetrics(p => ({ ...(p ?? {}), restingHR: Math.round(last.beatsPerMinute) }));
      }
    } catch (_) {}

    // ── Active calories ───────────────────────────────────────────────────────
    try {
      const { records } = await HealthConnect.readRecords('ActiveCaloriesBurned', { timeRangeFilter: rangeToday });
      if (records?.length) {
        const total = Math.round(records.reduce((s, r) => s + (r.energy?.inKilocalories ?? 0), 0));
        setTodayMetrics(p => ({ ...(p ?? {}), activeCalories: total }));
      }
    } catch (_) {}
  };

  // ── Public API ──────────────────────────────────────────────────────────────
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
