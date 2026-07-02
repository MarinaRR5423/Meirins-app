/**
 * useRecipes — carga y cachea las recetas desde Supabase.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Caché a nivel de módulo — una sola carga por sesión
let _cache = null;

export function useRecipes() {
  const [recipes, setRecipes] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (_cache) return;
    setLoading(true);
    supabase
      .from('recipes')
      .select('*')
      .order('display_order')
      .then(({ data, error: err }) => {
        if (err) setError(err);
        else if (data) { _cache = data; setRecipes(data); }
        setLoading(false);
      });
  }, []);

  return { recipes, loading, error };
}
