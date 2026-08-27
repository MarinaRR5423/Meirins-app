import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import T from '../../i18n/translations';
import { F } from '../../theme/fonts';
import BText from '../../components/BText';

const TOTAL = 5;

// ── Componentes reutilizables ─────────────────────────────────────────────────

function Layout({ step, title, subtitle, onBack, onNext, nextLabel, backLabel = '← Volver', nextDisabled = false, children }) {
 return (
 <SafeAreaView style={s.safe}>
 <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
 {/* Header */}
 <View style={s.header}>
 <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
 <BText style={s.back}>{backLabel}</BText>
 </TouchableOpacity>
 <BText style={s.stepCounter}>{step}/{TOTAL}</BText>
 <View style={{ width: 60 }} />
 </View>

 {/* Barra de progreso */}
 <View style={s.progressTrack}>
 <View style={[s.progressFill, { width: `${(step / TOTAL) * 100}%` }]} />
 </View>

 <ScrollView
 style={{ flex: 1 }}
 contentContainerStyle={s.scrollContent}
 showsVerticalScrollIndicator={false}
 keyboardShouldPersistTaps="handled"
 >
 <BText style={s.title}>{title}</BText>
 {subtitle ? <BText style={s.subtitle}>{subtitle}</BText> : null}
 <View style={{ gap: 20 }}>{children}</View>
 </ScrollView>

 <View style={s.footer}>
 <TouchableOpacity
 onPress={onNext}
 disabled={nextDisabled}
 style={[s.nextBtn, nextDisabled && s.nextBtnDisabled]}
 activeOpacity={0.85}
 >
 <BText style={[s.nextLabel, nextDisabled && s.nextLabelDisabled]}>{nextLabel}</BText>
 </TouchableOpacity>
 </View>
 </KeyboardAvoidingView>
 </SafeAreaView>
 );
}

function CardOption({ icon, label, description, selected, onPress }) {
 return (
 <TouchableOpacity onPress={onPress} style={[s.card, selected && s.cardSelected]} activeOpacity={0.8}>
 {icon ? <BText style={s.cardIcon}>{icon}</BText> : null}
 <View style={{ flex: 1 }}>
 <BText style={[s.cardLabel, selected && s.cardLabelSelected]}>{label}</BText>
 {description ? <BText style={[s.cardDesc, selected && s.cardDescSelected]}>{description}</BText> : null}
 </View>
 {selected && <Check size={16} color="#429FE7" />}
 </TouchableOpacity>
 );
}

function Chip({ label, selected, onPress, danger = false }) {
 return (
 <TouchableOpacity
 onPress={onPress}
 style={[s.chip, selected && (danger ? s.chipDanger : s.chipSelected)]}
 activeOpacity={0.75}
 >
 <BText style={[s.chipLabel, selected && s.chipLabelSelected]}>{label}</BText>
 </TouchableOpacity>
 );
}

function YesNo({ label, value, onChange, yesLabel = 'Sí', noLabel = 'No' }) {
 return (
 <View style={s.yesnoRow}>
 <BText style={s.yesnoLabel}>{label}</BText>
 <View style={s.yesnoButtons}>
 <TouchableOpacity onPress={() => onChange(true)} style={[s.yesnoBtn, value === true && s.yesnoBtnActive]}>
 <BText style={[s.yesnoBtnText, value === true && s.yesnoBtnTextActive]}>{yesLabel}</BText>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => onChange(false)} style={[s.yesnoBtn, value === false && s.yesnoBtnActive]}>
 <BText style={[s.yesnoBtnText, value === false && s.yesnoBtnTextActive]}>{noLabel}</BText>
 </TouchableOpacity>
 </View>
 </View>
 );
}

function SecLabel({ children }) {
 return <BText style={s.secLabel}>{children}</BText>;
}

function toggle(arr, val) {
 return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// ── Pantallas ─────────────────────────────────────────────────────────────────

const LIFE_STAGE_ICONS = { reproductive: '', perimenopause: '', menopause: '', postmenopause: '', pregnant: '', postpartum: '' };

// Opciones de semana de gestación agrupadas por trimestre
const PREGNANCY_WEEK_OPTIONS = [
 // Trimestre 1
 { v: '4',  l: '4 semanas',  t: 1 }, { v: '5',  l: '5 semanas',  t: 1 },
 { v: '6',  l: '6 semanas',  t: 1 }, { v: '7',  l: '7 semanas',  t: 1 },
 { v: '8',  l: '8 semanas',  t: 1 }, { v: '9',  l: '9 semanas',  t: 1 },
 { v: '10', l: '10 semanas', t: 1 }, { v: '11', l: '11 semanas', t: 1 },
 { v: '12', l: '12 semanas', t: 1 }, { v: '13', l: '13 semanas', t: 1 },
 // Trimestre 2
 { v: '14', l: '14 semanas', t: 2 }, { v: '15', l: '15 semanas', t: 2 },
 { v: '16', l: '16 semanas', t: 2 }, { v: '17', l: '17 semanas', t: 2 },
 { v: '18', l: '18 semanas', t: 2 }, { v: '19', l: '19 semanas', t: 2 },
 { v: '20', l: '20 semanas', t: 2 }, { v: '21', l: '21 semanas', t: 2 },
 { v: '22', l: '22 semanas', t: 2 }, { v: '23', l: '23 semanas', t: 2 },
 { v: '24', l: '24 semanas', t: 2 }, { v: '25', l: '25 semanas', t: 2 },
 { v: '26', l: '26 semanas', t: 2 },
 // Trimestre 3
 { v: '27', l: '27 semanas', t: 3 }, { v: '28', l: '28 semanas', t: 3 },
 { v: '29', l: '29 semanas', t: 3 }, { v: '30', l: '30 semanas', t: 3 },
 { v: '31', l: '31 semanas', t: 3 }, { v: '32', l: '32 semanas', t: 3 },
 { v: '33', l: '33 semanas', t: 3 }, { v: '34', l: '34 semanas', t: 3 },
 { v: '35', l: '35 semanas', t: 3 }, { v: '36', l: '36 semanas', t: 3 },
 { v: '37', l: '37 semanas', t: 3 }, { v: '38', l: '38 semanas', t: 3 },
 { v: '39', l: '39 semanas', t: 3 }, { v: '40', l: '40 semanas', t: 3 },
];

const TRIMESTER_LABELS = {
 1: { es: '1er trimestre', en: '1st trimester', fr: '1er trimestre', it: '1° trimestre' },
 2: { es: '2º trimestre', en: '2nd trimester', fr: '2e trimestre', it: '2° trimestre' },
 3: { es: '3er trimestre', en: '3rd trimester', fr: '3e trimestre', it: '3e trimestre' },
};

function Step1({ data, save, onBack, onNext, ob, lang }) {
 const pregnancyWeekLabel = {
  es: '¿EN QUÉ SEMANA DE GESTACIÓN ESTÁS?',
  en: 'WHAT WEEK OF PREGNANCY ARE YOU IN?',
  fr: 'À QUELLE SEMAINE DE GROSSESSE ES-TU ?',
  it: 'A CHE SETTIMANA DI GRAVIDANZA SEI?',
 }[lang] || '¿EN QUÉ SEMANA DE GESTACIÓN ESTÁS?';

 // Agrupar semanas por trimestre para mostrar secciones
 const trimesterGroups = [1, 2, 3].map(t => ({
  t,
  label: TRIMESTER_LABELS[t][lang] || TRIMESTER_LABELS[t].es,
  weeks: PREGNANCY_WEEK_OPTIONS.filter(o => o.t === t),
 }));

 return (
 <Layout step={1} title={ob.step1Title} subtitle={ob.step1Sub}
 onBack={onBack} onNext={onNext} nextLabel={ob.next} backLabel={ob.back} nextDisabled={false}>
 <View>
 <SecLabel>{ob.nameLabel}</SecLabel>
 <TextInput
 value={data.name || ''}
 onChangeText={v => save({ name: v })}
 placeholder={ob.namePlaceholder}
 placeholderTextColor="rgba(255,255,255,0.35)"
 style={s.input}
 autoCapitalize="words"
 />
 </View>
 <View>
 <SecLabel>{ob.lifeStageLabel}</SecLabel>
 {ob.lifeStages.map(o => (
 <CardOption key={o.v} icon={LIFE_STAGE_ICONS[o.v]}
 label={o.l} description={o.d}
 selected={data.lifeStage === o.v} onPress={() => save({ lifeStage: o.v })} />
 ))}
 {data.lifeStage === 'pregnant' && (
 <>
  <View style={s.infoBanner}>
   <BText style={s.infoBannerText}>{ob.pregnantBanner}</BText>
  </View>
  {/* ── Semana de gestación ── */}
  <View style={{ marginTop: 16, gap: 14 }}>
   <SecLabel>{pregnancyWeekLabel}</SecLabel>
   {trimesterGroups.map(({ t, label, weeks }) => (
    <View key={t} style={{ gap: 8 }}>
     <View style={s.trimesterHeader}>
      <BText style={s.trimesterLabel}>{label}</BText>
     </View>
     <View style={s.weekGrid}>
      {weeks.map(w => (
       <TouchableOpacity
        key={w.v}
        style={[s.weekChip, data.pregnancyWeek === w.v && s.weekChipSelected]}
        onPress={() => save({ pregnancyWeek: w.v })}
        activeOpacity={0.75}
       >
        <BText style={[s.weekChipTxt, data.pregnancyWeek === w.v && s.weekChipTxtSelected]}>
         {w.v}
        </BText>
       </TouchableOpacity>
      ))}
     </View>
    </View>
   ))}
   {data.pregnancyWeek && (
    <View style={s.weekSelectedBanner}>
     <BText style={s.weekSelectedTxt}>
      {`🌸 ${
       { es: 'Semana', en: 'Week', fr: 'Semaine', it: 'Settimana' }[lang] || 'Semana'
      } ${data.pregnancyWeek} · ${
       TRIMESTER_LABELS[PREGNANCY_WEEK_OPTIONS.find(o => o.v === data.pregnancyWeek)?.t]?.[lang] || ''
      }`}
     </BText>
    </View>
   )}
  </View>
 </>
 )}
 </View>
 </Layout>
 );
}

function Step2({ data, save, onBack, onNext, ob }) {
 return (
 <Layout step={2} title={ob.step2Title} subtitle={ob.step2Sub}
 onBack={onBack} onNext={onNext} nextLabel={ob.next} backLabel={ob.back}>
 <View>
 <SecLabel>{ob.conditionsLabel}</SecLabel>
 <View style={s.chips}>
 {ob.conditions.map(o => (
 <Chip key={o.v} label={o.l} selected={(data.conditions || []).includes(o.v)}
 onPress={() => save({ conditions: toggle(data.conditions || [], o.v) })} />
 ))}
 </View>
 </View>
 <View>
 <SecLabel>{ob.contraLabel}</SecLabel>
 <YesNo label={ob.contraQuestion} value={data.usesContra}
 onChange={v => save({ usesContra: v, contraception: v ? data.contraception : 'none' })}
 yesLabel={ob.yes} noLabel={ob.no} />
 {data.usesContra && (
 <View style={[s.chips, { marginTop: 10 }]}>
 {ob.contraOptions.map(o => (
 <Chip key={o.v} label={o.l} selected={data.contraception === o.v}
 onPress={() => save({ contraception: o.v })} />
 ))}
 </View>
 )}
 </View>
 <View>
 <SecLabel>{ob.medicationLabel}</SecLabel>
 <View style={s.chips}>
 {ob.medications.map(o => (
 <Chip key={o.v} label={o.l} selected={(data.medications || []).includes(o.v)}
 onPress={() => save({ medications: toggle(data.medications || [], o.v) })} />
 ))}
 </View>
 </View>
 <View>
 <BText style={s.mhNote}>{ob.mhNote}</BText>
 <SecLabel>{ob.mhLabel}</SecLabel>
 <View style={s.chips}>
 {ob.mental.map(o => (
 <Chip key={o.v} label={o.l} selected={(data.mentalHealthFlags || []).includes(o.v)}
 onPress={() => save({ mentalHealthFlags: toggle(data.mentalHealthFlags || [], o.v) })} />
 ))}
 <Chip label={ob.preferNotSay} selected={false}
 onPress={() => save({ mentalHealthFlags: [] })} />
 </View>
 </View>
 </Layout>
 );
}

function Step3({ data, save, onBack, onNext, ob }) {
 return (
 <Layout step={3} title={ob.step3Title} subtitle={ob.step3Sub}
 onBack={onBack} onNext={onNext} nextLabel={ob.next} backLabel={ob.back}>
 <View>
 <SecLabel>{ob.fitnessLabel}</SecLabel>
 {ob.fitness.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l} description={o.d}
 selected={data.fitnessLevel === o.v} onPress={() => save({ fitnessLevel: o.v })} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.sportsLabel}</SecLabel>
 <View style={s.chips}>
 {ob.sports.map(o => (
 <Chip key={o.v} label={o.l} selected={(data.sportsTypes || []).includes(o.v)}
 onPress={() => save({ sportsTypes: toggle(data.sportsTypes || [], o.v) })} />
 ))}
 </View>
 </View>
 <View>
 <SecLabel>{ob.injuryLabel}</SecLabel>
 <YesNo label={ob.injuryQuestion} value={data.hasInjury}
 onChange={v => save({ hasInjury: v, injuryZone: v ? data.injuryZone : null })}
 yesLabel={ob.yes} noLabel={ob.no} />
 {data.hasInjury && (
 <View style={[s.chips, { marginTop: 10 }]}>
 {ob.injuryZones.map(o => (
 <Chip key={o.v} label={o.l} selected={data.injuryZone === o.v}
 onPress={() => save({ injuryZone: o.v })} />
 ))}
 </View>
 )}
 <View style={{ height: 12 }} />
 <YesNo label={ob.rehabQuestion} value={data.inRehab}
 onChange={v => save({ inRehab: v })}
 yesLabel={ob.yes} noLabel={ob.no} />
 </View>
 <View>
 <SecLabel>{ob.gymLabel}</SecLabel>
 {ob.gymOptions.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l}
 selected={data.gymAccess === o.v} onPress={() => save({ gymAccess: o.v })} />
 ))}
 </View>
 </Layout>
 );
}

function Step4({ data, save, onBack, onNext, ob }) {
 return (
 <Layout step={4} title={ob.step4Title} subtitle={ob.step4Sub}
 onBack={onBack} onNext={onNext} nextLabel={ob.next} backLabel={ob.back}>
 <View>
 <SecLabel>{ob.dietLabel}</SecLabel>
 {ob.diets.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l} description={o.d}
 selected={data.diet === o.v} onPress={() => save({ diet: o.v })} />
 ))}
 </View>
 <View>
 <BText style={s.allergyWarning}>{ob.allergyWarning}</BText>
 <SecLabel>{ob.allergyLabel}</SecLabel>
 <View style={s.chips}>
 {ob.allergies.map(o => (
 <Chip key={o.v} label={o.l} danger selected={(data.allergies || []).includes(o.v)}
 onPress={() => save({ allergies: toggle(data.allergies || [], o.v) })} />
 ))}
 </View>
 </View>
 <View>
 <SecLabel>{ob.dislikesLabel}</SecLabel>
 <View style={s.chips}>
 {ob.dislikes.map(o => (
 <Chip key={o.v} label={o.l} selected={(data.foodDislikes || []).includes(o.v)}
 onPress={() => save({ foodDislikes: toggle(data.foodDislikes || [], o.v) })} />
 ))}
 </View>
 </View>
 <View>
 <SecLabel>{ob.cookingLabel}</SecLabel>
 {ob.cooking.map(o => (
 <CardOption key={o.v} label={o.l}
 selected={data.cookingTime === o.v} onPress={() => save({ cookingTime: o.v })} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.budgetLabel}</SecLabel>
 {ob.budgets.map(o => (
 <CardOption key={o.v} label={o.l}
 selected={data.weeklyBudget === o.v} onPress={() => save({ weeklyBudget: o.v })} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.digestiveLabel}</SecLabel>
 <YesNo label={ob.ibsQuestion} value={data.hasSIBS} onChange={v => save({ hasSIBS: v })}
 yesLabel={ob.yes} noLabel={ob.no} />
 {data.hasSIBS && <BText style={s.noteText}>{ob.ibsNote}</BText>}
 <View style={{ height: 12 }} />
 <YesNo label={ob.gastritisQuestion} value={data.hasGastritis} onChange={v => save({ hasGastritis: v })}
 yesLabel={ob.yes} noLabel={ob.no} />
 </View>
 </Layout>
 );
}

function Step5({ data, save, onBack, onFinish, saving, ob }) {
 const goals = data.primaryGoals || [];
 const toggleGoal = (v) => {
 const next = goals.includes(v) ? goals.filter(x => x !== v) : [...goals, v];
 save({ primaryGoals: next });
 };
 return (
 <Layout step={5} title={ob.step5Title} subtitle={ob.step5Sub}
 onBack={onBack} onNext={onFinish} backLabel={ob.back}
 nextLabel={saving ? ob.saving : ob.create}
 nextDisabled={goals.length === 0 || saving}>
 <View>
 <SecLabel>{ob.goalsLabel}</SecLabel>
 {ob.goals.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l} description={o.d}
 selected={goals.includes(o.v)} onPress={() => toggleGoal(o.v)} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.sleepLabel}</SecLabel>
 {ob.sleep.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l}
 selected={data.sleepQuality === o.v} onPress={() => save({ sleepQuality: o.v })} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.stressLabel}</SecLabel>
 {ob.stress.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l}
 selected={data.stressLevel === o.v} onPress={() => save({ stressLevel: o.v })} />
 ))}
 </View>
 <View>
 <SecLabel>{ob.workLabel}</SecLabel>
 {ob.work.map(o => (
 <CardOption key={o.v} icon={o.ico} label={o.l}
 selected={data.workType === o.v} onPress={() => save({ workType: o.v })} />
 ))}
 </View>
 {goals.length > 0 && (
 <View style={s.readyBanner}>
 <BText style={{ fontSize: 22 }}></BText>
 <View style={{ flex: 1 }}>
 <BText style={s.readyTitle}>{ob.readyTitle}</BText>
 <BText style={s.readySubtitle}>{ob.readySubtitle}</BText>
 </View>
 </View>
 )}
 </Layout>
 );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProfileOnboarding({ onDone, lang = 'es' }) {
 const ob = (T[lang] || T.es).onboarding;
 const [step, setStep] = useState(1);
 const [data, setData] = useState({});
 const [saving, setSaving] = useState(false);

 const save = (partial) => setData(prev => ({ ...prev, ...partial }));

 const finish = async () => {
 setSaving(true);
 await onDone({ ...data, profileOnboardingComplete: true });
 setSaving(false);
 };

 const props = { data, save, ob };

 if (step === 1) return <Step1 {...props} lang={lang} onBack={() => {}} onNext={() => setStep(2)} />;
 if (step === 2) return <Step2 {...props} onBack={() => setStep(1)} onNext={() => setStep(3)} />;
 if (step === 3) return <Step3 {...props} onBack={() => setStep(2)} onNext={() => setStep(4)} />;
 if (step === 4) return <Step4 {...props} onBack={() => setStep(3)} onNext={() => setStep(5)} />;
 if (step === 5) return <Step5 {...props} onBack={() => setStep(4)} onFinish={finish} saving={saving} />;
 return null;
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
 safe: { flex: 1, backgroundColor: '#0F1F4A' },
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
 back: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: F.body },
 stepCounter: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: F.bodyB },
 progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 20, borderRadius: 2, marginBottom: 24 },
 progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 2 },
 scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
 title: { fontSize: 26, fontFamily: F.bodyB, color: 'white', marginBottom: 6 },
 subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 22, fontFamily: F.body },
 footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
 nextBtn: { backgroundColor: 'white', borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
 nextBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.25)' },
 nextLabel: { fontSize: 16, fontFamily: F.bodyB, color: '#429FE7' },
 nextLabelDisabled: { color: 'rgba(255,255,255,0.4)' },
 secLabel: { fontSize: 11, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
 input: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 50, paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, color: 'white', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', fontFamily: F.body },
 card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 8, gap: 12 },
 cardSelected: { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'white' },
 cardIcon: { fontSize: 22, width: 30, textAlign: 'center', fontFamily: F.body },
 cardLabel: { fontSize: 15, fontFamily: F.bodyB, color: 'white' },
 cardLabelSelected: { color: '#429FE7' },
 cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontFamily: F.body },
 cardDescSelected: { color: '#737373' },
 cardCheck: { fontSize: 16, color: '#429FE7', fontFamily: F.bodyB },
 chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
 chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', margin: 4 },
 chipSelected: { backgroundColor: 'white', borderColor: 'white' },
 chipDanger: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
 chipLabel: { fontSize: 13, color: 'white', fontFamily: F.body },
 chipLabelSelected: { color: '#429FE7' },
 yesnoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
 yesnoLabel: { fontSize: 14, color: 'white', flex: 1, paddingRight: 12, fontFamily: F.body },
 yesnoButtons: { flexDirection: 'row', gap: 8 },
 yesnoBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
 yesnoBtnActive: { backgroundColor: 'white', borderColor: 'white' },
 yesnoBtnText: { fontSize: 13, color: 'white', fontFamily: F.bodyB },
 yesnoBtnTextActive: { color: '#429FE7' },
 infoBanner: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
 infoBannerText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19, fontFamily: F.body },
 allergyWarning: { fontSize: 12, color: '#FCA5A5', marginBottom: 8, lineHeight: 18, fontFamily: F.body },
 noteText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6, fontStyle: 'italic', fontFamily: F.body },
 mhNote: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 19, marginBottom: 10, fontStyle: 'italic', fontFamily: F.body },
 readyBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
 readyTitle: { fontSize: 15, fontFamily: F.bodyB, color: 'white', marginBottom: 4 },
 readySubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18, fontFamily: F.body },

 // Semana de gestación
 trimesterHeader: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 6 },
 trimesterLabel: { fontSize: 11, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.6 },
 weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 weekChip: { width: 52, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
 weekChipSelected: { backgroundColor: '#429FE7', borderColor: '#429FE7' },
 weekChipTxt: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: F.bodyB },
 weekChipTxtSelected: { color: 'white' },
 weekSelectedBanner: { backgroundColor: 'rgba(66,159,231,0.2)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(66,159,231,0.4)' },
 weekSelectedTxt: { fontSize: 14, color: 'white', fontFamily: F.bodyB, textAlign: 'center' },
});
