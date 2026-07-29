import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTrainerConnection() {
 const [connected, setConnected] = useState(false);
 const [trainerInfo, setTrainerInfo] = useState(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState(null);

 useEffect(() => {
 loadExistingConnection();
 }, []);

 async function loadExistingConnection() {
 setLoading(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data } = await supabase
 .from('trainer_clients')
 .select('status, trainers(name, specialty, trainer_code)')
 .eq('client_id', user.id)
 .eq('status', 'active')
 .maybeSingle();

 if (data?.trainers) {
 setTrainerInfo(data.trainers);
 setConnected(true);
 }
 } finally {
 setLoading(false);
 }
 }

 async function connectByCode(code) {
 setSaving(true);
 setError(null);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('No session');

 const normalized = code.toUpperCase().trim();

 const { data: trainer, error: trainerErr } = await supabase
 .from('trainers')
 .select('id, name, specialty, trainer_code')
 .eq('trainer_code', normalized)
 .maybeSingle();

 if (trainerErr || !trainer) {
 setError('Código no encontrado. Pide el código a tu entrenadora.');
 return false;
 }

 const { error: connErr } = await supabase
 .from('trainer_clients')
 .upsert(
 { trainer_id: trainer.id, client_id: user.id, status: 'active' },
 { onConflict: 'trainer_id,client_id' },
 );
 if (connErr) throw connErr;

 await supabase
 .from('profiles')
 .update({ trainer_code_used: normalized })
 .eq('id', user.id);

 setTrainerInfo(trainer);
 setConnected(true);
 return trainer;
 } catch {
 setError('Error al conectar. Inténtalo de nuevo.');
 return false;
 } finally {
 setSaving(false);
 }
 }

 async function disconnect() {
 setSaving(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 await supabase
 .from('trainer_clients')
 .update({ status: 'inactive' })
 .eq('client_id', user.id)
 .eq('status', 'active');

 await supabase
 .from('profiles')
 .update({ trainer_code_used: null })
 .eq('id', user.id);

 setConnected(false);
 setTrainerInfo(null);
 } finally {
 setSaving(false);
 }
 }

 return { connected, trainerInfo, loading, saving, error, connectByCode, disconnect };
}
