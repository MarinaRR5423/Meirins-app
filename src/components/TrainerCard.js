import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTrainerConnection } from '../hooks/useTrainerConnection';

export default function TrainerCard({ lang = 'es' }) {
  const [code, setCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { connected, trainerInfo, loading, saving, error, connectByCode, disconnect } = useTrainerConnection();

  const t = {
    es: {
      title: '¿Tienes entrenadora?',
      sub: 'Conecta con tu entrenadora personal para recibir tu programa adaptado al ciclo.',
      enter: 'Introduce su código',
      placeholder: 'Ej: MARINA26',
      connect: 'Conectar',
      cancel: 'Cancelar',
      connected: 'Entrenadora conectada',
      specialty: 'Especialidad',
      disconnect: 'Desconectar',
      disconnectConfirm: '¿Desconectar a tu entrenadora?',
      disconnectMsg: 'Perderás acceso a su programa personalizado.',
      yes: 'Sí, desconectar',
      no: 'Cancelar',
    },
    en: {
      title: 'Have a personal trainer?',
      sub: 'Connect with your trainer to receive a program adapted to your cycle.',
      enter: 'Enter their code',
      placeholder: 'E.g. MARINA26',
      connect: 'Connect',
      cancel: 'Cancel',
      connected: 'Trainer connected',
      specialty: 'Specialty',
      disconnect: 'Disconnect',
      disconnectConfirm: 'Disconnect your trainer?',
      disconnectMsg: 'You will lose access to their personalised programme.',
      yes: 'Yes, disconnect',
      no: 'Cancel',
    },
    fr: {
      title: 'Tu as une coach perso ?',
      sub: 'Connecte-toi à ta coach pour recevoir un programme adapté à ton cycle.',
      enter: 'Entre son code',
      placeholder: 'Ex: MARINA26',
      connect: 'Connecter',
      cancel: 'Annuler',
      connected: 'Coach connectée',
      specialty: 'Spécialité',
      disconnect: 'Déconnecter',
      disconnectConfirm: 'Déconnecter ta coach ?',
      disconnectMsg: 'Tu perdras accès à son programme personnalisé.',
      yes: 'Oui, déconnecter',
      no: 'Annuler',
    },
    it: {
      title: 'Hai una personal trainer?',
      sub: 'Connettiti con la tua trainer per ricevere un programma adattato al tuo ciclo.',
      enter: 'Inserisci il suo codice',
      placeholder: 'Es: MARINA26',
      connect: 'Connetti',
      cancel: 'Annulla',
      connected: 'Trainer connessa',
      specialty: 'Specialità',
      disconnect: 'Disconnetti',
      disconnectConfirm: 'Disconnettere la trainer?',
      disconnectMsg: 'Perderai accesso al suo programma personalizzato.',
      yes: 'Sì, disconnetti',
      no: 'Annulla',
    },
  };
  const i18n = t[lang] || t.es;

  const handleConnect = async () => {
    if (!code.trim()) return;
    await connectByCode(code);
  };

  const handleDisconnect = () => {
    Alert.alert(i18n.disconnectConfirm, i18n.disconnectMsg, [
      { text: i18n.no, style: 'cancel' },
      { text: i18n.yes, style: 'destructive', onPress: disconnect },
    ]);
  };

  if (loading) return null;

  // ── Conectada ──────────────────────────────────────────────────────────────
  if (connected && trainerInfo) {
    return (
      <View style={styles.card}>
        <View style={styles.connectedRow}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.connectedLabel}>{i18n.connected}</Text>
            <Text style={styles.trainerName}>{trainerInfo.name}</Text>
            {trainerInfo.specialty ? (
              <Text style={styles.trainerSpecialty}>{i18n.specialty}: {trainerInfo.specialty}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleDisconnect} disabled={saving}>
            <Text style={styles.disconnectText}>{i18n.disconnect}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Sin entrenadora ────────────────────────────────────────────────────────
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>🏋️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{i18n.title}</Text>
          <Text style={styles.sub}>{i18n.sub}</Text>
        </View>
      </View>

      {!showInput ? (
        <TouchableOpacity style={styles.enterBtn} onPress={() => setShowInput(true)}>
          <Text style={styles.enterBtnText}>{i18n.enter}</Text>
          <ArrowRight size={20} color="#0A0A0A" />
        </TouchableOpacity>
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={t => setCode(t.toUpperCase())}
            placeholder={i18n.placeholder}
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            autoFocus
            maxLength={12}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowInput(false); setCode(''); }}>
              <Text style={styles.cancelBtnText}>{i18n.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectBtn, (!code.trim() || saving) && { opacity: 0.5 }]}
              onPress={handleConnect}
              disabled={!code.trim() || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.connectBtnText}>{i18n.connect}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  icon: { fontSize: 28, flexShrink: 0 },
  title: { fontSize: 16, fontWeight: '700', color: '#171717', marginBottom: 4 },
  sub: { fontSize: 12, color: '#525252', lineHeight: 18 },
  enterBtn: {
    backgroundColor: 'white', borderRadius: 16, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12,
  },
  enterBtnText: { fontSize: 16, color: '#737373' },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 2,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
  },
  errorText: { fontSize: 12, color: '#DC2626', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, color: '#525252', fontWeight: '600' },
  connectBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#171717',
    alignItems: 'center',
  },
  connectBtnText: { fontSize: 13, color: 'white', fontWeight: '700' },
  // connected state
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#49CF38', flexShrink: 0 },
  connectedLabel: { fontSize: 10, fontWeight: '700', color: '#0B1F08', letterSpacing: 0.6, marginBottom: 2 },
  trainerName: { fontSize: 15, fontWeight: '700', color: '#0A0A0A' },
  trainerSpecialty: { fontSize: 12, color: '#525252', marginTop: 2 },
  disconnectText: { fontSize: 12, color: '#737373', textDecorationLine: 'underline' },
});
