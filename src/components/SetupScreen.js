import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import T from '../i18n/translations';
import { trackEvent, Events } from '../lib/analytics';

const LANG_OPTIONS = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'it', flag: '🇮🇹' },
];

export default function SetupScreen({ onDone, lang = 'es', onLangChange }) {
  const su = (T[lang] || T.es).setup;

  const [step, setStep] = useState(0);

  useEffect(() => {
    trackEvent(Events.ONBOARDING_STARTED);
  }, []);

  useEffect(() => {
    trackEvent(Events.ONBOARDING_STEP_VIEW, { step });
  }, [step]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [modules, setModules] = useState(['cycle', 'nutrition', 'sport', 'sleep']);
  const [goals, setGoals] = useState({}); // { cycle: 'track', nutrition: 'lose_weight', sport: 'muscle' }
  const [saving, setSaving] = useState(false);

  const toggleModule = (id) => {
    if (modules.includes(id)) {
      if (modules.length > 1) setModules(modules.filter(x => x !== id));
    } else {
      setModules([...modules, id]);
    }
  };

  const setGoal = (category, goalId) => {
    setGoals(prev => ({ ...prev, [category]: prev[category] === goalId ? undefined : goalId }));
  };

  const finish = async () => {
    setSaving(true);
    await onDone({
      name: name.trim(),
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      modules,
      goals,
    });
    trackEvent(Events.ONBOARDING_COMPLETED, { modules, activityLevel, goals });
    setSaving(false);
  };

  // ── Catálogos para multiidioma inline ──────────────────────────────────────
  const ACTIVITY_OPTS = [
    { id: 'sedentary', emoji: '🛋️', label: { es: 'Sedentaria',     en: 'Sedentary',  fr: 'Sédentaire',     it: 'Sedentaria'    }, desc: { es: 'Poca o ninguna actividad',     en: 'Little to no activity', fr: 'Peu ou pas d\'activité',    it: 'Poca o nessuna attività' } },
    { id: 'light',     emoji: '🚶', label: { es: 'Ligera',          en: 'Light',      fr: 'Légère',         it: 'Leggera'       }, desc: { es: 'Caminar, tareas suaves',       en: 'Walking, light chores', fr: 'Marche, tâches légères',    it: 'Camminata, attività leggere' } },
    { id: 'moderate',  emoji: '🏃', label: { es: 'Moderada',        en: 'Moderate',   fr: 'Modérée',        it: 'Moderata'      }, desc: { es: 'Deporte 3-4 veces/semana',     en: 'Sport 3-4×/week',       fr: 'Sport 3-4×/semaine',         it: 'Sport 3-4 volte/settimana' } },
    { id: 'active',    emoji: '🏋️', label: { es: 'Activa',          en: 'Active',     fr: 'Active',         it: 'Attiva'        }, desc: { es: 'Deporte 5+ veces/semana',      en: 'Sport 5+ ×/week',       fr: 'Sport 5+ fois/semaine',      it: 'Sport 5+ volte/settimana' } },
    { id: 'very_active', emoji: '🔥', label: { es: 'Muy activa',     en: 'Very active',fr: 'Très active',    it: 'Molto attiva'  }, desc: { es: 'Atleta, deporte diario intenso',en: 'Athlete, daily intense',fr: 'Athlète, sport quotidien',  it: 'Atleta, sport quotidiano' } },
  ];

  const GOALS_BY_MODULE = {
    cycle: [
      { id: 'track',         emoji: '🌙', label: { es: 'Seguir mi ciclo',        en: 'Track my cycle',       fr: 'Suivre mon cycle',           it: 'Seguire il mio ciclo' },     desc: { es: 'Conocer cada fase',                en: 'Know each phase',               fr: 'Connaître chaque phase',         it: 'Conoscere ogni fase' } },
      { id: 'reduce_pain',   emoji: '🌸', label: { es: 'Mejorar mis dolores',    en: 'Reduce period pain',   fr: 'Améliorer mes douleurs',     it: 'Migliorare i dolori' },     desc: { es: 'Cólicos, SPM, fatiga',             en: 'Cramps, PMS, fatigue',          fr: 'Crampes, SPM, fatigue',           it: 'Crampi, PMS, fatica' } },
      { id: 'pregnancy',     emoji: '🤰', label: { es: 'Quedarme embarazada',    en: 'Get pregnant',         fr: 'Tomber enceinte',            it: 'Rimanere incinta' },       desc: { es: 'Identificar tu ventana fértil',    en: 'Identify your fertile window',  fr: 'Identifier la fenêtre fertile', it: 'Identificare la finestra fertile' } },
    ],
    nutrition: [
      { id: 'eat_better',    emoji: '🥗', label: { es: 'Comer mejor',            en: 'Eat better',           fr: 'Mieux manger',               it: 'Mangiare meglio' },        desc: { es: 'Equilibrar mi alimentación',       en: 'Balance my diet',               fr: 'Équilibrer mon alimentation',     it: 'Equilibrare la mia alimentazione' } },
      { id: 'lose_weight',   emoji: '⚡', label: { es: 'Perder peso',            en: 'Lose weight',          fr: 'Perdre du poids',            it: 'Perdere peso' },           desc: { es: 'Déficit calórico controlado',     en: 'Controlled calorie deficit',     fr: 'Déficit calorique contrôlé',     it: 'Deficit calorico controllato' } },
      { id: 'gain_weight',   emoji: '💪', label: { es: 'Ganar peso',             en: 'Gain weight',          fr: 'Prendre du poids',           it: 'Aumentare di peso' },     desc: { es: 'Superávit calórico',               en: 'Calorie surplus',                fr: 'Surplus calorique',               it: 'Surplus calorico' } },
      { id: 'energize',      emoji: '🔋', label: { es: 'Energizarme',            en: 'Get more energy',      fr: 'Plus d\'énergie',             it: 'Più energia' },           desc: { es: 'Para deportistas (>5h/semana)',    en: 'For athletes (>5h/week)',        fr: 'Sportives (>5h/semaine)',        it: 'Per sportive (>5h/settimana)' } },
    ],
    sport: [
      { id: 'competition',   emoji: '🏆', label: { es: 'Competición',            en: 'Competition',          fr: 'Compétition',                it: 'Competizione' },          desc: { es: 'Preparación específica',           en: 'Specific preparation',           fr: 'Préparation spécifique',         it: 'Preparazione specifica' } },
      { id: 'muscle',        emoji: '💪', label: { es: 'Ganar músculo',          en: 'Build muscle',         fr: 'Prendre du muscle',          it: 'Costruire muscolo' },     desc: { es: 'Fuerza e hipertrofia',             en: 'Strength and hypertrophy',       fr: 'Force et hypertrophie',           it: 'Forza e ipertrofia' } },
      { id: 'tone',          emoji: '✨', label: { es: 'Afinarme y tonificar',   en: 'Tone up',              fr: 'M\'affiner et tonifier',     it: 'Tonificarmi' },           desc: { es: 'Definición y postura',             en: 'Definition and posture',         fr: 'Définition et posture',           it: 'Definizione e postura' } },
      { id: 'resume',        emoji: '🌱', label: { es: 'Retomar el deporte',     en: 'Resume sport',         fr: 'Reprendre le sport',         it: 'Riprendere lo sport' },   desc: { es: 'Volver con seguridad',             en: 'Come back safely',               fr: 'Revenir en sécurité',             it: 'Tornare in sicurezza' } },
    ],
  };

  // Solo se piden objetivos de los módulos elegidos (excluyendo sueño)
  const goalModules = modules.filter(m => GOALS_BY_MODULE[m]);

  // ─── PASO 0 · Bienvenida ────────────────────────────────────────────────────
  if (step === 0) return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        {LANG_OPTIONS.map(l => (
          <TouchableOpacity key={l.code} onPress={() => onLangChange?.(l.code)}
            style={[styles.langBtn, lang === l.code && styles.langBtnActive]}>
            <Text style={styles.langFlag}>{l.flag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>Meirins</Text>
      <Text style={styles.tagline}>{su.tagline}</Text>
      <View style={styles.divider} />
      {su.features.map(f => (
        <View key={f} style={styles.feature}><Text style={styles.featureText}>{f}</Text></View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
        <Text style={styles.btnText}>{su.start}</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── PASO 1 · Datos personales ──────────────────────────────────────────────
  if (step === 1) return (
    <KeyboardAvoidingView style={styles.scrollContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(0)}><Text style={styles.back}>{su.back}</Text></TouchableOpacity>
        <Text style={styles.stepDots}><Text style={styles.dotActive}>●</Text> ● ● ●</Text>
        <Text style={styles.stepTitle}>{su.step1Title}</Text>
        <Text style={styles.stepSub}>{su.step1Sub}</Text>

        {/* Nombre — opcional */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{su.nameLabel || '¿Cómo te llamas?'} <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{su.nameOptional || '(opcional)'}</Text></Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={su.namePlaceholder || 'Tu nombre…'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="words"
          />
        </View>

        {[
          { label: su.ageLabel,    value: age,    set: setAge,    placeholder: su.agePh,    keyboard: 'numeric',      unit: su.ageUnit },
          { label: su.weightLabel, value: weight, set: setWeight, placeholder: su.weightPh, keyboard: 'decimal-pad',  unit: 'kg' },
          { label: su.heightLabel, value: height, set: setHeight, placeholder: su.heightPh, keyboard: 'numeric',      unit: 'cm' },
        ].map(f => (
          <View key={f.label} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{f.label}</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={f.value} onChangeText={f.set}
                placeholder={f.placeholder} placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType={f.keyboard} />
              <Text style={styles.inputUnit}>{f.unit}</Text>
            </View>
          </View>
        ))}

        {/* Nivel de actividad */}
        <Text style={[styles.inputLabel, { marginTop: 6, marginBottom: 10 }]}>
          {lang === 'en' ? 'Activity level' : lang === 'fr' ? 'Niveau d\'activité' : lang === 'it' ? 'Livello di attività' : 'Nivel de actividad'}
        </Text>
        {ACTIVITY_OPTS.map(opt => {
          const active = activityLevel === opt.id;
          return (
            <TouchableOpacity key={opt.id} onPress={() => setActivityLevel(opt.id)}
              style={[styles.optionCard, active && styles.optionCardActive]}>
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label[lang] || opt.label.es}</Text>
                <Text style={styles.optionDesc}>{opt.desc[lang] || opt.desc.es}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.btn, (!age || !weight || !height) && styles.btnDisabled]}
          onPress={() => age && weight && height && setStep(2)}
          disabled={!age || !weight || !height}>
          <Text style={styles.btnText}>{su.next}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─── PASO 2 · Módulos ───────────────────────────────────────────────────────
  if (step === 2) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.back}>{su.back}</Text></TouchableOpacity>
      <Text style={styles.stepDots}>● <Text style={styles.dotActive}>●</Text> ● ●</Text>
      <Text style={styles.stepTitle}>{su.modulesTitle}</Text>
      <Text style={styles.stepSub}>{su.modulesSub}</Text>

      {su.modulesOpts.map(opt => {
        const active = modules.includes(opt.id);
        return (
          <TouchableOpacity key={opt.id} onPress={() => toggleModule(opt.id)}
            style={[styles.optionCard, active && styles.optionCardActive]}>
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <View style={[styles.checkbox, active && styles.checkboxActive]}>
              {active && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.btn, modules.length === 0 && styles.btnDisabled]}
        onPress={() => modules.length > 0 && setStep(3)}
        disabled={modules.length === 0}>
        <Text style={styles.btnText}>{su.next}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── PASO 3 · Objetivos por categoría ───────────────────────────────────────
  if (step === 3) {
    const titleTxt = { es: '¿Qué quieres conseguir?', en: 'What\'s your goal?', fr: 'Quel est ton objectif ?', it: 'Qual è il tuo obiettivo?' }[lang] || '¿Qué quieres conseguir?';
    const subTxt   = { es: 'Elige un objetivo por categoría', en: 'Pick one goal per category', fr: 'Choisis un objectif par catégorie', it: 'Scegli un obiettivo per categoria' }[lang] || 'Elige un objetivo por categoría';
    const moduleLabels = { cycle: { es: '🌙 Ciclo', en: '🌙 Cycle', fr: '🌙 Cycle', it: '🌙 Ciclo' }, nutrition: { es: '🥗 Nutrición', en: '🥗 Nutrition', fr: '🥗 Nutrition', it: '🥗 Nutrizione' }, sport: { es: '🏋️ Deporte', en: '🏋️ Sport', fr: '🏋️ Sport', it: '🏋️ Sport' } };

    // Validación: cada módulo (excepto sleep) debe tener un objetivo
    const allGoalsSet = goalModules.every(m => goals[m]);

    return (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(2)}><Text style={styles.back}>{su.back}</Text></TouchableOpacity>
        <Text style={styles.stepDots}>● ● <Text style={styles.dotActive}>●</Text> ●</Text>
        <Text style={styles.stepTitle}>{titleTxt}</Text>
        <Text style={styles.stepSub}>{subTxt}</Text>

        {goalModules.map(catId => (
          <View key={catId} style={{ marginBottom: 18 }}>
            <Text style={[styles.inputLabel, { fontSize: 14, fontWeight: '700', marginBottom: 10 }]}>
              {moduleLabels[catId][lang] || moduleLabels[catId].es}
            </Text>
            {GOALS_BY_MODULE[catId].map(opt => {
              const active = goals[catId] === opt.id;
              return (
                <TouchableOpacity key={opt.id} onPress={() => setGoal(catId, opt.id)}
                  style={[styles.optionCard, active && styles.optionCardActive]}>
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label[lang] || opt.label.es}</Text>
                    <Text style={styles.optionDesc}>{opt.desc[lang] || opt.desc.es}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Aviso médico */}
        <View style={styles.medDisclaimer}>
          <Text style={styles.medDisclaimerTitle}>
            ⚕️ {lang === 'en' ? 'Important' : lang === 'fr' ? 'Important' : lang === 'it' ? 'Importante' : 'Importante'}
          </Text>
          <Text style={styles.medDisclaimerBody}>
            {lang === 'en'
              ? 'Meirins is an information and wellness tool. It does not replace medical, gynaecological or nutritional advice. Consult a healthcare professional for any medical concerns.'
              : lang === 'fr'
              ? 'Meirins est un outil d\'information et de bien-être. Il ne remplace pas l\'avis médical, gynécologique ou nutritionnel. Consulte un professionnel de santé pour toute question médicale.'
              : lang === 'it'
              ? 'Meirins è uno strumento di informazione e benessere. Non sostituisce il parere medico, ginecologico o nutrizionale. Consulta un professionista per qualsiasi dubbio.'
              : 'Meirins es una herramienta de información y bienestar. No sustituye el consejo médico, ginecológico ni nutricional. Consulta a un profesional de la salud ante cualquier duda.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, (saving || !allGoalsSet) && styles.btnDisabled]}
          onPress={finish}
          disabled={saving || !allGoalsSet}>
          <Text style={styles.btnText}>
            {saving
              ? su.saving
              : (lang === 'en' ? 'I understand and accept ✨'
                 : lang === 'fr' ? 'Je comprends et accepte ✨'
                 : lang === 'it' ? 'Capisco e accetto ✨'
                 : 'Entiendo y acepto ✨')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1F4A', alignItems: 'center', justifyContent: 'center', padding: 28 },

  // Aviso médico
  medDisclaimer:      { backgroundColor: 'rgba(253,230,138,0.12)', borderWidth: 1, borderColor: 'rgba(253,230,138,0.3)', borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 16 },
  medDisclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#FCD34D', marginBottom: 6, letterSpacing: 0.3 },
  medDisclaimerBody:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  langRow: { position: 'absolute', top: 56, right: 24, flexDirection: 'row', gap: 8 },
  langBtn: { padding: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.5)' },
  langFlag: { fontSize: 20 },
  scrollContainer: { flex: 1, backgroundColor: '#0F1F4A' },
  scrollContent: { padding: 28, paddingTop: 60, paddingBottom: 40 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontFamily: 'serif', fontSize: 40, color: 'white', fontWeight: '700', marginBottom: 4 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 20 },
  divider: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 22 },
  feature: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 8, width: '100%' },
  featureText: { color: 'white', fontSize: 14 },
  btn: { width: '100%', padding: 15, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', marginTop: 24 },
  btnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  btnText: { color: '#1A56DB', fontSize: 16, fontWeight: '700' },
  back: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 },
  stepDots: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 6, marginBottom: 14 },
  dotActive: { color: 'white' },
  stepTitle: { fontFamily: 'serif', fontSize: 28, color: 'white', fontWeight: '700', marginBottom: 6 },
  stepSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 16 },
  inputUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 14, minWidth: 30 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  optionCardActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'white' },
  optionEmoji: { fontSize: 28, flexShrink: 0 },
  optionLabel: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  optionLabelActive: { color: 'white' },
  optionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxActive: { backgroundColor: 'white', borderColor: 'white' },
  checkmark: { color: '#1A56DB', fontSize: 14, fontWeight: '700' },

  // Radio para selección única (nivel actividad, objetivos)
  radio:       { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  radioActive: { borderColor: 'white' },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' },
});
