import { useState, useEffect } from 'react';
import { PHASES } from '../data/phases';
import { fetchPhaseData } from '../data/dataService';

export function usePhaseData(phase, lang = 'es') {
 const [phaseData, setPhaseData] = useState(phase ? PHASES[phase] : null);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (!phase) return;

 setPhaseData(PHASES[phase]);
 setLoading(true);

 fetchPhaseData(phase, PHASES[phase], lang)
 .then(enriched => setPhaseData(enriched))
 .catch(() => setPhaseData(PHASES[phase]))
 .finally(() => setLoading(false));
 }, [phase, lang]);

 return { phaseData, loading };
}
