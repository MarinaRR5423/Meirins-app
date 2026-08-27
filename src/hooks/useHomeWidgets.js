import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WIDGETS_KEY = 'home_widgets_v1';

export const WIDGET_DEFS = [
  { id: 'streak',    emoji: '🔥', label: { es: 'Racha',             en: 'Streak',            fr: 'Série',              it: 'Serie' } },
  { id: 'hydration', emoji: '💧', label: { es: 'Hidratación + Ciclo', en: 'Hydration + Cycle', fr: 'Hydratation + Cycle', it: 'Idratazione + Ciclo' } },
  { id: 'fasting',   emoji: '⏱️', label: { es: 'Ayuno',              en: 'Fasting',           fr: 'Jeûne',              it: 'Digiuno' } },
  { id: 'nutrition', emoji: '🥗', label: { es: 'Nutrición de hoy',   en: "Today's nutrition", fr: "Nutrition d'aujourd'hui", it: 'Nutrizione di oggi' } },
  { id: 'tip',       emoji: '✨', label: { es: 'Consejo del día',    en: 'Tip of the day',    fr: 'Conseil du jour',    it: 'Consiglio del giorno' } },
];

export const DEFAULT_WIDGETS = Object.fromEntries(WIDGET_DEFS.map(w => [w.id, true]));

export function useHomeWidgets() {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);

  useEffect(() => {
    AsyncStorage.getItem(WIDGETS_KEY).then(v => {
      if (v) {
        try { setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(v) }); } catch {}
      }
    });
  }, []);

  const toggle = useCallback((id) => {
    setWidgets(prev => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(WIDGETS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { widgets, toggle };
}
