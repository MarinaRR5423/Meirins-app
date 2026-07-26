-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Política DELETE en profiles
-- Ejecutar en Supabase SQL Editor
--
-- Hallazgo de la auditoría RLS pre-beta (12/06/2026):
-- profiles tenía políticas SELECT/INSERT/UPDATE (auth.uid() = id) pero no
-- DELETE. El flujo de eliminar cuenta usa la RPC delete_user_account
-- (SECURITY DEFINER), pero su fallback hace un DELETE directo sobre profiles
-- que sin esta política afecta 0 filas en silencio → los datos de salud
-- quedarían sin borrar creyendo la usuaria que se eliminaron (RGPD).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);
