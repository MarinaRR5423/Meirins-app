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
import { Check, X, ChevronRight, ChevronDown, Calendar, CalendarDays, Footprints, Dumbbell, Leaf, Waves, Bike, CircleDot, Shield, Zap, Music2, Mountain, Swords, MoreHorizontal, Circle } from 'lucide-react-native';
import T from '../i18n/translations';
import { F } from '../theme/fonts';
import RangeCalendar from './RangeCalendar';
import TrainerCard from './TrainerCard';
import { useDiets, DIET_CATEGORIES, normalizeDietId } from '../hooks/useDiets';
import { PROGRAMS, totalSessions, LEVEL_LABEL, isRecommended, isVisible } from '../data/trainingPrograms';
import { ALL_MEALS, MEAL_LABELS, getActiveMeals } from '../utils/fastingMeals';
import { trackEvent, Events } from '../lib/analytics';

// ── Catálogos compartidos para CicloSetupCard y CicloHealthCard ────────────────
const MENO_Q_OPTS = [
  { v: 'over12m',      l: { es: 'Más de 12 meses',        en: 'More than 12 months',     fr: 'Plus de 12 mois',           it: 'Più di 12 mesi' } },
  { v: '3to12m',       l: { es: 'Entre 3 y 12 meses',     en: 'Between 3 and 12 months', fr: 'Entre 3 et 12 mois',        it: 'Tra 3 e 12 mesi' } },
  { v: 'under3m',      l: { es: 'Menos de 3 meses',       en: 'Less than 3 months',      fr: 'Moins de 3 mois',           it: 'Meno di 3 mesi' } },
  { v: 'neverregular', l: { es: 'Nunca ha sido regular',  en: 'Never been regular',      fr: "N'a jamais été régulier",   it: 'Non è mai stato regolare' } },
];

const LIFE_STAGES_NEW = [
  { v: 'reproductive',  l: { es: 'Reproductiva',   en: 'Reproductive',   fr: 'Reproductive',   it: 'Riproduttiva' } },
  { v: 'perimenopause', l: { es: 'Perimenopausia', en: 'Perimenopause',  fr: 'Périménopause',  it: 'Perimenopausa' } },
  { v: 'menopause',     l: { es: 'Menopausia',     en: 'Menopause',      fr: 'Ménopause',      it: 'Menopausa' } },
  { v: 'postmenopause', l: { es: 'Postmenopausia', en: 'Postmenopause',  fr: 'Post-ménopause', it: 'Postmenopausa' } },
  { v: 'pregnant',      l: { es: 'Embarazo',       en: 'Pregnancy',      fr: 'Grossesse',      it: 'Gravidanza' } },
  { v: 'postpartum',    l: { es: 'Post embarazo',  en: 'Postpartum',     fr: 'Post-partum',    it: 'Post-parto' } },
];

const CONTRA_OPTIONS_NEW = [
  { v: 'pill',          l: { es: 'Píldora contraceptiva', en: 'Contraceptive pill', fr: 'Pilule contraceptive', it: 'Pillola contraccettiva' } },
  { v: 'hormonal_iud',  l: { es: 'DIU hormonal',          en: 'Hormonal IUD',       fr: 'Stérilet hormonal',    it: 'IUD ormonale' } },
  { v: 'copper_iud',    l: { es: 'DIU de cobre',          en: 'Copper IUD',         fr: 'Stérilet au cuivre',   it: 'IUD al rame' } },
  { v: 'ring',          l: { es: '⭕ Anillo vaginal',         en: '⭕ Vaginal ring',        fr: '⭕ Anneau vaginal',        it: '⭕ Anello vaginale' } },
  { v: 'patch',         l: { es: 'Parche',                 en: 'Patch',              fr: 'Patch',                it: 'Cerotto' } },
  { v: 'implant',       l: { es: 'Implante',               en: 'Implant',            fr: 'Implant',              it: 'Impianto' } },
];

// Helper para traducir labels multilingüe
const tr = (obj, lang) => obj?.[lang] || obj?.es || '';

// Top 10 complementos alimentarios + "Otros"
const SUPPLEMENTS_OPTIONS = [
  { v: 'omega3',        l: { es: 'Omega-3',           en: 'Omega-3',          fr: 'Oméga-3',          it: 'Omega-3' } },
  { v: 'vitamin_d',     l: { es: 'Vitamina D',         en: 'Vitamin D',         fr: 'Vitamine D',         it: 'Vitamina D' } },
  { v: 'magnesium',     l: { es: 'Magnesio',           en: 'Magnesium',         fr: 'Magnésium',          it: 'Magnesio' } },
  { v: 'iron',          l: { es: 'Hierro',             en: 'Iron',              fr: 'Fer',                it: 'Ferro' } },
  { v: 'vitamin_b12',   l: { es: 'Vitamina B12',        en: 'Vitamin B12',        fr: 'Vitamine B12',        it: 'Vitamina B12' } },
  { v: 'creatine',      l: { es: 'Creatina',           en: 'Creatine',          fr: 'Créatine',           it: 'Creatina' } },
  { v: 'whey_protein',  l: { es: 'Proteína Whey',      en: 'Whey protein',      fr: 'Protéine Whey',      it: 'Proteine Whey' } },
  { v: 'multivitamin',  l: { es: 'Multivitamínico',    en: 'Multivitamin',      fr: 'Multivitamines',     it: 'Multivitaminico' } },
  { v: 'probiotics',    l: { es: 'Probióticos',        en: 'Probiotics',        fr: 'Probiotiques',       it: 'Probiotici' } },
  { v: 'collagen',      l: { es: 'Colágeno',           en: 'Collagen',           fr: 'Collagène',           it: 'Collagene' } },
];

const BLUE = '#429FE7';
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
      {selected && <Check size={16} color="#429FE7" />}
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
    // Compute current week date number by JS day index (0=Sun … 6=Sat)
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dow + 6) % 7));
    const weekDateByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDateByDay[d.getDay()] = d.getDate();
    }
    // Lun→Dom: JS day indices starting Monday
    const MON_FIRST = [1, 2, 3, 4, 5, 6, 0];
    return (
      <View style={{ gap: 4, marginBottom: 8 }}>
        {/* Day labels row */}
        <View style={s.daysLabelRowAzote}>
          {MON_FIRST.map(d => (
            <View key={d} style={s.dayLabelCellAzote}>
              <Text style={s.dayLabelTxtAzote}>{dayLetters[d]}</Text>
            </View>
          ))}
        </View>
        {/* Day cells */}
        <View style={s.daysRowAzote}>
          {MON_FIRST.map(d => {
            const on = trainDays.includes(d);
            return (
              <TouchableOpacity key={d} onPress={() => onToggle(d)}
                style={[s.dayBtnAzote, on && s.dayBtnAzoteActive]}>
                <Text style={[s.dayLetterAzote, on && s.dayLetterAzoteActive]}>{weekDateByDay[d]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
            <Text style={{ fontSize: 12, marginTop: 2 }}>{on ? '' : ''}</Text>
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
            <X size={16} color={azote ? '#0A0A0A' : '#737373'} />
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
export function CicloSetupCard({ lang, lastPeriod, setLastPeriod, cycleLength, setCycleLength, profileExtended, saveProfileExtended, openModalRef }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const [open, setOpen]             = useState(false);
  const [rangeStart, setRangeStart] = useState(lastPeriod || null);
  const [rangeEnd, setRangeEnd]     = useState(profileExtended?.periodEnd || null);
  const [lifeStage, setLifeStage]   = useState(profileExtended?.lifeStage || '');
  const [conditions, setConditions] = useState(profileExtended?.conditions || []);
  const [contraUse, setContraUse]   = useState(profileExtended?.contraUse ?? null);   // true | false | null
  const [contraType, setContraType] = useState(profileExtended?.contraType || '');
  const [menoOpen, setMenoOpen]     = useState(false);
  const [menoQ, setMenoQ]           = useState(profileExtended?.menoSuspectQ || '');
  const [saving, setSaving]         = useState(false);

  const toggleCondition = (v) =>
    conditions.includes(v) ? setConditions(conditions.filter(x => x !== v)) : setConditions([...conditions, v]);

  const save = async () => {
    if (!menoOpen && !rangeStart) return;
    setSaving(true);
    if (!menoOpen) await setLastPeriod(rangeStart);
    if (saveProfileExtended) {
      await saveProfileExtended({
        periodEnd: rangeEnd || null,
        lifeStage, conditions, contraUse, contraType,
        ...(menoOpen ? { menoSuspectQ: menoQ } : {}),
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
    modalTitle:  { es: 'Tu ciclo', en: 'Your cycle', fr: 'Ton cycle', it: 'Il tuo ciclo' }[lang] || 'Tu ciclo',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  const canSave = menoOpen ? true : !!rangeStart;

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

  if (openModalRef) openModalRef.current = openModal;

  return (
    <>
      {!openModalRef && (
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
      )}

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

        {/* ── No recuerdo / No tengo regla ── */}
        <TouchableOpacity
          style={[s.menoToggleBtn, menoOpen && s.menoToggleBtnOpen]}
          onPress={() => setMenoOpen(v => !v)}
          activeOpacity={0.8}>
          <Text style={[s.menoToggleTxt, menoOpen && s.menoToggleTxtOpen]}>
            {tr({ es: 'No recuerdo / No tengo regla', en: "I don't remember / No period", fr: 'Je ne me souviens plus / Pas de règles', it: 'Non ricordo / Non ho il ciclo' }, lang)}
          </Text>
          <ChevronDown size={16} color={menoOpen ? '#49CF38' : '#888'} style={{ transform: [{ rotate: menoOpen ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>
        {menoOpen && (
          <View style={s.menoExpand}>
            <Text style={s.menoExpandQ}>
              {tr({ es: '¿Hace cuánto que no tienes la regla?', en: 'How long since your last period?', fr: "Depuis combien de temps n'as-tu pas tes règles ?", it: 'Da quanto tempo non hai il ciclo?' }, lang)}
            </Text>
            <View style={{ gap: 4 }}>
              {MENO_Q_OPTS.map(o => (
                <OptionCard key={o.v} variant="azote" label={tr(o.l, lang)} selected={menoQ === o.v} onPress={() => setMenoQ(o.v)} />
              ))}
            </View>
          </View>
        )}

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
    modalTitle:  { es: 'Salud menstrual', en: 'Menstrual health', fr: 'Santé menstruelle', it: 'Salute mestruale' }[lang] || 'Salud menstrual',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  return (
    <>
      <TouchableOpacity style={[s.banner, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}></Text>
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
export function NutriSetupCard({ lang, profileExtended, saveAll, saveProfileExtended, activityLevel, goal, dietary, openModalRef }) {
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
  const [localBatchDays, setBatchDays]  = useState(profileExtended?.batchCookingDays || []);
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
      batchCookingDays: localBatch ? localBatchDays : [],
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
    setBatchDays(cur.batchCookingDays || []);
    setSupps(cur.supplements || []);
    setSuppsOther(cur.supplementsOther || '');
    setOpen(true);
  };

  if (openModalRef) openModalRef.current = openModal;

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
      {!hasNutriData && !openModalRef ? (
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
        title={lang === 'en' ? 'Nutrition' : lang === 'fr' ? 'Nutrition' : lang === 'it' ? 'Nutrizione' : 'Nutrición'}>

        {/* ── DIETA BASE (agrupada por categoría) ── */}
        {allDiets.length > 0
          ? Object.entries(dietsByCategory)
              .filter(([cat]) => cat !== 'fasting')
              .map(([cat, catDiets]) => {
                const catInfo = DIET_CATEGORIES[cat] || { label: { es: cat, en: cat } };
                return (
                  <View key={cat} style={{ gap: 8 }}>
                    <Text style={s.dietCatLabel}>{catInfo.label[lang] || catInfo.label.es}</Text>
                    <View style={{ gap: 2 }}>
                      {catDiets.map(d => {
                        const sel = normalizeDietId(localDiet) === d.id;
                        return (
                          <OptionCard key={d.id} variant="azote"
                            label={d.name[lang] || d.name.es}
                            selected={sel} onPress={() => setLocalDiet(sel ? '' : d.id)} />
                        );
                      })}
                    </View>
                  </View>
                );
              })
          : (ob?.diets || []).map(o => (
              <OptionCard key={o.v} variant="azote" label={o.l} desc={o.d}
                selected={localDiet === o.v} onPress={() => setLocalDiet(o.v)} />
            ))
        }

        {/* ── INTOLERANCIAS ── */}
        <View style={{ gap: 8 }}>
          <Text style={s.dietCatLabel}>
            {lang === 'en' ? 'Intolerances' : lang === 'fr' ? 'Intolérances' : lang === 'it' ? 'Intolleranze' : 'Intolerancias'}
          </Text>
          <View style={{ gap: 2 }}>
            {[
              { v: 'gluten_free',  l: { es: 'Sin gluten',  en: 'Gluten-free',  fr: 'Sans gluten',  it: 'Senza glutine' } },
              { v: 'lactose_free', l: { es: 'Sin lactosa', en: 'Lactose-free', fr: 'Sans lactose', it: 'Senza lattosio' } },
            ].map(o => (
              <OptionCard key={o.v} variant="azote"
                label={o.l[lang] || o.l.es}
                selected={localModifiers.includes(o.v)}
                onPress={() => toggleArr(localModifiers, setModifiers, o.v)} />
            ))}
          </View>
        </View>

        {/* ── TERAPÉUTICAS ── */}
        <View style={{ gap: 8 }}>
          <Text style={s.dietCatLabel}>
            {lang === 'en' ? 'Therapeutic' : lang === 'fr' ? 'Thérapeutiques' : lang === 'it' ? 'Terapeutiche' : 'Terapéuticas'}
          </Text>
          <View style={{ gap: 2 }}>
            {[
              { v: 'low_fodmap',        l: { es: 'Low FODMAP',       en: 'Low FODMAP',        fr: 'Low FODMAP',        it: 'Low FODMAP' } },
              { v: 'anti_inflammatory', l: { es: 'Antiinflamatoria', en: 'Anti-inflammatory', fr: 'Anti-inflammatoire', it: 'Antinfiammatoria' } },
              { v: 'dash',              l: { es: 'DASH',              en: 'DASH',              fr: 'DASH',              it: 'DASH' } },
            ].map(o => (
              <OptionCard key={o.v} variant="azote"
                label={o.l[lang] || o.l.es}
                selected={localModifiers.includes(o.v)}
                onPress={() => toggleArr(localModifiers, setModifiers, o.v)} />
            ))}
          </View>
        </View>

        {/* ── PROTOCOLO DE AYUNO ── */}
        {dietsByCategory?.['fasting']?.length > 0 && <>
          <View style={{ gap: 4 }}>
            <Text style={s.dietCatLabel}>
              {lang === 'en' ? 'Fasting protocol' : lang === 'fr' ? 'Protocole de jeûne' : lang === 'it' ? 'Protocollo di digiuno' : 'Protocolo de ayuna'}
            </Text>
            <Text style={{ fontSize: 16, fontFamily: F.body, color: '#737373', lineHeight: 20.8 }}>
              {lang === 'en' ? 'Combinable with any diet' : lang === 'fr' ? 'Combinable avec n\'importe quel régime' : lang === 'it' ? 'Combinabile con qualsiasi dieta' : 'Combinable con cualquier dieta'}
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            {dietsByCategory['fasting'].map(d => {
              const sel = localFasting === d.id;
              const fw  = d.fasting_window;
              return (
                <OptionCard key={d.id} variant="azote"
                  label={d.name[lang] || d.name.es}
                  desc={fw?.eating_hours ? `${({ es: 'Ventana de', en: 'Window of', fr: 'Fenêtre de', it: 'Finestra di' }[lang] || 'Ventana de')} ${fw.eating_hours}h` : undefined}
                  selected={sel} onPress={() => setFasting(sel ? '' : d.id)} />
              );
            })}
          </View>
        </>}

        {/* ── COMIDAS DEL DÍA ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {lang === 'en' ? 'Meals you do' : lang === 'fr' ? 'Repas que tu fais' : lang === 'it' ? 'Pasti che fai' : 'Comidas que haces'}
        </Text>
        <Text style={[s.secSub, { color: '#737373', marginTop: -6 }]}>
          {localFasting && !usingCustom
            ? (({ es: 'Definido por tu ayuno. Toca para personalizar.', en: 'Auto-set by your fasting. Tap to customise.', fr: 'Défini par ton jeûne. Touche pour personnaliser.', it: 'Impostato dal tuo digiuno. Tocca per personalizzare.' }[lang] || 'Definido por tu ayuno. Toca para personalizar.'))
            : (({ es: 'Desmarca las comidas que te saltas.', en: 'Untick the meals you skip.', fr: 'Décoche les repas que tu sautes.', it: 'Deseleziona i pasti che salti.' }[lang] || 'Desmarca las comidas que te saltas.'))}
        </Text>
        <View style={s.chips}>
          {ALL_MEALS.map(mealId => {
            const sel = currentMeals.includes(mealId);
            const label = MEAL_LABELS[mealId][lang] || MEAL_LABELS[mealId].es;
            return (
              <Chip key={mealId} variant="azote" label={`${sel ? '' : ''}${label}`} selected={sel}
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
          <OptionCard variant="azote" label={({ es: 'Sí', en: 'Yes', fr: 'Oui', it: 'Sì' }[lang] || 'Sí')} selected={localBatch} onPress={() => setBatch(true)} />
          <OptionCard variant="azote" label={({ es: 'No', en: 'No', fr: 'Non', it: 'No' }[lang] || 'No')} selected={!localBatch} onPress={() => setBatch(false)} />
        </View>

        {localBatch && (() => {
          const dayNames = {
            es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
          }[lang] || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
          const toggleBatchDay = (d) =>
            setBatchDays(localBatchDays.includes(d)
              ? localBatchDays.filter(x => x !== d)
              : [...localBatchDays, d]);
          return (
            <View style={{ marginTop: 12, gap: 8 }}>
              <Text style={[s.secSub, { color: '#737373' }]}>
                {lang === 'en' ? 'Which days do you cook in batch?'
                 : lang === 'fr' ? 'Quels jours fais-tu du batch cooking ?'
                 : lang === 'it' ? 'In quali giorni fai batch cooking?'
                 : '¿Qué días cocinas por lotes?'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {dayNames.map((name, i) => {
                  const sel = localBatchDays.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggleBatchDay(i)}
                      style={[s.batchDayBtn, sel && s.batchDayBtnActive]}>
                      <Text style={[s.batchDayTxt, sel && s.batchDayTxtActive]}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })()}

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
            label={lang === 'en' ? 'Other' : lang === 'fr' ? 'Autre' : lang === 'it' ? 'Altro' : 'Otros'}
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
  { id: 'triathlon',     emoji: '', label: { es: 'Triatlón',        en: 'Triathlon',      fr: 'Triathlon',        it: 'Triathlon' } },
  { id: 'marathon',      emoji: '', label: { es: 'Maratón',         en: 'Marathon',       fr: 'Marathon',         it: 'Maratona' } },
  { id: 'half_marathon', emoji: '', label: { es: 'Media maratón',   en: 'Half marathon',  fr: 'Semi-marathon',    it: 'Mezza maratona' } },
  { id: 'race_10k',      emoji: '', label: { es: 'Carrera 5K/10K',  en: '5K/10K race',    fr: 'Course 5K/10K',    it: 'Corsa 5K/10K' } },
  { id: 'trail',         emoji: '', label: { es: 'Trail running',   en: 'Trail running',  fr: 'Trail',            it: 'Trail running' } },
  { id: 'swimming',      emoji: '', label: { es: 'Natación',        en: 'Swimming',       fr: 'Natation',         it: 'Nuoto' } },
  { id: 'cycling',       emoji: '', label: { es: 'Ciclismo',        en: 'Cycling',        fr: 'Cyclisme',         it: 'Ciclismo' } },
  { id: 'duathlon',      emoji: '', label: { es: 'Duatlón',         en: 'Duathlon',       fr: 'Duathlon',         it: 'Duathlon' } },
  { id: 'crossfit',      emoji: '', label: { es: 'CrossFit',        en: 'CrossFit',       fr: 'CrossFit',         it: 'CrossFit' } },
  { id: 'hyrox',         emoji: '', label: { es: 'Hyrox',           en: 'Hyrox',          fr: 'Hyrox',            it: 'Hyrox' } },
  { id: 'other',         emoji: '', label: { es: 'Otro',            en: 'Other',          fr: 'Autre',            it: 'Altro' } },
];

const COMP_LEVELS = [
  { id: 'beginner',     emoji: '', label: { es: 'Principiante',  en: 'Beginner',      fr: 'Débutante',     it: 'Principiante' } },
  { id: 'intermediate', emoji: '', label: { es: 'Intermedio',    en: 'Intermediate',  fr: 'Intermédiaire', it: 'Intermedio' } },
  { id: 'advanced',     emoji: '', label: { es: 'Avanzado',      en: 'Advanced',      fr: 'Avancée',       it: 'Avanzato' } },
  { id: 'elite',        emoji: '', label: { es: 'Élite',         en: 'Elite',         fr: 'Élite',         it: 'Élite' } },
];

// Deportes habituales para "¿qué deporte realizas?" (selección múltiple)
// Exportado: también lo usa GimnasioScreen para "añadir deporte extra"
export const SPORTS_LIST = [
  { id: 'running',    emoji: '', Icon: Footprints,    label: { es: 'Running',            en: 'Running',          fr: 'Running',            it: 'Corsa' } },
  { id: 'gym',        emoji: '', Icon: Dumbbell,      label: { es: 'Musculación',        en: 'Weight training',  fr: 'Musculation',        it: 'Pesi' } },
  { id: 'yoga',       emoji: '', Icon: Leaf,          label: { es: 'Yoga',               en: 'Yoga',             fr: 'Yoga',               it: 'Yoga' } },
  { id: 'pilates',    emoji: '', Icon: Circle,        label: { es: 'Pilates',            en: 'Pilates',          fr: 'Pilates',            it: 'Pilates' } },
  { id: 'swimming',   emoji: '', Icon: Waves,         label: { es: 'Natación',           en: 'Swimming',         fr: 'Natation',           it: 'Nuoto' } },
  { id: 'cycling',    emoji: '', Icon: Bike,          label: { es: 'Ciclismo',           en: 'Cycling',          fr: 'Vélo',               it: 'Ciclismo' } },
  { id: 'padel',      emoji: '', Icon: CircleDot,     label: { es: 'Pádel / Tenis',      en: 'Padel / Tennis',   fr: 'Padel / Tennis',     it: 'Padel / Tennis' } },
  { id: 'football',   emoji: '', Icon: CircleDot,     label: { es: 'Fútbol',             en: 'Football',         fr: 'Football',           it: 'Calcio' } },
  { id: 'rugby',      emoji: '', Icon: Shield,        label: { es: 'Rugby',              en: 'Rugby',            fr: 'Rugby',              it: 'Rugby' } },
  { id: 'basketball', emoji: '', Icon: CircleDot,     label: { es: 'Baloncesto',         en: 'Basketball',       fr: 'Basket',             it: 'Basket' } },
  { id: 'crossfit',   emoji: '', Icon: Zap,           label: { es: 'CrossFit / HIIT',    en: 'CrossFit / HIIT',  fr: 'CrossFit / HIIT',    it: 'CrossFit / HIIT' } },
  { id: 'dance',      emoji: '', Icon: Music2,        label: { es: 'Baile',              en: 'Dance',            fr: 'Danse',              it: 'Danza' } },
  { id: 'hiking',     emoji: '', Icon: Mountain,      label: { es: 'Senderismo',         en: 'Hiking',           fr: 'Randonnée',          it: 'Escursionismo' } },
  { id: 'martial',    emoji: '', Icon: Swords,        label: { es: 'Boxeo / Artes marciales', en: 'Boxing / Martial arts', fr: 'Boxe / Arts martiaux', it: 'Boxe / Arti marziali' } },
  { id: 'climbing',   emoji: '', Icon: Mountain,      label: { es: 'Escalada',           en: 'Climbing',         fr: 'Escalade',           it: 'Arrampicata' } },
  { id: 'other',      emoji: '', Icon: MoreHorizontal,label: { es: 'Otro',               en: 'Other',            fr: 'Autre',              it: 'Altro' } },
];

// Objetivos deportivos (mismos ids que el paso 3 del onboarding)
const SPORT_GOALS = [
  { id: 'competition', emoji: '', label: { es: 'Competición',          en: 'Competition',   fr: 'Compétition',            it: 'Competizione' },      desc: { es: 'Preparación específica', en: 'Specific preparation', fr: 'Préparation spécifique', it: 'Preparazione specifica' } },
  { id: 'muscle',      emoji: '', label: { es: 'Ganar músculo',        en: 'Build muscle',  fr: 'Prendre du muscle',      it: 'Costruire muscolo' }, desc: { es: 'Fuerza e hipertrofia',   en: 'Strength and hypertrophy', fr: 'Force et hypertrophie', it: 'Forza e ipertrofia' } },
  { id: 'tone',        emoji: '', label: { es: 'Afinarme y tonificar', en: 'Tone up',       fr: "M'affiner et tonifier",  it: 'Tonificarmi' },       desc: { es: 'Definición y postura',   en: 'Definition and posture', fr: 'Définition et posture', it: 'Definizione e postura' } },
  { id: 'resume',      emoji: '', label: { es: 'Retomar el deporte',   en: 'Resume sport',  fr: 'Reprendre le sport',     it: 'Riprendere lo sport' },desc: { es: 'Volver con seguridad',   en: 'Come back safely', fr: 'Revenir en sécurité', it: 'Tornare in sicurezza' } },
];

const LAST_SESSION_OPTIONS = [
  { id: 'less_1m',  label: { es: 'Hace menos de 1 mes',  en: 'Less than 1 month ago',  fr: 'Il y a moins d\'1 mois',  it: 'Meno di 1 mese fa' } },
  { id: '1_3m',     label: { es: 'Hace 1-3 meses',       en: '1-3 months ago',          fr: 'Il y a 1-3 mois',         it: '1-3 mesi fa' } },
  { id: '3_12m',    label: { es: 'Hace 3-12 meses',      en: '3-12 months ago',         fr: 'Il y a 3-12 mois',        it: '3-12 mesi fa' } },
  { id: 'more_1y',  label: { es: 'Hace más de 1 año',    en: 'More than a year ago',    fr: 'Il y a plus d\'1 an',     it: 'Più di un anno fa' } },
];

// ─── GIMNASIO ─────────────────────────────────────────────────────────────────
export function GymSetupCard({ lang, trainDays, setTrainDays, profileExtended, saveProfileExtended, age = null, openModalRef }) {
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
  const [selectedProgram, setSelectedProgram] = useState(profileExtended?.activeProgram?.id || '');

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
    const chosenProg = selectedProgram ? PROGRAMS.find(pr => pr.id === selectedProgram) : null;
    if (chosenProg) {
      trackEvent(Events.PROGRAM_SELECTED, {
        program_id: chosenProg.id,
        level: chosenProg.level,
        weeks: chosenProg.weeks?.length || 0,
        was_recommended: isRecommended(chosenProg, { ...(profileExtended || {}), fitnessLevel: localFitness || profileExtended?.fitnessLevel }),
        is_change: !!(profileExtended?.activeProgram?.id && profileExtended.activeProgram.id !== chosenProg.id),
      });
    }
    await saveProfileExtended({
      fitnessLevel: localFitness, gymAccess: localGym, sportProfile, gymSetupDone: true,
      goals: { ...(profileExtended?.goals || {}), sport: sportGoal },
      activeProgram: chosenProg
        ? (profileExtended?.activeProgram?.id === chosenProg.id
            // Mismo programa: preserva el progreso existente
            ? profileExtended.activeProgram
            // Programa nuevo: empieza desde cero
            : { id: chosenProg.id, started: new Date().toISOString().split('T')[0], done: 0,
                ...(chosenProg.phaseRotation ? { pp: { menstrual:0, follicular:0, ovulatory:0, luteal:0 } } : {}) })
        : null,
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
    setSelectedProgram(cur.activeProgram?.id || '');
    trackEvent(Events.PROGRAM_SELECTOR_OPENED);
    setOpen(true);
  };

  // Expose openModal to external ref (used by GimnasioScreen empty state)
  if (openModalRef) openModalRef.current = openModal;

  return (
    <>
      {!hasGymData && !openModalRef && (
        <View style={s.gymEmptyCard}>
          <View style={s.gymEmptyAvatar}>
            <CalendarDays size={22} color="white" strokeWidth={2.2} />
          </View>
          <Text style={s.gymEmptyTitle}>{L('Plan de entrenamiento', 'Training plan', "Plan d'entraînement", 'Piano di allenamento')}</Text>
          <Text style={s.gymEmptySub}>{L('Configura tus preferencias para que nos podamos adaptar a tus necesidades y gustos', 'Set your preferences so we can adapt to your needs and tastes', "Configure tes préférences pour qu'on puisse s'adapter", 'Configura le tue preferenze così possiamo adattarci')}</Text>
          <TouchableOpacity style={s.gymEmptyBtn} onPress={openModal} activeOpacity={0.85}>
            <Text style={s.gymEmptyBtnTxt}>{L('Configurar entrenamiento', 'Set up training', "Configurer l'entraînement", 'Configura allenamento')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {hasGymData && (
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
            {localDays.length === 0 ? '' : ''}{noTrainingLabel}
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
            {SPORTS_LIST.map(o => {
              const sel = currentSports.includes(o.id);
              const SportIcon = o.Icon;
              const lbl = o.label[lang] || o.label.es;
              return (
                <TouchableOpacity key={o.id} onPress={() => toggleSport(o.id)}
                  style={[s.chipAzote, sel && s.chipAzoteActive]}>
                  {!sel && SportIcon && <SportIcon size={13} color="#0A0A0A" strokeWidth={1.8} style={{ marginRight: 4 }} />}
                  <Text style={[s.chipAzoteLabel, sel && s.chipAzoteLabelActive]}>{lbl}</Text>
                </TouchableOpacity>
              );
            })}
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

        {/* ── Programa de entrenamiento ── */}
        <Text style={[s.secLabelAzote, { marginTop: 24 }]}>
          {L('Programa de entrenamiento', 'Training program', 'Programme d\'entraînement', 'Programma di allenamento')}
        </Text>

        {/* Grupos por nivel apilados */}
        {(() => {
          const levels = [
            { id: 'beginner',     label: L('Principiante', 'Beginner',     'Débutant',      'Principiante') },
            { id: 'intermediate', label: L('Intermedio',   'Intermediate', 'Intermédiaire', 'Intermedio') },
            { id: 'advanced',     label: L('Avanzado',     'Advanced',     'Avancé',        'Avanzato') },
          ];
          const recCfg = { ...(profileExtended || {}), fitnessLevel: localFitness || profileExtended?.fitnessLevel };
          return levels.map(lv => {
            const progs = PROGRAMS.filter(pr => isVisible(pr, profileExtended, age) && pr.level === lv.id);
            return (
              <View key={lv.id} style={{ marginTop: 16 }}>
                <Text style={s.levelGroupHeader}>{lv.label}</Text>
                {progs.length === 0 ? (
                  <Text style={s.levelEmpty}>{L('Próximamente', 'Coming soon', 'Bientôt disponible', 'Prossimamente')}</Text>
                ) : (
                  <View style={{ gap: 8, marginTop: 6 }}>
                    {progs.map(pr => {
                      const active = selectedProgram === pr.id;
                      const durationTxt = pr.phaseRotation
                        ? L('3 meses', '3 months', '3 mois', '3 mesi')
                        : `${pr.weeks?.length || 0} ${L('semanas', 'weeks', 'semaines', 'settimane')}`;
                      const rec = isRecommended(pr, recCfg);
                      return (
                        <TouchableOpacity key={pr.id} onPress={() => setSelectedProgram(active ? '' : pr.id)}
                          style={[s.programRow, active && s.programRowActive]}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={s.programName}>{pr.name[lang] || pr.name.es}</Text>
                              {rec && <View style={s.programRecBadge}><Text style={s.programRecTxt}>{L('Recomendado', 'Recommended', 'Recommandé', 'Consigliato')}</Text></View>}
                            </View>
                            <Text style={s.programMeta}>{durationTxt}</Text>
                          </View>
                          {active && <Check size={16} color="#FE6004" strokeWidth={2.5} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          });
        })()}

        <View style={{ height: 16 }} />
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
  bannerSub:   { fontSize: 12, color: '#3B82F6', fontFamily: F.body },
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
    lineHeight: 20, marginBottom: 20, fontFamily: F.body,
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
    lineHeight: 18, marginBottom: 20, fontFamily: F.body,
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
  gymEditBannerSub:   { fontSize: 12, color: '#525252', fontFamily: F.body },

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
  optLabelAzote:      { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, lineHeight: 20.8 },
  optDescAzote:       { fontSize: 12, color: '#525252', fontFamily: F.body, lineHeight: 15.6, marginTop: 2 },
  radioBase:       { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#737373', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  radioBaseActive: { backgroundColor: '#262626', borderColor: '#262626' },
  radioDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  chipAzote:            { height: 40, paddingHorizontal: 8, borderRadius: 16, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  chipAzoteActive:      { backgroundColor: '#0A0A0A' },
  chipAzoteLabel:       { fontSize: 16, color: '#0A0A0A', fontFamily: F.body, lineHeight: 20.8 },
  chipAzoteLabelActive: { color: 'white', fontFamily: F.body, textAlign: 'center' },
  menoToggleBtn:     { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#2a2a2a', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  menoToggleBtnOpen: { borderColor: '#49CF38', borderStyle: 'solid', backgroundColor: 'rgba(73,207,56,0.06)' },
  menoToggleTxt:     { fontSize: 14, fontFamily: F.body, color: '#888' },
  menoToggleTxtOpen: { color: '#49CF38' },
  menoExpand:        { marginTop: 8, backgroundColor: '#0e0e0e', borderRadius: 12, borderWidth: 1, borderColor: '#1e2e1e', padding: 14 },
  menoExpandQ:       { fontSize: 13, fontFamily: F.bodyB, color: '#ccc', marginBottom: 10 },
  saveBtnAzote:    { marginTop: 28, height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  saveBtnAzoteTxt: { color: '#FAFAFA', fontFamily: F.body, fontSize: 18 },
  batchDayBtn:       { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  batchDayBtnActive: { backgroundColor: '#171717', borderColor: '#171717' },
  batchDayTxt:       { fontSize: 13, fontFamily: F.bodyB, color: '#737373' },
  batchDayTxtActive: { color: 'white' },
  programRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FAFAFA', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'transparent' },
  programRowActive: { backgroundColor: '#FFF5F0', borderColor: '#FE6004' },
  programName:      { fontSize: 14, fontFamily: F.bodyB, color: '#171717', lineHeight: 18.2 },
  programMeta:      { fontSize: 12, fontFamily: F.body, color: '#737373', marginTop: 2 },
  programRecBadge:  { backgroundColor: '#FE6004', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  programRecTxt:    { fontSize: 10, fontFamily: F.bodyB, color: 'white' },
  levelGroupHeader: { fontSize: 11, fontFamily: F.bodyB, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase' },
  levelEmpty:       { fontSize: 13, fontFamily: F.body, color: '#9CA3AF', paddingVertical: 10 },

  // Section
  secLabel: { fontSize: 11, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  secSub:   { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12, fontFamily: F.body, lineHeight: 16.9 },

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
  chipLabelActive:{ color: '#429FE7' },

  // Day picker
  daysRow:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dayBtn:        { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  dayBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  dayLetter:     { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: F.bodyB },
  dayLetterActive:{ color: '#429FE7' },

  // Day picker — variant "azote"
  daysLabelRowAzote:  { flexDirection: 'row' },
  dayLabelCellAzote:  { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayLabelTxtAzote:   { fontSize: 10, fontFamily: F.body, color: '#737373', textTransform: 'uppercase' },
  daysRowAzote:      { flexDirection: 'row', gap: 4 },
  dayBtnAzote:       { flex: 1, aspectRatio: 1, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  dayBtnAzoteActive: { backgroundColor: '#0A0A0A' },
  dayLetterAzote:      { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
  dayLetterAzoteActive:{ color: 'white' },

  // Date buttons
  dateBtn:       { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginRight: 8, alignItems: 'center' },
  dateBtnActive: { backgroundColor: 'white' },
  dateBtnTxt:    { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  dateBtnTxtActive: { color: '#429FE7', fontFamily: F.bodyB },

  // Cycle length
  lenRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lenBtn:        { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', minWidth: 44, alignItems: 'center' },
  lenBtnActive:  { backgroundColor: 'white' },
  lenTxt:        { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  lenTxtActive:  { color: '#429FE7', fontFamily: F.bodyB },

  // Sin días fijos
  noTrainingBtn:       { marginTop: 8, marginBottom: 4, alignItems: 'center' },
  noTrainingBtnActive: {},
  noTrainingTxt:       { fontSize: 14, color: '#737373', fontFamily: F.body },
  noTrainingTxtActive: { color: '#171717', fontFamily: F.body, textDecorationLine: 'underline' },

  // Save button
  saveBtn:    { marginTop: 28, padding: 16, borderRadius: 50, backgroundColor: 'white', alignItems: 'center' },
  saveBtnTxt: { color: '#429FE7', fontFamily: F.bodyB, fontSize: 16 },

  // Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },

  // Pregnant banner
  pregnantBanner: { fontSize: 13, color: '#FDE68A', backgroundColor: 'rgba(253,230,138,0.12)', borderRadius: 10, padding: 12, marginTop: 8, marginBottom: 4, lineHeight: 18 },

  // Yes/No toggle
  yesNoRow:        { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 6 },
  yesNoBtn:        { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center' },
  yesNoBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  yesNoTxt:        { fontSize: 14, fontFamily: F.bodyB, color: 'rgba(255,255,255,0.75)' },
  yesNoTxtActive:  { color: '#429FE7' },

  // Label para categorías de dietas
  dietCatLabel: { fontSize: 16, fontFamily: F.bodyB, color: '#171717', marginBottom: 8, marginTop: 16 },

  // Input "Otros" para complementos personalizados
  otherInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 14,
    fontFamily: F.body,
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
    fontFamily: F.body,
    marginTop: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});

