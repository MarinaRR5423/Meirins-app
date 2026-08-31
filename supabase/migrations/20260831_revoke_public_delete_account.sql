-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Revoca EXECUTE público sobre delete_user_account()
--
-- Hallazgo del Security Advisor de Supabase (31/08/2026): Postgres concede
-- EXECUTE a PUBLIC por defecto al crear una función. La migración original
-- (delete_account_function.sql) solo hizo GRANT ... TO authenticated, sin
-- revocar el acceso público, así que el rol `anon` (sin sesión) también
-- podía llamar a /rest/v1/rpc/delete_user_account.
--
-- Inofensivo en la práctica (auth.uid() es NULL sin sesión, los 3 DELETE no
-- afectan ninguna fila), pero se cierra por buena práctica / defensa en
-- profundidad.
-- ═══════════════════════════════════════════════════════════════════════════

REVOKE EXECUTE ON FUNCTION delete_user_account() FROM PUBLIC, anon;
