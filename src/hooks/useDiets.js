/**
 * useDiets — carga y cachea las 19 dietas desde Supabase.
 *
 * Incluye un mapeo de IDs antiguos (del onboarding anterior) a los nuevos.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Caché a nivel de módulo — se carga una sola vez por sesión
let _cache = null;

// Mapeo de IDs del onboarding antiguo → IDs de la tabla diets
export const DIET_ID_MAP = {
 omnivore: 'standard',
 flexitarian: 'mediterranean',
 // Los demás coinciden: vegetarian, vegan, pescatarian, lactose_free, gluten_free…
};

export function normalizeDietId(id) {
 return DIET_ID_MAP[id] || id;
}

// IDs de dietas base permitidas durante el embarazo
// (Low-carb, ancestral, keto, paleo, ayuno → no recomendados en gestación)
export const PREGNANCY_ALLOWED_DIET_IDS = [
 'standard',
 'mediterranean',
 'vegetarian',
 'vegan',
 'pescatarian',
 'intuitive_eating', // flexible, sin restricción calórica
];

// Categorías con label multilingüe e icono
export const DIET_CATEGORIES = {
 standard: { icon: '', label: { es: 'Estándar', en: 'Standard', fr: 'Standard', it: 'Standard' } },
 'plant-based':{ icon: '', label: { es: 'Basadas en plantas', en: 'Plant-based', fr: 'Végétales', it: 'Vegetali' } },
 intolerance: { icon: '', label: { es: 'Intolerancias', en: 'Intolerances', fr: 'Intolérances', it: 'Intolleranze' } },
 therapeutic: { icon: '', label: { es: 'Terapéuticas', en: 'Therapeutic', fr: 'Thérapeutiques', it: 'Terapeutiche' } },
 'low-carb': { icon: '', label: { es: 'Bajo en carbohidratos', en: 'Low carb', fr: 'Faibles en glucides', it: 'Low carb' } },
 ancestral: { icon: '', label: { es: 'Ancestral', en: 'Ancestral', fr: 'Ancestrale', it: 'Ancestrale' } },
 performance: { icon: '', label: { es: 'Rendimiento', en: 'Performance', fr: 'Performance', it: 'Prestazione' } },
 fasting: { icon: '', label: { es: 'Ayuno intermitente', en: 'Intermittent fasting',fr: 'Jeûne intermittent', it: 'Digiuno intermittente' } },
 mindful: { icon: '', label: { es: 'Alimentación consciente',en: 'Mindful eating', fr: 'Alimentation consciente',it: 'Alimentazione consapevole' } },
};

export function useDiets(lang = 'es') {
 const [diets, setDiets] = useState(_cache || []);
 const [loading, setLoading] = useState(!_cache);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (_cache) return;
 setLoading(true);
 supabase
 .from('diets')
 .select('id,display_order,icon,category,name,description,allowed_foods,forbidden_foods,macros,benefits,warnings,compatible_goals,good_for_conditions,avoid_for_conditions,allergen_free,fasting_window')
 .order('display_order')
 .then(({ data, error: err }) => {
 if (err) { setError(err); }
 else if (data) { _cache = data; setDiets(data); }
 setLoading(false);
 });
 }, []);

 /** Devuelve un objeto dieta por id (normalizado) */
 const getDiet = (id) => {
 const normalId = normalizeDietId(id);
 return diets.find(d => d.id === normalId) || null;
 };

 /** Nombre de la dieta en el idioma actual */
 const dietName = (id) => {
 const d = getDiet(id);
 if (!d) return id;
 return d.name[lang] || d.name.es || id;
 };

 /** Dietas agrupadas por categoría */
 const dietsByCategory = diets.reduce((acc, d) => {
 const cat = d.category || 'standard';
 if (!acc[cat]) acc[cat] = [];
 acc[cat].push(d);
 return acc;
 }, {});

 return { diets, loading, error, getDiet, dietName, dietsByCategory };
}
