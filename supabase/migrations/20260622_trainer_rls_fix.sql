DROP POLICY IF EXISTS "trainers_select"  ON trainers;
DROP POLICY IF EXISTS "trainers_manage"  ON trainers;
DROP POLICY IF EXISTS "tc_select"        ON trainer_clients;
DROP POLICY IF EXISTS "tc_insert"        ON trainer_clients;
DROP POLICY IF EXISTS "tc_update"        ON trainer_clients;
DROP POLICY IF EXISTS "wp_select"        ON workout_programs;
DROP POLICY IF EXISTS "wp_manage"        ON workout_programs;
DROP POLICY IF EXISTS "ex_select"        ON exercises;
DROP POLICY IF EXISTS "ex_insert"        ON exercises;
DROP POLICY IF EXISTS "pe_select"        ON program_exercises;
DROP POLICY IF EXISTS "pe_manage"        ON program_exercises;

CREATE POLICY "trainers_select" ON trainers FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainers_manage" ON trainers FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "tc_select" ON trainer_clients FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "tc_insert" ON trainer_clients FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "tc_update" ON trainer_clients FOR UPDATE TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "wp_select" ON workout_programs FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "wp_manage" ON workout_programs FOR ALL TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "ex_select" ON exercises FOR SELECT TO authenticated
  USING (verified = true OR created_by_trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "ex_insert" ON exercises FOR INSERT TO authenticated
  WITH CHECK (created_by_trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "pe_select" ON program_exercises FOR SELECT TO authenticated
  USING (program_id IN (
    SELECT id FROM workout_programs
    WHERE client_id = auth.uid()
    OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  ));
CREATE POLICY "pe_manage" ON program_exercises FOR ALL TO authenticated
  USING (program_id IN (
    SELECT id FROM workout_programs
    WHERE trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  ));
