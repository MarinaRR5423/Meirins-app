/**
 * CycleImportModal
 *
 * Modal de 4 pasos para importar el historial de ciclo desde Apple HealthKit.
 * Solo se muestra en iOS; en Android el botón que abre esto ni se renderiza.
 *
 * Pasos:
 *  idle      → botón "Conectar Apple Salud"
 *  requesting / reading → spinner
 *  preview   → "Encontramos X ciclos de Y meses" + botón Confirmar
 *  importing → spinner
 *  done      → confirmación + cierre automático
 *  error     → mensaje + reintentar
 */

import React, { useEffect } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import BText from './BText';
import { F } from '../theme/fonts';
import { useHealthKitCycleImport } from '../hooks/useHealthKitCycleImport';

// ── Helper de traducción inline ───────────────────────────────────────────────
const tr = (lang, es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

// ── Textos ────────────────────────────────────────────────────────────────────
function copy(lang) {
  return {
    title:     tr(lang, 'Importar desde Apple Salud', 'Import from Apple Health', 'Importer depuis Santé', 'Importa da Salute'),
    subtitle:  tr(lang,
      'Blumm puede leer tu historial de reglas de Apple Salud para mejorar las predicciones de tu ciclo.',
      'Blumm can read your period history from Apple Health to improve your cycle predictions.',
      'Blumm peut lire ton historique de règles depuis Santé Apple pour améliorer tes prédictions de cycle.',
      'Blumm può leggere la tua cronologia mestruale da Salute Apple per migliorare le previsioni del ciclo.',
    ),
    connect:   tr(lang, 'Conectar Apple Salud', 'Connect Apple Health', 'Connecter Santé Apple', 'Connetti Salute Apple'),
    reading:   tr(lang, 'Leyendo datos de salud…', 'Reading health data…', 'Lecture des données de santé…', 'Lettura dati salute…'),
    requesting:tr(lang, 'Solicitando permiso…', 'Requesting permission…', 'Demande d\'autorisation…', 'Richiesta autorizzazione…'),
    importing: tr(lang, 'Guardando datos…', 'Saving data…', 'Enregistrement des données…', 'Salvataggio dati…'),
    foundCycles: (n, m) => tr(lang,
      `Encontramos ${n} ciclo${n !== 1 ? 's' : ''} de los últimos ${m} meses`,
      `Found ${n} cycle${n !== 1 ? 's' : ''} from the last ${m} month${m !== 1 ? 's' : ''}`,
      `Nous avons trouvé ${n} cycle${n !== 1 ? 's' : ''} sur les ${m} derniers mois`,
      `Abbiamo trovato ${n} ciclo${n !== 1 ? 'i' : ''} degli ultimi ${m} mesi`,
    ),
    confirm:   tr(lang, 'Importar', 'Import', 'Importer', 'Importa'),
    cancel:    tr(lang, 'Cancelar', 'Cancel', 'Annuler', 'Annulla'),
    retry:     tr(lang, 'Reintentar', 'Try again', 'Réessayer', 'Riprova'),
    done:      tr(lang, '¡Listo! Historial de ciclo importado', 'Done! Cycle history imported', 'Terminé ! Historique de cycle importé', 'Fatto! Cronologia ciclo importata'),
    notAvailable: tr(lang,
      'Apple Salud solo está disponible en iPhone.',
      'Apple Health is only available on iPhone.',
      'Santé Apple est disponible uniquement sur iPhone.',
      'Salute Apple è disponibile solo su iPhone.',
    ),
  };
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function CycleImportModal({ visible, onClose, lang = 'es', importPeriods }) {
  const { available, status, preview, error, requestAndRead, confirm, reset } =
    useHealthKitCycleImport({ onImport: importPeriods });

  const c = copy(lang);

  // Auto-cierre 2s tras éxito
  useEffect(() => {
    if (status === 'done') {
      const t = setTimeout(() => { reset(); onClose(); }, 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Reset al cerrar
  const handleClose = () => { reset(); onClose(); };

  const isLoading = status === 'requesting' || status === 'reading' || status === 'importing';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <BText style={s.title}>{c.title}</BText>
            {!isLoading && (
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <BText style={s.close}>✕</BText>
              </TouchableOpacity>
            )}
          </View>

          {/* Body */}
          {!available && (
            <View style={s.body}>
              <BText style={s.subtitle}>{c.notAvailable}</BText>
            </View>
          )}

          {available && status === 'idle' && (
            <View style={s.body}>
              <BText style={s.subtitle}>{c.subtitle}</BText>
              <TouchableOpacity style={s.primaryBtn} onPress={requestAndRead} activeOpacity={0.85}>
                <BText style={s.primaryBtnTxt}>{c.connect}</BText>
              </TouchableOpacity>
            </View>
          )}

          {available && isLoading && (
            <View style={s.body}>
              <ActivityIndicator size="large" color="#429FE7" style={{ marginBottom: 16 }} />
              <BText style={s.subtitle}>
                {status === 'requesting' ? c.requesting
                  : status === 'importing' ? c.importing
                  : c.reading}
              </BText>
            </View>
          )}

          {available && status === 'preview' && preview && (
            <View style={s.body}>
              <View style={s.previewBox}>
                <BText style={s.previewEmoji}>🌸</BText>
                <BText style={s.previewText}>
                  {c.foundCycles(preview.periods.length, preview.months)}
                </BText>
              </View>
              <TouchableOpacity style={s.primaryBtn} onPress={confirm} activeOpacity={0.85}>
                <BText style={s.primaryBtnTxt}>{c.confirm}</BText>
              </TouchableOpacity>
              <TouchableOpacity style={s.ghostBtn} onPress={handleClose} activeOpacity={0.7}>
                <BText style={s.ghostBtnTxt}>{c.cancel}</BText>
              </TouchableOpacity>
            </View>
          )}

          {available && status === 'done' && (
            <View style={s.body}>
              <BText style={s.doneEmoji}>✅</BText>
              <BText style={s.subtitle}>{c.done}</BText>
            </View>
          )}

          {available && status === 'error' && (
            <View style={s.body}>
              <BText style={[s.subtitle, { color: '#EF4444', marginBottom: 16 }]}>{error}</BText>
              <TouchableOpacity style={s.primaryBtn} onPress={requestAndRead} activeOpacity={0.85}>
                <BText style={s.primaryBtnTxt}>{c.retry}</BText>
              </TouchableOpacity>
              <TouchableOpacity style={s.ghostBtn} onPress={handleClose} activeOpacity={0.7}>
                <BText style={s.ghostBtnTxt}>{c.cancel}</BText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: F.heading,
    color: '#0A0A0A',
    lineHeight: 24,
    flex: 1,
  },
  close: {
    fontSize: 18,
    color: '#0A0A0A',
    fontFamily: F.body,
    lineHeight: 22,
    paddingLeft: 12,
  },
  body: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: F.body,
    color: '#525252',
    textAlign: 'center',
    lineHeight: 22,
  },
  previewBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  previewEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  previewText: {
    fontSize: 16,
    fontFamily: F.heading,
    color: '#1D4ED8',
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: '#429FE7',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: F.heading,
    lineHeight: 20,
  },
  ghostBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  ghostBtnTxt: {
    color: '#737373',
    fontSize: 15,
    fontFamily: F.body,
    lineHeight: 20,
  },
  doneEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
});
