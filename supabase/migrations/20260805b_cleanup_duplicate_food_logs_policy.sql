-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Limpieza de política redundante en food_logs
--
-- "food_logs_delete_own" (añadida en 20260804_delete_account_food_logs.sql)
-- quedó duplicada con "users_own_logs" (FOR ALL, ya existente), mismo
-- predicado auth.uid() = user_id. No suponía ningún riesgo, es solo
-- limpieza cosmética detectada en la auditoría del 05/08/2026.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;
