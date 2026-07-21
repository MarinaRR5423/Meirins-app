import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Check } from 'lucide-react-native';
import T from '../../i18n/translations';

const TOTAL = 5;

// ── Componentes reutilizables ─────────────────────────────────────────────────

function Layout({ step, title, subtitle, onBack, onNext, nextLabel, backLabel = '← Volver', nextDisabled = false, children }) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.back}>{backLabel}</Text>
          </TouchableOpacity>
          <Text style={s.stepCounter}>{step}/{TOTAL}</Text>
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
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          <View style={{ gap: 20 }}>{children}</View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            onPress={onNext}
            disabled={nextDisabled}
            style={[s.nextBtn, nextDisabled && s.nextBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={[s.nextLabel, nextDisabled && s.nextLabelDisabled]}>{nextLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CardOption({ icon, label, description, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.card, selected && s.cardSelected]} activeOpacity={0.8}>
      {icon ? <Text style={s.cardIcon}>{icon}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[s.cardLabel, selected && s.cardLabelSelected]}>{label}</Text>
        {description ? <Text style={[s.cardDesc, selected && s.cardDescSelected]}>{description}</Text> : null}
      </View>
      {selected && <Check size={16} color="#1A56DB" />}
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
      <Text style={[s.chipLabel, selected && s.chipLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function YesNo({ label, value, onChange, yesLabel = 'Sí', noLabel = 'No' }) {
  return (
    <View style={s.yesnoRow}>
      <Text style={s.yesnoLabel}>{label}</Text>
      <View style={s.yesnoButtons}>
        <TouchableOpacity onPress={() => onChange(true)} style={[s.yesnoBtn, value === true && s.yesnoBtnActive]}>
          <Text style={[s.yesnoBtnText, value === true && s.yesnoBtnTextActive]}>{yesLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onChange(false)} style={[s.yesnoBtn, value === false && s.yesnoBtnActive]}>
          <Text style={[s.yesnoBtnText, value === false && s.yesnoBtnTextActive]}>{noLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SecLabel({ children }) {
  return <Text style={s.secLabel}>{children}</Text>;
}

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// ── Pantallas ─────────────────────────────────────────────────────────────────

const LIFE_STAGE_ICONS = { adult: '👩', teen: '🌱', perimenopause: '🌅', menopause: '🌸', postpartum: '🤱', pregnant: '🤰' };

function Step1({ data, save, onBack, onNext, ob }) {
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
          <View style={s.infoBanner}>
            <Text style={s.infoBannerText}>{ob.pregnantBanner}</Text>
          </View>
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
        <Text style={s.mhNote}>{ob.mhNote}</Text>
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
        <Text style={s.allergyWarning}>{ob.allergyWarning}</Text>
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
        {data.hasSIBS && <Text style={s.noteText}>{ob.ibsNote}</Text>}
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
          <Text style={{ fontSize: 22 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.readyTitle}>{ob.readyTitle}</Text>
            <Text style={s.readySubtitle}>{ob.readySubtitle}</Text>
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

  if (step === 1) return <Step1 {...props} onBack={() => {}} onNext={() => setStep(2)} />;
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
  back: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  stepCounter: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 20, borderRadius: 2, marginBottom: 24 },
  progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 2 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: 'white', marginBottom: 6 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  nextBtn: { backgroundColor: 'white', borderRadius: 50, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.25)' },
  nextLabel: { fontSize: 16, fontWeight: '700', color: '#1A56DB' },
  nextLabelDisabled: { color: 'rgba(255,255,255,0.4)' },
  secLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 50, paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, color: 'white', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 8, gap: 12 },
  cardSelected: { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'white' },
  cardIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  cardLabel: { fontSize: 15, fontWeight: '600', color: 'white' },
  cardLabelSelected: { color: '#1A56DB' },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  cardDescSelected: { color: '#475569' },
  cardCheck: { fontSize: 16, color: '#1A56DB', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', margin: 4 },
  chipSelected: { backgroundColor: 'white', borderColor: 'white' },
  chipDanger: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  chipLabel: { fontSize: 13, color: 'white', fontWeight: '500' },
  chipLabelSelected: { color: '#1A56DB' },
  yesnoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  yesnoLabel: { fontSize: 14, color: 'white', flex: 1, paddingRight: 12 },
  yesnoButtons: { flexDirection: 'row', gap: 8 },
  yesnoBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  yesnoBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  yesnoBtnText: { fontSize: 13, color: 'white', fontWeight: '600' },
  yesnoBtnTextActive: { color: '#1A56DB' },
  infoBanner: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  infoBannerText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
  allergyWarning: { fontSize: 12, color: '#FCA5A5', marginBottom: 8, lineHeight: 18 },
  noteText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6, fontStyle: 'italic' },
  mhNote: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 19, marginBottom: 10, fontStyle: 'italic' },
  readyBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  readyTitle: { fontSize: 15, fontWeight: '700', color: 'white', marginBottom: 4 },
  readySubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
});
