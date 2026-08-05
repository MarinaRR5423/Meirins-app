/**
 * useWater — estado compartido de hidratación entre todas las instancias de WaterCard.
 * Usa un mini event-emitter a nivel de módulo para que HomeScreen y NutriScreen
 * se sincronicen al instante sin necesidad de Context ni Redux.
 */
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const listeners = new Set();
let _cachedKey = '';
let _cachedCount = 0;

function notify(count) {
  _cachedCount = count;
  listeners.forEach(fn => fn(count));
}

export function useWater() {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `water_count_${todayStr}`;

  // Si el día cambió, resetear caché
  if (_cachedKey !== storageKey) {
    _cachedKey = storageKey;
    _cachedCount = 0;
  }

  const [count, setCount] = useState(_cachedCount);

  useEffect(() => {
    // Leer AsyncStorage al montar (por si la app se reinicia)
    AsyncStorage.getItem(storageKey).then(v => {
      const n = v ? parseInt(v, 10) : 0;
      if (n !== _cachedCount) notify(n);
      else setCount(n);
    });

    const listener = (n) => setCount(n);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [storageKey]);

  const updateCount = (newCount) => {
    AsyncStorage.setItem(storageKey, String(newCount));
    notify(newCount);
  };

  return { count, updateCount };
}
