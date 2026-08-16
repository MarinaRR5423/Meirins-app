/**
 * useCycleData — gestiona cycle_periods y cycle_daily_logs desde Supabase.
 *
 * Reemplaza el acceso a profileExtended.periodHistory y profileExtended.cycleLog.
 * La carga ocurre una vez al montar; las escrituras hacen optimistic update local
 * + upsert en Supabase en segundo plano.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCycleData(userId) {
  const [periods, setPeriods] = useState([]);       // [{ id, start_date, end_date, source }]
  const [dailyLogs, setDailyLogs] = useState({});   // { 'YYYY-MM-DD': { flow, mood, ... } }
  const [loading, setLoading] = useState(true);

  // ─── Carga inicial ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [{ data: perData }, { data: logData }] = await Promise.all([
      supabase
        .from('cycle_periods')
        .select('id, start_date, end_date, source, imported_at')
        .eq('user_id', userId)
        .order('start_date', { ascending: false }),
      supabase
        .from('cycle_daily_logs')
        .select('log_date, data')
        .eq('user_id', userId)
        .order('log_date', { ascending: false }),
    ]);

    if (perData) setPeriods(perData);
    if (logData) {
      const map = {};
      logData.forEach(r => { map[r.log_date] = r.data; });
      setDailyLogs(map);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ─── Períodos ──────────────────────────────────────────────────────────────

  /**
   * Guarda (upsert) un período. Si ya existe con el mismo start_date lo actualiza.
   * @param {{ start: string, end?: string }} entry  fechas en formato 'YYYY-MM-DD'
   * @param {string} [source='manual']
   */
  const savePeriod = useCallback(async (entry, source = 'manual') => {
    if (!userId || !entry?.start) return;

    // Optimistic update local
    setPeriods(prev => {
      const filtered = prev.filter(p => p.start_date !== entry.start);
      return [
        { start_date: entry.start, end_date: entry.end || null, source },
        ...filtered,
      ].sort((a, b) => b.start_date.localeCompare(a.start_date));
    });

    await supabase.from('cycle_periods').upsert(
      {
        user_id:    userId,
        start_date: entry.start,
        end_date:   entry.end || null,
        source,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,start_date' }
    );
  }, [userId]);

  /**
   * Importa un array de períodos de golpe (usado por HealthKit / CSV).
   * @param {Array<{ start: string, end?: string }>} entries
   * @param {string} source  'healthkit' | 'apple_xml' | 'csv'
   */
  const importPeriods = useCallback(async (entries, source) => {
    if (!userId || !entries?.length) return;

    const now = new Date().toISOString();
    const rows = entries
      .filter(e => e?.start)
      .map(e => ({
        user_id:     userId,
        start_date:  e.start,
        end_date:    e.end || null,
        source,
        imported_at: now,
        updated_at:  now,
      }));

    if (!rows.length) return;

    // Manuales siempre ganan — no sobreescribir si source === 'manual'
    await supabase.from('cycle_periods').upsert(rows, {
      onConflict:      'user_id,start_date',
      ignoreDuplicates: false,
    });

    await load(); // recarga para reflejar el estado real de BD
  }, [userId, load]);

  /**
   * Elimina un período por su start_date.
   */
  const deletePeriod = useCallback(async (startDate) => {
    if (!userId || !startDate) return;

    setPeriods(prev => prev.filter(p => p.start_date !== startDate));

    await supabase
      .from('cycle_periods')
      .delete()
      .eq('user_id', userId)
      .eq('start_date', startDate);
  }, [userId]);

  // ─── Tracking diario ───────────────────────────────────────────────────────

  /**
   * Guarda o actualiza el log de síntomas de un día.
   * @param {string} dateStr  'YYYY-MM-DD'
   * @param {object} data     { flow, mood, pain, ... }
   */
  const logCycleDay = useCallback(async (dateStr, data) => {
    if (!userId || !dateStr) return;

    // Optimistic update
    setDailyLogs(prev => ({ ...prev, [dateStr]: data }));

    await supabase.from('cycle_daily_logs').upsert(
      {
        user_id:    userId,
        log_date:   dateStr,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' }
    );
  }, [userId]);

  // ─── Helpers de lectura ────────────────────────────────────────────────────

  /** Devuelve el período más reciente ({ start_date, end_date }) o null */
  const latestPeriod = periods[0] ?? null;

  /** Devuelve true si dateStr cae dentro de algún período registrado */
  const isInPeriod = useCallback((dateStr) => {
    return periods.some(p => {
      if (!p.start_date) return false;
      const end = p.end_date || p.start_date;
      return dateStr >= p.start_date && dateStr <= end;
    });
  }, [periods]);

  return {
    periods,
    dailyLogs,
    loading,
    latestPeriod,
    isInPeriod,
    savePeriod,
    importPeriods,
    deletePeriod,
    logCycleDay,
    reload: load,
  };
}
