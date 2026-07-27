/**
 * TabSetupCard — tarjeta inline que aparece en la parte superior de una pestaña
 * cuando faltan datos necesarios para esa pestaña.
 * Se pliega/despliega y desaparece cuando el usuario guarda los datos.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, SafeAreaView, Platform, ImageBackground,
} from 'react-native';
import { Check, X, ChevronRight, Calendar, CalendarDays } from 'lucide-react-native';
import T from '../i18n/translations';
import { F } from '../theme/fonts';
import RangeCalendar from './RangeCalendar';
import TrainerCard from './TrainerCard';
import { useDiets, DIET_CATEGORIES, normalizeDietId } from '../hooks/useDiets';
import { ALL_MEALS, MEAL_LABELS, getActiveMeals } from '../utils/fastingMeals';

// ── Catálogos compartidos para CicloSetupCard y CicloHealthCard ────────────────
const LIFE_STAGES_NEW = [
  { v: 'reproductive',  l: { es: 'Reproductiva',   en: 'Reproductive',   fr: 'Reproductive',   it: 'Riproduttiva' } },
  { v: 'perimenopause', l: { es: 'Perimenopausia', en: 'Perimenopause',  fr: 'Périménopause',  it: 'Perimenopausa' } },
  { v: 'menopause',     l: { es: 'Menopausia',     en: 'Menopause',      fr: 'Ménopause',      it: 'Menopausa' } },
  { v: 'postmenopause', l: { es: 'Postmenopausia', en: 'Postmenopause',  fr: 'Post-ménopause', it: 'Postmenopausa' } },
  { v: 'pregnant',      l: { es: 'Embarazo',       en: 'Pregnancy',      fr: 'Grossesse',      it: 'Gravidanza' } },
  { v: 'postpartum',    l: { es: 'Post embarazo',  en: 'Postpartum',     fr: 'Post-partum',    it: 'Post-parto' } },
];

const CONTRA_OPTIONS_NEW = [
  { v: 'pill',          l: { es: '💊 Píldora contraceptiva', en: '💊 Contraceptive pill', fr: '💊 Pilule contraceptive', it: '💊 Pillola contraccettiva' } },
  { v: 'hormonal_iud',  l: { es: '🌀 DIU hormonal',          en: '🌀 Hormonal IUD',       fr: '🌀 Stérilet hormonal',    it: '🌀 IUD ormonale' } },
  { v: 'copper_iud',    l: { es: '🔩 DIU de cobre',          en: '🔩 Copper IUD',         fr: '🔩 Stérilet au cuivre',   it: '🔩 IUD al rame' } },
  { v: 'ring',          l: { es: '⭕ Anillo vaginal',         en: '⭕ Vaginal ring',        fr: '⭕ Anneau vaginal',        it: '⭕ Anello vaginale' } },
  { v: 'patch',         l: { es: '🩹 Parche',                 en: '🩹 Patch',              fr: '🩹 Patch',                it: '🩹 Cerotto' } },
  { v: 'implant',       l: { es: '📌 Implante',               en: '📌 Implant',            fr: '📌 Implant',              it: '📌 Impianto' } },
];

// Helper para traducir labels multilingüe
const tr = (obj, lang) => obj?.[lang] || obj?.es || '';

// Top 10 complementos alimentarios + "Otros"
const SUPPLEMENTS_OPTIONS = [
  { v: 'omega3',        l: { es: '🐟 Omega-3',           en: '🐟 Omega-3',          fr: '🐟 Oméga-3',          it: '🐟 Omega-3' } },
  { v: 'vitamin_d',     l: { es: '☀️ Vitamina D',         en: '☀️ Vitamin D',         fr: '☀️ Vitamine D',         it: '☀️ Vitamina D' } },
  { v: 'magnesium',     l: { es: '🧂 Magnesio',           en: '🧂 Magnesium',         fr: '🧂 Magnésium',          it: '🧂 Magnesio' } },
  { v: 'iron',          l: { es: '🩸 Hierro',             en: '🩸 Iron',              fr: '🩸 Fer',                it: '🩸 Ferro' } },
  { v: 'vitamin_b12',   l: { es: '⚡ Vitamina B12',        en: '⚡ Vitamin B12',        fr: '⚡ Vitamine B12',        it: '⚡ Vitamina B12' } },
  { v: 'creatine',      l: { es: '💪 Creatina',           en: '💪 Creatine',          fr: '💪 Créatine',           it: '💪 Creatina' } },
  { v: 'whey_protein',  l: { es: '🥤 Proteína Whey',      en: '🥤 Whey protein',      fr: '🥤 Protéine Whey',      it: '🥤 Proteine Whey' } },
  { v: 'multivitamin',  l: { es: '💊 Multivitamínico',    en: '💊 Multivitamin',      fr: '💊 Multivitamines',     it: '💊 Multivitaminico' } },
  { v: 'probiotics',    l: { es: '🦠 Probióticos',        en: '🦠 Probiotics',        fr: '🦠 Probiotiques',       it: '🦠 Probiotici' } },
  { v: 'collagen',      l: { es: '✨ Colágeno',           en: '✨ Collagen',           fr: '✨ Collagène',           it: '✨ Collagene' } },
];

const BLUE = '#1A56DB';
const BG   = '#0F1F4A';

// ─── Componentes internos ─────────────────────────────────────────────────────

function OptionCard({ label, desc, icon, selected, onPress, variant = 'default' }) {
  if (variant === 'azote') {
    return (
      <TouchableOpacity onPress={onPress}
        style={[s.optCardAzote, selected && s.optCardAzoteActive]} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={s.optLabelAzote}>{label}</Text>
          {desc ? <Text style={s.optDescAzote}>{desc}</Text> : null}
        </View>
        <View style={[s.radioBase, selected && s.radioBaseActive]}>
          {selected && <View style={s.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress}
      style={[s.optCard, selected && s.optCardActive]} activeOpacity={0.8}>
      {icon ? <Text style={s.optIcon}>{icon}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[s.optLabel, selected && s.optLabelActive]}>{label}</Text>
        {desc ? <Text style={s.optDesc}>{desc}</Text> : null}
      </View>
      {selected && <Check size={16} color="#1A56DB" />}
    </TouchableOpacity>
  );
}

function Chip({ label, selected, onPress, danger, variant = 'default' }) {
  if (variant === 'azote') {
    return (
      <TouchableOpacity onPress={onPress} style={[s.chipAzote, selected && s.chipAzoteActive]}>
        <Text style={[s.chipAzoteLabel, selected && s.chipAzoteLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress}
      style={[s.chip, selected && (danger ? s.chipDanger : s.chipActive)]}>
      <Text style={[s.chipLabel, selected && s.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DayPicker({ trainDays, onToggle, dayLetters, variant = 'default' }) {
  if (variant === 'azote') {
    return (
      <View style={s.daysRowAzote}>
        {[0, 1, 2, 3, 4, 5, 6].map(d => {
          const on = trainDays.includes(d);
          return (
            <TouchableOpacity key={d} onPress={() => onToggle(d)}
              style={[s.dayBtnAzote, on && s.dayBtnAzoteActive]}>
              <Text style={[s.dayLetterAzote, on && s.dayLetterAzoteActive]}>{dayLetters[d]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
  return (
    <View style={s.daysRow}>
      {[0, 1, 2, 3, 4, 5, 6].map(d => {
        const on = trainDays.includes(d);
        return (
          <TouchableOpacity key={d} onPress={() => onToggle(d)}
            style={[s.dayBtn, on && s.dayBtnActive]}>
            <Text style={[s.dayLetter, on && s.dayLetterActive]}>{dayLetters[d]}</Text>
            <Text style={{ fontSize: 12, marginTop: 2 }}>{on ? '💪' : '😴'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Modal de contenido ───────────────────────────────────────────────────────

function SetupModal({ visible, onClose, title, children, variant = 'default' }) {
  const azote = variant === 'azote';
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[s.modal, azote && s.modalAzote]}>
        <View style={[s.modalHeader, azote && s.modalHeaderAzote]}>
          <Text style={[s.modalTitle, azote && s.modalTitleAzote]}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, azote && s.closeBtnAzote]}>
            <X size={16} color={azote ? '#0A0A0A' : '#64748B'} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── CICLO ────────────────────────────────────────────────────────────────────
export function CicloSetupCard({ lang, lastPeriod, setLastPeriod, cycleLength, setCycleLength, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const [open, setOpen]             = useState(false);
  const [rangeStart, setRangeStart] = useState(lastPeriod || null);
  const [rangeEnd, setRangeEnd]     = useState(profileExtended?.periodEnd || null);
  const [lifeStage, setLifeStage]   = useState(profileExtended?.lifeStage || '');
  const [conditions, setConditions] = useState(profileExtended?.conditions || []);
  const [contraUse, setContraUse]   = useState(profileExtended?.contraUse ?? null);   // true | false | null
  const [contraType, setContraType] = useState(profileExtended?.contraType || '');
  const [saving, setSaving]         = useState(false);

  const toggleCondition = (v) =>
    conditions.includes(v) ? setConditions(conditions.filter(x => x !== v)) : setConditions([...conditions, v]);

  const save = async () => {
    if (!rangeStart) return;
    setSaving(true);
    await setLastPeriod(rangeStart);
    if (saveProfileExtended) {
      await saveProfileExtended({
        periodEnd: rangeEnd || null,
        lifeStage, conditions, contraUse, contraType,
      });
    }
    setSaving(false);
    setOpen(false);
  };

  if (lastPeriod) return null;

  const txt = {
    emptyTitle: { es: 'Registra tu primer ciclo', en: 'Log your first cycle', fr: 'Enregistre ton premier cycle', it: 'Registra il tuo primo ciclo' }[lang] || 'Registra tu primer ciclo',
    emptySub:   { es: 'Añade la fecha de tu último período y desbloquea tu programa personalizado', en: 'Add the date of your last period to unlock your personalised programme', fr: 'Ajoute la date de tes dernières règles pour débloquer ton programme personnalisé', it: 'Aggiungi la data del tuo ultimo ciclo per sbloccare il tuo programma personalizzato' }[lang] || 'Añade la fecha de tu último período y desbloquea tu programa personalizado',
    emptyCta:   { es: 'Registrar', en: 'Log it', fr: 'Enregistrer', it: 'Registra' }[lang] || 'Registrar',
    modalTitle:  { es: '🌙 Tu ciclo', en: '🌙 Your cycle', fr: '🌙 Ton cycle', it: '🌙 Il tuo ciclo' }[lang] || '🌙 Tu ciclo',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  const canSave = !!rangeStart;

  // Resiembra desde el perfil actual al abrir (el perfil llega async)
  const openModal = () => {
    const cur = profileExtended || {};
    setRangeStart(lastPeriod || null);
    setRangeEnd(cur.periodEnd || null);
    setLifeStage(cur.lifeStage || '');
    setConditions(cur.conditions || []);
    setContraUse(cur.contraUse ?? null);
    setContraType(cur.contraType || '');
    setOpen(true);
  };

  return (
    <>
      <View style={s.cicloEmptyCard}>
        <View style={s.cicloEmptyAvatar}>
          <Calendar size={22} color="white" strokeWidth={2.2} />
        </View>
        <Text style={s.cicloEmptyTitle}>{txt.emptyTitle}</Text>
        <Text style={s.cicloEmptySub}>{txt.emptySub}</Text>
        <TouchableOpacity style={s.cicloEmptyBtn} onPress={openModal} activeOpacity={0.85}>
          <Text style={s.cicloEmptyBtnTxt}>{txt.emptyCta}</Text>
        </TouchableOpacity>
      </View>

      <SetupModal visible={open} onClose={() => setOpen(false)} title={txt.modalTitle} variant="azote">

        {/* ── Calendario de período (inicio + fin) ── */}
        <Text style={s.secLabelAzote}>
          {lang === 'en' ? 'Your last period'
           : lang === 'fr' ? 'Tes dernières règles'
           : lang === 'it' ? 'Il tuo ultimo ciclo'
           : 'Tu último período'}
        </Text>
        <RangeCalendar
          start={rangeStart}
          end={rangeEnd}
          onChange={(st, en) => { setRangeStart(st); setRangeEnd(en); }}
          color="#49CF38"
          lang={lang}
        />

        {/* ── Etapa vital ── */}
        <Text style={[s.secLabelAzote, { marginTop: 28 }]}>
          {lang === 'en' ? 'Your life stage'
           : lang === 'fr' ? 'Ta phase de vie'
           : lang === 'it' ? 'La tua fase di vita'
           : 'Tu etapa vital'}
        </Text>
        <View style={{ gap: 2 }}>
          {LIFE_STAGES_NEW.map(o => (
            <OptionCard key={o.v} variant="azote" label={tr(o.l, lang)} selected={lifeStage === o.v} onPress={() => setLifeStage(o.v)} />
          ))}
        </View>
        {lifeStage === 'pregnant' && ob?.pregnantBanner &&
          <Text style={s.pregnantBanner}>{ob.pregnantBanner}</Text>}

        {/* ── Condiciones ── */}
        {ob?.conditions && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.conditionsLabel}</Text>
          <View style={s.chips}>
            {ob.conditions.map(o => (
              <Chip key={o.v} variant="azote" label={o.l} selected={conditions.includes(o.v)} onPress={() => toggleCondition(o.v)} />
            ))}
          </View>
        </>}

        {/* ── Contracepción ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Contraception'
           : lang === 'fr' ? 'Contraception'
           : lang === 'it' ? 'Contraccezione'
           : 'Contracepción'}
        </Text>
        <View style={{ gap: 2 }}>
          <OptionCard variant="azote" label={txt.yesLabel} selected={contraUse === true} onPress={() => setContraUse(true)} />
          <OptionCard variant="azote" label={txt.noLabel} selected={contraUse === false} onPress={() => { setContraUse(false); setContraType(''); }} />
        </View>
        {contraUse === true && (
          <View style={[s.chips, { marginTop: 10 }]}>
            {CONTRA_OPTIONS_NEW.map(o => (
              <Chip key={o.v} variant="azote" label={tr(o.l, lang)} selected={contraType === o.v} onPress={() => setContraType(o.v)} />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[s.saveBtnAzote, (!canSave || saving) && { opacity: 0.45 }]}
          onPress={save} disabled={!canSave || saving}>
          <Text style={s.saveBtnAzoteTxt}>{saving ? '…' : (p.common?.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── CICLO HEALTH (secundaria, para usuarios con fecha pero sin datos de salud) ──
export function CicloHealthCard({ lang, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const [open, setOpen]             = useState(false);
  const [lifeStage, setLifeStage]   = useState(profileExtended?.lifeStage || '');
  const [conditions, setConditions] = useState(profileExtended?.conditions || []);
  const [contraUse, setContraUse]   = useState(profileExtended?.contraUse ?? null);
  const [contraType, setContraType] = useState(profileExtended?.contraType || '');
  const [saving, setSaving]         = useState(false);

  if (profileExtended?.lifeStage) return null;

  const toggleCondition = (v) =>
    conditions.includes(v) ? setConditions(conditions.filter(x => x !== v)) : setConditions([...conditions, v]);

  const save = async () => {
    setSaving(true);
    await saveProfileExtended({ lifeStage, conditions, contraUse, contraType });
    setSaving(false);
    setOpen(false);
  };

  const txt = {
    bannerTitle: { es: 'Tu salud menstrual', en: 'Your menstrual health', fr: 'Ta santé menstruelle', it: 'La tua salute mestruale' }[lang] || 'Tu salud menstrual',
    bannerSub:   { es: 'Condiciones, síndromes y anticoncepción', en: 'Conditions, syndromes & contraception', fr: 'Conditions, syndromes et contraception', it: 'Condizioni, sindromi e contraccezione' }[lang] || 'Condiciones, síndromes y anticoncepción',
    modalTitle:  { es: '🩺 Salud menstrual', en: '🩺 Menstrual health', fr: '🩺 Santé menstruelle', it: '🩺 Salute mestruale' }[lang] || '🩺 Salud menstrual',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  return (
    <>
      <TouchableOpacity style={[s.banner, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}>🩺</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.bannerTitle, { color: '#9F1239' }]}>{txt.bannerTitle}</Text>
          <Text style={[s.bannerSub, { color: '#FB7185' }]}>{txt.bannerSub}</Text>
        </View>
        <ChevronRight size={20} color="#9F1239" />
      </TouchableOpacity>

      <SetupModal visible={open} onClose={() => setOpen(false)} title={txt.modalTitle}>

        {/* Etapa vital — opciones nuevas */}
        <Text style={s.secLabel}>
          {lang === 'en' ? 'YOUR LIFE STAGE' : lang === 'fr' ? 'TA PHASE DE VIE' : lang === 'it' ? 'LA TUA FASE DI VITA' : 'TU ETAPA VITAL'}
        </Text>
        {LIFE_STAGES_NEW.map(o => (
          <OptionCard key={o.v} label={tr(o.l, lang)} selected={lifeStage === o.v} onPress={() => setLifeStage(o.v)} />
        ))}
        {lifeStage === 'pregnant' && ob?.pregnantBanner &&
          <Text style={s.pregnantBanner}>{ob.pregnantBanner}</Text>}

        {ob?.conditions && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.conditionsLabel}</Text>
          <View style={s.chips}>
            {ob.conditions.map(o => (
              <Chip key={o.v} label={o.l} selected={conditions.includes(o.v)} onPress={() => toggleCondition(o.v)} />
            ))}
          </View>
        </>}

        {/* Contracepción — opciones nuevas */}
        <Text style={[s.secLabel, { marginTop: 20 }]}>
          {lang === 'en' ? 'CONTRACEPTION' : lang === 'fr' ? 'CONTRACEPTION' : lang === 'it' ? 'CONTRACCEZIONE' : 'CONTRACEPCIÓN'}
        </Text>
        <Text style={s.secSub}>
          {lang === 'en' ? 'Do you use any?' : lang === 'fr' ? 'En utilises-tu une ?' : lang === 'it' ? 'Ne usi una?' : '¿Usas alguna?'}
        </Text>
        <View style={s.yesNoRow}>
          <TouchableOpacity style={[s.yesNoBtn, contraUse === true  && s.yesNoBtnActive]} onPress={() => setContraUse(true)}>
            <Text style={[s.yesNoTxt, contraUse === true  && s.yesNoTxtActive]}>{txt.yesLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.yesNoBtn, contraUse === false && s.yesNoBtnActive]} onPress={() => { setContraUse(false); setContraType(''); }}>
            <Text style={[s.yesNoTxt, contraUse === false && s.yesNoTxtActive]}>{txt.noLabel}</Text>
          </TouchableOpacity>
        </View>
        {contraUse === true && (
          <View style={[s.chips, { marginTop: 10 }]}>
            {CONTRA_OPTIONS_NEW.map(o => (
              <Chip key={o.v} label={tr(o.l, lang)} selected={contraType === o.v} onPress={() => setContraType(o.v)} />
            ))}
          </View>
        )}

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnTxt}>{saving ? '…' : (p.common?.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── NUTRICIÓN ────────────────────────────────────────────────────────────────
export function NutriSetupCard({ lang, profileExtended, saveAll, saveProfileExtended, activityLevel, goal, dietary }) {
  const p    = T[lang] || T.es;
  const ob   = p.onboarding;
  const L    = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

  // 19 dietas + ayunos desde Supabase
  const { diets: allDiets, dietsByCategory } = useDiets(lang);

  // ── Hooks ANTES de cualquier return condicional ────────────────────────────
  const [open, setOpen]                 = useState(false);
  const [localDiet, setLocalDiet]       = useState(profileExtended?.diet            || '');
  const [localFasting, setFasting]      = useState(profileExtended?.fastingProtocol || '');
  const [localModifiers, setModifiers]  = useState(profileExtended?.dietModifiers   || []);
  const [localMealsActive, setMealsAct] = useState(profileExtended?.mealsActive     || null);
  const [localAllergies, setAllergies]  = useState(profileExtended?.allergies       || []);
  const [localDislikes, setDislikes]    = useState(profileExtended?.foodDislikes    || []);
  const [localCooking, setCooking]      = useState(profileExtended?.cookingTime     || '');
  const [localBudget, setBudget]        = useState(profileExtended?.weeklyBudget    || '');
  const [localBatch, setBatch]          = useState(!!profileExtended?.batchCooking);
  const [localSupps, setSupps]          = useState(profileExtended?.supplements     || []);
  const [localSuppsOther, setSuppsOther]= useState(profileExtended?.supplementsOther|| '');
  const [saving, setSaving]             = useState(false);

  const hasNutriData = !!profileExtended?.diet;

  const toggleArr = (arr, set, val) =>
    arr.includes(val) ? set(arr.filter(x => x !== val)) : set([...arr, val]);

  const save = async () => {
    setSaving(true);
    await saveProfileExtended({
      diet: localDiet,
      fastingProtocol: localFasting,
      dietModifiers: localModifiers,
      mealsActive: localMealsActive,
      allergies: localAllergies,
      foodDislikes: localDislikes,
      cookingTime: localCooking,
      weeklyBudget: localBudget,
      batchCooking: localBatch,
      supplements: localSupps,
      supplementsOther: localSupps.includes('other') ? localSuppsOther.trim() : '',
    });
    setSaving(false);
    setOpen(false);
  };

  // Comidas que hace (auto-derivadas del ayuno o personalizadas)
  const mealsAuto    = getActiveMeals(localFasting, null);
  const currentMeals = localMealsActive ?? mealsAuto;
  const usingCustom  = localMealsActive !== null && localMealsActive !== undefined;
  const toggleMeal = (mealId) => {
    const base = localMealsActive ?? mealsAuto;
    const next = base.includes(mealId) ? base.filter(x => x !== mealId) : [...base, mealId];
    setMealsAct(next.length === 0 ? null : next);
  };

  // Resiembra los estados desde el perfil ACTUAL al abrir (el perfil llega
  // async de Supabase; guardar con estados de montaje vacíos borraría datos)
  const openModal = () => {
    const cur = profileExtended || {};
    setLocalDiet(cur.diet || '');
    setFasting(cur.fastingProtocol || '');
    setModifiers(cur.dietModifiers || []);
    setMealsAct(cur.mealsActive || null);
    setAllergies(cur.allergies || []);
    setDislikes(cur.foodDislikes || []);
    setCooking(cur.cookingTime || '');
    setBudget(cur.weeklyBudget || '');
    setBatch(!!cur.batchCooking);
    setSupps(cur.supplements || []);
    setSuppsOther(cur.supplementsOther || '');
    setOpen(true);
  };

  const emptyTxt = {
    title: L('Configura tu nutrición', 'Set up your nutrition', 'Configure ta nutrition', 'Configura la tua nutrizione'),
    sub:   L('Configura tus preferencias para que nos podamos adaptar a tus necesidades y gustos',
             'Set your preferences so we can adapt to your needs and tastes',
             'Configure tes préférences pour qu\'on puisse s\'adapter à tes besoins et goûts',
             'Configura le tue preferenze così possiamo adattarci alle tue esigenze e gusti'),
    cta:   L('Configurar nutrición', 'Set up nutrition', 'Configurer la nutrition', 'Configura nutrizione'),
  };

  return (
    <>
      {!hasNutriData ? (
        <ImageBackground
          source={require('../../assets/phases/ovulation.png')}
          style={s.nutriEmptyCard}
          imageStyle={{ borderRadius: 24 }}
        >
          <View style={s.nutriEmptyOverlay} />
          <Text style={s.nutriEmptyTitle}>{L('Plan de nutrición', 'Nutrition Plan', 'Plan de nutrition', 'Piano nutrizionale')}</Text>
          <Text style={s.nutriEmptySub}>{emptyTxt.sub}</Text>
          <TouchableOpacity style={s.nutriEmptyBtn} onPress={openModal} activeOpacity={0.85}>
            <Text style={s.nutriEmptyBtnTxt}>{emptyTxt.cta}</Text>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <TouchableOpacity style={s.gymEditBanner} onPress={openModal} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.gymEditBannerTitle}>
              {L('Editar tu nutrición', 'Edit your nutrition', 'Modifie ta nutrition', 'Modifica la tua nutrizione')}
            </Text>
            <Text style={s.gymEditBannerSub}>
              {L('Dieta, ayuno, comidas y complementos', 'Diet, fasting, meals and supplements', 'Régime, jeûne, repas et compléments', 'Dieta, digiuno, pasti e integratori')}
            </Text>
          </View>
          <ChevronRight size={20} color="#0A0A0A" />
        </TouchableOpacity>
      )}

      <SetupModal visible={open} onClose={() => setOpen(false)} variant="azote"
        title={lang === 'en' ? 'Nutrition setup' : lang === 'fr' ? 'Nutrition' : lang === 'it' ? 'Nutrizione' : 'Nutrición'}>

        {/* ── DIETA BASE (19 opciones agrupadas) ── */}
        <Text style={s.secLabelAzote}>
          {lang === 'en' ? 'Your diet' : lang === 'fr' ? 'Ton régime' : lang === 'it' ? 'La tua dieta' : 'Tu dieta'}
        </Text>
        {allDiets.length > 0
          ? Object.entries(dietsByCategory)
              .filter(([cat]) => cat !== 'fasting')
              .map(([cat, catDiets]) => {
                const catInfo = DIET_CATEGORIES[cat] || { icon: '🍽️', label: { es: cat, en: cat } };
                return (
                  <View key={cat} style={{ marginBottom: 6 }}>
                    <Text style={s.dietCatLabel}>{catInfo.icon} {catInfo.label[lang] || catInfo.label.es}</Text>
                    <View style={{ gap: 2 }}>
                      {catDiets.map(d => {
                        const sel = normalizeDietId(localDiet) === d.id;
                        return (
                          <OptionCard key={d.id} variant="azote" label={`${d.icon} ${d.name[lang] || d.name.es}`}
                            selected={sel} onPress={() => setLocalDiet(sel ? '' : d.id)} />
                        );
                      })}
                    </View>
                  </View>
                );
              })
          : (ob?.diets || []).map(o => (
              <OptionCard key={o.v} variant="azote" label={`${o.ico} ${o.l}`} desc={o.d}
                selected={localDiet === o.v} onPress={() => setLocalDiet(o.v)} />
            ))
        }

        {/* ── PROTOCOLO DE AYUNO (opcional, combinable) ── */}
        {dietsByCategory?.['fasting']?.length > 0 && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
            {lang === 'en' ? 'Fasting protocol (optional)'
                : lang === 'fr' ? 'Protocole de jeûne (optionnel)'
                : lang === 'it' ? 'Protocollo di digiuno (opzionale)'
                : 'Protocolo de ayuno (opcional)'}
          </Text>
          <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
            {lang === 'en' ? 'Combinable with any diet above'
             : lang === 'fr' ? 'Combinable avec n\'importe quel régime'
             : 'Combinable con cualquier dieta'}
          </Text>
          <View style={{ gap: 2 }}>
            {dietsByCategory['fasting'].map(d => {
              const sel = localFasting === d.id;
              const fw  = d.fasting_window;
              return (
                <OptionCard key={d.id} variant="azote" label={`${d.icon} ${d.name[lang] || d.name.es}`}
                  desc={fw?.eating_hours ? `🍽 ${fw.eating_hours}h · 🚫 ${fw.fasting_hours}h` : undefined}
                  selected={sel} onPress={() => setFasting(sel ? '' : d.id)} />
              );
            })}
          </View>
        </>}

        {/* ── MODIFICADORES DE DIETA ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Dietary modifiers (optional)'
           : lang === 'fr' ? 'Modificateurs alimentaires (optionnel)'
           : lang === 'it' ? 'Modificatori dietetici (opzionale)'
           : 'Modificadores de dieta (opcional)'}
        </Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
          {lang === 'en' ? 'Combine with any diet. Only recipes that meet ALL selected filters will be shown.'
           : lang === 'fr' ? 'Combinables avec n\'importe quel régime. Seules les recettes qui respectent TOUS les filtres seront affichées.'
           : lang === 'it' ? 'Combinabili con qualsiasi dieta. Verranno mostrate solo le ricette che rispettano TUTTI i filtri selezionati.'
           : 'Combinables con cualquier dieta. Solo se mostrarán recetas que cumplan TODOS los filtros seleccionados.'}
        </Text>
        <View style={s.chips}>
          {[
            { v: 'gluten_free',       l: { es: '🌾 Sin gluten',       en: '🌾 Gluten-free',       fr: '🌾 Sans gluten',        it: '🌾 Senza glutine' } },
            { v: 'lactose_free',      l: { es: '🥛 Sin lactosa',      en: '🥛 Lactose-free',      fr: '🥛 Sans lactose',       it: '🥛 Senza lattosio' } },
            { v: 'low_fodmap',        l: { es: '🫘 Low FODMAP',       en: '🫘 Low FODMAP',        fr: '🫘 Low FODMAP',         it: '🫘 Low FODMAP' } },
            { v: 'anti_inflammatory', l: { es: '🌿 Antiinflamatoria', en: '🌿 Anti-inflammatory', fr: '🌿 Anti-inflammatoire',  it: '🌿 Antinfiammatoria' } },
          ].map(o => (
            <Chip key={o.v} variant="azote"
              label={o.l[lang] || o.l.es}
              selected={localModifiers.includes(o.v)}
              onPress={() => toggleArr(localModifiers, setModifiers, o.v)} />
          ))}
        </View>

        {/* ── COMIDAS DEL DÍA ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Meals you do' : lang === 'fr' ? 'Repas que tu fais' : lang === 'it' ? 'Pasti che fai' : 'Comidas que haces'}
        </Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
          {localFasting && !usingCustom
            ? (lang === 'en' ? 'Auto-set by your fasting. Tap to customise.' : 'Definido por tu ayuno. Toca para personalizar.')
            : (lang === 'en' ? 'Untick the meals you skip.' : 'Desmarca las comidas que te saltas.')}
        </Text>
        <View style={s.chips}>
          {ALL_MEALS.map(mealId => {
            const sel = currentMeals.includes(mealId);
            const label = MEAL_LABELS[mealId][lang] || MEAL_LABELS[mealId].es;
            return (
              <Chip key={mealId} variant="azote" label={`${sel ? '✓ ' : ''}${label}`} selected={sel}
                onPress={() => toggleMeal(mealId)} />
            );
          })}
        </View>

        {/* ── ALERGIAS ── */}
        {ob?.allergies && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.allergyLabel}</Text>
          <View style={s.chips}>
            {ob.allergies.map(o => <Chip key={o.v} variant="azote" label={o.l} danger
              selected={localAllergies.includes(o.v)}
              onPress={() => toggleArr(localAllergies, setAllergies, o.v)} />)}
          </View>
        </>}

        {/* ── ALIMENTOS QUE NO TE GUSTAN ── */}
        {ob?.dislikes && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.dislikesLabel}</Text>
          <View style={s.chips}>
            {ob.dislikes.map(o => <Chip key={o.v} variant="azote" label={o.l}
              selected={localDislikes.includes(o.v)}
              onPress={() => toggleArr(localDislikes, setDislikes, o.v)} />)}
          </View>
        </>}

        {/* ── TIEMPO DE COCINA ── */}
        {ob?.cooking && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.cookingLabel}</Text>
          <View style={{ gap: 2 }}>
            {ob.cooking.map(o => <OptionCard key={o.v} variant="azote" label={o.l}
              selected={localCooking === o.v} onPress={() => setCooking(o.v)} />)}
          </View>
        </>}

        {/* ── PRESUPUESTO SEMANAL ── */}
        {ob?.budgets && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.budgetLabel}</Text>
          <View style={{ gap: 2 }}>
            {ob.budgets.map(o => <OptionCard key={o.v} variant="azote" label={o.l}
              selected={localBudget === o.v} onPress={() => setBudget(o.v)} />)}
          </View>
        </>}

        {/* ── BATCH COOKING ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Batch cooking' : 'Batch cooking'}
        </Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
          {lang === 'en' ? 'Rotate menus A/B/Free for meal-prep cooking'
           : lang === 'fr' ? 'Rotation de menus A/B/Libre pour batch cooking'
           : lang === 'it' ? 'Rotazione menù A/B/Libero per batch cooking'
           : 'Rotación de menús A/B/Libre para cocinar por lotes'}
        </Text>
        <View style={{ gap: 2 }}>
          <OptionCard variant="azote" label={lang === 'en' ? 'Yes' : lang === 'fr' ? 'Oui' : 'Sí'} selected={localBatch} onPress={() => setBatch(true)} />
          <OptionCard variant="azote" label={lang === 'en' ? 'No' : lang === 'fr' ? 'Non' : 'No'} selected={!localBatch} onPress={() => setBatch(false)} />
        </View>

        {/* ── COMPLEMENTOS ALIMENTARIOS ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Supplements'
           : lang === 'fr' ? 'Compléments alimentaires'
           : lang === 'it' ? 'Integratori'
           : 'Complementos alimentarios'}
        </Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
          {lang === 'en' ? 'Do you take any? Select all that apply.'
           : lang === 'fr' ? 'En prends-tu ? Sélectionne tout ce qui s\'applique.'
           : lang === 'it' ? 'Ne prendi qualcuno? Seleziona tutti.'
           : '¿Tomas alguno? Selecciona los que correspondan.'}
        </Text>
        <View style={s.chips}>
          {SUPPLEMENTS_OPTIONS.map(o => (
            <Chip key={o.v} variant="azote" label={tr(o.l, lang)} selected={localSupps.includes(o.v)}
              onPress={() => toggleArr(localSupps, setSupps, o.v)} />
          ))}
          <Chip variant="azote"
            label={lang === 'en' ? '➕ Other' : lang === 'fr' ? '➕ Autre' : lang === 'it' ? '➕ Altro' : '➕ Otros'}
            selected={localSupps.includes('other')}
            onPress={() => toggleArr(localSupps, setSupps, 'other')}
          />
        </View>
        {localSupps.includes('other') && (
          <TextInput
            style={s.otherInputAzote}
            value={localSuppsOther}
            onChangeText={setSuppsOther}
            placeholder={lang === 'en' ? 'Which one(s)? Separate by commas'
              : lang === 'fr' ? 'Lequel/lesquels ? Séparés par virgules'
              : lang === 'it' ? 'Quale/quali? Separati da virgole'
              : '¿Cuáles? Separados por comas'}
            placeholderTextColor="#A3A3A3"
            multiline
          />
        )}

        <TouchableOpacity style={[s.saveBtnAzote, saving && { opacity: 0.45 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnAzoteTxt}>{saving ? '…' : (p.common.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── Catálogos del cuestionario deportivo según objetivo ─────────────────────
// 10 deportes con competiciones populares + Otro
const COMP_SPORTS = [
  { id: 'triathlon',     emoji: '🏊', label: { es: 'Triatlón',        en: 'Triathlon',      fr: 'Triathlon',        it: 'Triathlon' } },
  { id: 'marathon',      emoji: '🏃', label: { es: 'Maratón',         en: 'Marathon',       fr: 'Marathon',         it: 'Maratona' } },
  { id: 'half_marathon', emoji: '🎽', label: { es: 'Media maratón',   en: 'Half marathon',  fr: 'Semi-marathon',    it: 'Mezza maratona' } },
  { id: 'race_10k',      emoji: '👟', label: { es: 'Carrera 5K/10K',  en: '5K/10K race',    fr: 'Course 5K/10K',    it: 'Corsa 5K/10K' } },
  { id: 'trail',         emoji: '⛰️', label: { es: 'Trail running',   en: 'Trail running',  fr: 'Trail',            it: 'Trail running' } },
  { id: 'swimming',      emoji: '🌊', label: { es: 'Natación',        en: 'Swimming',       fr: 'Natation',         it: 'Nuoto' } },
  { id: 'cycling',       emoji: '🚴', label: { es: 'Ciclismo',        en: 'Cycling',        fr: 'Cyclisme',         it: 'Ciclismo' } },
  { id: 'duathlon',      emoji: '🚵', label: { es: 'Duatlón',         en: 'Duathlon',       fr: 'Duathlon',         it: 'Duathlon' } },
  { id: 'crossfit',      emoji: '🏋️', label: { es: 'CrossFit',        en: 'CrossFit',       fr: 'CrossFit',         it: 'CrossFit' } },
  { id: 'hyrox',         emoji: '🔥', label: { es: 'Hyrox',           en: 'Hyrox',          fr: 'Hyrox',            it: 'Hyrox' } },
  { id: 'other',         emoji: '➕', label: { es: 'Otro',            en: 'Other',          fr: 'Autre',            it: 'Altro' } },
];

const COMP_LEVELS = [
  { id: 'beginner',     emoji: '🌱', label: { es: 'Principiante',  en: 'Beginner',      fr: 'Débutante',     it: 'Principiante' } },
  { id: 'intermediate', emoji: '🏃', label: { es: 'Intermedio',    en: 'Intermediate',  fr: 'Intermédiaire', it: 'Intermedio' } },
  { id: 'advanced',     emoji: '💪', label: { es: 'Avanzado',      en: 'Advanced',      fr: 'Avancée',       it: 'Avanzato' } },
  { id: 'elite',        emoji: '🏆', label: { es: 'Élite',         en: 'Elite',         fr: 'Élite',         it: 'Élite' } },
];

// Deportes habituales para "¿qué deporte realizas?" (selección múltiple)
// Exportado: también lo usa GimnasioScreen para "añadir deporte extra"
export const SPORTS_LIST = [
  { id: 'running',   emoji: '🏃', label: { es: 'Running',            en: 'Running',          fr: 'Running',            it: 'Corsa' } },
  { id: 'gym',       emoji: '🏋️', label: { es: 'Musculación',        en: 'Weight training',  fr: 'Musculation',        it: 'Pesi' } },
  { id: 'yoga',      emoji: '🧘', label: { es: 'Yoga',               en: 'Yoga',             fr: 'Yoga',               it: 'Yoga' } },
  { id: 'pilates',   emoji: '🤸', label: { es: 'Pilates',            en: 'Pilates',          fr: 'Pilates',            it: 'Pilates' } },
  { id: 'swimming',  emoji: '🏊', label: { es: 'Natación',           en: 'Swimming',         fr: 'Natation',           it: 'Nuoto' } },
  { id: 'cycling',   emoji: '🚴', label: { es: 'Ciclismo',           en: 'Cycling',          fr: 'Vélo',               it: 'Ciclismo' } },
  { id: 'padel',     emoji: '🎾', label: { es: 'Pádel / Tenis',      en: 'Padel / Tennis',   fr: 'Padel / Tennis',     it: 'Padel / Tennis' } },
  { id: 'football',  emoji: '⚽', label: { es: 'Fútbol',             en: 'Football',         fr: 'Football',           it: 'Calcio' } },
  { id: 'rugby',     emoji: '🏉', label: { es: 'Rugby',              en: 'Rugby',            fr: 'Rugby',              it: 'Rugby' } },
  { id: 'basketball',emoji: '🏀', label: { es: 'Baloncesto',         en: 'Basketball',       fr: 'Basket',             it: 'Basket' } },
  { id: 'crossfit',  emoji: '🔥', label: { es: 'CrossFit / HIIT',    en: 'CrossFit / HIIT',  fr: 'CrossFit / HIIT',    it: 'CrossFit / HIIT' } },
  { id: 'dance',     emoji: '💃', label: { es: 'Baile',              en: 'Dance',            fr: 'Danse',              it: 'Danza' } },
  { id: 'hiking',    emoji: '🥾', label: { es: 'Senderismo',         en: 'Hiking',           fr: 'Randonnée',          it: 'Escursionismo' } },
  { id: 'martial',   emoji: '🥊', label: { es: 'Boxeo / Artes marciales', en: 'Boxing / Martial arts', fr: 'Boxe / Arts martiaux', it: 'Boxe / Arti marziali' } },
  { id: 'climbing',  emoji: '🧗', label: { es: 'Escalada',           en: 'Climbing',         fr: 'Escalade',           it: 'Arrampicata' } },
  { id: 'other',     emoji: '➕', label: { es: 'Otro',               en: 'Other',            fr: 'Autre',              it: 'Altro' } },
];

// Objetivos deportivos (mismos ids que el paso 3 del onboarding)
const SPORT_GOALS = [
  { id: 'competition', emoji: '🏆', label: { es: 'Competición',          en: 'Competition',   fr: 'Compétition',            it: 'Competizione' },      desc: { es: 'Preparación específica', en: 'Specific preparation', fr: 'Préparation spécifique', it: 'Preparazione specifica' } },
  { id: 'muscle',      emoji: '💪', label: { es: 'Ganar músculo',        en: 'Build muscle',  fr: 'Prendre du muscle',      it: 'Costruire muscolo' }, desc: { es: 'Fuerza e hipertrofia',   en: 'Strength and hypertrophy', fr: 'Force et hypertrophie', it: 'Forza e ipertrofia' } },
  { id: 'tone',        emoji: '✨', label: { es: 'Afinarme y tonificar', en: 'Tone up',       fr: "M'affiner et tonifier",  it: 'Tonificarmi' },       desc: { es: 'Definición y postura',   en: 'Definition and posture', fr: 'Définition et posture', it: 'Definizione e postura' } },
  { id: 'resume',      emoji: '🌱', label: { es: 'Retomar el deporte',   en: 'Resume sport',  fr: 'Reprendre le sport',     it: 'Riprendere lo sport' },desc: { es: 'Volver con seguridad',   en: 'Come back safely', fr: 'Revenir en sécurité', it: 'Tornare in sicurezza' } },
];

const LAST_SESSION_OPTIONS = [
  { id: 'less_1m',  label: { es: 'Hace menos de 1 mes',  en: 'Less than 1 month ago',  fr: 'Il y a moins d\'1 mois',  it: 'Meno di 1 mese fa' } },
  { id: '1_3m',     label: { es: 'Hace 1-3 meses',       en: '1-3 months ago',          fr: 'Il y a 1-3 mois',         it: '1-3 mesi fa' } },
  { id: '3_12m',    label: { es: 'Hace 3-12 meses',      en: '3-12 months ago',         fr: 'Il y a 3-12 mois',        it: '3-12 mesi fa' } },
  { id: 'more_1y',  label: { es: 'Hace más de 1 año',    en: 'More than a year ago',    fr: 'Il y a plus d\'1 an',     it: 'Più di un anno fa' } },
];

// ─── GIMNASIO ─────────────────────────────────────────────────────────────────
export function GymSetupCard({ lang, trainDays, setTrainDays, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const DAY_LETTERS = p.dayLetters || ['D','L','M','X','J','V','S'];

  const [open, setOpen]                 = useState(false);
  const [localDays, setLocalDays]       = useState(trainDays?.length > 0 ? trainDays : []);
  const [localFitness, setLocalFitness] = useState(profileExtended?.fitnessLevel || '');
  // gymAccess: acepta string (perfiles antiguos) o array (selección múltiple)
  const [localGym, setLocalGym]         = useState(
    Array.isArray(profileExtended?.gymAccess) ? profileExtended.gymAccess
      : profileExtended?.gymAccess ? [profileExtended.gymAccess] : []
  );
  const toggleGym = (v) =>
    setLocalGym(localGym.includes(v) ? localGym.filter(x => x !== v) : [...localGym, v]);
  const [saving, setSaving]             = useState(false);

  // Objetivo deportivo: viene del onboarding (paso 3) pero es editable aquí,
  // p. ej. si la usuaria cambia de competición u objetivo
  const [sportGoal, setSportGoal] = useState(profileExtended?.goals?.sport || '');
  const sp        = profileExtended?.sportProfile || {};

  // — Competición —
  const [compSport, setCompSport]           = useState(sp.competitionSport || '');
  const [compSportOther, setCompSportOther] = useState(sp.competitionSportOther || '');
  const [compDate, setCompDate]             = useState(sp.competitionDate || '');
  const [compDistance, setCompDistance]     = useState(sp.competitionDistance || '');
  const [compLevel, setCompLevel]           = useState(sp.competitionLevel || '');
  // — Retomar el deporte —
  const [lastSession, setLastSession]       = useState(sp.lastSession || '');
  const [hadInjury, setHadInjury]           = useState(sp.hadInjury || '');
  const [injuryDetail, setInjuryDetail]     = useState(sp.injuryDetail || '');
  // — Comunes (resume / muscle / tone) —
  // currentSports: array de ids; compat con el antiguo texto libre (currentSport)
  const [currentSports, setCurrentSports]         = useState(
    Array.isArray(sp.currentSports) ? sp.currentSports : []
  );
  const [currentSportOther, setCurrentSportOther] = useState(sp.currentSportOther || sp.currentSport || '');
  const toggleSport = (id) =>
    setCurrentSports(currentSports.includes(id) ? currentSports.filter(x => x !== id) : [...currentSports, id]);
  const [wantNewSport, setWantNewSport]       = useState(sp.wantNewSport || '');
  const [newSportDetail, setNewSportDetail]   = useState(sp.newSportDetail || '');

  // Atajo para textos inline en 4 idiomas
  const L = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

  // Una vez configurado, el banner se queda como acceso de edición (igual que Nutrición)
  const hasGymData = !!profileExtended?.gymSetupDone;

  const toggleDay = (d) => {
    if (localDays.includes(d)) {
      setLocalDays(localDays.filter(x => x !== d));   // sin mínimo — puede quedar vacío
    } else {
      if (localDays.length < 6) setLocalDays([...localDays, d].sort());
    }
  };

  const save = async () => {
    setSaving(true);
    await setTrainDays(localDays);
    const sportProfile = {
      competitionSport: compSport,
      competitionSportOther: compSport === 'other' ? compSportOther.trim() : '',
      competitionDate: compDate.trim(),
      competitionDistance: compDistance.trim(),
      competitionLevel: compLevel,
      lastSession,
      hadInjury,
      injuryDetail: hadInjury === 'yes' ? injuryDetail.trim() : '',
      currentSports,
      currentSportOther: currentSports.includes('other') ? currentSportOther.trim() : '',
      wantNewSport,
      newSportDetail: wantNewSport === 'yes' ? newSportDetail.trim() : '',
    };
    await saveProfileExtended({
      fitnessLevel: localFitness, gymAccess: localGym, sportProfile, gymSetupDone: true,
      goals: { ...(profileExtended?.goals || {}), sport: sportGoal },
    });
    setSaving(false);
    setOpen(false);
  };

  const noTrainingLabel = { es: 'Sin días fijos', en: 'No fixed days', fr: 'Pas de jours fixes', it: 'Nessun giorno fisso' }[lang] || 'Sin días fijos';
  const maxLabel        = { es: 'Máximo 6 días', en: 'Maximum 6 days', fr: 'Maximum 6 jours', it: 'Massimo 6 giorni' }[lang] || 'Máximo 6 días';

  // Resiembra los estados desde el perfil ACTUAL al abrir: el perfil llega
  // async de Supabase y los useState de montaje pueden haber quedado vacíos
  // (guardar con campos vacíos machacaría los datos reales).
  const openModal = () => {
    const cur = profileExtended || {};
    const curSp = cur.sportProfile || {};
    setLocalDays(trainDays?.length > 0 ? trainDays : []);
    setLocalFitness(cur.fitnessLevel || '');
    setLocalGym(Array.isArray(cur.gymAccess) ? cur.gymAccess : cur.gymAccess ? [cur.gymAccess] : []);
    setSportGoal(cur.goals?.sport || '');
    setCompSport(curSp.competitionSport || '');
    setCompSportOther(curSp.competitionSportOther || '');
    setCompDate(curSp.competitionDate || '');
    setCompDistance(curSp.competitionDistance || '');
    setCompLevel(curSp.competitionLevel || '');
    setLastSession(curSp.lastSession || '');
    setHadInjury(curSp.hadInjury || '');
    setInjuryDetail(curSp.injuryDetail || '');
    setCurrentSports(Array.isArray(curSp.currentSports) ? curSp.currentSports : []);
    setCurrentSportOther(curSp.currentSportOther || curSp.currentSport || '');
    setWantNewSport(curSp.wantNewSport || '');
    setNewSportDetail(curSp.newSportDetail || '');
    setOpen(true);
  };

  const emptyTxt = {
    title: L('Plan de entrenamiento', 'Training plan', 'Plan d\'entraînement', 'Piano di allenamento'),
    sub:   L('Configura tus preferencias para que nos podamos adaptar a tus necesidades y gustos',
             'Set your preferences so we can adapt to your needs and tastes',
             'Configure tes préférences pour qu\'on puisse s\'adapter à tes besoins et goûts',
             'Configura le tue preferenze così possiamo adattarci alle tue esigenze e gusti'),
    cta:   L('Configurar entrenamiento', 'Set up training', 'Configurer l\'entraînement', 'Configura allenamento'),
  };

  return (
    <>
      {!hasGymData ? (
        <View style={s.gymEmptyCard}>
          <View style={s.gymEmptyAvatar}>
            <CalendarDays size={22} color="white" strokeWidth={2.2} />
          </View>
          <Text style={s.gymEmptyTitle}>{emptyTxt.title}</Text>
          <Text style={s.gymEmptySub}>{emptyTxt.sub}</Text>
          <TouchableOpacity style={s.gymEmptyBtn} onPress={openModal} activeOpacity={0.85}>
            <Text style={s.gymEmptyBtnTxt}>{emptyTxt.cta}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.gymEditBanner} onPress={openModal} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.gymEditBannerTitle}>
              {L('Editar tu entrenamiento', 'Edit your training', 'Modifie ton entraînement', 'Modifica il tuo allenamento')}
            </Text>
            <Text style={s.gymEditBannerSub}>
              {L('Días, nivel, lugar y objetivo', 'Days, level, location and goal', 'Jours, niveau, lieu et objectif', 'Giorni, livello, luogo e obiettivo')}
            </Text>
          </View>
          <ChevronRight size={20} color="#0A0A0A" />
        </TouchableOpacity>
      )}

      <SetupModal visible={open} onClose={() => setOpen(false)} variant="azote"
        title={lang === 'en' ? 'Training setup' : lang === 'fr' ? 'Entraînement' : lang === 'it' ? 'Allenamento' : 'Ejercicio'}>

        <Text style={s.secLabelAzote}>{p.setup?.step6Title || '¿Cuándo entrenas?'}</Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>{maxLabel}</Text>
        <DayPicker trainDays={localDays} onToggle={toggleDay} dayLetters={DAY_LETTERS} variant="azote" />

        {/* Opción "sin días fijos" */}
        <TouchableOpacity
          style={[s.noTrainingBtn, localDays.length === 0 && s.noTrainingBtnActive]}
          onPress={() => setLocalDays([])}
        >
          <Text style={[s.noTrainingTxt, localDays.length === 0 && s.noTrainingTxtActive]}>
            {localDays.length === 0 ? '✓ ' : ''}{noTrainingLabel}
          </Text>
        </TouchableOpacity>

        {ob?.fitness && <>
          <Text style={[s.secLabelAzote, { marginTop: 28 }]}>{ob.fitnessLabel}</Text>
          <View style={{ gap: 2 }}>
            {ob.fitness.map(o => <OptionCard key={o.v} variant="azote" label={o.l} desc={o.d} selected={localFitness === o.v} onPress={() => setLocalFitness(o.v)} />)}
          </View>
        </>}

        {ob?.gymOptions && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>{ob.gymLabel}</Text>
          <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>{L('Puedes elegir varios', 'You can pick several', 'Tu peux en choisir plusieurs', 'Puoi sceglierne più di uno')}</Text>
          <View style={s.chips}>
            {ob.gymOptions.map(o => <Chip key={o.v} variant="azote" label={`${o.ico} ${o.l}`} selected={localGym.includes(o.v)} onPress={() => toggleGym(o.v)} />)}
          </View>
        </>}

        {/* ── Objetivo deportivo (editable, viene del paso 3 del onboarding) ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {L('Tu objetivo deportivo', 'Your sport goal', 'Ton objectif sportif', 'Il tuo obiettivo sportivo')}
        </Text>
        <View style={{ gap: 2 }}>
          {SPORT_GOALS.map(o => (
            <OptionCard key={o.id} variant="azote"
              label={`${o.emoji} ${o.label[lang] || o.label.es}`} desc={o.desc[lang] || o.desc.es}
              selected={sportGoal === o.id} onPress={() => setSportGoal(o.id)} />
          ))}
        </View>

        {/* ── Objetivo: COMPETICIÓN ── */}
        {sportGoal === 'competition' && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
            {L('¿Para qué competición te preparas?', 'Which competition are you training for?', 'Pour quelle compétition te prépares-tu ?', 'Per quale competizione ti prepari?')}
          </Text>
          <View style={s.chips}>
            {COMP_SPORTS.map(o => (
              <Chip key={o.id} variant="azote" label={`${o.emoji} ${o.label[lang] || o.label.es}`}
                selected={compSport === o.id} onPress={() => setCompSport(o.id)} />
            ))}
          </View>
          {compSport === 'other' && (
            <TextInput style={s.otherInputAzote} value={compSportOther} onChangeText={setCompSportOther}
              placeholder={L('¿Qué deporte?', 'Which sport?', 'Quel sport ?', 'Quale sport?')}
              placeholderTextColor="#A3A3A3" />
          )}

          <Text style={[s.secLabelAzote, { marginTop: 20 }]}>
            {L('Día de la competición', 'Competition day', 'Jour de la compétition', 'Giorno della competizione')}
          </Text>
          <TextInput style={s.otherInputAzote} value={compDate} onChangeText={setCompDate}
            placeholder={L('DD/MM/AAAA', 'DD/MM/YYYY', 'JJ/MM/AAAA', 'GG/MM/AAAA')}
            placeholderTextColor="#A3A3A3" />

          <Text style={[s.secLabelAzote, { marginTop: 20 }]}>
            {L('Distancia', 'Distance', 'Distance', 'Distanza')}
          </Text>
          <TextInput style={s.otherInputAzote} value={compDistance} onChangeText={setCompDistance}
            placeholder={L('Ej: 21 km, sprint, olímpico…', 'E.g.: 21 km, sprint, olympic…', 'Ex : 21 km, sprint, olympique…', 'Es: 21 km, sprint, olimpico…')}
            placeholderTextColor="#A3A3A3" />

          <Text style={[s.secLabelAzote, { marginTop: 20 }]}>
            {L('Nivel actual en este deporte', 'Current level in this sport', 'Niveau actuel dans ce sport', 'Livello attuale in questo sport')}
          </Text>
          <View style={s.chips}>
            {COMP_LEVELS.map(o => (
              <Chip key={o.id} variant="azote" label={`${o.emoji} ${o.label[lang] || o.label.es}`}
                selected={compLevel === o.id} onPress={() => setCompLevel(o.id)} />
            ))}
          </View>
        </>}

        {/* ── Objetivo: RETOMAR EL DEPORTE ── */}
        {sportGoal === 'resume' && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
            {L('¿Cuándo fue tu última sesión de deporte?', 'When was your last sport session?', 'Quand était ta dernière séance de sport ?', 'Quando è stata la tua ultima sessione di sport?')}
          </Text>
          <View style={{ gap: 2 }}>
            {LAST_SESSION_OPTIONS.map(o => (
              <OptionCard key={o.id} variant="azote" label={o.label[lang] || o.label.es}
                selected={lastSession === o.id} onPress={() => setLastSession(o.id)} />
            ))}
          </View>

          <Text style={[s.secLabelAzote, { marginTop: 20 }]}>
            {L('¿Has tenido alguna lesión en particular?', 'Have you had any particular injury?', 'As-tu eu une blessure en particulier ?', 'Hai avuto qualche infortunio in particolare?')}
          </Text>
          <View style={s.chips}>
            <Chip variant="azote" label={L('Sí', 'Yes', 'Oui', 'Sì')} selected={hadInjury === 'yes'} onPress={() => setHadInjury('yes')} />
            <Chip variant="azote" label={L('No', 'No', 'Non', 'No')} selected={hadInjury === 'no'} onPress={() => setHadInjury('no')} />
          </View>
          {hadInjury === 'yes' && (
            <TextInput style={s.otherInputAzote} value={injuryDetail} onChangeText={setInjuryDetail}
              placeholder={L('¿Cuál? Ej: rodilla, espalda…', 'Which one? E.g.: knee, back…', 'Laquelle ? Ex : genou, dos…', 'Quale? Es: ginocchio, schiena…')}
              placeholderTextColor="#A3A3A3" multiline />
          )}
        </>}

        {/* ── Preguntas comunes (retomar / ganar músculo / tonificar) ── */}
        {(sportGoal === 'resume' || sportGoal === 'muscle' || sportGoal === 'tone') && <>
          <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
            {L('¿Qué deporte realizas?', 'What sport do you do?', 'Quel sport pratiques-tu ?', 'Che sport fai?')}
          </Text>
          <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>{L('Puedes elegir varios', 'You can pick several', 'Tu peux en choisir plusieurs', 'Puoi sceglierne più di uno')}</Text>
          <View style={s.chips}>
            {SPORTS_LIST.map(o => (
              <Chip key={o.id} variant="azote" label={`${o.emoji} ${o.label[lang] || o.label.es}`}
                selected={currentSports.includes(o.id)} onPress={() => toggleSport(o.id)} />
            ))}
          </View>
          {currentSports.includes('other') && (
            <TextInput style={s.otherInputAzote} value={currentSportOther} onChangeText={setCurrentSportOther}
              placeholder={L('¿Cuál? Separados por comas', 'Which one(s)? Separate by commas', 'Lequel/lesquels ? Séparés par virgules', 'Quale/quali? Separati da virgole')}
              placeholderTextColor="#A3A3A3" />
          )}

          <Text style={[s.secLabelAzote, { marginTop: 20 }]}>
            {L('¿Te gustaría empezar un nuevo deporte?', 'Would you like to start a new sport?', 'Aimerais-tu commencer un nouveau sport ?', 'Ti piacerebbe iniziare un nuovo sport?')}
          </Text>
          <View style={s.chips}>
            <Chip variant="azote" label={L('Sí', 'Yes', 'Oui', 'Sì')} selected={wantNewSport === 'yes'} onPress={() => setWantNewSport('yes')} />
            <Chip variant="azote" label={L('No', 'No', 'Non', 'No')} selected={wantNewSport === 'no'} onPress={() => setWantNewSport('no')} />
          </View>
          {wantNewSport === 'yes' && (
            <TextInput style={s.otherInputAzote} value={newSportDetail} onChangeText={setNewSportDetail}
              placeholder={L('¿Cuál te llama?', 'Which one appeals to you?', 'Lequel te tente ?', 'Quale ti attira?')}
              placeholderTextColor="#A3A3A3" />
          )}
        </>}

        <TrainerCard lang={lang} />

        <TouchableOpacity style={[s.saveBtnAzote, saving && { opacity: 0.45 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnAzoteTxt}>{saving ? '…' : (p.common.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Banner inline
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE',
  },
  bannerEmoji: { fontSize: 28 },
  bannerTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#1E3A8A', marginBottom: 2 },
  bannerSub:   { fontSize: 12, color: '#3B82F6' },
  bannerArrow: { fontSize: 18, color: '#1E3A8A', fontFamily: F.bodyB },

  // Ciclo — tarjeta de estado vacío (Azote redesign)
  cicloEmptyCard: {
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 20,
    marginBottom: 12, borderWidth: 1, borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  cicloEmptyAvatar: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#49CF38',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cicloEmptyTitle: {
    fontSize: 20, fontFamily: F.headingX, color: '#171717',
    textAlign: 'center', marginBottom: 8, fontFamily: F.headingX,
  },
  cicloEmptySub: {
    fontSize: 14, color: '#525252', textAlign: 'center',
    lineHeight: 20, marginBottom: 20,
  },
  cicloEmptyBtn: {
    backgroundColor: '#171717', borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  cicloEmptyBtnTxt: { color: '#FAFAFA', fontFamily: F.bodyB, fontSize: 16 },

  // Ejercicio — tarjeta de estado vacío (Azote redesign)
  gymEmptyCard: {
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 20,
    marginBottom: 12, borderWidth: 1, borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  gymEmptyAvatar: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#429FE7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  gymEmptyTitle: {
    fontSize: 20, fontFamily: F.headingX, color: '#171717',
    textAlign: 'center', marginBottom: 8, fontFamily: F.headingX,
  },
  gymEmptySub: {
    fontSize: 14, color: '#525252', textAlign: 'center',
    lineHeight: 20, marginBottom: 20,
  },
  gymEmptyBtn: {
    backgroundColor: '#171717', borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  gymEmptyBtnTxt: { color: '#FAFAFA', fontFamily: F.bodyB, fontSize: 16 },
  nutriEmptyCard: {
    borderRadius: 24, padding: 24, marginBottom: 12, overflow: 'hidden',
    minHeight: 200, justifyContent: 'flex-end',
  },
  nutriEmptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.5)', borderRadius: 24,
  },
  nutriEmptyTitle: {
    fontSize: 26, fontFamily: F.headingX, color: '#FFFFFF',
    marginBottom: 8, fontFamily: F.headingX,
  },
  nutriEmptySub: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    lineHeight: 18, marginBottom: 20,
  },
  nutriEmptyBtn: {
    backgroundColor: '#171717', borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  nutriEmptyBtnTxt: { color: '#FAFAFA', fontFamily: F.bodyB, fontSize: 16 },

  gymEditBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E5E5E5',
  },
  gymEditBannerTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A', marginBottom: 2 },
  gymEditBannerSub:   { fontSize: 12, color: '#525252' },

  // Modal
  modal:       { flex: 1, backgroundColor: BG },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle:  { fontSize: 18, fontFamily: F.bodyB, color: 'white' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  closeTxt:    { color: 'white', fontSize: 14, fontFamily: F.bodyB },
  modalBody:   { padding: 20, paddingBottom: 60 },

  // Modal — variant "azote" (Ciclo)
  modalAzote:       { backgroundColor: 'white' },
  modalHeaderAzote: { borderBottomColor: '#F1F5F9' },
  modalTitleAzote:  { color: '#0A0A0A', fontFamily: F.headingX },
  closeBtnAzote:    { backgroundColor: '#F5F5F5' },
  secLabelAzote:    { fontSize: 16, fontFamily: F.bodyB, color: '#171717', marginBottom: 10 },
  optCardAzote:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#FAFAFA', borderRadius: 24, padding: 16, minHeight: 56, borderWidth: 1, borderColor: 'transparent' },
  optCardAzoteActive: { backgroundColor: '#F5F5F5', borderColor: '#262626' },
  optLabelAzote:      { fontSize: 16, color: '#0A0A0A' },
  optDescAzote:       { fontSize: 12, color: '#737373', marginTop: 2 },
  radioBase:       { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#737373', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  radioBaseActive: { backgroundColor: '#262626', borderColor: '#262626' },
  radioDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  chipAzote:            { height: 40, paddingHorizontal: 8, borderRadius: 16, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
  chipAzoteActive:      { backgroundColor: '#0A0A0A' },
  chipAzoteLabel:       { fontSize: 16, color: '#0A0A0A' },
  chipAzoteLabelActive: { color: 'white' },
  saveBtnAzote:    { marginTop: 28, height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  saveBtnAzoteTxt: { color: '#FAFAFA', fontFamily: F.bodyB, fontSize: 18 },

  // Section
  secLabel: { fontSize: 11, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  secSub:   { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 },

  // Option card
  optCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  optCardActive: { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'white' },
  optIcon:       { fontSize: 22, flexShrink: 0 },
  optLabel:      { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: F.bodyB },
  optLabelActive:{ color: 'white' },
  optDesc:       { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  check:         { fontSize: 14, color: 'white', fontFamily: F.bodyB },

  // Chips
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  chipActive:     { backgroundColor: 'white', borderColor: 'white' },
  chipDanger:     { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  chipLabel:      { fontSize: 13, color: 'white', fontWeight: '500' },
  chipLabelActive:{ color: '#1A56DB' },

  // Day picker
  daysRow:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dayBtn:        { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  dayBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  dayLetter:     { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: F.bodyB },
  dayLetterActive:{ color: '#1A56DB' },

  // Day picker — variant "azote"
  daysRowAzote:      { flexDirection: 'row', gap: 4, marginBottom: 8 },
  dayBtnAzote:       { flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  dayBtnAzoteActive: { backgroundColor: '#0A0A0A' },
  dayLetterAzote:      { fontSize: 12, color: '#0A0A0A' },
  dayLetterAzoteActive:{ color: 'white' },

  // Date buttons
  dateBtn:       { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginRight: 8, alignItems: 'center' },
  dateBtnActive: { backgroundColor: 'white' },
  dateBtnTxt:    { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  dateBtnTxtActive: { color: '#1A56DB', fontFamily: F.bodyB },

  // Cycle length
  lenRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lenBtn:        { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', minWidth: 44, alignItems: 'center' },
  lenBtnActive:  { backgroundColor: 'white' },
  lenTxt:        { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  lenTxtActive:  { color: '#1A56DB', fontFamily: F.bodyB },

  // Sin días fijos
  noTrainingBtn:       { marginTop: 4, marginBottom: 4, padding: 12, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center' },
  noTrainingBtnActive: { backgroundColor: '#F5F5F5' },
  noTrainingTxt:       { fontSize: 13, color: '#525252', fontWeight: '500' },
  noTrainingTxtActive: { color: '#0A0A0A', fontFamily: F.bodyB, textDecorationLine: 'underline' },

  // Save button
  saveBtn:    { marginTop: 28, padding: 16, borderRadius: 50, backgroundColor: 'white', alignItems: 'center' },
  saveBtnTxt: { color: '#1A56DB', fontFamily: F.bodyB, fontSize: 16 },

  // Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },

  // Pregnant banner
  pregnantBanner: { fontSize: 13, color: '#FDE68A', backgroundColor: 'rgba(253,230,138,0.12)', borderRadius: 10, padding: 12, marginTop: 8, marginBottom: 4, lineHeight: 18 },

  // Yes/No toggle
  yesNoRow:        { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 6 },
  yesNoBtn:        { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center' },
  yesNoBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  yesNoTxt:        { fontSize: 14, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.75)' },
  yesNoTxtActive:  { color: '#1A56DB' },

  // Label para categorías de dietas
  dietCatLabel: { fontSize: 10, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },

  // Input "Otros" para complementos personalizados
  otherInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Input "Otros" — variant azote
  otherInputAzote: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    color: '#0A0A0A',
    fontSize: 14,
    marginTop: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
