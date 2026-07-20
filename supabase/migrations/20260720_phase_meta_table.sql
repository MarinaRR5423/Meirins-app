-- ─────────────────────────────────────────────────────────────────────────────
-- Table: phase_meta
-- Stores editorial content for each cycle phase (colors, copy, tips).
-- The complex nested data (meals, week plan) stays in dataService / Supabase
-- recipes + workout_sessions tables. This table covers the display metadata
-- that appears in HomeScreen, CicloScreen, NutriScreen, GimnasioScreen headers.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.phase_meta (
  id             TEXT        PRIMARY KEY,   -- menstrual | follicular | ovulation | luteal
  emoji          TEXT,
  color          TEXT,                      -- primary hex color
  color_light    TEXT,                      -- light bg hex
  color_mid      TEXT,                      -- translucent mid tone (rgba string)
  tagline_es     TEXT,
  tagline_en     TEXT,
  tagline_fr     TEXT,
  desc_es        TEXT,
  desc_en        TEXT,
  desc_fr        TEXT,
  focus          TEXT[],                    -- nutrient focus list (Spanish labels)
  kcal_es        TEXT,
  kcal_en        TEXT,
  kcal_fr        TEXT,
  intensity      TEXT,
  intensity_pct  INT,
  tip_es         TEXT,
  tip_en         TEXT,
  tip_fr         TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.phase_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read phase_meta"
  ON public.phase_meta FOR SELECT
  USING (true);

DROP TRIGGER IF EXISTS phase_meta_updated_at ON public.phase_meta;
CREATE TRIGGER phase_meta_updated_at
  BEFORE UPDATE ON public.phase_meta
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Data
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.phase_meta (id, emoji, color, color_light, color_mid,
  tagline_es, tagline_en, tagline_fr,
  desc_es, desc_en, desc_fr,
  focus, kcal_es, kcal_en, kcal_fr,
  intensity, intensity_pct,
  tip_es, tip_en, tip_fr)
VALUES

('menstrual', '🌑', '#64748B', '#F8FAFC', 'rgba(100,116,139,0.10)',
  'Restauración & Descanso',
  'Restoration & Rest',
  'Restauration & Repos',
  'Tu cuerpo se renueva. Nutre con calma y respeta el descanso.',
  'Your body is renewing itself. Nourish calmly and respect rest.',
  'Ton corps se renouvelle. Nourris-toi calmement et respecte le repos.',
  ARRAY['Hierro', 'Magnesio', 'Omega-3', 'Antiinflamatorios'],
  'Déficit suave · −200 kcal/día',
  'Gentle deficit · −200 kcal/day',
  'Déficit doux · −200 kcal/jour',
  'Muy baja', 20,
  'El descanso activo tiene tanto valor como el entreno intenso. Tu cuerpo trabaja internamente.',
  'Active rest is as valuable as intense training. Your body is working internally.',
  'Le repos actif a autant de valeur que l''entraînement intense. Ton corps travaille en interne.'
),

('follicular', '🌒', '#2563EB', '#EFF6FF', 'rgba(37,99,235,0.10)',
  'Energía & Crecimiento',
  'Energy & Growth',
  'Énergie & Croissance',
  'Los estrógenos suben. Tu fuerza, resistencia y motivación están en pleno auge.',
  'Oestrogen rises. Your strength, endurance and motivation are in full bloom.',
  'Les œstrogènes montent. Ta force, ton endurance et ta motivation sont en plein essor.',
  ARRAY['Proteína magra', 'Carbohidratos complejos', 'Probióticos', 'Zinc'],
  'Déficit moderado · −300 kcal/día',
  'Moderate deficit · −300 kcal/day',
  'Déficit modéré · −300 kcal/jour',
  'Alta', 80,
  '¡Aprovecha esta ventana! Tu fuerza es superior. Intenta superar tus marcas personales.',
  'Make the most of this window! Your strength is at its peak. Try to beat your personal records.',
  'Profite de cette fenêtre ! Ta force est supérieure. Essaie de battre tes records personnels.'
),

('ovulation', '🌕', '#0284C7', '#F0F9FF', 'rgba(2,132,199,0.10)',
  'Pico de Potencia',
  'Power Peak',
  'Pic de Puissance',
  'Tu mejor momento. Fuerza, energía y carisma al máximo absoluto.',
  'Your best moment. Strength, energy and charisma at their absolute peak.',
  'Ton meilleur moment. Force, énergie et charisme à leur maximum absolu.',
  ARRAY['Zinc', 'Antioxidantes', 'Fibra', 'Comidas ligeras'],
  'Déficit moderado · −250 kcal/día',
  'Moderate deficit · −250 kcal/day',
  'Déficit modéré · −250 kcal/jour',
  'Máxima', 100,
  '¡Bate tus récords! Tu cuerpo está en su pico absoluto. El momento ideal para nuevos retos.',
  'Beat your records! Your body is at its absolute peak. The ideal time for new challenges.',
  'Bats tes records ! Ton corps est à son pic absolu. Le moment idéal pour de nouveaux défis.'
),

('luteal', '🌖', '#475569', '#F8FAFC', 'rgba(71,85,105,0.10)',
  'Calma & Equilibrio',
  'Calm & Balance',
  'Calme & Équilibre',
  'La progesterona toma el mando. Nutre tu cuerpo para navegar el SPM con energía.',
  'Progesterone takes charge. Nourish your body to navigate PMS with energy.',
  'La progestérone prend le relais. Nourris ton corps pour traverser le SPM avec énergie.',
  ARRAY['Carbohidratos complejos', 'Triptófano', 'Magnesio', 'Anti-cravings'],
  'Mantenimiento · +100–150 kcal',
  'Maintenance · +100–150 kcal',
  'Maintien · +100–150 kcal',
  'Media', 55,
  'Escucha a tu cuerpo. La progesterona aumenta el apetito y el cansancio — es normal y pasará.',
  'Listen to your body. Progesterone increases appetite and fatigue — this is normal and will pass.',
  'Écoute ton corps. La progestérone augmente l''appétit et la fatigue — c''est normal et ça passera.'
)

ON CONFLICT (id) DO UPDATE SET
  tagline_es    = EXCLUDED.tagline_es,
  tagline_en    = EXCLUDED.tagline_en,
  tagline_fr    = EXCLUDED.tagline_fr,
  desc_es       = EXCLUDED.desc_es,
  desc_en       = EXCLUDED.desc_en,
  desc_fr       = EXCLUDED.desc_fr,
  focus         = EXCLUDED.focus,
  kcal_es       = EXCLUDED.kcal_es,
  kcal_en       = EXCLUDED.kcal_en,
  kcal_fr       = EXCLUDED.kcal_fr,
  intensity     = EXCLUDED.intensity,
  intensity_pct = EXCLUDED.intensity_pct,
  tip_es        = EXCLUDED.tip_es,
  tip_en        = EXCLUDED.tip_en,
  tip_fr        = EXCLUDED.tip_fr,
  updated_at    = NOW();
