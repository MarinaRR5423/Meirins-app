import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image, ImageBackground, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { F } from '../theme/fonts';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { PHASES } from '../data/phases';
import T, { getPhaseDisplay, getDayLetters } from '../i18n/translations';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import { CicloSetupCard, CicloHealthCard } from '../components/TabSetupCard';
import CycleTrackingModal from '../components/CycleTrackingModal';
import CycleImportModal from '../components/CycleImportModal';
import CycleHistoryModal from '../components/CycleHistoryModal';
import { trackScreen } from '../lib/analytics';
import { cancelPeriodCheckNotifications } from '../utils/notifications';
import BText from '../components/BText';
import ErrorBoundary from '../components/ErrorBoundary';
import PhaseGlow from '../../assets/Calendar icons/PhaseGlow';


const CICLO_ARTICLE_IDS = ['sleep-cycle', 'cycle-training'];
const cicloArticles = ARTICLES.filter(a => CICLO_ARTICLE_IDS.includes(a.id));

const BLUE = { primary: '#429FE7', light: '#EFF6FF' };
const SCREEN_W = Dimensions.get('window').width;


const PHASE_IMAGES = {
 menstrual:  require('../../assets/HeroHomescreen/Menstrual.png'),
 follicular: require('../../assets/HeroHomescreen/Folicular.png'),
 ovulation:  require('../../assets/HeroHomescreen/Ovulacion.png'),
 luteal:     require('../../assets/HeroHomescreen/Lutea.png'),
};

const QUALITY_MOONS = ['','','','',''];
const QUALITY_COLORS = ['#737373','#F97316','#F59E0B','#3B82F6','#7C3AED'];

// ─── Cycle visual (pure RN, no SVG) ───────────────────────────────────────────

// ─── Calendar helpers ──────────────────────────────────────────────────────────
// Paleta Azote (tags-stack del diseño): menstrual=verde, folicular=morado, ovulación=amarillo, lútea=naranja
const PHASE_BG = { menstrual:'#b6ecaf', follicular:'#d9bce9', ovulation:'#ffea9b', luteal:'#ffbf9b' };
const PHASE_TEXT = { menstrual:'#0b1f08', follicular:'#180d1e', ovulation:'#261e01', luteal:'#260e01' };
// Figma exact: On (past) = -300 variants; Off (future) = -100 lighter variants
const PHASE_COLORS =        { menstrual:'#92E288', follicular:'#C79ADF', ovulation:'#FEDF68', luteal:'#FEA068' };
const PHASE_COLORS_FUTURE = { menstrual:'#DBF5D7', follicular:'#ECDDF4', ovulation:'#FFFAE6', luteal:'#FFE8D6' };

function getPhaseForDate(dateStr, lastPeriodStr, cycleLen) {
 if (!lastPeriodStr) return null;
 const diff = Math.floor((new Date(dateStr + 'T12:00:00') - new Date(lastPeriodStr + 'T12:00:00')) / 86400000);
 const day = ((diff % cycleLen) + cycleLen) % cycleLen + 1;
 if (day <= 5) return 'menstrual';
 if (day <= 13) return 'follicular';
 if (day <= 16) return 'ovulation';
 return 'luteal';
}

// ─── Sleep Tracker ─────────────────────────────────────────────────────────────
function SleepCard({ sleepLog, logSleep, lang }) {
 const sl = (T[lang] || T.es).sleep;
 const today = new Date().toISOString().split('T')[0];
 const todayEntry = sleepLog.find(e => e.date === today);

 const [hours, setHours] = useState(todayEntry?.hours || 7.5);
 const [quality, setQuality] = useState(todayEntry?.quality || 3);
 const [saved, setSaved] = useState(!!todayEntry);

 const changeHours = (delta) => setHours(h => Math.min(12, Math.max(3, Math.round((h + delta) * 2) / 2)));

 const handleLog = async () => {
 await logSleep({ date: today, hours, quality });
 setSaved(true);
 };

 // Last 7 days for the mini chart
 const last7 = useMemo(() => {
 return Array.from({ length: 7 }, (_, i) => {
 const d = new Date(); d.setDate(d.getDate() - (6 - i));
 const dateStr = d.toISOString().split('T')[0];
 const entry = sleepLog.find(e => e.date === dateStr);
 return { dateStr, entry, dayLetter: d.toLocaleDateString('default', { weekday: 'narrow' }) };
 });
 }, [sleepLog]);

 const avgHours = sleepLog.length > 0
 ? (sleepLog.slice(0, 7).reduce((s, e) => s + e.hours, 0) / Math.min(7, sleepLog.length)).toFixed(1)
 : null;

 return (
 <View style={styles.card}>
 <View style={styles.cardHeader}>
 <BText style={styles.cardTitle}>{sl.title}</BText>
 {avgHours && (
 <View style={styles.avgBadge}>
 <BText style={styles.avgText}>{sl.avgLabel} {avgHours}{sl.hoursShort}</BText>
 </View>
 )}
 </View>

 {/* Today's log */}
 <View style={styles.sleepLogRow}>
 <BText style={styles.sleepLabel}>{sl.todayLabel}</BText>
 <View style={styles.hoursRow}>
 <TouchableOpacity style={styles.hoursBtn} onPress={() => changeHours(-0.5)}><BText style={styles.hoursBtnText}>−</BText></TouchableOpacity>
 <BText style={styles.hoursValue}>{hours}{sl.hoursShort}</BText>
 <TouchableOpacity style={styles.hoursBtn} onPress={() => changeHours(0.5)}><BText style={styles.hoursBtnText}>+</BText></TouchableOpacity>
 </View>
 </View>

 {/* Quality picker */}
 <View style={styles.qualityRow}>
 <BText style={styles.sleepLabel}>{sl.quality}</BText>
 <View style={styles.qualityBtns}>
 {QUALITY_MOONS.map((moon, i) => (
 <TouchableOpacity key={i} onPress={() => setQuality(i + 1)}
 style={[styles.qualityBtn, quality === i + 1 && { backgroundColor: QUALITY_COLORS[i] + '22', borderColor: QUALITY_COLORS[i] }]}>
 <BText style={styles.qualityMoon}>{moon}</BText>
 </TouchableOpacity>
 ))}
 </View>
 </View>
 <BText style={styles.qualityLabelText}>{sl.qualityLabels[quality - 1]}</BText>

 {/* Log button */}
 <TouchableOpacity
 style={[styles.logBtn, saved && styles.logBtnSaved]}
 onPress={handleLog}
 >
 <BText style={[styles.logBtnText, saved && styles.logBtnTextSaved]}>
 {saved ? sl.logged : sl.log}
 </BText>
 </TouchableOpacity>

 {/* 7-day chart */}
 {sleepLog.length > 0 ? (
 <View style={styles.sleepChart}>
 <BText style={styles.chartLabel}>{sl.history}</BText>
 <View style={styles.barsRow}>
 {last7.map(({ dateStr, entry, dayLetter }) => {
 const barH = entry ? Math.max(4, (entry.hours / 12) * 60) : 0;
 const qColor = entry ? QUALITY_COLORS[entry.quality - 1] : '#E2E8F0';
 const isToday = dateStr === today;
 return (
 <View key={dateStr} style={styles.barItem}>
 <View style={styles.barBg}>
 <View style={[styles.barFill, { height: barH, backgroundColor: qColor }]} />
 </View>
 <BText style={[styles.barDay, isToday && { color: BLUE.primary, fontFamily: F.bodyB }]}>{dayLetter}</BText>
 {entry && <BText style={styles.barHours}>{entry.hours}{sl.hoursShort}</BText>}
 </View>
 );
 })}
 </View>
 </View>
 ) : (
 <BText style={styles.noDataText}>{sl.noData}</BText>
 )}
 </View>
 );
}

// ─── Carrusel de bienestar (menopausia / postmenopausia) ──────────────────────
const WELLNESS_TABS = [
 {
  key: 'sleep',
  icon: '',
  label: { es: 'Sueño', en: 'Sleep', fr: 'Sommeil', it: 'Sonno' },
  color: '#0891B2',
  bg: '#ECFEFF',
  tips: {
   es: ['Mantén horarios regulares de sueño', 'Evita pantallas 1h antes de dormir', 'La melatonina puede ayudar en la transición', 'Temperatura fresca en el dormitorio (17-19°C)', 'Los sofocos nocturnos: ropa de algodón y capas'],
   en: ['Keep regular sleep schedules', 'Avoid screens 1h before bed', 'Melatonin may help during the transition', 'Cool bedroom temperature (17-19°C)', 'Night sweats: cotton clothing and layers'],
   fr: ['Maintiens des horaires de sommeil réguliers', 'Évite les écrans 1h avant de dormir', 'La mélatonine peut aider lors de la transition', 'Température fraîche dans la chambre (17-19°C)', 'Sueurs nocturnes : vêtements en coton et superposition'],
   it: ['Mantieni orari di sonno regolari', 'Evita gli schermi 1h prima di dormire', 'La melatonina può aiutare nella transizione', 'Temperatura fresca in camera (17-19°C)', 'Sudorazioni notturne: cotone e strati'],
  },
 },
 {
  key: 'sport',
  icon: '',
  label: { es: 'Deporte', en: 'Sport', fr: 'Sport', it: 'Sport' },
  color: '#2563EB',
  bg: '#EFF6FF',
  tips: {
   es: ['El entrenamiento de fuerza protege la densidad ósea', 'Caminar 30 min/día reduce el riesgo cardiovascular', 'El yoga y el pilates mejoran el equilibrio hormonal', 'HIIT moderado 2×/semana para el metabolismo', 'Escucha tu cuerpo: recuperación más importante que antes'],
   en: ['Strength training protects bone density', 'Walking 30 min/day reduces cardiovascular risk', 'Yoga and pilates improve hormonal balance', 'Moderate HIIT 2×/week for metabolism', 'Listen to your body: recovery is more important than ever'],
   fr: ['La musculation protège la densité osseuse', 'Marcher 30 min/jour réduit le risque cardiovasculaire', 'Le yoga et le pilates améliorent l\'équilibre hormonal', 'HIIT modéré 2×/semaine pour le métabolisme', 'Écoute ton corps : la récupération est plus importante que jamais'],
   it: ['L\'allenamento di forza protegge la densità ossea', 'Camminare 30 min/giorno riduce il rischio cardiovascolare', 'Yoga e pilates migliorano l\'equilibrio ormonale', 'HIIT moderato 2×/settimana per il metabolismo', 'Ascolta il tuo corpo: il recupero è più importante che mai'],
  },
 },
 {
  key: 'nutrition',
  icon: '',
  label: { es: 'Nutrición', en: 'Nutrition', fr: 'Nutrition', it: 'Nutrizione' },
  color: '#059669',
  bg: '#ECFDF5',
  tips: {
   es: ['Aumenta el calcio y vitamina D para los huesos', 'Fitoestrógenos de la soja pueden reducir sofocos', 'Reduce azúcares simples y alcohol', 'Prioriza proteína en cada comida (1,2-1,6g/kg)', 'Omega-3 para salud cardiovascular y cognitiva'],
   en: ['Increase calcium and vitamin D for bones', 'Phytoestrogens from soy may reduce hot flushes', 'Reduce simple sugars and alcohol', 'Prioritise protein at every meal (1.2-1.6g/kg)', 'Omega-3 for cardiovascular and cognitive health'],
   fr: ['Augmente le calcium et la vitamine D pour les os', 'Les phytoestrogènes du soja peuvent réduire les bouffées de chaleur', 'Réduis les sucres simples et l\'alcool', 'Priorise les protéines à chaque repas (1,2-1,6g/kg)', 'Oméga-3 pour la santé cardiovasculaire et cognitive'],
   it: ['Aumenta calcio e vitamina D per le ossa', 'I fitoestrogeni della soia possono ridurre le vampate', 'Riduci zuccheri semplici e alcol', 'Dai priorità alle proteine ad ogni pasto (1,2-1,6g/kg)', 'Omega-3 per la salute cardiovascolare e cognitiva'],
  },
 },
];

function MenopauseWellnessCarousel({ lang }) {
 const [activeTab, setActiveTab] = useState(0);
 const tab = WELLNESS_TABS[activeTab];
 const tips = tab.tips[lang] || tab.tips.en;
 const chatbotPlaceholder = {
  es: 'Chatbot de recomendaciones personalizadas\n(próximamente)',
  en: 'Personalised recommendations chatbot\n(coming soon)',
  fr: 'Chatbot de recommandations personnalisées\n(bientôt disponible)',
  it: 'Chatbot di raccomandazioni personalizzate\n(prossimamente)',
 }[lang] || 'Coming soon';

 return (
  <View style={mwStyles.container}>
   {/* Título */}
   <BText style={mwStyles.title}>
    {{ es: 'Tu bienestar', en: 'Your wellbeing', fr: 'Ton bien-être', it: 'Il tuo benessere' }[lang] || 'Your wellbeing'}
   </BText>
   <BText style={mwStyles.sub}>
    {{ es: 'Recomendaciones adaptadas a tu etapa', en: 'Recommendations adapted to your stage', fr: 'Recommandations adaptées à ta phase', it: 'Consigli adattati alla tua fase' }[lang] || 'Recommendations adapted to your stage'}
   </BText>

   {/* Tabs */}
   <View style={mwStyles.tabRow}>
    {WELLNESS_TABS.map((t, i) => {
     const active = i === activeTab;
     return (
      <TouchableOpacity key={t.key} onPress={() => setActiveTab(i)}
       style={[mwStyles.tabBtn, active && { backgroundColor: t.color, borderColor: t.color }]}>
       <BText style={[mwStyles.tabIcon]}>{t.icon}</BText>
       <BText style={[mwStyles.tabLabel, active && { color: 'white' }]}>
        {t.label[lang] || t.label.en}
       </BText>
      </TouchableOpacity>
     );
    })}
   </View>

   {/* Contenido del tab activo */}
   <View style={[mwStyles.card, { borderColor: tab.color + '33' }]}>
    {/* Tips */}
    <View style={{ gap: 8 }}>
     {tips.map((tip, i) => (
      <View key={i} style={mwStyles.tipRow}>
       <View style={[mwStyles.tipDot, { backgroundColor: tab.color }]} />
       <BText style={mwStyles.tipTxt}>{tip}</BText>
      </View>
     ))}
    </View>

    {/* Chatbot placeholder */}
    <View style={[mwStyles.chatbotBox, { backgroundColor: tab.bg, borderColor: tab.color + '44' }]}>
     <BText style={[mwStyles.chatbotIcon]}>{tab.icon}</BText>
     <BText style={[mwStyles.chatbotTxt, { color: tab.color }]}>{chatbotPlaceholder}</BText>
    </View>
   </View>
  </View>
 );
}

const mwStyles = StyleSheet.create({
 container: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 16 },
 title: { fontSize: 20, fontFamily: F.headingX, color: '#0A0A0A', letterSpacing: -0.2 },
 sub: { fontSize: 14, fontFamily: F.body, color: '#525252', marginTop: -8 },
 tabRow: { flexDirection: 'row', gap: 6 },
 tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5E5', backgroundColor: 'white' },
 tabIcon: { fontSize: 14, fontFamily: F.body },
 tabLabel: { fontSize: 12, fontFamily: F.bodyB, color: '#525252' },
 card: { backgroundColor: 'white', borderRadius: 16, padding: 14, gap: 16, borderWidth: 1 },
 tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
 tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
 tipTxt: { flex: 1, fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20 },
 chatbotBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
 chatbotIcon: { fontSize: 28, fontFamily: F.body },
 chatbotTxt: { fontSize: 13, fontFamily: F.bodyB, textAlign: 'center', lineHeight: 18 },
});

// ─── Main component ────────────────────────────────────────────────────────────
export default function CicloScreen({ pi, lastPeriod, setLastPeriod, setCycleLength, periodEnd, setPeriodEnd, sleepLog = [], logSleep, lang = 'es', profileExtended, saveProfileExtended, logCycleDay, cyclePeriods = [], cycleDailyLogs = {}, savePeriod, deletePeriod, importPeriods }) {
 useEffect(() => { trackScreen('Ciclo', { phase: pi?.phase }); }, []);
 const cicloOpenRef = useRef(null);
 const [trackingOpen, setTrackingOpen] = useState(false);
 const [importOpen, setImportOpen] = useState(false);
 const [historyOpen, setHistoryOpen] = useState(false);
 const [expandedPhase, setExpanded] = useState(pi?.phase || null);
 const route = useRoute();
 const [selectedDate, setSelectedDate] = useState(null);
 const [selectedPhaseKey, setSelectedPhaseKey] = useState(route.params?.openPhase || null);
 const cy = (T[lang] || T.es).cycle;

 const today = new Date();
 const todayStr = today.toISOString().split('T')[0];
 const cycleLen = pi?.cycleLen || 28;
 const d = pi?.data;
 const dDisplay = pi?.phase ? getPhaseDisplay(lang, pi.phase, d) : null;

 // Anticoncepción hormonal: oculta ventana fértil y fases hormonales proyectadas
 const contra = profileExtended?.contraception;
 const HORMONAL_CONTRA = ['pill', 'hormonal_iud', 'ring', 'patch', 'implant'];
 const isHormonalContra = HORMONAL_CONTRA.includes(contra);

 // Menopausia / postmenopausia: sustituye carrusel de fases por carrusel de bienestar
 const lifeStage = profileExtended?.lifeStage || '';
 const isMenopause  = lifeStage === 'menopause' || lifeStage === 'postmenopause';
 const isPregnantCiclo   = lifeStage === 'pregnant';
 const isPostpartumCiclo = lifeStage === 'postpartum';

 // Calendar — navegación por meses (0 = mes actual, negativo = pasado, positivo = pronóstico)
 const [calOffset, setCalOffset] = useState(0);
 const [marking, setMarking] = useState(false); // modo "marcar regla"
 const [markStart, setMarkStart] = useState(null);
 const [markEnd, setMarkEnd] = useState(null);

 const calBase = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
 const year = calBase.getFullYear();
 const month = calBase.getMonth();
 const monthName = calBase.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'es-ES', { month: 'long', year: 'numeric' });
 const firstDay = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();
 const startOffset = (firstDay + 6) % 7;

 // Historial de reglas desde cycle_periods (tabla propia)
 // Normalizamos a { start, end } para compatibilidad con el código existente
 const periods = useMemo(() => {
 const fromTable = cyclePeriods.map(p => ({
   start: p.start_date,
   end:   p.end_date || null,
   source: p.source,
 }));
 // Garantía de fallback: si la tabla está vacía y hay lastPeriod, lo incluimos
 if (!fromTable.length && lastPeriod) {
   fromTable.push({ start: lastPeriod, end: periodEnd || null, source: 'manual' });
 }
 return fromTable.sort((a, b) => a.start.localeCompare(b.start));
 }, [cyclePeriods, lastPeriod, periodEnd]);

 const inRealPeriod = (dateStr) => {
 const norm = dateStr.split('T')[0];
 return periods.some(p => {
 const pStart = p.start?.split('T')[0] || p.start;
 const pEnd = (p.end?.split('T')[0] || p.end) || pStart;
 return norm >= pStart && norm <= pEnd;
 });
 };

 // Duración media real del ciclo (últimos 3 intervalos entre reglas) para el pronóstico
 const effectiveCycleLen = useMemo(() => {
 const starts = periods.map(p => p.start);
 if (starts.length < 2) return cycleLen;
 const gaps = [];
 for (let i = 1; i < starts.length; i++) {
 const g = Math.round((new Date(starts[i] + 'T12:00:00') - new Date(starts[i - 1] + 'T12:00:00')) / 86400000);
 if (g >= 18 && g <= 45) gaps.push(g); // descarta huecos no plausibles (meses sin registrar)
 }
 if (!gaps.length) return cycleLen;
 const recent = gaps.slice(-3);
 return Math.round(recent.reduce((s, g) => s + g, 0) / recent.length);
 }, [periods, cycleLen]);

 // Modo marcar regla: la selección se puede ampliar y REDUCIR tocando
 // el nuevo inicio o fin (fix: antes un rango completo se reiniciaba y
 // los días sobrantes parecían no desmarcarse)
 const handleMarkTap = (dateStr) => {
 if (dateStr > todayStr) return; // no se marcan reglas en el futuro
 if (!markStart) { setMarkStart(dateStr); return; }

 if (markEnd) {
 const daysFromEnd = Math.round((new Date(dateStr + 'T12:00:00') - new Date(markEnd + 'T12:00:00')) / 86400000);
 if (daysFromEnd > 15) {
  // Toque muy lejano: nueva regla distinta
  setMarkStart(dateStr); setMarkEnd(null);
 } else if (dateStr < markStart) {
  setMarkStart(dateStr); // antes del inicio → ampliar inicio
 } else if (dateStr > markEnd) {
  setMarkEnd(dateStr); // después del fin → ampliar fin
 } else {
  // Dentro del rango: la mitad decide si mover inicio o fin
  const startMs = new Date(markStart + 'T12:00:00').getTime();
  const endMs   = new Date(markEnd   + 'T12:00:00').getTime();
  const tapMs   = new Date(dateStr   + 'T12:00:00').getTime();
  if (tapMs <= (startMs + endMs) / 2) {
   setMarkStart(dateStr); // primera mitad → mover inicio
  } else {
   setMarkEnd(dateStr);   // segunda mitad → mover fin
  }
 }
 return;
 }

 // Solo inicio marcado → segundo toque define el fin (con intercambio si va antes)
 if (dateStr < markStart) {
 setMarkEnd(markStart); setMarkStart(dateStr);
 } else {
 setMarkEnd(dateStr);
 }
 };

 const savePeriodMark = async () => {
 if (!markStart) return;
 const entry = { start: markStart, end: markEnd || markStart };

 // Guardar en cycle_periods (tabla propia) — upsert por start_date
 await savePeriod?.(entry, 'manual');
 // Cancela los avisos "¿te ha venido el período?" ya que ha llegado
 cancelPeriodCheckNotifications().catch(() => {});

 // Si es el período más reciente, actualizar también last_period en profiles
 // para que el motor de fases (pi) lo recoja correctamente
 const isNewest = !lastPeriod || entry.start >= lastPeriod;
 if (isNewest) {
 await setPeriodEnd(entry.end);
 await setLastPeriod(entry.start);
 }

 setMarking(false); setMarkStart(null); setMarkEnd(null);
 };

 const tr = (es, en, fr, it) => ({ es, en, fr, it }[lang] || es);

 const pDays = {
 menstrual: cy.phaseDays.menstrual,
 follicular: cy.phaseDays.follicular,
 ovulation: cy.phaseDays.ovulation,
 luteal: cy.phaseDays.luteal + (cycleLen || 28),
 };
 const phaseInfo = cy.phaseInfo;

 const dateLocale = ({ es: 'es-ES', en: 'en-GB', fr: 'fr-FR', it: 'it-IT' }[lang] || 'es-ES');
 const navigation = useNavigation();

 if (!lastPeriod) {
  const emptyTxt = {
   title: { es: 'Registra tu primer ciclo', en: 'Log your first cycle', fr: 'Enregistre ton premier cycle', it: 'Registra il tuo primo ciclo' },
   sub: { es: 'Ve a la pesta\u00f1a Ciclo para introducir la fecha de tu \u00faltimo periodo y desbloquear todo tu programa personalizado', en: 'Enter your last period date to unlock your personalised programme.', fr: 'Saisis ta derni\u00e8re date de r\u00e8gles pour d\u00e9bloquer ton programme.', it: 'Inserisci la data dell\u2019ultimo periodo per sbloccare il tuo programma.' },
   cta: { es: 'Registrar', en: 'Register', fr: 'Enregistrer', it: 'Registra' },
  };
  return (
   <ImageBackground source={require('../../assets/Apartados/Blumm_ciclo_fondo.png')} style={{ flex: 1 }}>
    <View style={es.wrap}>
     <BlurView intensity={25} tint="light" style={es.card}>
      <View style={es.iconWrap}><View style={es.iconInner} /></View>
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
       <BText style={es.title}>{emptyTxt.title[lang] || emptyTxt.title.es}</BText>
       <BText style={es.sub}>{emptyTxt.sub[lang] || emptyTxt.sub.es}</BText>
      </View>
      <TouchableOpacity style={es.btn} onPress={() => cicloOpenRef.current?.()} activeOpacity={0.85}>
       <BText style={es.btnTxt}>{emptyTxt.cta[lang] || emptyTxt.cta.es}</BText>
      </TouchableOpacity>
     </BlurView>
    </View>
    <CicloSetupCard lang={lang} lastPeriod={lastPeriod} setLastPeriod={setLastPeriod}
     cycleLength={pi?.cycleLen} setCycleLength={setCycleLength}
     profileExtended={profileExtended} saveProfileExtended={saveProfileExtended}
     openModalRef={cicloOpenRef} />
   </ImageBackground>
  );
 }

 return (
 <>
 <ScrollView style={styles.container} contentContainerStyle={styles.content}>

 {/* ── SETUP CARDS ── */}
 <CicloSetupCard
 lang={lang}
 lastPeriod={lastPeriod}
 setLastPeriod={setLastPeriod}
 cycleLength={pi?.cycleLen}
 setCycleLength={setCycleLength}
 profileExtended={profileExtended}
 saveProfileExtended={saveProfileExtended}
 />
 <CicloHealthCard
 lang={lang}
 profileExtended={profileExtended}
 saveProfileExtended={saveProfileExtended}
 />

 {/* ── HOY BANNER ── */}
 <ImageBackground
 source={isHormonalContra ? null : (PHASE_IMAGES[pi?.phase] || PHASE_IMAGES.menstrual)}
 style={styles.todayPill}
 imageStyle={{ borderRadius: 24 }}
 >
 <View style={styles.todayRow}>
 <BlurView intensity={25} tint="light" style={styles.todayMiniCard}>
 <BText style={styles.todayLabel}>{tr('día', 'day', 'jour', 'giorno')}</BText>
 <BText style={styles.todayDay}>{pi?.day ?? '—'}</BText>
 </BlurView>
 <BlurView intensity={25} tint="light" style={[styles.todayMiniCard, { flex: 1 }]}>
 {isHormonalContra ? (
 <>
 <BText style={styles.todayTagline}>{tr('Ciclo con AC', 'Cycle on BC', 'Cycle sous CO', 'Ciclo con AC')}</BText>
 <BText style={styles.todayPhaseName}>{tr('Anticoncepción', 'Contraception', 'Contraception', 'Anticoncezionale')}</BText>
 </>
 ) : (
 <>
 <BText style={styles.todayTagline}>{dDisplay?.tagline}</BText>
 <BText style={styles.todayPhaseName}>{dDisplay?.name}</BText>
 </>
 )}
 </BlurView>
 <BlurView intensity={25} tint="light" style={styles.todayMiniCard}>
 {!isHormonalContra && (() => {
 const nextPhaseKey = pi?.phase === 'menstrual' ? 'follicular' : pi?.phase === 'follicular' ? 'ovulation' : pi?.phase === 'ovulation' ? 'luteal' : 'menstrual';
 const nextPh = getPhaseDisplay(lang, nextPhaseKey, PHASES[nextPhaseKey]);
 return <>
 <BText style={styles.todayLabel}>{nextPh.name} {tr('en', 'in', 'dans', 'tra')}</BText>
 <BText style={styles.todayDay}>{pi?.daysLeft ?? '—'} {tr('días', 'days', 'jours', 'giorni')}</BText>
 </>;
 })()}
 </BlurView>
 </View>
 </ImageBackground>

 {/* ── CALENDAR VIEW ── */}
 <View style={styles.calendarCard}>
 <View style={styles.cardHeader}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
 <TouchableOpacity onPress={() => setCalOffset(o => Math.max(-24, o - 1))}
 style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
 <ChevronLeft size={16} color="#171717" />
 </TouchableOpacity>
 <BText style={[styles.cardTitle, { flex: 1, textAlign: 'center', letterSpacing: 0 }]}>
 {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
 </BText>
 <TouchableOpacity onPress={() => setCalOffset(o => Math.min(6, o + 1))}
 style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
 <ChevronRight size={16} color="#171717" />
 </TouchableOpacity>
 </View>
 </View>
 {calOffset > 0 && (
 <BText style={{ fontSize: 11, color: '#737373', textAlign: 'center', marginBottom: 8 }}>
 {tr('Pronóstico estimado', 'Estimated forecast', 'Prévision estimée', 'Previsione stimata')}
 </BText>
 )}
 {isHormonalContra && (
 <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 8 }}>
 <BText style={{ fontSize: 12, color: '#92400E', flex: 1, lineHeight: 17 }}>
 {tr(
 'Con anticoncepción hormonal el ciclo no sigue el patrón natural. Solo se muestra la regla real — las fases estimadas no aplican.',
 'With hormonal contraception the cycle does not follow a natural pattern. Only real period data is shown — estimated phases do not apply.',
 'Avec une contraception hormonale, le cycle ne suit pas le schéma naturel. Seules les règles réelles sont affichées — les phases estimées ne s\'appliquent pas.',
 'Con contraccettivi ormonali il ciclo non segue il pattern naturale. Vengono mostrate solo le mestruazioni reali — le fasi stimate non si applicano.',
 )}
 </BText>
 </View>
 )}
 <View style={{ alignSelf:'stretch' }}>
 <View style={styles.calHeader}>
 {[...getDayLetters(lang).slice(1), getDayLetters(lang)[0]].map((h, i) => (
 <BText key={i} style={styles.calHeaderText}>{h}</BText>
 ))}
 </View>
 <View style={styles.calGrid}>
 {Array.from({ length: startOffset }).map((_, i) => (
 <View key={'e'+i} style={[styles.calCell, { backgroundColor: 'transparent' }]} />
 ))}
 {Array.from({ length: daysInMonth }, (_, i) => {
 const dayNum = i + 1;
 const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
 const isFuture = dateStr > todayStr;
 // Regla real (historial) → rojo; fases calculadas desde el período más cercano
 const isReal = inRealPeriod(dateStr);
 // Para fechas pasadas: buscar el inicio de período más reciente <= dateStr
 const refPeriod = !isHormonalContra
 ? (() => {
 const starts = periods.map(p => p.start?.split('T')[0]).filter(Boolean).sort();
 // El período de referencia es el más reciente que sea <= dateStr
 const ref = starts.filter(s => s <= dateStr).slice(-1)[0];
 return ref || (lastPeriod && dateStr >= lastPeriod ? lastPeriod : null);
 })()
 : null;
 const phase = isReal ? 'menstrual'
 : (refPeriod && !isHormonalContra) ? getPhaseForDate(dateStr, refPeriod, effectiveCycleLen)
 : null;
 const isToday = dateStr === todayStr;
 const isSelected = !marking && dateStr === selectedDate;
 const isMarked = marking && markStart && dateStr >= markStart && dateStr <= (markEnd || markStart);
 const hasLog = !!(cycleDailyLogs?.[dateStr]);
 return (
 <TouchableOpacity
 key={dayNum}
 onPress={() => marking ? handleMarkTap(dateStr) : lastPeriod && setSelectedDate(isSelected ? null : dateStr)}
 activeOpacity={(marking || lastPeriod) ? 0.65 : 1}
 style={[styles.calCell, marking && !isMarked && { opacity: 0.3 }]}
 >
 {phase && !isMarked && (
  <View style={[StyleSheet.absoluteFillObject, { opacity: isFuture ? 0.45 : 1, justifyContent: 'flex-end', alignItems: 'center' }]}>
   <PhaseGlow phase={phase} />
  </View>
 )}
 {isMarked && <View style={[styles.calCellArch, { backgroundColor: '#EF4444' }]} />}
 {isToday && <View style={styles.calCellTodayRing} />}
 <BText style={[
 styles.calDayNum,
 isFuture && { color: '#737373' },
 isMarked && { fontFamily: F.bodyB, color: 'white' },
 isToday && styles.calDayNumToday,
 isSelected && styles.calDayNumSelected,
 ]}>{dayNum}</BText>
 {hasLog && <View style={styles.calCycleLogDot} />}
 </TouchableOpacity>
 );
 })}
 </View>
 </View>

 {/* Legend pills — below the grid */}
 {!isHormonalContra && (
 <View style={styles.legend}>
 {Object.keys(PHASE_BG).map(k => {
 const phTr = getPhaseDisplay(lang, k, PHASES[k]);
 return (
 <View key={k} style={[styles.legendTag, { backgroundColor: PHASE_BG[k] }]}>
 <BText style={[styles.legendTagText, { color: PHASE_TEXT[k] }]}>{phTr.name}</BText>
 </View>
 );
 })}
 </View>
 )}

 {/* ── Marcar regla directamente en el calendario ── */}
 {!marking ? (
 <TouchableOpacity
 onPress={() => {
 setMarking(true); setSelectedDate(null);
 // Precarga la regla actual para poder ajustarla (reducir/ampliar)
 setMarkStart(lastPeriod || null);
 setMarkEnd(periodEnd || null);
 }}
 style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#171717', borderRadius: 12, height: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
 <BText style={{ color: '#171717', fontFamily: F.body, fontSize: 16 }}>
 {tr('Marcar regla', 'Mark period', 'Marquer les règles', 'Segna il ciclo')}
 </BText>
 </TouchableOpacity>
 ) : (
 <View style={{ alignSelf: 'stretch' }}>
 <BText style={{ fontSize: 12, color: '#737373', textAlign: 'center', marginBottom: 10 }}>
 {!markStart
 ? tr('Toca el día de inicio de tu regla', 'Tap the first day of your period', 'Touche le premier jour de tes règles', 'Tocca il primo giorno del tuo ciclo')
 : !markEnd
 ? tr('Ahora toca el día de fin (o guarda si fue solo un día)', 'Now tap the last day (or save if it was one day)', 'Touche maintenant le dernier jour (ou enregistre si un seul jour)', 'Ora tocca l\'ultimo giorno (o salva se è stato un solo giorno)')
 : tr('Toca otro día para ajustar el inicio o el fin, y guarda', 'Tap another day to adjust start or end, then save', 'Touche un autre jour pour ajuster le début ou la fin, puis enregistre', 'Tocca un altro giorno per regolare inizio o fine, poi salva')}
 </BText>
 <View style={{ flexDirection: 'row', gap: 8 }}>
 <TouchableOpacity
 onPress={() => { setMarking(false); setMarkStart(null); setMarkEnd(null); }}
 style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, alignItems: 'center' }}>
 <BText style={{ color: '#737373', fontFamily: F.bodyB, fontSize: 13 }}>
 {tr('Cancelar', 'Cancel', 'Annuler', 'Annulla')}
 </BText>
 </TouchableOpacity>
 <TouchableOpacity
 onPress={savePeriodMark} disabled={!markStart}
 style={{ flex: 1, backgroundColor: markStart ? '#EF4444' : '#FCA5A5', borderRadius: 12, padding: 12, alignItems: 'center' }}>
 <BText style={{ color: 'white', fontFamily: F.bodyB, fontSize: 13 }}>
 {tr('Guardar regla', 'Save period', 'Enregistrer', 'Salva ciclo')}
 </BText>
 </TouchableOpacity>
 </View>
 </View>
 )}

 {/* ── Day detail panel (oculto con anticoncepción hormonal) ── */}
 {!isHormonalContra && !marking && selectedDate && lastPeriod && (() => {
 const selPhase = getPhaseForDate(selectedDate, lastPeriod, effectiveCycleLen);
 const diff = Math.floor((new Date(selectedDate + 'T12:00:00') - new Date(lastPeriod + 'T12:00:00')) / 86400000);
 const selCycleDay = ((diff % effectiveCycleLen) + effectiveCycleLen) % effectiveCycleLen + 1;
 const ph = PHASES[selPhase];
 const phTr = getPhaseDisplay(lang, selPhase, ph);
 const dayLabel = ({ es: 'Día', en: 'Day', fr: 'Jour', it: 'Giorno' }[lang] || 'Día');
 const selDateFormatted = new Date(selectedDate + 'T12:00:00').toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' });
 return (
 <View style={[styles.dayDetail, { backgroundColor: PHASE_BG[selPhase] }]}>
  {/* Badge día — izquierda */}
  <View style={[styles.dayDetailDayBadge, { backgroundColor: PHASE_TEXT[selPhase] }]}>
   <BText style={styles.dayDetailDayNum}>{selCycleDay}</BText>
   <BText style={styles.dayDetailDayLbl}>{dayLabel}</BText>
  </View>
  {/* Info — derecha */}
  <View style={{ flex: 1, minWidth: 0 }}>
   <BText style={[styles.dayDetailDate, { color: PHASE_TEXT[selPhase] }]}>
    {selDateFormatted.charAt(0).toUpperCase() + selDateFormatted.slice(1)}
   </BText>
   <View style={styles.dayDetailRow}>
    <BText style={styles.dayDetailEmoji}>{ph.emoji}</BText>
    <BText style={[styles.dayDetailPhase, { color: PHASE_TEXT[selPhase] }]}>{phTr.name}</BText>
   </View>
   <BText style={[styles.dayDetailTagline, { color: PHASE_TEXT[selPhase] }]}>{phTr.tagline}</BText>
  </View>
 </View>
 );
 })()}

 {!lastPeriod && <BText style={styles.noDataNote}>{cy.noDataCal}</BText>}
 </View>

 {/* ── Registrar el día (tracking Clue-style) ── */}
 <View style={styles.logDayCard}>
 <View style={styles.logDayHeader}>
 <BText style={styles.logDayHeaderTxt}>
 + {tr('Registro & Histórico', 'Log & History', 'Journal & Historique', 'Registro & Storico')}
 </BText>
 <TouchableOpacity onPress={() => setHistoryOpen(true)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
 <ChevronRight size={16} color="#261E01" />
 </TouchableOpacity>
 </View>
 <BText style={styles.logDayTitle}>
 {tr('No te olvides de registrar tu día', "Don't forget to log your day", "N'oublie pas d'enregistrer ta journée", 'Non dimenticare di registrare la tua giornata')}
 </BText>
 <BText style={styles.logDaySub}>
 {tr(
 'Te ayudará a establecer patrones y ser consciente de tu estado anímico en las diferentes fases',
 'It will help you spot patterns and stay aware of your mood across phases',
 'Cela t\'aidera à repérer des schémas et à être consciente de ton humeur selon les phases',
 'Ti aiuterà a individuare pattern ed essere consapevole del tuo umore nelle diverse fasi',
 )}
 </BText>
 <TouchableOpacity style={styles.logDayBtn} onPress={() => setTrackingOpen(true)} activeOpacity={0.85}>
 <BText style={styles.logDayBtnTxt}>
 {tr('Registra tu día', 'Log your day', 'Enregistre ta journée', 'Registra la tua giornata')}
 </BText>
 </TouchableOpacity>
 </View>

 {/* ── Banner especial embarazo / postparto ── */}
 {(isPregnantCiclo || isPostpartumCiclo) && (
  <View style={cicStyles.pregnancyCicloBanner}>
   <BText style={cicStyles.pregnancyCicloEmoji}>{isPostpartumCiclo ? '🤱' : '🌸'}</BText>
   <View style={{ flex: 1, gap: 4 }}>
    <BText style={cicStyles.pregnancyCicloTitle}>
     {isPostpartumCiclo
      ? { es: 'Modo postparto', en: 'Postpartum mode', fr: 'Mode post-partum', it: 'Modalità post-parto' }[lang]
      : { es: 'Modo embarazo activo', en: 'Pregnancy mode active', fr: 'Mode grossesse actif', it: 'Modalità gravidanza attiva' }[lang]}
    </BText>
    <BText style={cicStyles.pregnancyCicloSub}>
     {isPostpartumCiclo
      ? { es: 'Tu ciclo volverá cuando termine la lactancia o en unas semanas. Puedes seguir registrando síntomas.', en: 'Your cycle will return when breastfeeding ends or in a few weeks. You can keep logging symptoms.', fr: 'Ton cycle reviendra à la fin de l\'allaitement ou dans quelques semaines. Tu peux continuer à noter tes symptômes.', it: 'Il tuo ciclo tornerà quando finisce l\'allattamento o tra qualche settimana. Puoi continuare a registrare i sintomi.' }[lang]
      : { es: 'Tu ciclo está en pausa. Los consejos de nutrición y sueño están adaptados a tu embarazo en la pestaña Nutrición.', en: 'Your cycle is paused. Nutrition and sleep tips are adapted to your pregnancy in the Nutrition tab.', fr: 'Ton cycle est en pause. Les conseils de nutrition et de sommeil sont adaptés à ta grossesse dans l\'onglet Nutrition.', it: 'Il tuo ciclo è in pausa. I consigli di nutrizione e sonno sono adattati alla tua gravidanza nella scheda Nutrizione.' }[lang]}
    </BText>
   </View>
  </View>
 )}

 {/* ── Carrusel de fases (ciclo normal) o bienestar (menopausia/postmenopausia) ── */}
 {isMenopause ? (
  <MenopauseWellnessCarousel lang={lang} />
 ) : !isHormonalContra && !isPregnantCiclo && !isPostpartumCiclo && (
 <View style={{ backgroundColor:'#F5F5F5', borderRadius:24, padding:16, gap:40 }}>
 <View>
 <BText style={styles.phaseInfoTitle}>{tr('Información de las fases', 'Phase information', 'Infos sur les phases', 'Informazioni sulle fasi')}</BText>
 <BText style={styles.phaseInfoSub}>{tr('Conoce tu ciclo en profundidad', 'Understand your cycle in depth', 'Comprends ton cycle en profondeur', 'Conosci il tuo ciclo in profondità')}</BText>
 </View>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 2 }}>
 {Object.entries(PHASES).map(([key, ph]) => {
 const phTr = getPhaseDisplay(lang, key, ph);
 const isActive = key === pi?.phase;
 return (
 <TouchableOpacity key={key} style={styles.phaseGridItem} onPress={() => setSelectedPhaseKey(key)} activeOpacity={0.85}>
 <View style={styles.phaseGridImgWrap}>
 <Image source={PHASE_IMAGES[key]} style={styles.phaseGridImg} resizeMode="cover" />
 {isActive && (
 <View style={styles.phaseGridActiveBadge}>
 <BText style={styles.phaseGridActiveTxt}>{cy.todayBadge}</BText>
 </View>
 )}
 </View>
 <View>
 <BText style={styles.phaseGridName}>{phTr.name}</BText>
 <BText style={styles.phaseGridDays}>{pDays[key]}</BText>
 </View>
 </TouchableOpacity>
 );
 })}
 </ScrollView>
 </View>
 )
 }

 {/* ── SLEEP TRACKER ── */}
 {/* SleepCard movido a Gimnasio > Salud */}

 <CycleTrackingModal
 visible={trackingOpen}
 onClose={() => setTrackingOpen(false)}
 lang={lang}
 cycleLog={cycleDailyLogs}
 onSave={(date, data) => logCycleDay?.(date, data)}
 currentPhase={pi?.phase || null}
 trackingPrefs={profileExtended?.cycleTrackingPrefs || {}}
 onSavePrefs={(prefs) => saveProfileExtended({ cycleTrackingPrefs: prefs })}
 />

 <CycleHistoryModal
 visible={historyOpen}
 onClose={() => setHistoryOpen(false)}
 lang={lang}
 cycleDailyLogs={cycleDailyLogs}
 lastPeriod={lastPeriod}
 cycleLength={pi?.cycleLength ?? 28}
 />

 <CycleImportModal
 visible={importOpen}
 onClose={() => setImportOpen(false)}
 lang={lang}
 importPeriods={importPeriods}
 />

 {/* La fecha y duración del ciclo se editan ahora marcando la regla
 directamente en la vista calendario ( Marcar regla). */}

 {/* ── Importar desde Apple Salud (iOS only) ── */}
 {Platform.OS === 'ios' && (
 <View style={styles.importCard}>
  <BText style={styles.sectionLabel}>{tr('Apple Salud', 'Apple Health', 'Santé Apple', 'Salute Apple')}</BText>
  <View style={styles.importRow}>
   <BText style={styles.importRowName}>Apple Health</BText>
   <BText style={styles.importRowSub}>{tr('Historial de ciclo', 'Cycle history', 'Historique du cycle', 'Cronologia ciclo')}</BText>
  </View>
  <TouchableOpacity style={styles.wearablesAddBtn} onPress={() => setImportOpen(true)} activeOpacity={0.85}>
   <BText style={styles.wearablesAddTxt}>
    {tr('Importar historial', 'Import history', 'Importer l\'historique', 'Importa cronologia')}
   </BText>
  </TouchableOpacity>
 </View>
 )}

 {/* ── CONSEJOS ── */}
 <TipsCard articles={cicloArticles} lang={lang} variant="azote" />

 {/* ── Phase info modal ── */}
 {selectedPhaseKey && (() => {
  const ph = PHASES[selectedPhaseKey];
  const phTr = getPhaseDisplay(lang, selectedPhaseKey, ph);
  return (
   <Modal visible={!!selectedPhaseKey} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={() => setSelectedPhaseKey(null)}>
    <View style={styles.phaseModalOverlay}>
     <SafeAreaView style={styles.phaseModalSheet}>
      <View style={styles.phaseModalHeader}>
       <BText style={styles.phaseModalTitle}>{tr('Información', 'Information', 'Information', 'Informazioni')}</BText>
       <TouchableOpacity style={styles.phaseModalClose} onPress={() => setSelectedPhaseKey(null)}>
        <BText style={{ fontSize: 18, color: '#0A0A0A', fontFamily: F.body, lineHeight: 22 }}>✕</BText>
       </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 32 }}>
       <View style={{ gap: 16 }}>
        <Image source={PHASE_IMAGES[selectedPhaseKey]} style={{ width: '100%', height: 200, borderRadius: 24 }} resizeMode="cover" />
        <BText style={styles.phaseModalName}>{phTr.name}</BText>
        <BText style={styles.phaseModalDesc}>{phTr.desc || ph.desc}</BText>
       </View>
       <View style={{ gap: 16 }}>
        <BText style={styles.phaseModalSectionTitle}>{tr('Nutrición', 'Nutrition', 'Nutrition', 'Nutrizione')}</BText>
        {ph.focus && ph.focus.map((f, i) => (
         <BText key={i} style={styles.phaseModalBodyTxt}>· {f}</BText>
        ))}
       </View>
       <View style={{ gap: 16 }}>
        <BText style={styles.phaseModalSectionTitle}>{tr('Consejos', 'Tips', 'Conseils', 'Consigli')}</BText>
        <BText style={styles.phaseModalBodyTxt}>{ph.tip}</BText>
       </View>
      </ScrollView>
     </SafeAreaView>
    </View>
   </Modal>
  );
 })()}
 </ScrollView>
 </>
 );
}

const cicStyles = StyleSheet.create({
 pregnancyCicloBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FDF2F8', borderRadius: 20, padding: 16, marginBottom: 8 },
 pregnancyCicloEmoji: { fontSize: 28, lineHeight: 34 },
 pregnancyCicloTitle: { fontSize: 15, fontFamily: F.bodyB, color: '#BE185D', lineHeight: 20 },
 pregnancyCicloSub: { fontSize: 13, fontFamily: F.body, color: '#9D174D', lineHeight: 18 },
});

const styles = StyleSheet.create({
 container: { flex:1, backgroundColor:'#FFFFFF' },
 sectionLabel: { fontSize: 12, fontFamily: F.bodyB, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 },
 importCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24 },
 importRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5', gap: 8 },
 importRowName: { flex: 1, fontSize: 16, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 20.8 },
 importRowSub: { fontSize: 14, fontFamily: F.body, color: '#737373', lineHeight: 20 },
 wearablesAddBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 wearablesAddTxt: { fontSize: 16, fontFamily: F.body, color: 'white', lineHeight: 24 },
 content: { padding:16, paddingTop:60, paddingBottom:100, gap:2 },
 card: { backgroundColor:'white', borderRadius:18, padding:16, shadowColor:'#000', shadowOffset:{ width:0, height:2 }, shadowOpacity:0.06, shadowRadius:8, elevation:2 },

 // Banner
 todayPill: { borderRadius:24, overflow:'hidden' },
 todayRow: { flexDirection:'row', gap:2, padding:8 },
 todayMiniCard: { backgroundColor:'rgba(255,255,255,0.3)', borderRadius:16, padding:8, gap:0, width:80, overflow:'hidden' },
 todayLabel: { fontSize:12, fontFamily: F.body, color:'#0a0a0a', letterSpacing:-0.24 },
 todayDay: { fontSize:18, color:'#0a0a0a', fontFamily: F.heading, lineHeight:23.4 },
 todayPhaseName: { fontSize:18, color:'#0a0a0a', fontFamily: F.heading, lineHeight:23.4 },
 todayTagline: { fontSize:12, color:'#0a0a0a', fontFamily: F.body, letterSpacing:-0.24 },

 // Card header
 cardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', alignSelf:'stretch' },
 cardTitle: { fontSize:16, color:'#0a0a0a', fontFamily: F.body, letterSpacing:-0.32 },
 viewToggleBtn: { backgroundColor:'#F0F4FA', borderRadius:20, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'#E2E8F0' },
 viewToggleBtnText: { fontSize:15, fontFamily: F.body },

 // Registrar el día
 logDayCard: { backgroundColor:'#49CF38', borderRadius:24, padding:16, gap:24 },
 logDayHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
 logDayHeaderTxt: { fontSize:12, fontFamily: F.body, color:'#0b1f08', letterSpacing:-0.24 },
 logDayTitle: { fontSize:32, color:'#0b1f08', lineHeight:35, fontFamily: F.headingX, letterSpacing:-0.32 },
 logDaySub: { fontSize:14, color:'#0b1f08', lineHeight:20, fontFamily: F.body, letterSpacing:-0.28 },
 logDayBtn: { backgroundColor:'#0A0A0A', height:48, borderRadius:12, alignItems:'center', justifyContent:'center', width:'100%' },
 logDayBtnTxt: { color:'#FAFAFA', fontFamily: F.body, fontSize:18 },

 // Calendar
 calendarCard: { backgroundColor:'#F5F5F5', borderRadius:32, padding:16, flexDirection:'column', alignItems:'flex-start', gap:24, alignSelf:'stretch' },
 legend: { flexDirection:'row', flexWrap:'wrap', gap:2 },
 legendTag: { height:24, paddingHorizontal:8, borderRadius:8, justifyContent:'center', alignItems:'center' },
 legendTagText: { fontSize:10, fontFamily: F.body, letterSpacing:0.3, textTransform:'uppercase' },
 calHeader: { flexDirection:'row', alignSelf:'stretch' },
 calHeaderText: { flex:1, textAlign:'center', fontSize:10, fontFamily: F.body, color:'#737373', textTransform:'uppercase', letterSpacing:-0.2, padding:4 },
 calGrid: { flexDirection:'row', flexWrap:'wrap', alignItems:'flex-start', alignContent:'flex-start', gap:4, alignSelf:'stretch' },
 calCell: { width:43, height:43, overflow:'hidden', borderRadius:4, backgroundColor:'white', alignItems:'center', justifyContent:'center' },
 calCellGlow1: { position:'absolute', top:10, left:-9, width:62, height:62, borderRadius:31, opacity:0.12 },
 calCellGlow2: { position:'absolute', top:16, left:-4, width:52, height:52, borderRadius:26, opacity:0.25 },
 calCellArch: { position:'absolute', top:21, left:-1, width:44, height:44, borderRadius:22, opacity:0.55 },
 calCellTodayRing: { position:'absolute', top:0, left:0, right:0, bottom:0, borderRadius:4, borderWidth:1, borderColor:'#0a0a0a' },
 calCycleLogDot: { position:'absolute', bottom:4, width:4, height:4, borderRadius:2, backgroundColor:'#0a0a0a' },

 calDayNum: { fontSize:12, fontFamily: F.body, color:'#0a0a0a', zIndex:1 },
 calDayNumToday: { fontFamily: F.bodyB, color:'#0a0a0a' },
 calCellSelected: {},
 calDayNumSelected: { fontFamily: F.bodyB },
 noDataNote: { fontSize:12, color:'#737373', textAlign:'center', marginTop:8, lineHeight:18, fontFamily: F.body },

 // Day detail panel
 dayDetail: { marginTop:14, borderRadius:16, padding:14, flexDirection:'row', alignItems:'center', gap:14 },
 dayDetailDayBadge: { width:52, height:52, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0 },
 dayDetailDayNum: { fontSize:22, fontFamily: F.bodyB, color:'white', lineHeight:26 },
 dayDetailDayLbl: { fontSize:9, fontFamily: F.bodyB, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:0.5 },
 dayDetailDate: { fontSize:11, fontFamily: F.body, opacity:0.7, marginBottom:3 },
 dayDetailRow: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:2 },
 dayDetailEmoji: { fontSize:18, fontFamily: F.body },
 dayDetailPhase: { fontSize:16, fontFamily: F.bodyB },
 dayDetailTagline: { fontSize:12, opacity:0.8, fontFamily: F.body },

 // Sleep card
 sleepLogRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
 sleepLabel: { fontSize:13, color:'#737373', fontFamily: F.body },
 hoursRow: { flexDirection:'row', alignItems:'center', gap:8 },
 hoursBtn: { width:32, height:32, borderRadius:16, backgroundColor:'#F0F4FA', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#E2E8F0' },
 hoursBtnText: { fontSize:18, fontFamily: F.bodyB, color:'#429FE7', lineHeight:22 },
 hoursValue: { fontSize:20, fontFamily: F.headingX, color:'#0A0A0A', minWidth:50, textAlign:'center' },
 qualityRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
 qualityBtns: { flexDirection:'row', gap:6 },
 qualityBtn: { width:36, height:36, borderRadius:18, borderWidth:1.5, borderColor:'#E2E8F0', justifyContent:'center', alignItems:'center' },
 qualityMoon: { fontSize:18, fontFamily: F.body },
 qualityLabelText: { fontSize:11, color:'#737373', textAlign:'right', marginBottom:12, fontFamily: F.body },
 logBtn: { backgroundColor:'#EFF6FF', borderRadius:12, paddingVertical:10, alignItems:'center', marginBottom:16, borderWidth:1, borderColor:'#BFDBFE' },
 logBtnSaved: { backgroundColor:'#F0FDF4', borderColor:'#BBF7D0' },
 logBtnText: { fontSize:14, fontFamily: F.bodyB, color:'#429FE7' },
 logBtnTextSaved: { color:'#16A34A' },
 sleepChart: { marginTop:4 },
 chartLabel: { fontSize:11, color:'#737373', fontFamily: F.bodyB, marginBottom:8 },
 barsRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end' },
 barItem: { flex:1, alignItems:'center' },
 barBg: { width:24, height:60, backgroundColor:'#F1F5F9', borderRadius:6, justifyContent:'flex-end', overflow:'hidden' },
 barFill: { width:'100%', borderRadius:6 },
 barDay: { fontSize:9, color:'#737373', marginTop:4, fontFamily: F.body },
 barHours: { fontSize:8, color:'#737373', marginTop:1, fontFamily: F.body },
 avgBadge: { backgroundColor:'#EFF6FF', paddingHorizontal:10, paddingVertical:4, borderRadius:10 },
 avgText: { fontSize:11, color:'#429FE7', fontFamily: F.bodyB },
 noDataText: { fontSize:12, color:'#737373', textAlign:'center', marginTop:8, fontFamily: F.body },

 // Información de las fases — carrusel con imágenes
 phaseInfoTitle: { fontSize:20, color:'#0A0A0A', fontFamily: F.headingX, letterSpacing:-0.2 },
 phaseInfoSub: { fontSize:16, color:'#0A0A0A', fontFamily: F.body, letterSpacing:-0.32 },
 phaseGrid: { flexDirection:'row', flexWrap:'wrap', gap:10 },
 phaseGridItem: { width: 200, backgroundColor:'white', borderRadius:16, overflow:'hidden', padding:8, gap:8 },
 phaseGridImgWrap: { width:'100%', height:200, borderRadius:12, overflow:'hidden', position:'relative' },
 phaseGridImg: { width:'100%', height:'100%' },
 phaseGridActiveBadge: { position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.65)', borderRadius:20, paddingHorizontal:8, paddingVertical:3 },
 phaseGridActiveTxt: { fontSize:9, fontFamily: F.bodyB, color:'white' },
 phaseGridName: { fontSize:18, color:'#0A0A0A', fontFamily: F.headingX, lineHeight:23 },
 phaseGridDays: { fontSize:14, color:'#525252', fontFamily: F.body, letterSpacing:-0.28, lineHeight:20 },


 // Phase info modal
 phaseModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 phaseModalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1, maxHeight: '90%' },
 phaseModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 48 },
 phaseModalTitle: { flex: 1, fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },
 phaseModalClose: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
 phaseModalName: { fontSize: 28, fontFamily: F.heading, color: '#171717', lineHeight: 32.2 },
 phaseModalDesc: { fontSize: 16, fontFamily: F.body, color: '#171717', lineHeight: 20.8 },
 phaseModalSectionTitle: { fontSize: 16, fontFamily: F.bodyB, color: '#171717' },
 phaseModalBodyTxt: { fontSize: 16, fontFamily: F.body, color: '#171717', lineHeight: 20.8 },

 // Edit
 editBtn: { fontSize:13, color:'#737373', textAlign:'center', padding:4, fontFamily: F.body },
 editTitle: { fontSize:14, fontFamily: F.bodyB, color:'#0A0A0A', marginBottom:12 },
 editLabel: { fontSize:12, color:'#737373', marginBottom:8, fontFamily: F.body },
 periodEndHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
 periodEndClear: { fontSize:12, color:'#EF4444', fontFamily: F.bodyB },
 dateBtn: { padding:10, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', marginRight:8, alignItems:'center', minWidth:60 },
 dateBtnSmall: { minWidth:50, padding:8 },
 dateBtnActive: { backgroundColor:'#429FE7', borderColor:'#429FE7' },
 dateBtnText: { fontSize:12, color:'#737373', fontFamily: F.body },
 lenRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
 lenBtn: { padding:8, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', minWidth:40, alignItems:'center' },
 lenBtnActive: { backgroundColor:'#429FE7', borderColor:'#429FE7' },
 lenBtnText: { fontSize:13, color:'#737373', fontFamily: F.body },
 lenBtnTextActive: { color:'white', fontFamily: F.bodyB },
 editBtns: { flexDirection:'row', gap:8 },
 cancelBtn: { flex:1, padding:10, borderRadius:10, borderWidth:1, borderColor:'#E2E8F0', alignItems:'center' },
 cancelText: { fontSize:14, color:'#737373', fontFamily: F.body },
 saveBtn: { flex:1, padding:10, borderRadius:10, backgroundColor:'#429FE7', alignItems:'center' },
 saveText: { fontSize:14, color:'white', fontFamily: F.bodyB },
});
const es = StyleSheet.create({
 wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
 card: { borderRadius: 24, padding: 16, gap: 32, overflow: 'hidden', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.20)' },
 iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#49CF38', alignItems: 'center', justifyContent: 'center' },
 iconInner: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0B1F08' },
 title: { fontSize: 24, fontFamily: F.heading, color: 'white', textAlign: 'center', lineHeight: 28.8 },
 sub: { fontSize: 16, fontFamily: F.body, color: 'white', textAlign: 'center', lineHeight: 20.8 },
 btn: { alignSelf: 'stretch', height: 48, backgroundColor: '#171717', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
 btnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA', lineHeight: 24 },
});


