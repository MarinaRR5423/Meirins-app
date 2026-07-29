/**
 * useWorkouts — carga y cachea los workouts desde Supabase.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

let _cache = null;

export function useWorkouts() {
 const [workouts, setWorkouts] = useState(_cache || []);
 const [loading, setLoading] = useState(!_cache);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (_cache) return;
 setLoading(true);
 supabase
 .from('workouts')
 .select('*')
 .order('display_order')
 .then(({ data, error: err }) => {
 if (err) setError(err);
 else if (data) { _cache = data; setWorkouts(data); }
 setLoading(false);
 });
 }, []);

 return { workouts, loading, error };
}
