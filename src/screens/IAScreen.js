import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, LayoutAnimation, Platform, UIManager, Dimensions, ActivityIndicator } from 'react-native';
import { F } from '../theme/fonts';
import { Check, ChevronRight } from 'lucide-react-native';
import T, { LANGUAGES, t } from '../i18n/translations';
import ProgressChart from '../components/ProgressChart';
import { syncWeekToCalendar, removeAllCalendarEvents, exportWeekICS, IS_EXPO_GO, getWorkoutForDate } from '../utils/calendarSync';
import { useDiets, DIET_CATEGORIES, normalizeDietId } from '../hooks/useDiets';
import { syncNotifications, cancelAllMeirinsNotifications } from '../utils/notifications';
import { ALL_MEALS, MEAL_LABELS, getActiveMeals } from '../utils/fastingMeals';
import { Linking, Image, Alert } from 'react-native';
import { PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '../lib/legalLinks';
import { trackScreen } from '../lib/analytics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BLUE = { primary: '#1A56DB', light: '#EFF6FF' };

// ─── Label maps ───────────────────────────────────────────────────────────────
// ─── Multilingual label maps ──────────────────────────────────────────────────
// Each map has { es, en, fr } so we pick the right one at render time.

const LIFE_L = {
  es: { adult:'👩 Adulta', teen:'🌱 Adolescente', perimenopause:'🌅 Perimenopausia', menopause:'🌸 Menopausia', postpartum:'🤱 Postparto', pregnant:'🤰 Embarazada' },
  en: { adult:'👩 Adult', teen:'🌱 Teenager', perimenopause:'🌅 Perimenopause', menopause:'🌸 Menopause', postpartum:'🤱 Postpartum', pregnant:'🤰 Pregnant' },
  fr: { adult:'👩 Adulte', teen:'🌱 Adolescente', perimenopause:'🌅 Périménopause', menopause:'🌸 Ménopause', postpartum:'🤱 Post-partum', pregnant:'🤰 Enceinte' },
};

const GOAL_L = {
  es: { lose_weight:'⚖️ Perder peso y definir', maintain:'⚡ Mantener mi peso', gain_muscle:'💪 Ganar músculo', energy:'🌅 Mejorar energía', reduce_symptoms:'🌙 Reducir síntomas', fertility:'🌱 Apoyo fertilidad', performance:'🏆 Rendimiento deportivo', rehab:'🩺 Rehabilitación' },
  en: { lose_weight:'⚖️ Lose weight & tone', maintain:'⚡ Maintain weight', gain_muscle:'💪 Gain muscle', energy:'🌅 Improve energy', reduce_symptoms:'🌙 Reduce symptoms', fertility:'🌱 Fertility support', performance:'🏆 Athletic performance', rehab:'🩺 Rehabilitation' },
  fr: { lose_weight:'⚖️ Perdre du poids', maintain:'⚡ Maintenir mon poids', gain_muscle:'💪 Prendre du muscle', energy:'🌅 Améliorer mon énergie', reduce_symptoms:'🌙 Réduire les symptômes', fertility:'🌱 Soutien fertilité', performance:'🏆 Performance sportive', rehab:'🩺 Rééducation' },
};
const FITNESS_L = {
  es: { beginner:'🌱 Principiante', occasional:'🚶 Activa ocasional', regular:'🏃 Regular', advanced:'🏋️ Avanzada' },
  en: { beginner:'🌱 Beginner', occasional:'🚶 Occasional', regular:'🏃 Regular', advanced:'🏋️ Advanced' },
  fr: { beginner:'🌱 Débutante', occasional:'🚶 Occasionnelle', regular:'🏃 Régulière', advanced:'🏋️ Avancée' },
};
const GYM_L = {
  es: { gym:'🏋️ Gym', home:'🏠 Casa', outdoor:'🌿 Exterior', mixed:'🔀 Mixto' },
  en: { gym:'🏋️ Gym', home:'🏠 Home', outdoor:'🌿 Outdoor', mixed:'🔀 Mixed' },
  fr: { gym:'🏋️ Gym', home:'🏠 Maison', outdoor:'🌿 Extérieur', mixed:'🔀 Mixte' },
};
const DIET_L = {
  es: { omnivore:'🍗 Omnívora', flexitarian:'🥗 Flexitariana', pescatarian:'🐟 Pescetariana', vegetarian:'🥦 Vegetariana', vegan:'🌱 Vegana' },
  en: { omnivore:'🍗 Omnivore', flexitarian:'🥗 Flexitarian', pescatarian:'🐟 Pescatarian', vegetarian:'🥦 Vegetarian', vegan:'🌱 Vegan' },
  fr: { omnivore:'🍗 Omnivore', flexitarian:'🥗 Flexitarienne', pescatarian:'🐟 Pescétarienne', vegetarian:'🥦 Végétarienne', vegan:'🌱 Végane' },
};
const COOKING_L = { under20:'⚡ <20 min', '20to40':'🍳 20–40 min', over60:'👨‍🍳 >1h' }; // no lang variants
const BUDGET_L = {
  es: { low:'💰 Económico', medium:'💳 Medio', high:'✨ Sin límite' },
  en: { low:'💰 Budget', medium:'💳 Medium', high:'✨ No limit' },
  fr: { low:'💰 Économique', medium:'💳 Moyen', high:'✨ Sans limite' },
};
const SLEEP_L = {
  es: { good:'😴 Bien', insomnia:'👁️ Insomnio', night_shift:'🌙 Turno de noche' },
  en: { good:'😴 Good', insomnia:'👁️ Insomnia', night_shift:'🌙 Night shift' },
  fr: { good:'😴 Bien', insomnia:'👁️ Insomnie', night_shift:'🌙 Travail de nuit' },
};
const STRESS_L = {
  es: { low:'🌿 Bajo', moderate:'🌊 Moderado', chronic:'🔥 Burnout' },
  en: { low:'🌿 Low', moderate:'🌊 Moderate', chronic:'🔥 Burnout' },
  fr: { low:'🌿 Bas', moderate:'🌊 Modéré', chronic:'🔥 Burnout' },
};
const WORK_L = {
  es: { office:'💼 Oficina', physical:'🦺 Físico', remote:'🏠 Remoto' },
  en: { office:'💼 Office', physical:'🦺 Physical', remote:'🏠 Remote' },
  fr: { office:'💼 Bureau', physical:'🦺 Physique', remote:'🏠 Télétravail' },
};
const ALLERGY_L = {
  es: { lactose:'🥛 Lactosa', gluten:'🌾 Gluten', nuts:'🥜 Frutos secos', egg:'🥚 Huevo', shellfish:'🦐 Marisco', soy:'🫘 Soja', sesame:'🌿 Sésamo' },
  en: { lactose:'🥛 Lactose', gluten:'🌾 Gluten', nuts:'🥜 Nuts', egg:'🥚 Egg', shellfish:'🦐 Shellfish', soy:'🫘 Soy', sesame:'🌿 Sesame' },
  fr: { lactose:'🥛 Lactose', gluten:'🌾 Gluten', nuts:'🥜 Fruits à coque', egg:'🥚 Œuf', shellfish:'🦐 Crustacés', soy:'🫘 Soja', sesame:'🌿 Sésame' },
};
const DISLIKE_L = {
  es: { spicy:'🌶️ Picante', onion:'🧅 Cebolla', garlic:'🧄 Ajo', legumes:'🫘 Legumbres', fermented:'🫙 Fermentados' },
  en: { spicy:'🌶️ Spicy', onion:'🧅 Onion', garlic:'🧄 Garlic', legumes:'🫘 Legumes', fermented:'🫙 Fermented' },
  fr: { spicy:'🌶️ Épicé', onion:'🧅 Oignon', garlic:'🧄 Ail', legumes:'🫘 Légumineuses', fermented:'🫙 Fermentés' },
};
const SPORT_L = {
  es: { running:'🏃 Running', cycling:'🚴 Ciclismo', yoga:'🧘 Yoga/Pilates', swimming:'🏊 Natación', strength:'🏋️ Fuerza', hiit:'⚡ HIIT', dance:'💃 Baile', crossfit:'🔥 CrossFit', martialarts:'🥊 Artes marciales', climbing:'🧗 Escalada', team:'⚽ Equipo', other:'🌀 Otro' },
  en: { running:'🏃 Running', cycling:'🚴 Cycling', yoga:'🧘 Yoga/Pilates', swimming:'🏊 Swimming', strength:'🏋️ Strength', hiit:'⚡ HIIT', dance:'💃 Dance', crossfit:'🔥 CrossFit', martialarts:'🥊 Martial arts', climbing:'🧗 Climbing', team:'⚽ Team sport', other:'🌀 Other' },
  fr: { running:'🏃 Running', cycling:'🚴 Cyclisme', yoga:'🧘 Yoga/Pilates', swimming:'🏊 Natation', strength:'🏋️ Musculation', hiit:'⚡ HIIT', dance:'💃 Danse', crossfit:'🔥 CrossFit', martialarts:'🥊 Arts martiaux', climbing:'🧗 Escalade', team:'⚽ Sport collectif', other:'🌀 Autre' },
};
const COND_L = {
  es: { pcos:'🩺 SOP/PCOS', endometriosis:'🌸 Endometriosis', hypothyroidism:'⚡ Hipotiroidismo', hyperthyroidism:'⚡ Hipertiroidismo', type1_diabetes:'💉 Diabetes tipo 1', type2_diabetes:'💉 Diabetes tipo 2', hypertension:'❤️ Hipertensión', anemia:'🩸 Anemia', none:'✅ Ninguna' },
  en: { pcos:'🩺 PCOS', endometriosis:'🌸 Endometriosis', hypothyroidism:'⚡ Hypothyroidism', hyperthyroidism:'⚡ Hyperthyroidism', type1_diabetes:'💉 Type 1 diabetes', type2_diabetes:'💉 Type 2 diabetes', hypertension:'❤️ Hypertension', anemia:'🩸 Anaemia', none:'✅ None' },
  fr: { pcos:'🩺 SOPK/PCOS', endometriosis:'🌸 Endométriose', hypothyroidism:'⚡ Hypothyroïdie', hyperthyroidism:'⚡ Hyperthyroïdie', type1_diabetes:'💉 Diabète type 1', type2_diabetes:'💉 Diabète type 2', hypertension:'❤️ Hypertension', anemia:'🩸 Anémie', none:'✅ Aucune' },
};
const MED_L = {
  es: { hormonal_contraceptive:'💊 Anticonceptivo hormonal', levothyroxine:'🔵 Levotiroxina', metformin:'🔵 Metformina', antidepressants:'🔵 Antidepresivos', iron:'🩸 Hierro', ssri:'🧠 ISRS', none:'✅ Ninguna' },
  en: { hormonal_contraceptive:'💊 Hormonal contraceptive', levothyroxine:'🔵 Levothyroxine', metformin:'🔵 Metformin', antidepressants:'🔵 Antidepressants', iron:'🩸 Iron', ssri:'🧠 SSRI', none:'✅ None' },
  fr: { hormonal_contraceptive:'💊 Contraceptif hormonal', levothyroxine:'🔵 Lévothyroxine', metformin:'🔵 Metformine', antidepressants:'🔵 Antidépresseurs', iron:'🩸 Fer', ssri:'🧠 ISRS', none:'✅ Aucun' },
};
const CONTRA_L = {
  es: { pill:'💊 Píldora', iud_hormonal:'🌀 DIU hormonal', iud_copper:'🔩 DIU cobre', patch:'🩹 Parche', injection:'💉 Inyectable', implant:'📌 Implante', ring:'⭕ Anillo', none:'—' },
  en: { pill:'💊 Pill', iud_hormonal:'🌀 Hormonal IUD', iud_copper:'🔩 Copper IUD', patch:'🩹 Patch', injection:'💉 Injection', implant:'📌 Implant', ring:'⭕ Ring', none:'—' },
  fr: { pill:'💊 Pilule', iud_hormonal:'🌀 DIU hormonal', iud_copper:'🔩 DIU cuivre', patch:'🩹 Patch', injection:'💉 Injectable', implant:'📌 Implant', ring:'⭕ Anneau', none:'—' },
};
const MH_L = {
  es: { anxiety:'😰 Ansiedad', depression:'🌧 Depresión', burnout:'🔥 Burnout', eating_disorder:'🍽 TCA', none:'✅ Ninguna' },
  en: { anxiety:'😰 Anxiety', depression:'🌧 Depression', burnout:'🔥 Burnout', eating_disorder:'🍽 Eating disorder', none:'✅ None' },
  fr: { anxiety:'😰 Anxiété', depression:'🌧 Dépression', burnout:'🔥 Burnout', eating_disorder:'🍽 TCA', none:'✅ Aucune' },
};
const INJURY_L = {
  es: { knee:'🦵 Rodilla', back:'🧍 Espalda', shoulder:'💪 Hombro', hip:'🦴 Cadera', neck:'🔄 Cuello', ankle:'🦶 Tobillo', other:'📌 Otro' },
  en: { knee:'🦵 Knee', back:'🧍 Back', shoulder:'💪 Shoulder', hip:'🦴 Hip', neck:'🔄 Neck', ankle:'🦶 Ankle', other:'📌 Other' },
  fr: { knee:'🦵 Genou', back:'🧍 Dos', shoulder:'💪 Épaule', hip:'🦴 Hanche', neck:'🔄 Cou', ankle:'🦶 Cheville', other:'📌 Autre' },
};

const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

// Pick from a multilingual map { es:{}, en:{}, fr:{} } or a flat map
function lbl(map, key, lang = 'es') {
  if (!key) return null;
  const m = map[lang] ?? map.es ?? map; // use lang variant if available, else flat map
  return m[key] || key;
}
function lblArr(map, arr, lang = 'es') {
  if (!arr || !arr.length) return null;
  return arr.map(k => lbl(map, k, lang)).join('  ·  ');
}

function InfoRow({ icon, title, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <View style={styles.infoRowBody}>
        <Text style={styles.infoRowTitle}>{title}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
      </View>
    </View>
  );
}

function ChipRow({ items }) {
  if (!items || !items.length) return null;
  return (
    <View style={styles.chipRow}>
      {items.map((item, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{item}</Text></View>)}
    </View>
  );
}

export default function PerfilScreen({ pi, profile, signOut }) {
  useEffect(() => { trackScreen('Perfil'); }, []);
  const ext = profile?.profileExtended || {};

  // Language — read from profile_extended, default es
  const [lang, setLang] = useState(ext.language || 'es');

  const [editing, setEditing]   = useState(null);

  // Estado editable para el programa personalizado (datos de ProfileOnboarding)
  const [editFitness,      setEditFitness]      = useState(ext.fitnessLevel   || '');
  const [editGym,          setEditGym]          = useState(ext.gymAccess      || '');
  const [editDiet,         setEditDiet]         = useState(ext.diet              || '');
  const [editDietMod,      setEditDietMod]      = useState(ext.dietModifiers     || []);
  const [editFasting,      setEditFasting]      = useState(ext.fastingProtocol  || '');
  const [editMealsActive,  setEditMealsActive]  = useState(ext.mealsActive      || null);
  const [editAllergies,    setEditAllergies]    = useState(ext.allergies      || []);
  const [editDislikes,     setEditDislikes]     = useState(ext.foodDislikes   || []);
  const [editCooking,      setEditCooking]      = useState(ext.cookingTime    || '');
  const [editBudget,       setEditBudget]       = useState(ext.weeklyBudget   || '');
  const [editBatchCooking, setEditBatchCooking] = useState(!!ext.batchCooking);
  const [editGoals,        setEditGoals]        = useState(
    ext.primaryGoals?.length > 0 ? ext.primaryGoals : ext.primaryGoal ? [ext.primaryGoal] : []
  );
  // ── Salud ──
  const [editLifeStage,    setEditLifeStage]    = useState(ext.lifeStage      || '');
  const [editConditions,   setEditConditions]   = useState(ext.conditions     || []);
  const [editContraUse,    setEditContraUse]    = useState(ext.contraUse      ?? null);
  const [editContraType,   setEditContraType]   = useState(ext.contraType     || '');
  const [editMedications,  setEditMedications]  = useState(ext.medications    || []);
  const [savingExt,        setSavingExt]        = useState(false);

  // ── Weight tracker ──
  const weightLog    = ext.weightLog || [];
  const todayStr     = new Date().toISOString().split('T')[0];
  const todayEntry   = weightLog.find(e => e.date === todayStr);
  const lastEntry    = weightLog[0]; // log is sorted desc
  const [todayW, setTodayW]       = useState(todayEntry?.weight ?? (profile?.weight || 60));
  const [targetW, setTargetW]     = useState(ext.targetWeight || '');
  const [editTarget, setEditTarget] = useState(false);
  const [wLogged, setWLogged]     = useState(!!todayEntry);

  const changeW = (delta) => setTodayW(w => Math.max(30, Math.min(200, Math.round((+w + delta) * 10) / 10)));

  const handleLogWeight = async () => {
    if (!profile?.logWeight) return;
    await profile.logWeight({ date: todayStr, weight: +todayW });
    if (targetW && !ext.targetWeight) {
      await profile.saveProfileExtended({ targetWeight: +targetW });
    }
    setWLogged(true);
  };

  // ── Notificaciones ──
  const notifSettings    = ext.notifSettings || {};
  const [notifSaving,    setNotifSaving]    = useState(false);
  const [notifStatus,    setNotifStatus]    = useState('idle'); // 'idle'|'ok'|'denied'|'error'
  const NOTIF_HOUR_OPTS  = [6, 7, 8, 9, 10, 12, 17, 18, 19, 20];

  const handleSaveNotifSettings = async (newSettings) => {
    setNotifSaving(true);
    try {
      const merged = { ...notifSettings, ...newSettings };
      await profile.saveProfileExtended({ notifSettings: merged });
      const lastPeriod = ext.lastPeriod || profile?.lastPeriod || null;
      await syncNotifications({
        lastPeriod,
        cycleLength: profile?.cycleLength || ext.cycleLength || 28,
        trainDays:   profile?.trainDays   || [],
        notifSettings: merged,
      }, lang);
      setNotifStatus('ok');
    } catch (e) {
      setNotifStatus(e.message?.includes('permission') ? 'denied' : 'error');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleDisableAllNotifs = async () => {
    await cancelAllMeirinsNotifications();
    await profile.saveProfileExtended({ notifSettings: { cycle: false, workout: false, hydration: false } });
    setNotifStatus('idle');
  };

  // ── Calendar sync ──
  const calSyncEnabled = !!ext.calendarSync;
  const calSyncHour    = ext.calendarSyncHour ?? 7;
  const calEvents      = ext.calendarEvents   || {};
  const [calSyncing,   setCalSyncing]   = useState(false);
  const [calStatus,    setCalStatus]    = useState('idle'); // 'idle'|'synced'|'error'|'denied'
  const [deleting,     setDeleting]     = useState(false);
  const [deleteStep,   setDeleteStep]   = useState(0); // 0=hidden 1=confirm 2=deleting
  const HOUR_OPTIONS   = [6, 7, 8, 9, 17, 18, 19, 20];

  const todayWorkout = pi?.phase ? getWorkoutForDate(pi.phase, todayStr) : null;

  const handleToggleCalSync = async () => {
    if (calSyncEnabled) {
      await removeAllCalendarEvents(calEvents);
      await profile.saveProfileExtended({ calendarSync: false, calendarEvents: {} });
      setCalStatus('idle');
      return;
    }
    setCalSyncing(true);
    try {
      if (IS_EXPO_GO) {
        // En Expo Go: exportar ICS — el usuario añade los eventos manualmente
        await exportWeekICS({
          phase:     pi?.phase,
          trainDays: profile?.trainDays || [],
          hour:      calSyncHour,
        });
        await profile.saveProfileExtended({ calendarSync: true });
        setCalStatus('synced');
      } else {
        // En build nativo: sincronización directa silenciosa
        const events = await syncWeekToCalendar({
          phase:          pi?.phase,
          trainDays:      profile?.trainDays || [],
          hour:           calSyncHour,
          calendarEvents: calEvents,
        });
        await profile.saveProfileExtended({ calendarSync: true, calendarEvents: events });
        setCalStatus('synced');
      }
    } catch (e) {
      if (e.message === 'PERMISSION_DENIED') setCalStatus('denied');
      else if (e.message === 'NO_WORKOUTS_THIS_WEEK') setCalStatus('noworkouts');
      else setCalStatus('error');
    } finally {
      setCalSyncing(false);
    }
  };

  const handleResync = async () => {
    setCalSyncing(true);
    try {
      if (IS_EXPO_GO) {
        await exportWeekICS({
          phase:     pi?.phase,
          trainDays: profile?.trainDays || [],
          hour:      calSyncHour,
        });
        setCalStatus('synced');
      } else {
        const events = await syncWeekToCalendar({
          phase:          pi?.phase,
          trainDays:      profile?.trainDays || [],
          hour:           calSyncHour,
          calendarEvents: calEvents,
        });
        await profile.saveProfileExtended({ calendarEvents: events });
        setCalStatus('synced');
      }
    } catch (e) {
      setCalStatus(e.message === 'NO_WORKOUTS_THIS_WEEK' ? 'noworkouts' : 'error');
    } finally {
      setCalSyncing(false);
    }
  };

  const handleChangeHour = async (h) => {
    await profile.saveProfileExtended({ calendarSyncHour: h });
  };
  const [age, setAge]           = useState(String(profile?.age || ''));
  const [weight, setWeight]     = useState(String(profile?.weight || ''));
  const [height, setHeight]     = useState(String(profile?.height || ''));
  const [activityLevel, setAL]  = useState(profile?.activityLevel || 'moderate');
  const [goal, setGoal]         = useState(profile?.goal || 'lose_weight');
  const [dietary, setDietary]   = useState(profile?.dietary || []);
  const [trainDays, setTD]      = useState(profile?.trainDays || [1, 2, 4, 5]);
  const [saving, setSaving]     = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Support both old (primaryGoal string) and new (primaryGoals array) format
  const primaryGoals = ext.primaryGoals?.length > 0
    ? ext.primaryGoals
    : ext.primaryGoal
      ? [ext.primaryGoal]
      : [];

  // Show extended profile section if onboarding was completed OR if any extended data exists
  const hasExtended = ext.profileOnboardingComplete || primaryGoals.length > 0 || ext.fitnessLevel || ext.diet;

  const changeLang = async (code) => {
    setLang(code);
    if (profile?.saveProfileExtended) {
      await profile.saveProfileExtended({ language: code });
    }
  };

  const toggleDietary = (id) => {
    if (id === 'none') { setDietary(['none']); return; }
    const without = dietary.filter(x => x !== 'none');
    setDietary(without.includes(id) ? without.filter(x => x !== id) : [...without, id]);
  };
  const toggleDay = (d) => {
    if (trainDays.includes(d)) {
      setTD(trainDays.filter(x => x !== d));   // sin mínimo
    } else {
      if (trainDays.length < 6) setTD([...trainDays, d].sort());
    }
  };
  const save = async () => {
    setSaving(true);
    await profile.saveAll({ age: parseInt(age), weight: parseFloat(weight), height: parseFloat(height), activityLevel, goal, dietary, trainDays });
    setSaving(false);
    setEditing(null);
  };
  const toggleMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMoreOpen(v => !v);
  };

  const toggleExtArr = (arr, set, val) =>
    arr.includes(val) ? set(arr.filter(x => x !== val)) : set([...arr, val]);

  const saveProgram = async () => {
    setSavingExt(true);
    // Este formulario solo edita los objetivos. El resto (dieta, ayuno,
    // alergias, nivel, lugar…) se gestiona en las pestañas Nutrición y
    // Gimnasio — no se sobreescribe aquí para no machacar datos.
    await profile.saveProfileExtended({ primaryGoals: editGoals });
    setSavingExt(false);
    setEditing(null);
  };

  const saveHealth = async () => {
    setSavingExt(true);
    await profile.saveProfileExtended({
      lifeStage:   editLifeStage,
      conditions:  editConditions,
      contraUse:   editContraUse,
      contraType:  editContraUse ? editContraType : '',
      medications: editMedications,
    });
    setSavingExt(false);
    setEditing(null);
  };

  // ── Avatar de usuario ──
  const avatarUri = ext.avatarUri || null;
  const [avatarUploading, setAvatarUploading] = useState(false);

  const pickAvatar = async (source) => {
    try {
      setAvatarUploading(true);
      const ImagePicker = require('expo-image-picker');

      // Pedir permiso
      let perm;
      if (source === 'camera') {
        perm = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (perm.status !== 'granted') {
        Alert.alert(
          lang === 'en' ? 'Permission needed' : 'Permiso necesario',
          lang === 'en' ? 'Enable access in Settings.' : 'Actívalo en Ajustes.',
        );
        setAvatarUploading(false);
        return;
      }

      const picker = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await picker({
        mediaTypes:    ImagePicker.MediaTypeOptions?.Images,
        allowsEditing: true,
        aspect:        [1, 1],
        quality:       0.5,
        base64:        true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await profile.saveProfileExtended({ avatarUri: uri });
      }
    } catch (e) {
      console.warn('Avatar pick error:', e);
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatar = () => {
    Alert.alert(
      lang === 'en' ? 'Remove photo?' : '¿Eliminar foto?',
      '',
      [
        { text: lang === 'en' ? 'Cancel' : 'Cancelar', style: 'cancel' },
        { text: lang === 'en' ? 'Remove' : 'Eliminar', style: 'destructive', onPress: async () => {
          await profile.saveProfileExtended({ avatarUri: null });
        }},
      ],
    );
  };

  const handleAvatarPress = () => {
    Alert.alert(
      lang === 'en' ? 'Profile picture' : lang === 'fr' ? 'Photo de profil' : 'Foto de perfil',
      '',
      [
        { text: lang === 'en' ? '📷 Camera' : '📷 Cámara', onPress: () => pickAvatar('camera') },
        { text: lang === 'en' ? '🖼 Photos' : '🖼 Galería', onPress: () => pickAvatar('library') },
        ...(avatarUri ? [{ text: lang === 'en' ? '🗑 Remove' : '🗑 Eliminar', style: 'destructive', onPress: removeAvatar }] : []),
        { text: lang === 'en' ? 'Cancel' : 'Cancelar', style: 'cancel' },
      ],
    );
  };

  const p = T[lang] || T.es;
  const { diets: allDiets, dietsByCategory, getDiet } = useDiets(lang);
  const name = ext.name || '';

  // ── Editar nombre con prompt ─────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft]     = useState(name);

  const handleEditName = () => {
    setNameDraft(name);
    setEditingName(true);
  };
  const saveName = async () => {
    const trimmed = (nameDraft || '').trim();
    await profile.saveProfileExtended({ name: trimmed });
    setEditingName(false);
  };

  const ACTIVITY_OPTIONS = [
    { id: 'sedentary', emoji: '🛋️', label: p.activity.sedentary },
    { id: 'light',     emoji: '🚶', label: p.activity.light },
    { id: 'moderate',  emoji: '🏃', label: p.activity.moderate },
    { id: 'active',    emoji: '🏋️', label: p.activity.active },
  ];
  const GOAL_OPTIONS = [
    { id: 'lose_weight', emoji: '⚡', label: p.goals.lose_weight },
    { id: 'maintain',    emoji: '⚖️', label: p.goals.maintain },
    { id: 'gain_muscle', emoji: '💪', label: p.goals.gain_muscle },
  ];
  const DIETARY_OPTIONS = [
    { id: 'lactose_free', label: '🥛 Sin lactosa / Lactose-free / Sans lactose' },
    { id: 'gluten_free',  label: '🌾 Sin gluten / Gluten-free / Sans gluten' },
    { id: 'vegetarian',   label: '🥗 Vegetariana / Vegetarian / Végétarienne' },
    { id: 'vegan',        label: '🌱 Vegana / Vegan / Végane' },
    { id: 'none',         label: lang === 'fr' ? '✅ Aucune restriction' : lang === 'en' ? '✅ No restrictions' : '✅ Sin restricciones' },
  ];

  const actOpt  = ACTIVITY_OPTIONS.find(a => a.id === activityLevel);
  const goalOpt = GOAL_OPTIONS.find(g => g.id === goal);
  const goalMap = GOAL_L[lang] || GOAL_L.es;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── TÍTULO "Perfil" ── */}
      <View style={styles.pageTitleRow}>
        <Text style={styles.pageTitle}>{lang === 'en' ? 'Profile' : lang === 'fr' ? 'Profil' : lang === 'it' ? 'Profilo' : 'Perfil'}</Text>
      </View>

      {/* ── CABECERA ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : '👤'}</Text>
            </View>
          )}
          <View style={styles.avatarEdit}>
            <Text style={styles.avatarEditTxt}>{avatarUploading ? '⏳' : '📷'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
          {name ? (
            <Text style={styles.headerName}>{name} <Text style={{ fontSize: 14, color: '#94A3B8' }}>✏️</Text></Text>
          ) : (
            <Text style={[styles.headerName, { color: '#94A3B8', fontStyle: 'italic' }]}>
              + {lang === 'en' ? 'Add your name' : lang === 'fr' ? 'Ajoute ton prénom' : lang === 'it' ? 'Aggiungi il tuo nome' : 'Añade tu nombre'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Modal de edición de nombre */}
        {editingName && (
          <View style={styles.nameModalOverlay}>
            <View style={styles.nameModal}>
              <Text style={styles.nameModalTitle}>
                {lang === 'en' ? 'Your name' : lang === 'fr' ? 'Ton prénom' : lang === 'it' ? 'Il tuo nome' : 'Tu nombre'}
              </Text>
              <TextInput
                style={styles.nameInput}
                value={nameDraft}
                onChangeText={setNameDraft}
                placeholder={lang === 'en' ? 'Your name…' : lang === 'fr' ? 'Ton prénom…' : 'Tu nombre…'}
                autoFocus
                maxLength={30}
                placeholderTextColor="#94A3B8"
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                <TouchableOpacity onPress={() => setEditingName(false)}
                  style={[styles.nameModalBtn, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={{ color: '#64748B', fontWeight: '600' }}>
                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveName}
                  style={[styles.nameModalBtn, { backgroundColor: BLUE.primary }]}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    {lang === 'en' ? 'Save' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <View style={styles.headerMeta}>
          {!!profile?.age && <Text style={styles.metaChip}>{profile.age} {p.profile.years}</Text>}
          {!!ext.lifeStage && <Text style={styles.metaChip}>{lbl(LIFE_L, ext.lifeStage, lang)}</Text>}
        </View>
        {primaryGoals.length > 0 && (
          <Text style={styles.headerGoal}>{primaryGoals.map(g => goalMap[g] || g).join('  ·  ')}</Text>
        )}
        {pi && (
          <Text style={styles.headerSub}>
            {pi.data?.emoji} {p.profile.phase} {pi.data?.name} · {p.profile.day} {pi.day}
          </Text>
        )}
      </View>

      {/* ── DATOS PERSONALES ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{p.profile.personalData}</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'personal' ? null : 'personal')}>
            <Text style={styles.editBtn}>{editing === 'personal' ? p.profile.close : p.profile.edit}</Text>
          </TouchableOpacity>
        </View>
        {editing !== 'personal' ? (
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{age || '—'}</Text><Text style={styles.infoLbl}>{p.profile.years}</Text></View>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{weight || '—'}</Text><Text style={styles.infoLbl}>{p.profile.kg}</Text></View>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{height || '—'}</Text><Text style={styles.infoLbl}>{p.profile.cm}</Text></View>
          </View>
        ) : (
          <View>
            {[
              { label: lang === 'fr' ? 'Âge' : lang === 'en' ? 'Age' : 'Edad', val: age, set: setAge, unit: p.profile.years, kb: 'numeric' },
              { label: lang === 'fr' ? 'Poids' : lang === 'en' ? 'Weight' : 'Peso', val: weight, set: setWeight, unit: p.profile.kg, kb: 'decimal-pad' },
              { label: lang === 'fr' ? 'Taille' : lang === 'en' ? 'Height' : 'Altura', val: height, set: setHeight, unit: p.profile.cm, kb: 'numeric' },
            ].map(f => (
              <View key={f.label} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} value={f.val} onChangeText={f.set} keyboardType={f.kb} placeholder="—" />
                  <Text style={styles.inputUnit}>{f.unit}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? p.profile.saving : p.profile.save}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── ACTIVIDAD Y OBJETIVO ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{p.profile.activityGoal}</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'goal' ? null : 'goal')}>
            <Text style={styles.editBtn}>{editing === 'goal' ? p.profile.close : p.profile.edit}</Text>
          </TouchableOpacity>
        </View>
        {editing !== 'goal' ? (
          <View style={styles.row}>
            <View style={[styles.chip, { backgroundColor: BLUE.light }]}><Text style={styles.chipTextBlue}>{actOpt?.emoji} {actOpt?.label}</Text></View>
            <View style={[styles.chip, { backgroundColor: BLUE.light }]}><Text style={styles.chipTextBlue}>{goalOpt?.emoji} {goalOpt?.label}</Text></View>
          </View>
        ) : (
          <View>
            <Text style={styles.editSection}>{p.profile.activityLevel.toUpperCase()}</Text>
            {ACTIVITY_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => setAL(opt.id)}
                style={[styles.optRow, activityLevel === opt.id && styles.optRowActive]}>
                <Text style={styles.optEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optLabel, activityLevel === opt.id && { color: BLUE.primary, fontWeight: '700' }]}>{opt.label}</Text>
                <View style={[styles.radio, activityLevel === opt.id && styles.radioActive]}>
                  {activityLevel === opt.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <Text style={[styles.editSection, { marginTop: 16 }]}>{p.profile.objective.toUpperCase()}</Text>
            {GOAL_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => setGoal(opt.id)}
                style={[styles.optRow, goal === opt.id && styles.optRowActive]}>
                <Text style={styles.optEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optLabel, goal === opt.id && { color: BLUE.primary, fontWeight: '700' }]}>{opt.label}</Text>
                <View style={[styles.radio, goal === opt.id && styles.radioActive]}>
                  {goal === opt.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? p.profile.saving : p.profile.save}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── PROGRAMA PERSONALIZADO (datos del onboarding) — editable ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{p.profile.myProgram}</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'program' ? null : 'program')}>
            <Text style={styles.editBtn}>{editing === 'program' ? p.profile.close : p.profile.edit}</Text>
          </TouchableOpacity>
        </View>

        {editing !== 'program' ? (
          /* ── Vista de solo lectura ── */
          <View>
            {editGoals.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.subLabel}>{p.onboarding?.goalsLabel || 'OBJETIVOS'}</Text>
                <ChipRow items={editGoals.map(g => (GOAL_L[lang] || GOAL_L.es)[g] || g)} />
              </View>
            )}
            <InfoRow icon="🏋️" title={p.profile.fitnessLevel} value={lbl(FITNESS_L, editFitness, lang) || '—'} />
            <InfoRow icon="🏟️" title={p.profile.whereITrain}
              value={(Array.isArray(editGym) ? editGym : [editGym]).filter(Boolean).map(g => lbl(GYM_L, g, lang)).filter(Boolean).join(', ') || '—'} />
            <InfoRow icon="🍽️" title={p.profile.dietType}
              value={[
                editDiet ? (getDiet(normalizeDietId(editDiet))?.name?.[lang] || lbl(DIET_L, editDiet, lang)) : null,
                editFasting ? getDiet(editFasting)?.name?.[lang] : null,
              ].filter(Boolean).join('  +  ') || '—'}
            />
            {editDietMod.length > 0 && (
              <View>
                <Text style={styles.subLabel}>⚙️ {lang === 'en' ? 'Modifiers' : lang === 'fr' ? 'Modificateurs' : lang === 'it' ? 'Modificatori' : 'Modificadores'}</Text>
                <ChipRow items={editDietMod.map(m => {
                  const MOD_LABELS = {
                    gluten_free:       { es: '🌾 Sin gluten',       en: '🌾 Gluten-free',       fr: '🌾 Sans gluten',       it: '🌾 Senza glutine' },
                    lactose_free:      { es: '🥛 Sin lactosa',      en: '🥛 Lactose-free',      fr: '🥛 Sans lactose',      it: '🥛 Senza lattosio' },
                    low_fodmap:        { es: '🫘 Low FODMAP',       en: '🫘 Low FODMAP',        fr: '🫘 Low FODMAP',        it: '🫘 Low FODMAP' },
                    anti_inflammatory: { es: '🌿 Antiinflamatoria', en: '🌿 Anti-inflammatory', fr: '🌿 Anti-inflammatoire', it: '🌿 Antinfiammatoria' },
                  };
                  return MOD_LABELS[m]?.[lang] || m;
                })} />
              </View>
            )}
            {editAllergies.length > 0 && (
              <View>
                <Text style={[styles.subLabel, { color: '#EF4444' }]}>{p.profile.allergies}</Text>
                <ChipRow items={editAllergies.map(a => lbl(ALLERGY_L, a, lang))} />
              </View>
            )}
            {editDislikes.length > 0 && (
              <View>
                <Text style={styles.subLabel}>{p.profile.avoids}</Text>
                <ChipRow items={editDislikes.map(d => lbl(DISLIKE_L, d, lang))} />
              </View>
            )}
            <InfoRow icon="⏱️" title={p.profile.cookingTime} value={lbl(COOKING_L, editCooking) || '—'} />
            <InfoRow icon="💶" title={p.profile.budget} value={lbl(BUDGET_L, editBudget, lang) || '—'} />
            {!hasExtended && (
              <Text style={styles.optionDesc}>
                {lang === 'en' ? 'Tap Edit to personalise your programme' : lang === 'fr' ? 'Appuie sur Modifier pour personnaliser' : lang === 'it' ? 'Tocca Modifica per personalizzare' : 'Toca Editar para personalizar tu programa'}
              </Text>
            )}
          </View>
        ) : (
          /* ── Formulario de edición ── */
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>

            {/* Objetivos */}
            {p.onboarding?.goals && <>
              <Text style={styles.editSection}>{p.onboarding.goalsLabel || 'OBJETIVOS'}</Text>
              {p.onboarding.goals.map(o => (
                <TouchableOpacity key={o.v} onPress={() => toggleExtArr(editGoals, setEditGoals, o.v)}
                  style={[styles.optRow, editGoals.includes(o.v) && styles.optRowActive]}>
                  <Text style={styles.optEmoji}>{o.ico}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optLabel, editGoals.includes(o.v) && { color: BLUE.primary, fontWeight: '700' }]}>{o.l}</Text>
                    {o.d ? <Text style={{ fontSize: 11, color: '#94A3B8' }}>{o.d}</Text> : null}
                  </View>
                  {editGoals.includes(o.v) && <Check size={16} color={BLUE.primary} />}
                </TouchableOpacity>
              ))}
            </>}

            {/* Nota: nutrición y entrenamiento se editan desde los banners
                contextuales de sus pestañas (Nutrición y Gimnasio). */}
            <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
              {lang === 'en' ? '🥗 Edit diet, fasting, meals, allergies and supplements\nfrom the Nutrition tab.\n🏋️ Edit days, level, location and sport goal\nfrom the Gym tab.'
               : lang === 'fr' ? '🥗 Modifie régime, jeûne, repas, allergies et compléments\ndans l\'onglet Nutrition.\n🏋️ Modifie jours, niveau, lieu et objectif sportif\ndans l\'onglet Gym.'
               : lang === 'it' ? '🥗 Modifica dieta, digiuno, pasti, allergie e integratori\ndalla scheda Nutrizione.\n🏋️ Modifica giorni, livello, luogo e obiettivo sportivo\ndalla scheda Palestra.'
               : '🥗 Edita dieta, ayuno, comidas, alergias y complementos\ndesde la pestaña Nutrición.\n🏋️ Edita días, nivel, lugar y objetivo deportivo\ndesde la pestaña Gimnasio.'}
            </Text>

            <TouchableOpacity style={styles.saveBtn} onPress={saveProgram} disabled={savingExt}>
              <Text style={styles.saveBtnText}>{savingExt ? p.profile.saving : p.profile.save}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ── EVOLUCIÓN / MÉTRICAS ── */}
      {(() => {
        const goalColor = {
          lose_weight: '#7C3AED', gain_muscle: '#1A56DB', maintain: '#059669',
          energy: '#F59E0B', reduce_symptoms: '#EC4899', performance: '#0EA5E9',
        }[goal] || '#1A56DB';

        const goalLabel = {
          lose_weight: { es:'Perder peso',  en:'Lose weight',    fr:'Perdre du poids',     it:'Perdere peso' },
          gain_muscle: { es:'Ganar músculo',en:'Gain muscle',    fr:'Prendre du muscle',   it:'Guadagnare muscolo' },
          maintain:    { es:'Mantener peso',en:'Maintain weight',fr:'Maintenir le poids',  it:'Mantenere il peso' },
        }[goal]?.[lang] || goal;

        // Calcular BMI
        const h = profile?.height, w = profile?.weight;
        const bmi = h && w ? +(w / ((h / 100) ** 2)).toFixed(1) : null;
        const bmiLabel = bmi
          ? bmi < 18.5 ? { es:'Bajo peso', en:'Underweight', fr:'Sous-poids', it:'Sottopeso' }[lang]
          : bmi < 25   ? { es:'Normal',    en:'Normal',      fr:'Normal',     it:'Normale'   }[lang]
          : bmi < 30   ? { es:'Sobrepeso', en:'Overweight',  fr:'Surpoids',   it:'Sovrappeso'}[lang]
          :               { es:'Obesidad',  en:'Obese',       fr:'Obésité',    it:'Obesità'   }[lang]
          : null;

        // Progreso hacia objetivo de peso
        const startW  = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : profile?.weight;
        const currW   = weightLog.length > 0 ? weightLog[0].weight : profile?.weight;
        const tgt     = ext.targetWeight ? +ext.targetWeight : null;
        const totalNeeded = startW && tgt ? Math.abs(tgt - startW) : null;
        const done        = startW && currW && tgt ? Math.abs(currW - startW) : null;
        const pct         = totalNeeded && done ? Math.min(100, Math.round((done / totalNeeded) * 100)) : 0;

        const metricTitle = lang === 'en' ? '📊 My progress'
          : lang === 'fr' ? '📊 Mon évolution'
          : lang === 'it' ? '📊 La mia evoluzione'
          : '📊 Mi evolución';

        return (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{metricTitle}</Text>
              <View style={[styles.metaBadge, { backgroundColor: goalColor + '18' }]}>
                <Text style={[styles.metaBadgeText, { color: goalColor }]}>{goalLabel}</Text>
              </View>
            </View>

            {/* Stats row: BMI + peso actual + objetivo */}
            <View style={styles.statsRow}>
              {bmi && (
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{bmi}</Text>
                  <Text style={styles.statLbl}>IMC · {bmiLabel}</Text>
                </View>
              )}
              {currW && (
                <View style={styles.statBox}>
                  <Text style={[styles.statVal, { color: goalColor }]}>{currW} kg</Text>
                  <Text style={styles.statLbl}>{lang === 'en' ? 'Current' : lang === 'fr' ? 'Actuel' : 'Actual'}</Text>
                </View>
              )}
              {tgt && (
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{tgt} kg</Text>
                  <Text style={styles.statLbl}>{lang === 'en' ? 'Target' : lang === 'fr' ? 'Objectif' : 'Objetivo'}</Text>
                </View>
              )}
            </View>

            {/* Barra de progreso hacia objetivo */}
            {tgt && totalNeeded > 0 && (
              <View style={styles.progressWrap}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goalColor }]} />
                </View>
                <Text style={[styles.progressLbl, { color: goalColor }]}>{pct}%</Text>
              </View>
            )}

            {/* Registro de peso hoy */}
            <View style={styles.wLogRow}>
              <Text style={styles.wLogLabel}>
                {lang === 'en' ? "Today's weight" : lang === 'fr' ? "Poids du jour" : lang === 'it' ? "Peso di oggi" : "Peso de hoy"}
              </Text>
              <View style={styles.wControls}>
                <TouchableOpacity style={styles.wBtn} onPress={() => changeW(-0.1)}><Text style={styles.wBtnTxt}>−</Text></TouchableOpacity>
                <Text style={styles.wVal}>{(+todayW).toFixed(1)} kg</Text>
                <TouchableOpacity style={styles.wBtn} onPress={() => changeW(+0.1)}><Text style={styles.wBtnTxt}>+</Text></TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.wSaveBtn, wLogged && styles.wSaveBtnDone]}
              onPress={handleLogWeight}
            >
              <Text style={[styles.wSaveBtnTxt, wLogged && { color: '#16A34A' }]}>
                {wLogged
                  ? (lang === 'en' ? '✓ Logged' : lang === 'fr' ? '✓ Enregistré' : '✓ Registrado')
                  : (lang === 'en' ? 'Log weight' : lang === 'fr' ? 'Enregistrer' : lang === 'it' ? 'Registra' : 'Registrar peso')}
              </Text>
            </TouchableOpacity>

            {/* Objetivo de peso (editable) */}
            {!tgt && !editTarget && (
              <TouchableOpacity onPress={() => setEditTarget(true)} style={styles.setTargetBtn}>
                <Text style={styles.setTargetTxt}>
                  + {lang === 'en' ? 'Set target weight' : lang === 'fr' ? 'Définir un objectif de poids' : lang === 'it' ? 'Imposta peso obiettivo' : 'Establecer peso objetivo'}
                </Text>
              </TouchableOpacity>
            )}
            {editTarget && !tgt && (
              <View style={styles.targetRow}>
                <TextInput
                  style={styles.targetInput}
                  value={String(targetW)}
                  onChangeText={setTargetW}
                  keyboardType="decimal-pad"
                  placeholder="65.0"
                  placeholderTextColor="#CBD5E1"
                />
                <Text style={styles.targetUnit}>kg</Text>
                <TouchableOpacity style={styles.targetSave} onPress={async () => {
                  if (targetW) {
                    await profile.saveProfileExtended({ targetWeight: +targetW });
                    setEditTarget(false);
                  }
                }}>
                  <Check size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            {tgt && (
              <TouchableOpacity onPress={() => profile.saveProfileExtended({ targetWeight: null })} style={styles.setTargetBtn}>
                <Text style={[styles.setTargetTxt, { color: '#94A3B8' }]}>
                  × {lang === 'en' ? 'Remove target' : lang === 'fr' ? 'Supprimer l\'objectif' : 'Eliminar objetivo'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Gráfico de evolución */}
            {weightLog.length >= 2 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.subLabel, { marginBottom: 8 }]}>
                  {lang === 'en' ? 'WEIGHT HISTORY' : lang === 'fr' ? 'HISTORIQUE DU POIDS' : lang === 'it' ? 'STORICO PESO' : 'HISTORIAL DE PESO'}
                </Text>
                <ProgressChart
                  data={weightLog.map(e => ({ date: e.date, value: e.weight }))}
                  color={goalColor}
                  unit="kg"
                  goal={goal}
                />
              </View>
            )}
            {weightLog.length === 1 && (
              <Text style={styles.chartHint}>
                {lang === 'en' ? 'Log tomorrow to see your progress chart'
                 : lang === 'fr' ? 'Enregistre demain pour voir ta courbe'
                 : 'Registra mañana para ver tu gráfica de evolución'}
              </Text>
            )}
          </View>
        );
      })()}

      {/* ── SALUD ── */}
      {(() => {
        const ob = p.onboarding;

        // Lista completa de condiciones: menstruales + metabólicas
        const ALL_CONDITIONS = [
          ...(ob?.conditions || []),
          { v: 'type1_diabetes', l: lbl(COND_L, 'type1_diabetes', lang) },
          { v: 'type2_diabetes', l: lbl(COND_L, 'type2_diabetes', lang) },
          { v: 'hypertension',   l: lbl(COND_L, 'hypertension',   lang) },
          { v: 'anemia',         l: lbl(COND_L, 'anemia',         lang) },
        ];

        // Medicación ampliada
        const MED_OPTIONS = [
          { v: 'thyroid_hormone',          l: lbl(MED_L, 'levothyroxine',          lang) },
          { v: 'metformin',                l: lbl(MED_L, 'metformin',               lang) },
          { v: 'insulin',                  l: '💉 ' + (lang === 'en' ? 'Insulin' : lang === 'fr' ? 'Insuline' : 'Insulina') },
          { v: 'antidepressants',          l: lbl(MED_L, 'antidepressants',         lang) },
          { v: 'iron',                     l: lbl(MED_L, 'iron',                    lang) },
          { v: 'ssri',                     l: lbl(MED_L, 'ssri',                    lang) },
          { v: 'none',                     l: lbl(MED_L, 'none',                    lang) },
        ];

        const hasHealthData = editLifeStage || editConditions.length > 0 || editContraUse !== null || editMedications.length > 0;
        const yesLbl = ob?.yes || 'Sí';
        const noLbl  = ob?.no  || 'No';
        const hTitle = lang === 'en' ? '🩺 Your health' : lang === 'fr' ? '🩺 Ta santé' : lang === 'it' ? '🩺 La tua salute' : '🩺 Tu salud';
        const editingHealth = editing === 'health';

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{hTitle}</Text>
              <TouchableOpacity onPress={() => setEditing(editingHealth ? null : 'health')}>
                <Text style={styles.editBtn}>{editingHealth ? p.profile.close : p.profile.edit}</Text>
              </TouchableOpacity>
            </View>

            {!editingHealth ? (
              /* ── Vista de solo lectura ── */
              <View>
                {!hasHealthData ? (
                  <Text style={styles.optionDesc}>
                    {lang === 'en' ? 'Tap Edit to add your health information'
                     : lang === 'fr' ? 'Appuie sur Modifier pour ajouter tes infos santé'
                     : lang === 'it' ? 'Tocca Modifica per aggiungere le info salute'
                     : 'Toca Editar para añadir tu información de salud'}
                  </Text>
                ) : (
                  <>
                    {editLifeStage ? (
                      <InfoRow icon="🌸" title={ob?.lifeStageLabel || 'Etapa vital'}
                        value={(ob?.lifeStages?.find(s => s.v === editLifeStage)?.l) || editLifeStage} />
                    ) : null}
                    {editConditions.length > 0 && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={[styles.subLabel, { color: '#EF4444' }]}>
                          {ob?.conditionsLabel || (lang === 'en' ? 'CONDITIONS' : lang === 'fr' ? 'CONDITIONS' : 'CONDICIONES')}
                        </Text>
                        <ChipRow items={editConditions.map(c => {
                          const fromOb = ob?.conditions?.find(x => x.v === c);
                          return fromOb ? fromOb.l : lbl(COND_L, c, lang);
                        })} />
                      </View>
                    )}
                    {editContraUse === true && (
                      <InfoRow icon="💊" title={ob?.contraLabel || 'Anticoncepción'}
                        value={ob?.contraOptions?.find(o => o.v === editContraType)?.l || editContraType || yesLbl} />
                    )}
                    {editContraUse === false && (
                      <InfoRow icon="💊" title={ob?.contraLabel || 'Anticoncepción'} value={noLbl} />
                    )}
                    {editMedications.length > 0 && editMedications[0] !== 'none' && (
                      <View style={{ marginBottom: 4 }}>
                        <Text style={styles.subLabel}>
                          {lang === 'en' ? 'MEDICATION' : lang === 'fr' ? 'MÉDICAMENTS' : lang === 'it' ? 'FARMACI' : 'MEDICACIÓN'}
                        </Text>
                        <ChipRow items={editMedications.filter(m => m !== 'none').map(m =>
                          MED_OPTIONS.find(o => o.v === m)?.l || lbl(MED_L, m, lang)
                        )} />
                      </View>
                    )}
                  </>
                )}
              </View>
            ) : (
              /* ── Formulario de edición ── */
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>

                {/* Etapa vital */}
                {ob?.lifeStages && <>
                  <Text style={styles.editSection}>{ob.lifeStageLabel}</Text>
                  {ob.lifeStages.map(o => (
                    <TouchableOpacity key={o.v} onPress={() => setEditLifeStage(o.v)}
                      style={[styles.optRow, editLifeStage === o.v && styles.optRowActive]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optLabel, editLifeStage === o.v && { color: BLUE.primary, fontWeight: '700' }]}>{o.l}</Text>
                        {o.d ? <Text style={{ fontSize: 11, color: '#94A3B8' }}>{o.d}</Text> : null}
                      </View>
                      <View style={[styles.radio, editLifeStage === o.v && styles.radioActive]}>
                        {editLifeStage === o.v && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {editLifeStage === 'pregnant' && ob.pregnantBanner &&
                    <Text style={styles.pregnantNote}>{ob.pregnantBanner}</Text>}
                </>}

                {/* Condiciones menstruales y metabólicas */}
                <Text style={[styles.editSection, { marginTop: 16, color: '#EF4444' }]}>
                  ⚠️ {ob?.conditionsLabel || (lang === 'en' ? 'HEALTH CONDITIONS' : lang === 'fr' ? 'CONDITIONS DE SANTÉ' : 'CONDICIONES DE SALUD')}
                </Text>
                <Text style={[styles.editSection, { marginTop: -4, color: '#94A3B8', fontWeight: '400', letterSpacing: 0 }]}>
                  {lang === 'en' ? 'Select all that apply'
                   : lang === 'fr' ? 'Sélectionne tout ce qui s\'applique'
                   : lang === 'it' ? 'Seleziona tutte quelle applicabili'
                   : 'Selecciona todas las que apliquen'}
                </Text>
                <View style={styles.row}>
                  {ALL_CONDITIONS.map(o => {
                    const sel = editConditions.includes(o.v);
                    return (
                      <TouchableOpacity key={o.v} onPress={() => toggleExtArr(editConditions, setEditConditions, o.v)}
                        style={[styles.chip, sel && { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' }]}>
                        <Text style={[styles.chipText, sel && { color: '#EF4444', fontWeight: '600' }]}>{o.l}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Anticoncepción */}
                <Text style={[styles.editSection, { marginTop: 16 }]}>
                  💊 {ob?.contraLabel || (lang === 'en' ? 'HORMONAL CONTRACEPTION' : lang === 'fr' ? 'CONTRACEPTION HORMONALE' : 'ANTICONCEPTIVOS HORMONALES')}
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>
                  {ob?.contraQuestion || (lang === 'en' ? 'Do you use hormonal contraception?' : lang === 'fr' ? 'Utilises-tu une contraception hormonale ?' : '¿Usas anticonceptivos hormonales?')}
                </Text>
                <View style={styles.yesNoRow}>
                  <TouchableOpacity style={[styles.yesNoBtn, editContraUse === true && styles.yesNoBtnActive]}
                    onPress={() => setEditContraUse(true)}>
                    <Text style={[styles.yesNoTxt, editContraUse === true && styles.yesNoTxtActive]}>{yesLbl}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.yesNoBtn, editContraUse === false && styles.yesNoBtnActive]}
                    onPress={() => { setEditContraUse(false); setEditContraType(''); }}>
                    <Text style={[styles.yesNoTxt, editContraUse === false && styles.yesNoTxtActive]}>{noLbl}</Text>
                  </TouchableOpacity>
                </View>
                {editContraUse === true && ob?.contraOptions && (
                  <View style={[styles.row, { marginTop: 10 }]}>
                    {ob.contraOptions.map(o => {
                      const sel = editContraType === o.v;
                      return (
                        <TouchableOpacity key={o.v} onPress={() => setEditContraType(o.v)}
                          style={[styles.chip, sel && { backgroundColor: BLUE.light, borderWidth: 1, borderColor: BLUE.primary }]}>
                          <Text style={[styles.chipText, sel && { color: BLUE.primary, fontWeight: '600' }]}>{o.l}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Medicación */}
                <Text style={[styles.editSection, { marginTop: 16 }]}>
                  💊 {lang === 'en' ? 'REGULAR MEDICATION' : lang === 'fr' ? 'MÉDICAMENTS HABITUELS' : lang === 'it' ? 'FARMACI ABITUALI' : 'MEDICACIÓN HABITUAL'}
                </Text>
                <View style={styles.row}>
                  {MED_OPTIONS.map(o => {
                    const sel = editMedications.includes(o.v);
                    return (
                      <TouchableOpacity key={o.v}
                        onPress={() => {
                          if (o.v === 'none') { setEditMedications(sel ? [] : ['none']); return; }
                          const without = editMedications.filter(x => x !== 'none');
                          setEditMedications(without.includes(o.v) ? without.filter(x => x !== o.v) : [...without, o.v]);
                        }}
                        style={[styles.chip, sel && { backgroundColor: BLUE.light, borderWidth: 1, borderColor: BLUE.primary }]}>
                        <Text style={[styles.chipText, sel && { color: BLUE.primary, fontWeight: '600' }]}>{o.l}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={saveHealth} disabled={savingExt}>
                  <Text style={styles.saveBtnText}>{savingExt ? p.profile.saving : p.profile.save}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        );
      })()}

      {/* ── NOTIFICACIONES ── */}
      {Platform.OS !== 'web' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                🔔 {lang === 'en' ? 'Reminders' : lang === 'fr' ? 'Rappels' : lang === 'it' ? 'Promemoria' : 'Recordatorios'}
              </Text>
              <Text style={styles.calSubtitle}>
                {lang === 'en' ? 'Cycle, training and hydration'
                 : lang === 'fr' ? 'Cycle, entraînement et hydratation'
                 : lang === 'it' ? 'Ciclo, allenamento e idratazione'
                 : 'Ciclo, entrenamiento e hidratación'}
              </Text>
            </View>
          </View>

          {/* Estado */}
          {notifStatus === 'ok' && (
            <Text style={styles.calOk}>
              ✓ {lang === 'en' ? 'Reminders saved!' : lang === 'fr' ? 'Rappels enregistrés !' : '¡Recordatorios guardados!'}
            </Text>
          )}
          {notifStatus === 'denied' && (
            <Text style={[styles.calAlert, { marginBottom: 8 }]}>
              ⚠️ {lang === 'en' ? 'Permission denied. Enable notifications in Settings → Meirins.'
                  : 'Permiso denegado. Activa las notificaciones en Ajustes → Meirins.'}
            </Text>
          )}

          {/* Toggle ciclo */}
          {(() => {
            const items = [
              {
                key: 'cycle', emoji: '🌙',
                label:   { es: 'Aviso de ciclo', en: 'Cycle reminder', fr: 'Rappel de cycle', it: 'Promemoria ciclo' },
                sublabel:{ es: 'Antes del inicio del período', en: 'Before period start', fr: 'Avant le début des règles', it: 'Prima dell\'inizio del periodo' },
                enabled: notifSettings.cycle !== false,
              },
              {
                key: 'workout', emoji: '🏋️',
                label:   { es: 'Recordatorio de entreno', en: 'Workout reminder', fr: 'Rappel d\'entraînement', it: 'Promemoria allenamento' },
                sublabel:{ es: 'En tus días de entreno', en: 'On your training days', fr: 'Tes jours d\'entraînement', it: 'Nei tuoi giorni di allenamento' },
                enabled: notifSettings.workout !== false,
              },
              {
                key: 'hydration', emoji: '💧',
                label:   { es: 'Hidratación diaria', en: 'Daily hydration', fr: 'Hydratation quotidienne', it: 'Idratazione giornaliera' },
                sublabel:{ es: 'Recordatorio de beber agua', en: 'Water drinking reminder', fr: 'Rappel de boire de l\'eau', it: 'Promemoria di bere acqua' },
                enabled: notifSettings.hydration !== false,
              },
            ];

            return (
              <View>
                {items.map(item => (
                  <View key={item.key} style={styles.notifRow}>
                    <Text style={styles.notifEmoji}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifLabel}>{item.label[lang] || item.label.es}</Text>
                      <Text style={styles.notifSub}>{item.sublabel[lang] || item.sublabel.es}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleSaveNotifSettings({ [item.key]: !item.enabled })}
                      disabled={notifSaving}
                      style={[styles.toggle, item.enabled && styles.toggleOn]}
                    >
                      <View style={[styles.toggleDot, item.enabled && styles.toggleDotOn]} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Hora del recordatorio de entreno */}
                {notifSettings.workout !== false && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.editSection}>
                      🕐 {lang === 'en' ? 'WORKOUT REMINDER TIME' : lang === 'fr' ? 'HEURE DU RAPPEL' : 'HORA DEL RECORDATORIO'}
                    </Text>
                    <View style={styles.hoursRow}>
                      {NOTIF_HOUR_OPTS.map(h => (
                        <TouchableOpacity
                          key={h}
                          onPress={() => handleSaveNotifSettings({ workoutHour: h })}
                          style={[styles.hourBtn, (notifSettings.workoutHour || 8) === h && styles.hourBtnActive]}
                        >
                          <Text style={[styles.hourTxt, (notifSettings.workoutHour || 8) === h && styles.hourTxtActive]}>
                            {String(h).padStart(2,'0')}:00
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Días de antelación del aviso de ciclo */}
                {notifSettings.cycle !== false && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.editSection}>
                      📅 {lang === 'en' ? 'DAYS BEFORE PERIOD' : lang === 'fr' ? 'JOURS AVANT LES RÈGLES' : 'DÍAS DE ANTELACIÓN'}
                    </Text>
                    <View style={styles.hoursRow}>
                      {[1, 2, 3, 5].map(d => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => handleSaveNotifSettings({ cycleWarningDays: d })}
                          style={[styles.hourBtn, (notifSettings.cycleWarningDays || 2) === d && styles.hourBtnActive]}
                        >
                          <Text style={[styles.hourTxt, (notifSettings.cycleWarningDays || 2) === d && styles.hourTxtActive]}>
                            {d}d
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Desactivar todo */}
                {(notifSettings.cycle !== false || notifSettings.workout !== false || notifSettings.hydration !== false) && (
                  <TouchableOpacity onPress={handleDisableAllNotifs} style={styles.setTargetBtn}>
                    <Text style={[styles.setTargetTxt, { color: '#94A3B8' }]}>
                      × {lang === 'en' ? 'Disable all reminders' : lang === 'fr' ? 'Désactiver tous les rappels' : 'Desactivar todos los recordatorios'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* ── SINCRONIZACIÓN CALENDARIO ── */}
      {Platform.OS !== 'web' && (
        <View style={styles.card}>
          {/* Header con toggle */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                📅 {IS_EXPO_GO
                  ? (lang === 'en' ? 'Export to Calendar' : lang === 'fr' ? 'Exporter vers l\'agenda' : 'Exportar al Calendario')
                  : (lang === 'en' ? 'Calendar sync' : lang === 'fr' ? 'Sync agenda' : 'Sincronizar agenda')}
              </Text>
              <Text style={styles.calSubtitle}>
                {IS_EXPO_GO
                  ? (lang === 'en' ? 'Share a .ics file with your weekly workouts'
                     : lang === 'fr' ? 'Partager un fichier .ics avec tes séances'
                     : 'Comparte un fichero .ics con tus entrenamientos semanales')
                  : (lang === 'en' ? 'Add workouts to your calendar automatically'
                     : lang === 'fr' ? 'Ajoute tes séances à ton agenda automatiquement'
                     : 'Añade tus entrenamientos al calendario automáticamente')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleCalSync}
              disabled={calSyncing}
              style={[styles.toggle, calSyncEnabled && styles.toggleOn]}
            >
              <View style={[styles.toggleDot, calSyncEnabled && styles.toggleDotOn]} />
            </TouchableOpacity>
          </View>

          {/* Modo Expo Go: aviso de exportación ICS */}
          {IS_EXPO_GO && (
            <View style={styles.calInfoBox}>
              <Text style={styles.calInfoTxt}>
                📤 {lang === 'en'
                  ? 'Tap the button to export your workouts as a calendar file (.ics). iOS will ask you to add them to your Calendar app.'
                  : lang === 'fr'
                  ? 'Appuie sur le bouton pour exporter tes séances en fichier calendrier (.ics). iOS te proposera de les ajouter à l\'agenda.'
                  : 'Pulsa el botón para exportar tus entrenamientos como fichero de calendario (.ics). iOS te pedirá añadirlos a tu app Calendario.'}
              </Text>
            </View>
          )}

          {/* Estados */}
          {calStatus === 'denied' && (
            <Text style={styles.calAlert}>
              ⚠️ {lang === 'en' ? 'Permission denied.' : 'Permiso denegado.'}
            </Text>
          )}
          {calStatus === 'noworkouts' && (
            <Text style={styles.calAlert}>
              ℹ️ {lang === 'en' ? 'No workouts scheduled this week for your training days.'
                  : 'No hay entrenamientos programados esta semana para tus días de entreno.'}
            </Text>
          )}
          {calStatus === 'error' && (
            <Text style={styles.calAlert}>
              ❌ {lang === 'en' ? 'Something went wrong. Try again.' : 'Algo fue mal. Inténtalo de nuevo.'}
            </Text>
          )}
          {calStatus === 'synced' && (
            <Text style={styles.calOk}>
              ✓ {lang === 'en' ? 'Done! Check your Calendar app.' : lang === 'fr' ? 'Fait ! Vérifiez votre agenda.' : '¡Listo! Comprueba tu app Calendario.'}
            </Text>
          )}

          {/* Entreno de hoy */}
          {todayWorkout && (
            <View style={styles.calTodayBox}>
              <Text style={styles.calTodayLabel}>
                {lang === 'en' ? "Today's session" : lang === 'fr' ? "Séance du jour" : "Sesión de hoy"}
              </Text>
              <Text style={styles.calTodayWorkout}>
                {todayWorkout.ico} {todayWorkout.name}
                {todayWorkout.dur ? `  ·  ${todayWorkout.dur}` : ''}
              </Text>
            </View>
          )}

          {/* Hora preferida (solo si activo) */}
          {calSyncEnabled && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.editSection}>
                🕐 {lang === 'en' ? 'PREFERRED TIME' : lang === 'fr' ? 'HEURE PRÉFÉRÉE' : 'HORA PREFERIDA'}
              </Text>
              <View style={styles.hoursRow}>
                {HOUR_OPTIONS.map(h => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => handleChangeHour(h)}
                    style={[styles.hourBtn, calSyncHour === h && styles.hourBtnActive]}
                  >
                    <Text style={[styles.hourTxt, calSyncHour === h && styles.hourTxtActive]}>
                      {String(h).padStart(2,'0')}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Re-sync / re-export */}
              <TouchableOpacity
                style={[styles.resyncBtn, calSyncing && { opacity: 0.5 }]}
                onPress={handleResync}
                disabled={calSyncing}
              >
                <Text style={styles.resyncTxt}>
                  {calSyncing ? '⏳ ' : (IS_EXPO_GO ? '📤 ' : '🔄 ')}
                  {IS_EXPO_GO
                    ? (lang === 'en' ? 'Export this week again' : lang === 'fr' ? 'Exporter cette semaine' : 'Exportar esta semana')
                    : (lang === 'en' ? 'Sync this week' : lang === 'fr' ? 'Synchroniser cette semaine' : 'Sincronizar esta semana')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── IDIOMA ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 {p.profile.language}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => changeLang(l.code)}
              style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langName, lang === l.code && styles.langNameActive]}>{l.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── CERRAR SESIÓN ── */}
      {/* ── LEGAL ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          📄 {lang === 'en' ? 'Legal & support' : lang === 'fr' ? 'Légal & support' : lang === 'it' ? 'Legale & supporto' : 'Legal y soporte'}
        </Text>

        <TouchableOpacity style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text style={styles.legalEmoji}>🔒</Text>
          <Text style={styles.legalLabel}>
            {lang === 'en' ? 'Privacy policy' : lang === 'fr' ? 'Politique de confidentialité' : lang === 'it' ? 'Privacy policy' : 'Política de privacidad'}
          </Text>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
          <Text style={styles.legalEmoji}>📜</Text>
          <Text style={styles.legalLabel}>
            {lang === 'en' ? 'Terms of use' : lang === 'fr' ? 'Conditions d\'utilisation' : lang === 'it' ? 'Termini di utilizzo' : 'Términos de uso'}
          </Text>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalLink} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Meirins%20support`)}>
          <Text style={styles.legalEmoji}>✉️</Text>
          <Text style={styles.legalLabel}>
            {lang === 'en' ? 'Contact support' : lang === 'fr' ? 'Contacter le support' : lang === 'it' ? 'Contatta il supporto' : 'Contactar con soporte'}
          </Text>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        <Text style={styles.legalVersion}>Meirins · v1.0.0</Text>
      </View>

      {/* ── AVISO MÉDICO ── */}
      <View style={styles.medCard}>
        <Text style={styles.medCardTitle}>
          ⚕️ {lang === 'en' ? 'Medical disclaimer' : lang === 'fr' ? 'Avis médical' : lang === 'it' ? 'Avviso medico' : 'Aviso médico'}
        </Text>
        <Text style={styles.medCardBody}>
          {lang === 'en'
            ? 'Meirins is an information and wellness tool. It does not replace medical, gynaecological or nutritional advice. The recommendations are personalised guides — they do not substitute professional consultation. If you have symptoms or specific health conditions, consult a healthcare professional.'
            : lang === 'fr'
            ? 'Meirins est un outil d\'information et de bien-être. Il ne remplace pas l\'avis médical, gynécologique ou nutritionnel. Les recommandations sont des guides personnalisés et ne remplacent pas une consultation professionnelle. En cas de symptômes ou de conditions de santé spécifiques, consulte un professionnel.'
            : lang === 'it'
            ? 'Meirins è uno strumento di informazione e benessere. Non sostituisce il parere medico, ginecologico o nutrizionale. Le raccomandazioni sono guide personalizzate e non sostituiscono il consulto professionale. In caso di sintomi o condizioni specifiche, consulta un professionista.'
            : 'Meirins es una herramienta de información y bienestar. No sustituye el consejo médico, ginecológico ni nutricional. Las recomendaciones son guías personalizadas, no consultas profesionales. Si tienes síntomas o condiciones específicas, consulta a un profesional sanitario.'}
        </Text>
      </View>

      {/* ── CERRAR SESIÓN ── */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>{p.profile.signOut}</Text>
      </TouchableOpacity>

      {/* ── ELIMINAR CUENTA ── */}
      {(() => {
        const step    = deleteStep;
        const setStep = setDeleteStep;

        const deleteLabel = {
          btn:      { es: 'Eliminar cuenta y datos', en: 'Delete account and data', fr: 'Supprimer compte et données', it: 'Elimina account e dati' },
          title:    { es: '⚠️ ¿Eliminar tu cuenta?', en: '⚠️ Delete your account?', fr: '⚠️ Supprimer ton compte ?', it: '⚠️ Eliminare il tuo account?' },
          body:     { es: 'Esta acción es irreversible. Se borrarán todos tus datos: ciclo, peso, programa y perfil. No podrás recuperarlos.', en: 'This action is irreversible. All your data will be deleted: cycle, weight, programme and profile. You cannot recover them.', fr: 'Cette action est irréversible. Toutes tes données seront supprimées : cycle, poids, programme et profil.', it: 'Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati: ciclo, peso, programma e profilo.' },
          confirm:  { es: 'Sí, eliminar todo', en: 'Yes, delete everything', fr: 'Oui, tout supprimer', it: 'Sì, elimina tutto' },
          cancel:   { es: 'Cancelar', en: 'Cancel', fr: 'Annuler', it: 'Annulla' },
          deleting: { es: 'Eliminando…', en: 'Deleting…', fr: 'Suppression…', it: 'Eliminazione…' },
        };

        const handleDelete = async () => {
          setStep(2);
          setDeleting(true);
          try {
            const { supabase: sb } = require('../lib/supabase');
            const { error } = await sb.rpc('delete_user_account');
            if (error) throw error;
          } catch (e) {
            const { supabase: sb } = require('../lib/supabase');
            const user = (await sb.auth.getUser())?.data?.user;
            if (user) await sb.from('profiles').delete().eq('id', user.id);
          }
          await signOut();
        };

        if (step === 0) {
          return (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setStep(1)}>
              <Text style={styles.deleteBtnTxt}>{deleteLabel.btn[lang] || deleteLabel.btn.es}</Text>
            </TouchableOpacity>
          );
        }

        if (step === 1) {
          return (
            <View style={styles.deleteConfirmBox}>
              <Text style={styles.deleteConfirmTitle}>{deleteLabel.title[lang] || deleteLabel.title.es}</Text>
              <Text style={styles.deleteConfirmBody}>{deleteLabel.body[lang] || deleteLabel.body.es}</Text>
              <View style={styles.deleteConfirmBtns}>
                <TouchableOpacity style={styles.deleteCancelBtn} onPress={() => setStep(0)}>
                  <Text style={styles.deleteCancelTxt}>{deleteLabel.cancel[lang] || deleteLabel.cancel.es}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteConfirmBtn} onPress={handleDelete} disabled={deleting}>
                  <Text style={styles.deleteConfirmTxt}>
                    {deleting ? (deleteLabel.deleting[lang] || deleteLabel.deleting.es) : (deleteLabel.confirm[lang] || deleteLabel.confirm.es)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        return (
          <View style={[styles.deleteConfirmBox, { alignItems: 'center' }]}>
            <ActivityIndicator color="#EF4444" />
            <Text style={[styles.deleteConfirmBody, { marginTop: 8 }]}>{deleteLabel.deleting[lang] || deleteLabel.deleting.es}</Text>
          </View>
        );
      })()}

      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatar:     { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1A56DB', justifyContent: 'center', alignItems: 'center' },
  avatarImg:  { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1A56DB' },
  avatarText: { fontSize: 30, color: 'white', fontWeight: '700' },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, borderWidth: 1, borderColor: '#E2E8F0' },
  avatarEditTxt: { fontSize: 12 },
  headerName: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 6, fontFamily: F.heading },

  // Modal de edición de nombre
  nameModalOverlay: { position: 'absolute', top: 0, left: -14, right: -14, bottom: -300, backgroundColor: 'rgba(15,31,74,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  nameModal:        { width: '90%', maxWidth: 360, backgroundColor: 'white', borderRadius: 18, padding: 20 },
  nameModalTitle:   { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12, fontFamily: F.heading },
  nameInput:        { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  nameModalBtn:     { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  headerMeta: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: { fontSize: 13, color: '#1A56DB', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontWeight: '500' },
  headerGoal: { fontSize: 13, color: '#475569', marginBottom: 4, textAlign: 'center' },
  headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  editBtn: { fontSize: 13, color: '#1A56DB', fontWeight: '600' },

  // Language picker
  langRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  langBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  langBtnActive: { borderColor: '#1A56DB', backgroundColor: '#EFF6FF' },
  langFlag: { fontSize: 22 },
  langName: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  langNameActive: { color: '#1A56DB', fontWeight: '700' },

  infoGrid: { flexDirection: 'row', gap: 10 },
  infoBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center' },
  infoVal: { fontSize: 22, fontWeight: '700', color: '#1A56DB' },
  infoLbl: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { width: 90, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, textAlign: 'center' },
  inputUnit: { fontSize: 13, color: '#94A3B8' },
  saveBtn: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#1A56DB', alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 6, marginBottom: 6 },
  chipText: { fontSize: 12, color: '#334155', fontWeight: '500' },
  chipTextBlue: { fontSize: 13, color: '#1A56DB', fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 4 },

  editSection: { fontSize: 12, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 6 },
  optRowActive: { borderColor: '#1A56DB', backgroundColor: '#EFF6FF' },
  optEmoji: { fontSize: 20, marginRight: 10 },
  optLabel: { flex: 1, fontSize: 14, color: '#334155' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#1A56DB' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A56DB' },

  daysRow: { flexDirection: 'row', gap: 5 },
  dayChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  dayChipText: { fontSize: 11, fontWeight: '600' },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  infoRowIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  infoRowBody: { flex: 1 },
  infoRowTitle: { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  infoRowValue: { fontSize: 14, color: '#334155', fontWeight: '500' },
  subLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.3, marginTop: 6, marginBottom: 4 },

  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  accordionTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },
  accordionArrow: { fontSize: 11, color: '#94A3B8' },
  accordionNote: { fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 18 },
  accordionSection: { marginBottom: 10 },

  iaDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },
  iaExamples: { backgroundColor: 'white', borderRadius: 12, padding: 12 },
  iaQ: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iaQText: { fontSize: 13, color: '#475569' },

  // Legal links
  legalLink:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  legalEmoji:   { fontSize: 18, width: 26 },
  legalLabel:   { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  legalArrow:   { fontSize: 16, color: '#94A3B8' },
  legalVersion: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 12 },

  // Medical disclaimer
  medCard:      { backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A' },
  medCardTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  medCardBody:  { fontSize: 12, color: '#78350F', lineHeight: 18 },

  pageTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  pageTitle:    { fontSize: 32, fontFamily: 'BricolageGrotesque_800ExtraBold', fontWeight: '800', color: '#0A0A0A' },
  signOutBtn:  { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#0A0A0A', alignItems: 'center' },
  signOutText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },

  // Delete account
  deleteBtn:           { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#FEE2E2', alignItems: 'center' },
  deleteBtnTxt:        { fontSize: 15, color: '#DC2626', fontWeight: '700' },
  deleteConfirmBox:    { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  deleteConfirmTitle:  { fontSize: 15, fontWeight: '700', color: '#EF4444', marginBottom: 8, textAlign: 'center' },
  deleteConfirmBody:   { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  deleteConfirmBtns:   { flexDirection: 'row', gap: 10 },
  deleteCancelBtn:     { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  deleteCancelTxt:     { fontSize: 14, color: '#64748B', fontWeight: '500' },
  deleteConfirmBtn:    { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center' },
  deleteConfirmTxt:    { fontSize: 14, color: 'white', fontWeight: '700' },

  // Metrics card
  metaBadge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  metaBadgeText: { fontSize: 11, fontWeight: '600' },
  statsRow:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox:       { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, alignItems: 'center' },
  statVal:       { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  statLbl:       { fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'center' },
  progressWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  progressBg:    { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: 8, borderRadius: 4 },
  progressLbl:   { fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
  // Weight logger
  wLogRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  wLogLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  wControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F4FA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  wBtnTxt:   { fontSize: 18, fontWeight: '700', color: '#1A56DB', lineHeight: 22 },
  wVal:      { fontSize: 20, fontWeight: '800', color: '#1E293B', minWidth: 72, textAlign: 'center' },
  wSaveBtn:      { backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  wSaveBtnDone:  { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  wSaveBtnTxt:   { fontSize: 14, fontWeight: '700', color: '#1A56DB' },
  setTargetBtn:  { paddingVertical: 8, alignItems: 'center' },
  setTargetTxt:  { fontSize: 13, color: '#1A56DB', fontWeight: '500' },
  targetRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  targetInput:   { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, textAlign: 'center', color: '#1E293B' },
  targetUnit:    { fontSize: 14, color: '#94A3B8' },
  targetSave:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A56DB', justifyContent: 'center', alignItems: 'center' },
  targetSaveTxt: { color: 'white', fontSize: 18, fontWeight: '700' },
  chartHint:     { fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingVertical: 8 },

  // Notification rows
  notifRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  notifEmoji: { fontSize: 22, width: 30 },
  notifLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  notifSub:   { fontSize: 12, color: '#94A3B8', marginTop: 1 },

  // Calendar sync
  calSubtitle:     { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  calAlertBox:     { marginBottom: 8 },
  calAlert:        { fontSize: 12, color: '#EF4444', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 10, lineHeight: 18, marginBottom: 8 },
  calInfoBox:      { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, marginBottom: 10 },
  calInfoTxt:      { fontSize: 12, color: '#1E40AF', lineHeight: 18 },
  calOk:           { fontSize: 13, color: '#16A34A', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, marginBottom: 8 },
  calTodayBox:     { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 4 },
  calTodayLabel:   { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  calTodayWorkout: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  toggle:          { width: 50, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', padding: 2, justifyContent: 'center' },
  toggleOn:        { backgroundColor: '#1A56DB' },
  toggleDot:       { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleDotOn:     { alignSelf: 'flex-end' },
  hoursRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  hourBtn:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  hourBtnActive:   { backgroundColor: BLUE.light, borderColor: BLUE.primary },
  hourTxt:         { fontSize: 13, color: '#64748B', fontWeight: '500' },
  hourTxtActive:   { color: BLUE.primary, fontWeight: '700' },
  resyncBtn:       { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  resyncTxt:       { fontSize: 14, color: '#475569', fontWeight: '500' },

  dietCatLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.6, marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
  fastingNote:  { fontSize: 12, color: '#94A3B8', marginBottom: 8, fontStyle: 'italic' },
  optionDesc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 8 },
  pregnantNote: { fontSize: 13, color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginTop: 6, marginBottom: 4, lineHeight: 18 },
  yesNoRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  yesNoBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8FAFC' },
  yesNoBtnActive: { backgroundColor: BLUE.light, borderColor: BLUE.primary },
  yesNoTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  yesNoTxtActive: { color: BLUE.primary },
});
