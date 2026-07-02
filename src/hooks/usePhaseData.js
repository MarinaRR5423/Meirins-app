import { useState, useEffect } from 'react';
import { PHASES } from '../data/phases';
import { fetchPhaseData } from '../data/dataService';

export function usePhaseData(phase, lang = 'es') {
  const [phaseData, setPhaseData] = useState(phase ? PHASES[phase] : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phase) return;

    // Always load static data immediately
    setPhaseData(PHASES[phase]);

    // Only enrich from Supabase when language is Spanish — Supabase content is in ES only
    if (lang !== 'es') return;

    setLoading(true);
    fetchPhaseData(phase, PHASES[phase])
      .then(enriched => setPhaseData(enriched))
      .catch(() => setPhaseData(PHASES[phase]))
      .finally(() => setLoading(false));
  }, [phase, lang]);

  return { phaseData, loading };
}
