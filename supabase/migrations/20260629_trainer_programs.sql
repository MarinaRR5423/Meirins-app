-- Tabla trainer_programs: programas creados por la entrenadora en el dashboard coach
-- (diferente de workout_programs que es el programa activo asignado a una clienta)

CREATE TABLE IF NOT EXISTS trainer_programs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id    UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  days_per_week INTEGER DEFAULT 3,
  description   TEXT,
  sessions      JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainer_programs ENABLE ROW LEVEL SECURITY;

-- La entrenadora puede ver, crear, editar y borrar sus propios programas
CREATE POLICY "tp_select" ON trainer_programs FOR SELECT TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "tp_insert" ON trainer_programs FOR INSERT TO authenticated
  WITH CHECK (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "tp_update" ON trainer_programs FOR UPDATE TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "tp_delete" ON trainer_programs FOR DELETE TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
