-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · delete_user_account también borra food_logs
-- Ejecutar en Supabase SQL Editor
--
-- Hallazgo de auditoría de seguridad (04/08/2026):
-- delete_user_account() (ver delete_account_function.sql) solo borraba
-- `profiles` y `auth.users`. La tabla `food_logs` (historial diario de
-- comidas/macros de cada usuaria) no tiene FK con ON DELETE CASCADE hacia
-- profiles/auth.users documentada en este repo, así que al eliminar la
-- cuenta ese historial podía quedar huérfano en Supabase — la usuaria cree
-- que borró todo pero sus registros de comidas siguen ahí (incumplimiento
-- del derecho al olvido, RGPD). Mismo patrón que el hallazgo ya corregido
-- para `profiles` en 20260612_profiles_delete_policy.sql.
-- ═══════════════════════════════════════════════════════════════════════════

-- Asegura que food_logs tiene RLS y que cada usuaria puede borrar solo sus
-- propias filas (necesario tanto para este fix como para el fallback de
-- borrado manual en el cliente, ver UserScreen.js handleDelete).
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;
CREATE POLICY "food_logs_delete_own"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Recrea la función de borrado de cuenta incluyendo food_logs
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- 1. Borrar historial de comidas/macros
  DELETE FROM food_logs WHERE user_id = v_uid;

  -- 2. Borrar perfil y datos extendidos (cascada a trainer_clients / workout_programs)
  DELETE FROM profiles WHERE id = v_uid;

  -- 3. Borrar el usuario de auth (requiere SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
