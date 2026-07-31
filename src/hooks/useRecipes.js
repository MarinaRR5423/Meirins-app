import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Caché a nivel de módulo — una sola carga por sesión
let _cache = null;

export function useRecipes() {
 const [recipes, setRecipes] = useState(_cache || []);
 const [loading, setLoading] = useState(!_cache);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (_cache) return;
 setLoading(true);
 Promise.all([
 supabase.from('recipes').select('*').order('display_order'),
 supabase.from('recipe_nutrition').select('recipe_id,kcal,protein_g,carbs_g,fat_g,fiber_g'),
 ]).then(([{ data, error: err }, { data: nutrition }]) => {
 if (err) { setError(err); setLoading(false); return; }
 if (data) {
 const nutritionMap = {};
 if (nutrition) nutrition.forEach(n => { nutritionMap[n.recipe_id] = n; });
 const merged = data.map(r => {
 const calc = nutritionMap[r.id];
 return {
 ...r,
 kcal: calc?.kcal != null ? Math.round(calc.kcal) : r.kcal,
 protein_g: calc?.protein_g != null ? Math.round(calc.protein_g) : r.protein_g,
 carbs_g: calc?.carbs_g != null ? Math.round(calc.carbs_g) : r.carbs_g,
 fat_g: calc?.fat_g != null ? Math.round(calc.fat_g) : r.fat_g,
 fiber_g: calc?.fiber_g != null ? Math.round(calc.fiber_g) : r.fiber_g,
 };
 });
 _cache = merged;
 setRecipes(merged);
 }
 setLoading(false);
 });
 }, []);

 return { recipes, loading, error };
}
