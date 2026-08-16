import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ImageBackground, Image, Dimensions } from 'react-native';
import { Check, ChevronLeft } from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');
import T from '../i18n/translations';
import { trackEvent, Events } from '../lib/analytics';
import { F } from '../theme/fonts';
import BText from './BText';

const LANG_OPTIONS = [
 { code: 'es', flag: '' },
 { code: 'en', flag: '' },
 { code: 'fr', flag: '' },
 { code: 'it', flag: '' },
];

// Conversiones imperial ↔ métrico
const lbsToKg = (lbs) => Math.round(parseFloat(lbs) * 0.453592 * 10) / 10;
const feetInchesToCm = (ft, inch) => Math.round((parseFloat(ft || 0) * 30.48) + (parseFloat(inch || 0) * 2.54));

function BackBtn({ label, onPress }) {
 return (
 <TouchableOpacity onPress={onPress} style={styles.backBtn} activeOpacity={0.8}>
 <ChevronLeft size={16} color="#0A0A0A" />
 <BText style={styles.backBtnTxt}>{label}</BText>
 </TouchableOpacity>
 );
}

function StepBar({ index, total = 3 }) {
 return (
 <View style={styles.stepBarRow}>
 {Array.from({ length: total }, (_, i) => (
 <View key={i} style={[styles.stepBarSeg, i <= index && styles.stepBarSegActive]} />
 ))}
 </View>
 );
}

function UnitInput({ value, onChangeText, placeholder, unit, keyboardType = 'numeric' }) {
 return (
 <View style={styles.input}>
 <TextInput
 style={styles.inputTxt}
 value={value}
 onChangeText={onChangeText}
 placeholder={placeholder}
 placeholderTextColor="#737373"
 keyboardType={keyboardType}
 />
 <View style={styles.inputUnitBadge}>
 <BText style={styles.inputUnitBadgeTxt}>{unit}</BText>
 </View>
 </View>
 );
}

const INTRO_SLIDES = [
 {
  key: 'nutrition',
  image: require('../../assets/Inicio Nutricion.png'),
  title: { es: 'Nutrición adaptada a tu ciclo', en: 'Nutrition adapted to your cycle', fr: 'Nutrition adaptée à ton cycle', it: 'Nutrizione adattata al tuo ciclo' },
  subtitle: { es: 'Descubre cómo comer en sintonía con las fases de tu ciclo para sentirte con más energía.', en: 'Discover how to eat in sync with your cycle phases to feel more energised.', fr: 'Découvre comment manger en harmonie avec ton cycle pour te sentir plus énergique.', it: 'Scopri come mangiare in armonia con le fasi del tuo ciclo per sentirti più energica.' },
 },
 {
  key: 'training',
  image: require('../../assets/Inicio Hit.png'),
  title: { es: 'Entrenamiento personalizado', en: 'Personalised training', fr: 'Entraînement personnalisé', it: 'Allenamento personalizzato' },
  subtitle: { es: 'Entrena adaptado a tus fases hormonales para maximizar tu rendimiento y recuperación.', en: 'Train adapted to your hormonal phases to maximise performance and recovery.', fr: 'Entraîne-toi selon tes phases hormonales pour maximiser tes performances.', it: 'Allenati in base alle tue fasi ormonali per massimizzare le prestazioni.' },
 },
];

export default function SetupScreen({ onDone, lang = 'es', onLangChange, unitSystem = 'metric', onUnitSystemChange }) {
 const su = (T[lang] || T.es).setup;

 const [step, setStep] = useState(0);
 const [introSlide, setIntroSlide] = useState(0);

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
 const [heightFt, setHeightFt] = useState('');
 const [heightIn, setHeightIn] = useState('');
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
 const weightKg = unitSystem === 'imperial' ? lbsToKg(weight) : parseFloat(weight);
 const heightCm = unitSystem === 'imperial' ? feetInchesToCm(heightFt, heightIn) : parseFloat(height);
 await onDone({
 name: name.trim(),
 age: parseInt(age),
 weight: weightKg,
 height: heightCm,
 activityLevel,
 modules,
 goals,
 });
 trackEvent(Events.ONBOARDING_COMPLETED, { modules, activityLevel, goals });
 setSaving(false);
 };

 // ── Catálogos para multiidioma inline ──────────────────────────────────────
 const ACTIVITY_OPTS = [
 { id: 'sedentary', emoji: '', label: { es: 'Sedentaria', en: 'Sedentary', fr: 'Sédentaire', it: 'Sedentaria' }, desc: { es: 'Poca o ninguna actividad', en: 'Little to no activity', fr: 'Peu ou pas d\'activité', it: 'Poca o nessuna attività' } },
 { id: 'light', emoji: '', label: { es: 'Ligera', en: 'Light', fr: 'Légère', it: 'Leggera' }, desc: { es: 'Caminar, tareas suaves', en: 'Walking, light chores', fr: 'Marche, tâches légères', it: 'Camminata, attività leggere' } },
 { id: 'moderate', emoji: '', label: { es: 'Moderada', en: 'Moderate', fr: 'Modérée', it: 'Moderata' }, desc: { es: 'Deporte 3-4 veces/semana', en: 'Sport 3-4×/week', fr: 'Sport 3-4×/semaine', it: 'Sport 3-4 volte/settimana' } },
 { id: 'active', emoji: '', label: { es: 'Activa', en: 'Active', fr: 'Active', it: 'Attiva' }, desc: { es: 'Deporte 5+ veces/semana', en: 'Sport 5+ ×/week', fr: 'Sport 5+ fois/semaine', it: 'Sport 5+ volte/settimana' } },
 { id: 'very_active', emoji: '', label: { es: 'Muy activa', en: 'Very active',fr: 'Très active', it: 'Molto attiva' }, desc: { es: 'Atleta, deporte diario intenso',en: 'Athlete, daily intense',fr: 'Athlète, sport quotidien', it: 'Atleta, sport quotidiano' } },
 ];

 const GOALS_BY_MODULE = {
 cycle: [
 { id: 'track', emoji: '', label: { es: 'Seguir mi ciclo', en: 'Track my cycle', fr: 'Suivre mon cycle', it: 'Seguire il mio ciclo' }, desc: { es: 'Conocer cada fase', en: 'Know each phase', fr: 'Connaître chaque phase', it: 'Conoscere ogni fase' } },
 { id: 'reduce_pain', emoji: '', label: { es: 'Mejorar mis dolores', en: 'Reduce period pain', fr: 'Améliorer mes douleurs', it: 'Migliorare i dolori' }, desc: { es: 'Cólicos, SPM, fatiga', en: 'Cramps, PMS, fatigue', fr: 'Crampes, SPM, fatigue', it: 'Crampi, PMS, fatica' } },
 { id: 'pregnancy', emoji: '', label: { es: 'Quedarme embarazada', en: 'Get pregnant', fr: 'Tomber enceinte', it: 'Rimanere incinta' }, desc: { es: 'Identificar tu ventana fértil', en: 'Identify your fertile window', fr: 'Identifier la fenêtre fertile', it: 'Identificare la finestra fertile' } },
 ],
 nutrition: [
 { id: 'eat_better', emoji: '', label: { es: 'Comer mejor', en: 'Eat better', fr: 'Mieux manger', it: 'Mangiare meglio' }, desc: { es: 'Equilibrar mi alimentación', en: 'Balance my diet', fr: 'Équilibrer mon alimentation', it: 'Equilibrare la mia alimentazione' } },
 { id: 'lose_weight', emoji: '', label: { es: 'Perder peso', en: 'Lose weight', fr: 'Perdre du poids', it: 'Perdere peso' }, desc: { es: 'Déficit calórico controlado', en: 'Controlled calorie deficit', fr: 'Déficit calorique contrôlé', it: 'Deficit calorico controllato' } },
 { id: 'gain_weight', emoji: '', label: { es: 'Ganar peso', en: 'Gain weight', fr: 'Prendre du poids', it: 'Aumentare di peso' }, desc: { es: 'Superávit calórico', en: 'Calorie surplus', fr: 'Surplus calorique', it: 'Surplus calorico' } },
 { id: 'energize', emoji: '', label: { es: 'Energizarme', en: 'Get more energy', fr: 'Plus d\'énergie', it: 'Più energia' }, desc: { es: 'Para deportistas (>5h/semana)', en: 'For athletes (>5h/week)', fr: 'Sportives (>5h/semaine)', it: 'Per sportive (>5h/settimana)' } },
 ],
 sport: [
 { id: 'competition', emoji: '', label: { es: 'Competición', en: 'Competition', fr: 'Compétition', it: 'Competizione' }, desc: { es: 'Preparación específica', en: 'Specific preparation', fr: 'Préparation spécifique', it: 'Preparazione specifica' } },
 { id: 'muscle', emoji: '', label: { es: 'Ganar músculo', en: 'Build muscle', fr: 'Prendre du muscle', it: 'Costruire muscolo' }, desc: { es: 'Fuerza e hipertrofia', en: 'Strength and hypertrophy', fr: 'Force et hypertrophie', it: 'Forza e ipertrofia' } },
 { id: 'tone', emoji: '', label: { es: 'Afinarme y tonificar', en: 'Tone up', fr: 'M\'affiner et tonifier', it: 'Tonificarmi' }, desc: { es: 'Definición y postura', en: 'Definition and posture', fr: 'Définition et posture', it: 'Definizione e postura' } },
 { id: 'resume', emoji: '', label: { es: 'Retomar el deporte', en: 'Resume sport', fr: 'Reprendre le sport', it: 'Riprendere lo sport' }, desc: { es: 'Volver con seguridad', en: 'Come back safely', fr: 'Revenir en sécurité', it: 'Tornare in sicurezza' } },
 ],
 };

 // Solo se piden objetivos de los módulos elegidos (excluyendo sueño)
 const goalModules = modules.filter(m => GOALS_BY_MODULE[m]);

 // ─── PASO 0 · Slides de introducción ───────────────────────────────────────
 if (step === 0) {
 const slide = INTRO_SLIDES[introSlide];
 const title = slide.title[lang] || slide.title.es;
 const subtitle = slide.subtitle[lang] || slide.subtitle.es;
 const isLast = introSlide === INTRO_SLIDES.length - 1;

 return (
  <ImageBackground source={require('../../assets/onboarding-bg.png')} style={{ flex: 1 }} resizeMode="cover">
   <View style={styles.bgOverlay} />

   {/* Pills flotantes */}
   <View style={[styles.introPill, styles.pillGreen, { top: SH * 0.14, left: SW * 0.06 }]}>
    <BText style={[styles.introPillTxt, { color: '#0B1F08' }]}>CICLO</BText>
   </View>
   <View style={[styles.introPill, styles.pillOrange, { top: SH * 0.22, right: SW * 0.12 }]}>
    <BText style={[styles.introPillTxt, { color: '#260E01' }]}>NUTRICIÓN</BText>
   </View>
   <View style={[styles.introPill, styles.pillBlue, { top: SH * 0.08, right: SW * 0.06 }]}>
    <BText style={[styles.introPillTxt, { color: '#0A1823' }]}>ENTRENAMIENTO</BText>
   </View>

   {/* Panel blanco desde abajo */}
   <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <View style={styles.introPanel}>
     {/* Botón Volver */}
     {introSlide > 0 ? (
      <TouchableOpacity style={styles.backBtn} onPress={() => setIntroSlide(i => i - 1)}>
       <BText style={styles.backBtnTxt}>← Volver</BText>
      </TouchableOpacity>
     ) : (
      <View style={{ height: 32 }} />
     )}

     {/* Imagen + dots + texto */}
     <View style={{ gap: 16, alignItems: 'center', alignSelf: 'stretch' }}>
      {/* Imagen */}
      <Image source={slide.image} style={styles.introImg} resizeMode="cover" />

      {/* Dots de paginación */}
      <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 8 }}>
       {INTRO_SLIDES.map((_, i) => (
        <View key={i} style={[styles.introDot, i === introSlide && styles.introDotActive]} />
       ))}
      </View>

      {/* Título + subtítulo */}
      <View style={{ gap: 4, alignSelf: 'stretch' }}>
       <BText style={styles.introTitle}>{title}</BText>
       <BText style={styles.introSubtitle}>{subtitle}</BText>
      </View>
     </View>

     {/* Botón Siguiente */}
     <View style={{ alignSelf: 'stretch' }}>
      <TouchableOpacity style={styles.btn} onPress={() => {
       if (isLast) { setStep(1); }
       else { setIntroSlide(i => i + 1); }
      }}>
       <BText style={styles.btnText}>{su.next || 'Siguiente →'}</BText>
      </TouchableOpacity>
     </View>
    </View>
   </View>
  </ImageBackground>
 );
 }

 // ─── PASO 1 · Datos personales ──────────────────────────────────────────────
 if (step === 1) return (
 <KeyboardAvoidingView style={styles.scrollContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
 <ScrollView contentContainerStyle={styles.scrollContent}>
 <BackBtn label={su.back} onPress={() => setStep(0)} />
 <StepBar index={0} />
 <BText style={styles.stepTitle}>{su.step1Title}</BText>
 <BText style={styles.stepSub}>{su.step1Sub}</BText>

 {/* Nombre — opcional */}
 <View style={styles.inputGroup}>
 <BText style={styles.inputLabel}>{su.nameLabel || '¿Cómo te llamas?'} <BText style={{ color: '#A3A3A3', fontSize: 12 }}>{su.nameOptional || '(opcional)'}</BText></BText>
 <View style={styles.input}>
 <TextInput
 style={styles.inputTxt}
 value={name}
 onChangeText={setName}
 placeholder={su.namePlaceholder || 'Tu nombre…'}
 placeholderTextColor="#737373"
 autoCapitalize="words"
 />
 </View>
 </View>

 {/* Toggle de sistema de medidas */}
 <View style={styles.unitToggleRow}>
 {[
 { id: 'metric', label: 'kg · cm' },
 { id: 'imperial', label: 'lbs · ft' },
 ].map(u => (
 <TouchableOpacity key={u.id} onPress={() => onUnitSystemChange?.(u.id)}
 style={[styles.unitToggleBtn, unitSystem === u.id && styles.unitToggleBtnActive]}>
 <BText style={[styles.unitToggleLabel, unitSystem === u.id && styles.unitToggleLabelActive]}>{u.label}</BText>
 </TouchableOpacity>
 ))}
 </View>

 {/* Edad */}
 <View style={styles.inputGroup}>
 <BText style={styles.inputLabel}>{su.ageLabel}</BText>
 <View style={styles.input}>
 <TextInput style={styles.inputTxt} value={age} onChangeText={setAge}
 placeholder={su.agePh} placeholderTextColor="#737373" keyboardType="numeric" />
 </View>
 </View>

 {/* Peso */}
 <View style={styles.inputGroup}>
 <BText style={styles.inputLabel}>{su.weightLabel}</BText>
 <UnitInput value={weight} onChangeText={setWeight}
 placeholder={unitSystem === 'imperial' ? '130' : su.weightPh}
 unit={unitSystem === 'imperial' ? 'lbs' : 'Kg'} keyboardType="decimal-pad" />
 </View>

 {/* Altura */}
 <View style={styles.inputGroup}>
 <BText style={styles.inputLabel}>{su.heightLabel}</BText>
 {unitSystem === 'imperial' ? (
 <View style={{ flexDirection: 'row', gap: 10 }}>
 <View style={{ flex: 1 }}>
 <UnitInput value={heightFt} onChangeText={setHeightFt} placeholder="5" unit="ft" />
 </View>
 <View style={{ flex: 1 }}>
 <UnitInput value={heightIn} onChangeText={setHeightIn} placeholder="6" unit="in" />
 </View>
 </View>
 ) : (
 <UnitInput value={height} onChangeText={setHeight} placeholder={su.heightPh} unit="Cm" />
 )}
 </View>

 {/* Nivel de actividad */}
 <BText style={[styles.sectionLabel, { marginTop: 6 }]}>
 {lang === 'en' ? 'Activity level' : lang === 'fr' ? 'Niveau d\'activité' : lang === 'it' ? 'Livello di attività' : 'Nivel de actividad'}
 </BText>
 <View style={{ gap: 2, marginBottom: 8 }}>
 {ACTIVITY_OPTS.map(opt => {
 const active = activityLevel === opt.id;
 return (
 <TouchableOpacity key={opt.id} onPress={() => setActivityLevel(opt.id)}
 style={[styles.optionCard, active && styles.optionCardActive]}>
 <View style={{ flex: 1 }}>
 <BText style={styles.optionLabel}>{opt.emoji} {opt.label[lang] || opt.label.es}</BText>
 <BText style={styles.optionDesc}>{opt.desc[lang] || opt.desc.es}</BText>
 </View>
 <View style={[styles.radio, active && styles.radioActive]}>
 {active && <View style={styles.radioDot} />}
 </View>
 </TouchableOpacity>
 );
 })}
 </View>

 <TouchableOpacity
 style={[styles.btn, (!age || !weight || (unitSystem === 'imperial' ? !heightFt : !height)) && styles.btnDisabled]}
 onPress={() => { const hOk = unitSystem === 'imperial' ? !!heightFt : !!height; if (age && weight && hOk) setStep(2); }}
 disabled={!age || !weight || (unitSystem === 'imperial' ? !heightFt : !height)}>
 <BText style={styles.btnText}>{su.next}</BText>
 </TouchableOpacity>
 </ScrollView>
 </KeyboardAvoidingView>
 );

 // ─── PASO 2 · Módulos ───────────────────────────────────────────────────────
 if (step === 2) return (
 <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
 <BackBtn label={su.back} onPress={() => setStep(1)} />
 <StepBar index={1} />
 <BText style={styles.stepTitle}>{su.modulesTitle}</BText>
 <BText style={styles.stepSub}>{su.modulesSub}</BText>

 <View style={{ gap: 2, marginBottom: 8 }}>
 {su.modulesOpts.map(opt => {
 const active = modules.includes(opt.id);
 return (
 <TouchableOpacity key={opt.id} onPress={() => toggleModule(opt.id)}
 style={[styles.optionCard, active && styles.optionCardActive]}>
 <View style={{ flex: 1 }}>
 <BText style={styles.optionLabel}>{opt.emoji} {opt.label}</BText>
 <BText style={styles.optionDesc}>{opt.desc}</BText>
 </View>
 <View style={[styles.checkbox, active && styles.checkboxActive]}>
 {active && <Check size={14} color="white" />}
 </View>
 </TouchableOpacity>
 );
 })}
 </View>

 <TouchableOpacity
 style={[styles.btn, modules.length === 0 && styles.btnDisabled]}
 onPress={() => modules.length > 0 && setStep(3)}
 disabled={modules.length === 0}>
 <BText style={styles.btnText}>{su.next}</BText>
 </TouchableOpacity>
 </ScrollView>
 );

 // ─── PASO 3 · Objetivos por categoría ───────────────────────────────────────
 if (step === 3) {
 const titleTxt = { es: '¿Qué quieres conseguir?', en: 'What\'s your goal?', fr: 'Quel est ton objectif ?', it: 'Qual è il tuo obiettivo?' }[lang] || '¿Qué quieres conseguir?';
 const subTxt = { es: 'Elige un objetivo por categoría', en: 'Pick one goal per category', fr: 'Choisis un objectif par catégorie', it: 'Scegli un obiettivo per categoria' }[lang] || 'Elige un objetivo por categoría';
 const moduleLabels = { cycle: { es: 'Ciclo', en: 'Cycle', fr: 'Cycle', it: 'Ciclo' }, nutrition: { es: 'Nutrición', en: 'Nutrition', fr: 'Nutrition', it: 'Nutrizione' }, sport: { es: 'Deporte', en: 'Sport', fr: 'Sport', it: 'Sport' } };

 // Validación: cada módulo (excepto sleep) debe tener un objetivo
 const allGoalsSet = goalModules.every(m => goals[m]);

 return (
 <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
 <BackBtn label={su.back} onPress={() => setStep(2)} />
 <StepBar index={2} />
 <BText style={styles.stepTitle}>{titleTxt}</BText>
 <BText style={styles.stepSub}>{subTxt}</BText>

 {goalModules.map(catId => (
 <View key={catId} style={{ marginBottom: 20 }}>
 <BText style={styles.sectionLabel}>
 {moduleLabels[catId][lang] || moduleLabels[catId].es}
 </BText>
 <View style={{ gap: 2 }}>
 {GOALS_BY_MODULE[catId].map(opt => {
 const active = goals[catId] === opt.id;
 return (
 <TouchableOpacity key={opt.id} onPress={() => setGoal(catId, opt.id)}
 style={[styles.optionCard, active && styles.optionCardActive]}>
 <View style={{ flex: 1 }}>
 <BText style={styles.optionLabel}>{opt.emoji} {opt.label[lang] || opt.label.es}</BText>
 <BText style={styles.optionDesc}>{opt.desc[lang] || opt.desc.es}</BText>
 </View>
 <View style={[styles.radio, active && styles.radioActive]}>
 {active && <View style={styles.radioDot} />}
 </View>
 </TouchableOpacity>
 );
 })}
 </View>
 </View>
 ))}

 {/* Aviso médico */}
 <View style={styles.medDisclaimer}>
 <BText style={styles.medDisclaimerTitle}>
 {lang === 'en' ? 'Important' : lang === 'fr' ? 'Important' : lang === 'it' ? 'Importante' : 'Importante'}
 </BText>
 <BText style={styles.medDisclaimerBody}>
 {lang === 'en'
 ? 'Blumm is an information and wellness tool. It does not replace medical, gynaecological or nutritional advice. Consult a healthcare professional for any medical concerns.'
 : lang === 'fr'
 ? 'Blumm est un outil d\'information et de bien-être. Il ne remplace pas l\'avis médical, gynécologique ou nutritionnel. Consulte un professionnel de santé pour toute question médicale.'
 : lang === 'it'
 ? 'Blumm è uno strumento di informazione e benessere. Non sostituisce il parere medico, ginecologico o nutrizionale. Consulta un professionista per qualsiasi dubbio.'
 : 'Blumm es una herramienta de información y bienestar. No sustituye el consejo médico, ginecológico ni nutricional. Consulta a un profesional de la salud ante cualquier duda.'}
 </BText>
 </View>

 <TouchableOpacity
 style={[styles.btn, (saving || !allGoalsSet) && styles.btnDisabled]}
 onPress={finish}
 disabled={saving || !allGoalsSet}>
 <BText style={styles.btnText}>
 {saving
 ? su.saving
 : (lang === 'en' ? 'I understand and accept '
 : lang === 'fr' ? 'Je comprends et accepte '
 : lang === 'it' ? 'Capisco e accetto '
 : 'Entiendo y acepto ')}
 </BText>
 </TouchableOpacity>
 </ScrollView>
 );
 }

 return null;
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 28 },

 // ── Intro slides ────────────────────────────────────────────────────────────
 bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },
 introPill: { position: 'absolute', paddingHorizontal: 8, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
 introPillTxt: { fontSize: 10, fontFamily: F.body, letterSpacing: 0.3, textTransform: 'uppercase', lineHeight: 12 },
 pillGreen: { backgroundColor: '#49CF38' },
 pillOrange: { backgroundColor: '#FE6004' },
 pillBlue: { backgroundColor: '#429FE7' },
 introPanel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 16, paddingBottom: 48, gap: 48 },
 introImg: { width: 300, height: 400, borderRadius: 24, backgroundColor: '#E5E5E5' },
 introDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5E5' },
 introDotActive: { backgroundColor: '#0A0A0A', width: 24 },
 introTitle: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 28.8, textAlign: 'center' },
 introSubtitle: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 19.6, textAlign: 'center' },

 // Aviso médico
 medDisclaimer: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 16, padding: 14, marginTop: 8, marginBottom: 16 },
 medDisclaimerTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#9A3412', marginBottom: 6, letterSpacing: 0.3 },
 medDisclaimerBody: { fontSize: 12, color: '#7C2D12', lineHeight: 18, fontFamily: F.body },
 langRow: { position: 'absolute', top: 56, right: 24, flexDirection: 'row', gap: 8 },
 langBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
 langBtnActive: { backgroundColor: 'white', borderColor: '#171717' },
 langFlag: { fontSize: 20, fontFamily: F.body },
 scrollContainer: { flex: 1, backgroundColor: 'white' },
 scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
 emoji: { fontSize: 64, marginBottom: 16, fontFamily: F.body },
 title: { fontSize: 36, fontFamily: F.headingX, color: '#0A0A0A', marginBottom: 4 },
 tagline: { fontSize: 11, fontFamily: F.body, color: '#737373', letterSpacing: 3, marginBottom: 20 },
 divider: { width: 40, height: 2, backgroundColor: '#E5E5E5', marginBottom: 22 },
 feature: { backgroundColor: '#F5F5F5', borderRadius: 16, padding: 12, marginBottom: 8, width: '100%' },
 featureText: { color: '#0A0A0A', fontSize: 14, fontFamily: F.body },
 btn: { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
 btnDisabled: { opacity: 0.4 },
 btnText: { color: '#FAFAFA', fontSize: 18, fontFamily: F.body },

 // Volver
 backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, height: 32, marginBottom: 20 },
 backBtnTxt: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },

 // Barra de pasos
 stepBarRow: { flexDirection: 'row', gap: 4, marginBottom: 12 },
 stepBarSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E5E5' },
 stepBarSegActive: { backgroundColor: '#171717' },

 stepTitle: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', marginBottom: 6 },
 stepSub: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', marginBottom: 24, lineHeight: 20 },
 sectionLabel: { fontSize: 16, fontFamily: F.bodyB, color: '#171717', marginBottom: 10 },
 inputGroup: { marginBottom: 16 },
 inputLabel: { fontSize: 14, fontFamily: F.body, color: '#171717', marginBottom: 8 },
 input: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 16, backgroundColor: '#FAFAFA', paddingLeft: 8, paddingRight: 4, gap: 8 },
 inputTxt: { flex: 1, fontSize: 15, fontFamily: F.body, color: '#0A0A0A' },
 inputUnitBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
 inputUnitBadgeTxt: { color: 'white', fontSize: 12, fontFamily: F.bodyB },

 optionCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAFAFA', borderRadius: 24, padding: 16, minHeight: 56, borderWidth: 1, borderColor: 'transparent' },
 optionCardActive: { backgroundColor: '#F5F5F5', borderColor: '#262626' },
 optionLabel: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A' },
 optionDesc: { fontSize: 11, fontFamily: F.body, color: '#737373', marginTop: 2 },
 checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#737373', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 checkboxActive: { backgroundColor: '#262626', borderColor: '#262626' },

 // Radio para selección única (nivel actividad, objetivos)
 radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#737373', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
 radioActive: { backgroundColor: '#262626', borderColor: '#262626' },
 radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },

 // Toggle de sistema de medidas (metric / imperial)
 unitToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
 unitToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: '#FAFAFA' },
 unitToggleBtnActive: { backgroundColor: '#171717', borderColor: '#171717' },
 unitToggleLabel: { fontSize: 13, color: '#525252', fontFamily: F.bodyB },
 unitToggleLabelActive:{ color: 'white' },
});
