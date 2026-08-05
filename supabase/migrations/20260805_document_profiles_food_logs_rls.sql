-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Documentación de RLS real en profiles y food_logs
-- No ejecutar salvo para restaurar el baseline — solo deja constancia en el
-- repo del estado confirmado en Supabase Studio el 05/08/2026, para que
-- profiles y food_logs dejen de ser un punto ciego en las auditorías.
--
-- Verificado con:
--   select tablename, policyname, cmd, qual, with_check from pg_policies
--   where schemaname = 'public' and tablename in ('profiles', 'food_logs');
--
-- Resultado: ambas tablas ya estaban correctamente cerradas a auth.uid().
-- No se detectó ningún hallazgo de seguridad aquí — CREATE POLICY IF NOT
-- EXISTS no existe en Postgres, así que se usa DROP + CREATE (idempotente,
-- reproduce exactamente las políticas ya vigentes, no cambia nada).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs  ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────────────────
-- Cada usuaria solo puede ver/crear/editar/borrar su propia fila.

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ── food_logs ─────────────────────────────────────────────────────────────
-- Una única política FOR ALL ya cubre las 4 operaciones. La política
-- "food_logs_delete_own" añadida en 20260804_delete_account_food_logs.sql
-- queda redundante con esta (mismo predicado) — se deja tal cual, no genera
-- ningún riesgo (Postgres evalúa políticas permisivas con OR), pero se podría
-- retirar en una limpieza futura con:
--   DROP POLICY "food_logs_delete_own" ON food_logs;

DROP POLICY IF EXISTS "users_own_logs" ON food_logs;
CREATE POLICY "users_own_logs"
  ON food_logs FOR ALL
  USING (auth.uid() = user_id);
