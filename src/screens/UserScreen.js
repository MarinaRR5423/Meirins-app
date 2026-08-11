import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, LayoutAnimation, Platform, UIManager, Dimensions, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { F } from '../theme/fonts';
import { Check, ChevronRight, X, UserRound, Salad, Heart, CalendarFold, Scale, Flag, CircleAlert, Camera } from 'lucide-react-native';
import T, { LANGUAGES, t } from '../i18n/translations';
import ProgressChart from '../components/ProgressChart';
import { syncWeekToCalendar, removeAllCalendarEvents, exportWeekICS, IS_EXPO_GO, getWorkoutForDate } from '../utils/calendarSync';
import { useDiets, DIET_CATEGORIES, normalizeDietId } from '../hooks/useDiets';
import { syncNotifications, cancelAllMeirinsNotifications } from '../utils/notifications';
import { ALL_MEALS, MEAL_LABELS, getActiveMeals } from '../utils/fastingMeals';
import { Linking, Image, Alert } from 'react-native';
import { PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '../lib/legalLinks';
import { trackScreen } from '../lib/analytics';
import BText from '../components/BText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
 UIManager.setLayoutAnimationEnabledExperimental(true);
}


// ─── Label maps ───────────────────────────────────────────────────────────────
// ─── Multilingual label maps ──────────────────────────────────────────────────
// Each map has { es, en, fr } so we pick the right one at render time.

const LIFE_L = {
 es: { reproductive:' Reproductiva', perimenopause:' Perimenopausia', menopause:' Menopausia', postmenopause:' Postmenopausia', pregnant:' Embarazo', postpartum:' Post embarazo' },
 en: { reproductive:' Reproductive', perimenopause:' Perimenopause', menopause:' Menopause', postmenopause:' Postmenopause', pregnant:' Pregnancy', postpartum:' Postpartum' },
 fr: { reproductive:' Reproductive', perimenopause:' Périménopause', menopause:' Ménopause', postmenopause:' Post-ménopause', pregnant:' Grossesse', postpartum:' Post-partum' },
 it: { reproductive:' Riproduttiva', perimenopause:' Perimenopausa', menopause:' Menopausa', postmenopause:' Postmenopausa', pregnant:' Gravidanza', postpartum:' Post-parto' },
};

const GOAL_L = {
 es: { lose_weight:' Perder peso y definir', maintain:' Mantener mi peso', gain_muscle:' Ganar músculo', energy:' Mejorar energía', reduce_symptoms:' Reducir síntomas', fertility:' Apoyo fertilidad', performance:' Rendimiento deportivo', rehab:' Rehabilitación' },
 en: { lose_weight:' Lose weight & tone', maintain:' Maintain weight', gain_muscle:' Gain muscle', energy:' Improve energy', reduce_symptoms:' Reduce symptoms', fertility:' Fertility support', performance:' Athletic performance', rehab:' Rehabilitation' },
 fr: { lose_weight:' Perdre du poids', maintain:' Maintenir mon poids', gain_muscle:' Prendre du muscle', energy:' Améliorer mon énergie', reduce_symptoms:' Réduire les symptômes', fertility:' Soutien fertilité', performance:' Performance sportive', rehab:' Rééducation' },
};
const FITNESS_L = {
 es: { beginner:' Principiante', occasional:' Activa ocasional', regular:' Regular', advanced:' Avanzada' },
 en: { beginner:' Beginner', occasional:' Occasional', regular:' Regular', advanced:' Advanced' },
 fr: { beginner:' Débutante', occasional:' Occasionnelle', regular:' Régulière', advanced:' Avancée' },
};
const GYM_L = {
 es: { gym:' Gym', home:' Casa', outdoor:' Exterior', mixed:' Mixto' },
 en: { gym:' Gym', home:' Home', outdoor:' Outdoor', mixed:' Mixed' },
 fr: { gym:' Gym', home:' Maison', outdoor:' Extérieur', mixed:' Mixte' },
};
const DIET_L = {
 es: { omnivore:' Omnívora', flexitarian:' Flexitariana', pescatarian:' Pescetariana', vegetarian:' Vegetariana', vegan:' Vegana' },
 en: { omnivore:' Omnivore', flexitarian:' Flexitarian', pescatarian:' Pescatarian', vegetarian:' Vegetarian', vegan:' Vegan' },
 fr: { omnivore:' Omnivore', flexitarian:' Flexitarienne', pescatarian:' Pescétarienne', vegetarian:' Végétarienne', vegan:' Végane' },
};
const COOKING_L = { under20:' <20 min', '20to40':' 20–40 min', over60:' >1h' }; // no lang variants
const BUDGET_L = {
 es: { low:' Económico', medium:' Medio', high:' Sin límite' },
 en: { low:' Budget', medium:' Medium', high:' No limit' },
 fr: { low:' Économique', medium:' Moyen', high:' Sans limite' },
};
const SLEEP_L = {
 es: { good:' Bien', insomnia:' Insomnio', night_shift:' Turno de noche' },
 en: { good:' Good', insomnia:' Insomnia', night_shift:' Night shift' },
 fr: { good:' Bien', insomnia:' Insomnie', night_shift:' Travail de nuit' },
};
const STRESS_L = {
 es: { low:' Bajo', moderate:' Moderado', chronic:' Burnout' },
 en: { low:' Low', moderate:' Moderate', chronic:' Burnout' },
 fr: { low:' Bas', moderate:' Modéré', chronic:' Burnout' },
};
const WORK_L = {
 es: { office:' Oficina', physical:' Físico', remote:' Remoto' },
 en: { office:' Office', physical:' Physical', remote:' Remote' },
 fr: { office:' Bureau', physical:' Physique', remote:' Télétravail' },
};
const ALLERGY_L = {
 es: { lactose:' Lactosa', gluten:' Gluten', nuts:' Frutos secos', egg:' Huevo', shellfish:' Marisco', soy:' Soja', sesame:' Sésamo' },
 en: { lactose:' Lactose', gluten:' Gluten', nuts:' Nuts', egg:' Egg', shellfish:' Shellfish', soy:' Soy', sesame:' Sesame' },
 fr: { lactose:' Lactose', gluten:' Gluten', nuts:' Fruits à coque', egg:' Œuf', shellfish:' Crustacés', soy:' Soja', sesame:' Sésame' },
};
const DISLIKE_L = {
 es: { spicy:' Picante', onion:' Cebolla', garlic:' Ajo', legumes:' Legumbres', fermented:' Fermentados' },
 en: { spicy:' Spicy', onion:' Onion', garlic:' Garlic', legumes:' Legumes', fermented:' Fermented' },
 fr: { spicy:' Épicé', onion:' Oignon', garlic:' Ail', legumes:' Légumineuses', fermented:' Fermentés' },
};
const SPORT_L = {
 es: { running:' Running', cycling:' Ciclismo', yoga:' Yoga/Pilates', swimming:' Natación', strength:' Fuerza', hiit:' HIIT', dance:' Baile', crossfit:' CrossFit', martialarts:' Artes marciales', climbing:' Escalada', team:' Equipo', other:' Otro' },
 en: { running:' Running', cycling:' Cycling', yoga:' Yoga/Pilates', swimming:' Swimming', strength:' Strength', hiit:' HIIT', dance:' Dance', crossfit:' CrossFit', martialarts:' Martial arts', climbing:' Climbing', team:' Team sport', other:' Other' },
 fr: { running:' Running', cycling:' Cyclisme', yoga:' Yoga/Pilates', swimming:' Natation', strength:' Musculation', hiit:' HIIT', dance:' Danse', crossfit:' CrossFit', martialarts:' Arts martiaux', climbing:' Escalade', team:' Sport collectif', other:' Autre' },
};
const COND_L = {
 es: { pcos:' SOP/PCOS', endometriosis:' Endometriosis', hypothyroidism:' Hipotiroidismo', hyperthyroidism:' Hipertiroidismo', type1_diabetes:' Diabetes tipo 1', type2_diabetes:' Diabetes tipo 2', hypertension:' Hipertensión', anemia:' Anemia', none:' Ninguna' },
 en: { pcos:' PCOS', endometriosis:' Endometriosis', hypothyroidism:' Hypothyroidism', hyperthyroidism:' Hyperthyroidism', type1_diabetes:' Type 1 diabetes', type2_diabetes:' Type 2 diabetes', hypertension:' Hypertension', anemia:' Anaemia', none:' None' },
 fr: { pcos:' SMOP', endometriosis:' Endométriose', hypothyroidism:' Hypothyroïdie', hyperthyroidism:' Hyperthyroïdie', type1_diabetes:' Diabète type 1', type2_diabetes:' Diabète type 2', hypertension:' Hypertension', anemia:' Anémie', none:' Aucune' },
};
const MED_L = {
 es: { hormonal_contraceptive:' Anticonceptivo hormonal', levothyroxine:' Levotiroxina', metformin:' Metformina', antidepressants:' Antidepresivos', iron:' Hierro', ssri:' ISRS', none:' Ninguna' },
 en: { hormonal_contraceptive:' Hormonal contraceptive', levothyroxine:' Levothyroxine', metformin:' Metformin', antidepressants:' Antidepressants', iron:' Iron', ssri:' SSRI', none:' None' },
 fr: { hormonal_contraceptive:' Contraceptif hormonal', levothyroxine:' Lévothyroxine', metformin:' Metformine', antidepressants:' Antidépresseurs', iron:' Fer', ssri:' ISRS', none:' Aucun' },
};
const CONTRA_L = {
 es: { pill:' Píldora', iud_hormonal:' DIU hormonal', iud_copper:' DIU cobre', patch:' Parche', injection:' Inyectable', implant:' Implante', ring:' Anillo', none:'—' },
 en: { pill:' Pill', iud_hormonal:' Hormonal IUD', iud_copper:' Copper IUD', patch:' Patch', injection:' Injection', implant:' Implant', ring:' Ring', none:'—' },
 fr: { pill:' Pilule', iud_hormonal:' DIU hormonal', iud_copper:' DIU cuivre', patch:' Patch', injection:' Injectable', implant:' Implant', ring:' Anneau', none:'—' },
};
const MH_L = {
 es: { anxiety:' Ansiedad', depression:' Depresión', burnout:' Burnout', eating_disorder:' TCA', none:' Ninguna' },
 en: { anxiety:' Anxiety', depression:' Depression', burnout:' Burnout', eating_disorder:' Eating disorder', none:' None' },
 fr: { anxiety:' Anxiété', depression:' Dépression', burnout:' Burnout', eating_disorder:' TCA', none:' Aucune' },
};
const INJURY_L = {
 es: { knee:' Rodilla', back:' Espalda', shoulder:' Hombro', hip:' Cadera', neck:' Cuello', ankle:' Tobillo', other:' Otro' },
 en: { knee:' Knee', back:' Back', shoulder:' Shoulder', hip:' Hip', neck:' Neck', ankle:' Ankle', other:' Other' },
 fr: { knee:' Genou', back:' Dos', shoulder:' Épaule', hip:' Hanche', neck:' Cou', ankle:' Cheville', other:' Autre' },
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
 return arr.map(k => lbl(map, k, lang)).join(' · ');
}

function InfoRow({ icon, title, value }) {
 if (!value) return null;
 return (
 <View style={styles.infoRow}>
 <BText style={styles.infoRowIcon}>{icon}</BText>
 <View style={styles.infoRowBody}>
 <BText style={styles.infoRowTitle}>{title}</BText>
 <BText style={styles.infoRowValue}>{value}</BText>
 </View>
 </View>
 );
}

function ChipRow({ items }) {
 if (!items || !items.length) return null;
 return (
 <View style={styles.chipRow}>
 {items.map((item, i) => <View key={i} style={styles.chip}><BText style={styles.chipText}>{item}</BText></View>)}
 </View>
 );
}

export default function PerfilScreen({ pi, profile, signOut }) {
 useEffect(() => { trackScreen('Perfil'); }, []);
 const ext = profile?.profileExtended || {};

 // Language — read from profile_extended, default es
 const [lang, setLang] = useState(ext.language || 'es');

 const [editing, setEditing] = useState(null);

 // Estado editable para el programa personalizado (datos de ProfileOnboarding)
 const [editFitness, setEditFitness] = useState(ext.fitnessLevel || '');
 const [editGym, setEditGym] = useState(ext.gymAccess || '');
 const [editDiet, setEditDiet] = useState(ext.diet || '');
 const [editDietMod, setEditDietMod] = useState(ext.dietModifiers || []);
 const [editFasting, setEditFasting] = useState(ext.fastingProtocol || '');
 const [editMealsActive, setEditMealsActive] = useState(ext.mealsActive || null);
 const [editAllergies, setEditAllergies] = useState(ext.allergies || []);
 const [editDislikes, setEditDislikes] = useState(ext.foodDislikes || []);
 const [editCooking, setEditCooking] = useState(ext.cookingTime || '');
 const [editBudget, setEditBudget] = useState(ext.weeklyBudget || '');
 const [editBatchCooking, setEditBatchCooking] = useState(!!ext.batchCooking);
 const [editGoals, setEditGoals] = useState(
 ext.primaryGoals?.length > 0 ? ext.primaryGoals : ext.primaryGoal ? [ext.primaryGoal] : []
 );
 // ── Salud ──
 const [editLifeStage, setEditLifeStage] = useState(ext.lifeStage || '');
 const [editConditions, setEditConditions] = useState(ext.conditions || []);
 const [editContraUse, setEditContraUse] = useState(ext.contraUse ?? null);
 const [editContraType, setEditContraType] = useState(ext.contraType || '');
 const [editMedications, setEditMedications] = useState(ext.medications || []);
 const [savingExt, setSavingExt] = useState(false);

 // ── Weight tracker ──
 const weightLog = ext.weightLog || [];
 const todayStr = new Date().toISOString().split('T')[0];
 const todayEntry = weightLog.find(e => e.date === todayStr);
 const lastEntry = weightLog[0]; // log is sorted desc
 const [todayW, setTodayW] = useState(todayEntry?.weight ?? (profile?.weight || 60));
 const [targetW, setTargetW] = useState(ext.targetWeight || '');
 const [editTarget, setEditTarget] = useState(false);
 const [wLogged, setWLogged] = useState(!!todayEntry);

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
 const notifSettings = ext.notifSettings || {};
 const [notifSaving, setNotifSaving] = useState(false);
 const [notifStatus, setNotifStatus] = useState('idle'); // 'idle'|'ok'|'denied'|'error'
 const NOTIF_HOUR_OPTS = [6, 7, 8, 9, 10, 12, 17, 18, 19, 20];

 const handleSaveNotifSettings = async (newSettings) => {
 setNotifSaving(true);
 try {
 const merged = { ...notifSettings, ...newSettings };
 await profile.saveProfileExtended({ notifSettings: merged });
 const lastPeriod = ext.lastPeriod || profile?.lastPeriod || null;
 await syncNotifications({
 lastPeriod,
 cycleLength: profile?.cycleLength || ext.cycleLength || 28,
 trainDays: profile?.trainDays || [],
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
 const calSyncHour = ext.calendarSyncHour ?? 7;
 const calEvents = ext.calendarEvents || {};
 const [calSyncing, setCalSyncing] = useState(false);
 const [calStatus, setCalStatus] = useState('idle'); // 'idle'|'synced'|'error'|'denied'
 const [deleting, setDeleting] = useState(false);
 const [deleteStep, setDeleteStep] = useState(0); // 0=hidden 1=confirm 2=deleting
 const HOUR_OPTIONS = [6, 7, 8, 9, 17, 18, 19, 20];

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
 phase: pi?.phase,
 trainDays: profile?.trainDays || [],
 hour: calSyncHour,
 });
 await profile.saveProfileExtended({ calendarSync: true });
 setCalStatus('synced');
 } else {
 // En build nativo: sincronización directa silenciosa
 const events = await syncWeekToCalendar({
 phase: pi?.phase,
 trainDays: profile?.trainDays || [],
 hour: calSyncHour,
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
 phase: pi?.phase,
 trainDays: profile?.trainDays || [],
 hour: calSyncHour,
 });
 setCalStatus('synced');
 } else {
 const events = await syncWeekToCalendar({
 phase: pi?.phase,
 trainDays: profile?.trainDays || [],
 hour: calSyncHour,
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
 const [age, setAge] = useState(String(profile?.age || ''));
 const [weight, setWeight] = useState(String(profile?.weight || ''));
 const [height, setHeight] = useState(String(profile?.height || ''));
 const [activityLevel, setAL] = useState(profile?.activityLevel || 'moderate');
 const [goal, setGoal] = useState(profile?.goal || 'lose_weight');
 const [dietary, setDietary] = useState(profile?.dietary || []);
 const [trainDays, setTD] = useState(profile?.trainDays || [1, 2, 4, 5]);
 const [saving, setSaving] = useState(false);
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
 setTD(trainDays.filter(x => x !== d)); // sin mínimo
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
 await profile.saveProfileExtended({ primaryGoals: editGoals });
 setSavingExt(false);
 setEditing(null);
 };

 const saveDiet = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({ diet: editDiet });
 setSavingExt(false);
 setEditing(null);
 };

 const saveCooking = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({ cookingTime: editCooking });
 setSavingExt(false);
 setEditing(null);
 };

 const saveBudget = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({ weeklyBudget: editBudget });
 setSavingExt(false);
 setEditing(null);
 };

 const saveFitness = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({ fitnessLevel: editFitness });
 setSavingExt(false);
 setEditing(null);
 };

 const saveGym = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({ gymAccess: editGym });
 setSavingExt(false);
 setEditing(null);
 };

 const saveHealth = async () => {
 setSavingExt(true);
 await profile.saveProfileExtended({
 lifeStage: editLifeStage,
 conditions: editConditions,
 contraUse: editContraUse,
 contraType: editContraUse ? editContraType : '',
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
 mediaTypes: ImagePicker.MediaTypeOptions?.Images,
 allowsEditing: true,
 aspect: [1, 1],
 quality: 0.5,
 base64: true,
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
 { text: lang === 'en' ? ' Camera' : 'Cámara', onPress: () => pickAvatar('camera') },
 { text: lang === 'en' ? ' Photos' : 'Galería', onPress: () => pickAvatar('library') },
 ...(avatarUri ? [{ text: lang === 'en' ? ' Remove' : 'Eliminar', style: 'destructive', onPress: removeAvatar }] : []),
 { text: lang === 'en' ? 'Cancel' : 'Cancelar', style: 'cancel' },
 ],
 );
 };

 const p = T[lang] || T.es;
 const { diets: allDiets, dietsByCategory, getDiet } = useDiets(lang);
 const name = ext.name || '';

 // ── Editar nombre con prompt ─────────────────────────────────────────────
 const [editingName, setEditingName] = useState(false);
 const [nameDraft, setNameDraft] = useState(name);

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
 { id: 'sedentary', emoji: '', label: p.activity.sedentary },
 { id: 'light', emoji: '', label: p.activity.light },
 { id: 'moderate', emoji: '', label: p.activity.moderate },
 { id: 'active', emoji: '', label: p.activity.active },
 ];
 const GOAL_OPTIONS = [
 { id: 'lose_weight', emoji: '', label: p.goals.lose_weight },
 { id: 'maintain', emoji: '', label: p.goals.maintain },
 { id: 'gain_muscle', emoji: '', label: p.goals.gain_muscle },
 ];
 const DIETARY_OPTIONS = [
 { id: 'lactose_free', label: 'Sin lactosa / Lactose-free / Sans lactose' },
 { id: 'gluten_free', label: 'Sin gluten / Gluten-free / Sans gluten' },
 { id: 'vegetarian', label: 'Vegetariana / Vegetarian / Végétarienne' },
 { id: 'vegan', label: 'Vegana / Vegan / Végane' },
 { id: 'none', label: lang === 'fr' ? ' Aucune restriction' : lang === 'en' ? ' No restrictions' : 'Sin restricciones' },
 ];

 const actOpt = ACTIVITY_OPTIONS.find(a => a.id === activityLevel);
 const goalOpt = GOAL_OPTIONS.find(g => g.id === goal);
 const goalMap = GOAL_L[lang] || GOAL_L.es;

 // ── helpers ──
 const tr = (es, en, fr, it) => ({ es, en: en||es, fr: fr||es, it: it||es })[lang] || es;
 const yesStr = p.onboarding?.yes || 'Sí';
 const noStr = p.onboarding?.no || 'No';
 const actOpt2 = ACTIVITY_OPTIONS.find(a => a.id === activityLevel);
 const goalOpt2 = GOAL_OPTIONS.find(g => g.id === goal);

 const editModalTitle = {
  personal: tr('Datos personales','Personal data'),
  goal: tr('Actividad y objetivo','Activity & goal'),
  program: tr('Programa','Programme'),
  health: tr('Salud','Health'),
  notifications: tr('Recordatorios','Reminders'),
  calendar: tr('Agenda','Calendar'),
  language: p.profile.language || 'Idioma',
 }[editing] || '';

 function NavCard({ iconEl, title, children }) {
  return (
   <View style={s2.sectionCard}>
    <View style={s2.sectionHeader}>
     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {iconEl}
      <BText style={s2.sectionHeaderTxt}>{title}</BText>
     </View>
    </View>
    <View>{children}</View>
   </View>
  );
 }

 function NavItem({ label, value, onPress, last }) {
  return (
   <TouchableOpacity onPress={onPress}
    style={[s2.navItem, !last && s2.navItemBorder]}>
    <BText style={s2.navItemLabel}>{label}</BText>
    {!!value && <BText style={s2.navItemValue} numberOfLines={1}>{value}</BText>}
    <ChevronRight size={24} color="#0A0A0A" />
   </TouchableOpacity>
  );
 }

 const deleteLabel = {
  btn: { es: 'Eliminar cuenta y datos', en: 'Delete account and data', fr: 'Supprimer compte et données', it: 'Elimina account e dati' },
  title: { es: '¿Eliminar tu cuenta?', en: 'Delete your account?', fr: 'Supprimer ton compte ?', it: 'Eliminare il tuo account?' },
  body: { es: 'Esta acción es irreversible. Se borrarán todos tus datos: ciclo, peso, programa y perfil.', en: 'This action is irreversible. All your data will be deleted.', fr: 'Cette action est irréversible. Toutes tes données seront supprimées.', it: 'Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati.' },
  confirm: { es: 'Sí, eliminar todo', en: 'Yes, delete everything', fr: 'Oui, tout supprimer', it: 'Sì, elimina tutto' },
  cancel: { es: 'Cancelar', en: 'Cancel', fr: 'Annuler', it: 'Annulla' },
  deleting: { es: 'Eliminando…', en: 'Deleting…', fr: 'Suppression…', it: 'Eliminazione…' },
 };
 const handleDelete = async () => {
  setDeleteStep(2); setDeleting(true);
  try {
   const { supabase: sb } = require('../lib/supabase');
   const { error } = await sb.rpc('delete_user_account');
   if (error) throw error;
  } catch (e) {
   // Fallback si la RPC falla: borra manualmente lo mismo que ella (food_logs
   // primero, luego profiles) para no dejar historial huérfano.
   const { supabase: sb } = require('../lib/supabase');
   const user = (await sb.auth.getUser())?.data?.user;
   if (user) {
    await sb.from('food_logs').delete().eq('user_id', user.id);
    await sb.from('profiles').delete().eq('id', user.id);
   }
  }
  await signOut();
 };

 const disclaimerText = tr(
  'Blumm es una herramienta de información y bienestar. No sustituye el consejo médico, ginecológico ni nutricional. Las recomendaciones son guías personalizadas, no consultas profesionales.',
  'Blumm is an information and wellness tool. It does not replace medical, gynaecological or nutritional advice.',
  'Blumm est un outil d\'information et de bien-être. Il ne remplace pas l\'avis médical, gynécologique ou nutritionnel.',
  'Blumm è uno strumento di informazione e benessere. Non sostituisce il parere medico.'
 );

 return (
 <View style={{ flex: 1, backgroundColor: 'white' }}>
 <ScrollView style={{ flex: 1 }} contentContainerStyle={s2.content}>

 {/* ── NavBar ── */}
 <View style={s2.navBar}>
  <BText style={s2.navTitle}>{tr('Perfil','Profile','Profil','Profilo')}</BText>
 </View>

 {/* ── Profile header card ── */}
 <View style={s2.profileCard}>
  <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={{ position: 'relative' }}>
   {avatarUri
    ? <Image source={{ uri: avatarUri }} style={s2.avatar} />
    : <View style={[s2.avatar, { backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }]}>
       <BText style={{ fontSize: 24, color: 'white', fontFamily: F.bodyB }}>{name ? name[0].toUpperCase() : '?'}</BText>
      </View>}
   <View style={s2.cameraBtn}>
    {avatarUploading ? <ActivityIndicator size="small" color="white" /> : <Camera size={12} color="white" />}
   </View>
  </TouchableOpacity>
  <View style={{ alignItems: 'center', width: '100%', gap: 4 }}>
   <TouchableOpacity onPress={handleEditName}>
    {name
     ? <BText style={s2.profileName}>{name}</BText>
     : <BText style={[s2.profileName, { color: '#A3A3A3' }]}>+ {tr('Añadir nombre','Add name')}</BText>}
   </TouchableOpacity>
   <View style={s2.tagsRow}>
    {pi?.data?.name && <View style={s2.tag}><BText style={s2.tagTxt}>{pi.data.name.toUpperCase()}</BText></View>}
    {pi && <View style={s2.tag}><BText style={s2.tagTxt}>{tr('DÍA','DAY')} {pi.day}/{pi.cycleLen}</BText></View>}
    {pi?.data?.intensity && <View style={s2.tag}><BText style={s2.tagTxt}>{pi.data.intensity.toUpperCase()}</BText></View>}
    {primaryGoals[0] && <View style={s2.tag}><BText style={s2.tagTxt}>{((GOAL_L[lang]||GOAL_L.es)[primaryGoals[0]]||'').trim().toUpperCase()}</BText></View>}
   </View>
  </View>
 </View>

 {/* ── Name edit modal ── */}
 <Modal visible={editingName} transparent animationType="fade">
  <View style={s2.modalOverlay}>
   <View style={s2.nameModal}>
    <BText style={s2.nameModalTitle}>{tr('Tu nombre','Your name')}</BText>
    <TextInput style={s2.nameInput} value={nameDraft} onChangeText={setNameDraft}
     placeholder={tr('Tu nombre…','Your name…')} autoFocus maxLength={30} placeholderTextColor="#A3A3A3" />
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
     <TouchableOpacity onPress={() => setEditingName(false)} style={[s2.nameModalBtn, { backgroundColor: '#F5F5F5' }]}>
      <BText style={{ fontFamily: F.body, color: '#737373' }}>{tr('Cancelar','Cancel')}</BText>
     </TouchableOpacity>
     <TouchableOpacity onPress={saveName} style={[s2.nameModalBtn, { backgroundColor: '#0A0A0A' }]}>
      <BText style={{ fontFamily: F.bodyB, color: 'white' }}>{tr('Guardar','Save')}</BText>
     </TouchableOpacity>
    </View>
   </View>
  </View>
 </Modal>

 {/* ── Datos personales ── */}
 <NavCard iconEl={<UserRound size={16} color="#FECA04" />} title={tr('Datos personales','Personal data')}>
  <NavItem label={tr('Edad','Age','Âge','Età')} value={age || '—'} onPress={() => setEditing('personal')} />
  <NavItem label={tr('Altura','Height','Taille','Altezza')} value={height ? `${height} cm` : '—'} onPress={() => setEditing('personal')} />
  <NavItem label={tr('Peso','Weight','Poids','Peso')} value={weight ? `${weight} kg` : '—'} last onPress={() => setEditing('personal')} />
 </NavCard>

 {/* ── Entrenamiento ── */}
 <NavCard iconEl={<UserRound size={16} color="#429FE7" />} title={tr('Entrenamiento','Training')}>
  <NavItem label={tr('Nivel de actividad','Activity level')} value={actOpt2?.label || '—'} onPress={() => setEditing('goal')} />
  <NavItem label={tr('Objetivo','Goal')} value={goalOpt2?.label || '—'} onPress={() => setEditing('goal')} />
  <NavItem label={tr('Nivel fitness','Fitness level')} value={lbl(FITNESS_L, editFitness, lang) || '—'} onPress={() => setEditing('fitness')} />
  <NavItem label={tr('Lugar entreno','Training location')} value={(Array.isArray(editGym)?editGym:[editGym]).filter(Boolean).map(g=>lbl(GYM_L,g,lang)).filter(Boolean).join(', ')||'—'} last onPress={() => setEditing('gym')} />
 </NavCard>

 {/* ── Nutrición ── */}
 <NavCard iconEl={<Salad size={16} color="#FE6004" />} title={tr('Nutrición','Nutrition')}>
  <NavItem label={p.profile.dietType || tr('Tipo de dieta','Diet type')} value={[editDiet?(getDiet(normalizeDietId(editDiet))?.name?.[lang]||lbl(DIET_L,editDiet,lang)):null,editFasting?getDiet(editFasting)?.name?.[lang]:null].filter(Boolean).join(' + ')||'—'} onPress={() => setEditing('diet')} />
  <NavItem label={p.profile.cookingTime || tr('Tiempo cocina','Cooking time')} value={lbl(COOKING_L, editCooking) || '—'} onPress={() => setEditing('cooking')} />
  <NavItem label={p.profile.budget || tr('Presupuesto','Budget')} value={lbl(BUDGET_L, editBudget, lang) || '—'} last onPress={() => setEditing('budget')} />
 </NavCard>

 {/* ── Salud ── */}
 <NavCard iconEl={<Heart size={16} color="#49CF38" />} title={tr('Salud','Health')}>
  <NavItem label={tr('Etapa vital','Life stage')} value={lbl(LIFE_L, editLifeStage, lang) || '—'} onPress={() => setEditing('health')} />
  <NavItem label={tr('Condiciones','Conditions')} value={editConditions.filter(c=>c!=='none').length ? String(editConditions.filter(c=>c!=='none').length) : '—'} onPress={() => setEditing('health')} />
  <NavItem label={tr('Anticonceptivos','Contraception')} value={editContraUse === true ? yesStr : editContraUse === false ? noStr : '—'} last onPress={() => setEditing('health')} />
 </NavCard>

 {/* ── Agenda y recordatorios ── */}
 {Platform.OS !== 'web' && (
  <NavCard iconEl={<CalendarFold size={16} color="#F04747" />} title={tr('Agenda y recordatorios','Reminders & calendar')}>
   <NavItem label={tr('Ciclo','Cycle')} value={notifSettings.cycle !== false ? yesStr : noStr} onPress={() => setEditing('notifications')} />
   <NavItem label={tr('Entrenamiento','Training')} value={notifSettings.workout !== false ? yesStr : noStr} onPress={() => setEditing('notifications')} />
   <NavItem label={tr('Hidratación','Hydration')} value={notifSettings.hydration !== false ? yesStr : noStr} onPress={() => setEditing('notifications')} />
   <NavItem label={tr('Sincronizar agenda','Sync calendar')} value={calSyncEnabled ? yesStr : noStr} last onPress={() => setEditing('calendar')} />
  </NavCard>
 )}

 {/* ── Legal y soporte ── */}
 <NavCard iconEl={<Scale size={16} color="#737373" />} title={tr('Legal y soporte','Legal & support')}>
  <NavItem label={tr('Política de privacidad','Privacy policy')} onPress={() => Linking.openURL(PRIVACY_URL)} />
  <NavItem label={tr('Términos de uso','Terms of use')} onPress={() => Linking.openURL(TERMS_URL)} />
  <NavItem label={tr('Contactar con soporte','Contact support')} last onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Blumm%20support`)} />
 </NavCard>

 {/* ── Idioma ── */}
 <NavCard iconEl={<Flag size={16} color="#A157C9" />} title={p.profile.language || 'Idioma'}>
  <NavItem label={p.profile.language || 'Idioma'} value={LANGUAGES.find(l=>l.code===lang)?.name || lang} last onPress={() => setEditing('language')} />
 </NavCard>

 {/* ── Alert card ── */}
 <View style={s2.alertCard}>
  <CircleAlert size={24} color="#0A0A0A" />
  <BText style={s2.alertTxt}>{disclaimerText}</BText>
 </View>

 {/* ── Action buttons ── */}
 <View style={{ gap: 2 }}>
  <TouchableOpacity style={s2.signOutBtn} onPress={signOut}>
   <BText style={s2.signOutTxt}>{p.profile.signOut || 'Cerrar sesión'}</BText>
  </TouchableOpacity>
  {deleteStep === 0 && (
   <TouchableOpacity style={s2.deleteBtn} onPress={() => setDeleteStep(1)}>
    <BText style={s2.deleteBtnTxt}>{deleteLabel.btn[lang] || deleteLabel.btn.es}</BText>
   </TouchableOpacity>
  )}
  {deleteStep === 1 && (
   <View style={s2.deleteConfirmBox}>
    <BText style={s2.deleteConfirmTitle}>{deleteLabel.title[lang]}</BText>
    <BText style={s2.deleteConfirmBody}>{deleteLabel.body[lang]}</BText>
    <View style={{ flexDirection: 'row', gap: 8 }}>
     <TouchableOpacity style={[s2.nameModalBtn, { flex:1, backgroundColor:'#F5F5F5' }]} onPress={() => setDeleteStep(0)}>
      <BText style={{ fontFamily: F.body, color: '#737373' }}>{deleteLabel.cancel[lang]}</BText>
     </TouchableOpacity>
     <TouchableOpacity style={[s2.nameModalBtn, { flex:1, backgroundColor:'#DF4949' }]} onPress={handleDelete} disabled={deleting}>
      <BText style={{ fontFamily: F.bodyB, color: 'white' }}>{deleteLabel.confirm[lang]}</BText>
     </TouchableOpacity>
    </View>
   </View>
  )}
  {deleteStep === 2 && (
   <View style={{ alignItems: 'center', padding: 16 }}>
    <ActivityIndicator color="#DF4949" />
    <BText style={{ marginTop: 8, color: '#737373', fontFamily: F.body }}>{deleteLabel.deleting[lang]}</BText>
   </View>
  )}
 </View>

 <View style={{ height: 100 }} />
 </ScrollView>

 {/* ── Edit Modal ── */}
 <Modal visible={!!editing} animationType="slide" transparent presentationStyle="overFullScreen">
  <View style={s2.modalOverlay}>
   <SafeAreaView style={s2.modalSheet}>
    <View style={s2.modalHeader}>
     <BText style={s2.modalTitle}>{editModalTitle}</BText>
     <TouchableOpacity onPress={() => setEditing(null)} style={s2.modalCloseBtn}>
      <X size={16} color="#0A0A0A" />
     </TouchableOpacity>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 48 }} showsVerticalScrollIndicator={false}>

     {/* ── personal ── */}
     {editing === 'personal' && (
      <View style={{ gap: 48 }}>
       {[
        { label: tr('Edad','Age','Âge','Età'), val: age, set: setAge, unit: p.profile.years, kb: 'numeric' },
        { label: tr('Altura','Height','Taille','Altezza'), val: height, set: setHeight, unit: 'cm', kb: 'numeric' },
        { label: tr('Peso','Weight','Poids','Peso'), val: weight, set: setWeight, unit: 'kg', kb: 'decimal-pad' },
       ].map(f => (
        <View key={f.label} style={styles.inputRow}>
         <BText style={styles.inputLabel}>{f.label}</BText>
         <View style={styles.inputWrap}>
          <TextInput style={styles.input} value={f.val} onChangeText={f.set} keyboardType={f.kb} placeholder="—" placeholderTextColor="#A3A3A3" />
          {f.unit ? <View style={styles.inputUnit}><BText style={styles.inputUnitTxt}>{f.unit}</BText></View> : null}
         </View>
        </View>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={save} disabled={saving}>
        <BText style={s2.modalSaveBtnTxt}>{saving ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── goal ── */}
     {editing === 'goal' && (
      <View style={{ gap: 48 }}>
       <View style={{ gap: 2 }}>
        {ACTIVITY_OPTIONS.map(opt => (
         <TouchableOpacity key={opt.id} onPress={() => setAL(opt.id)}
          style={[styles.optRow, activityLevel === opt.id && styles.optRowActive]}>
          <View style={{ flex: 1 }}>
           <BText style={styles.optLabel}>{opt.label}</BText>
           {opt.desc ? <BText style={styles.optDesc}>{opt.desc}</BText> : null}
          </View>
          <View style={[styles.radio, activityLevel === opt.id && styles.radioActive]}>
           {activityLevel === opt.id && <View style={styles.radioDot} />}
          </View>
         </TouchableOpacity>
        ))}
       </View>
       <View style={{ gap: 2 }}>
        {GOAL_OPTIONS.map(opt => (
         <TouchableOpacity key={opt.id} onPress={() => setGoal(opt.id)}
          style={[styles.optRow, goal === opt.id && styles.optRowActive]}>
          <View style={{ flex: 1 }}>
           <BText style={styles.optLabel}>{opt.label}</BText>
          </View>
          <View style={[styles.radio, goal === opt.id && styles.radioActive]}>
           {goal === opt.id && <View style={styles.radioDot} />}
          </View>
         </TouchableOpacity>
        ))}
       </View>
       <TouchableOpacity style={s2.modalSaveBtn} onPress={save} disabled={saving}>
        <BText style={s2.modalSaveBtnTxt}>{saving ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── program ── */}
     {editing === 'program' && (
      <View>
       {p.onboarding?.goals && <>
        <BText style={styles.editSection}>{p.onboarding.goalsLabel || 'OBJETIVOS'}</BText>
        {p.onboarding.goals.map(o => (
         <TouchableOpacity key={o.v} onPress={() => toggleExtArr(editGoals, setEditGoals, o.v)}
          style={[styles.optRow, editGoals.includes(o.v) && styles.optRowActive]}>
          <BText style={styles.optEmoji}>{o.ico}</BText>
          <View style={{ flex: 1 }}>
           <BText style={[styles.optLabel, editGoals.includes(o.v) && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{o.l}</BText>
           {o.d && <BText style={{ fontSize: 11, color: '#737373', fontFamily: F.body }}>{o.d}</BText>}
          </View>
          {editGoals.includes(o.v) && <Check size={16} color="#0A0A0A" />}
         </TouchableOpacity>
        ))}
       </>}
       <BText style={{ fontSize: 12, color: '#737373', fontFamily: F.body, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
        {tr('Edita dieta, ayuno, alergias y complementos desde la pestaña Nutrición. Edita días, nivel y lugar desde la pestaña Gimnasio.',
         'Edit diet, fasting, allergies and supplements from the Nutrition tab.')}
       </BText>
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveProgram} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── diet ── */}
     {editing === 'diet' && (
      <View>
       <BText style={styles.editSection}>{tr('TIPO DE DIETA','DIET TYPE')}</BText>
       {Object.entries(DIET_L[lang] || DIET_L.es).map(([id, label]) => (
        <TouchableOpacity key={id} onPress={() => setEditDiet(id)}
         style={[styles.optRow, editDiet === id && styles.optRowActive]}>
         <View style={{ flex: 1 }}>
          <BText style={[styles.optLabel, editDiet === id && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{label}</BText>
         </View>
         <View style={[styles.radio, editDiet === id && styles.radioActive]}>
          {editDiet === id && <View style={styles.radioDot} />}
         </View>
        </TouchableOpacity>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveDiet} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── cooking time ── */}
     {editing === 'cooking' && (
      <View>
       <BText style={styles.editSection}>{tr('TIEMPO DE COCINA','COOKING TIME')}</BText>
       {Object.entries(COOKING_L).map(([id, label]) => (
        <TouchableOpacity key={id} onPress={() => setEditCooking(id)}
         style={[styles.optRow, editCooking === id && styles.optRowActive]}>
         <View style={{ flex: 1 }}>
          <BText style={[styles.optLabel, editCooking === id && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{label}</BText>
         </View>
         <View style={[styles.radio, editCooking === id && styles.radioActive]}>
          {editCooking === id && <View style={styles.radioDot} />}
         </View>
        </TouchableOpacity>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveCooking} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── budget ── */}
     {editing === 'budget' && (
      <View>
       <BText style={styles.editSection}>{tr('PRESUPUESTO SEMANAL','WEEKLY BUDGET')}</BText>
       {Object.entries(BUDGET_L[lang] || BUDGET_L.es).map(([id, label]) => (
        <TouchableOpacity key={id} onPress={() => setEditBudget(id)}
         style={[styles.optRow, editBudget === id && styles.optRowActive]}>
         <View style={{ flex: 1 }}>
          <BText style={[styles.optLabel, editBudget === id && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{label}</BText>
         </View>
         <View style={[styles.radio, editBudget === id && styles.radioActive]}>
          {editBudget === id && <View style={styles.radioDot} />}
         </View>
        </TouchableOpacity>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveBudget} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── fitness level ── */}
     {editing === 'fitness' && (
      <View>
       <BText style={styles.editSection}>{tr('NIVEL FITNESS','FITNESS LEVEL')}</BText>
       {Object.entries(FITNESS_L[lang] || FITNESS_L.es).map(([id, label]) => (
        <TouchableOpacity key={id} onPress={() => setEditFitness(id)}
         style={[styles.optRow, editFitness === id && styles.optRowActive]}>
         <View style={{ flex: 1 }}>
          <BText style={[styles.optLabel, editFitness === id && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{label}</BText>
         </View>
         <View style={[styles.radio, editFitness === id && styles.radioActive]}>
          {editFitness === id && <View style={styles.radioDot} />}
         </View>
        </TouchableOpacity>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveFitness} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── gym location ── */}
     {editing === 'gym' && (
      <View>
       <BText style={styles.editSection}>{tr('LUGAR DE ENTRENAMIENTO','TRAINING LOCATION')}</BText>
       {Object.entries(GYM_L[lang] || GYM_L.es).map(([id, label]) => (
        <TouchableOpacity key={id} onPress={() => setEditGym(id)}
         style={[styles.optRow, editGym === id && styles.optRowActive]}>
         <View style={{ flex: 1 }}>
          <BText style={[styles.optLabel, editGym === id && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{label}</BText>
         </View>
         <View style={[styles.radio, editGym === id && styles.radioActive]}>
          {editGym === id && <View style={styles.radioDot} />}
         </View>
        </TouchableOpacity>
       ))}
       <TouchableOpacity style={s2.modalSaveBtn} onPress={saveGym} disabled={savingExt}>
        <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
       </TouchableOpacity>
      </View>
     )}

     {/* ── health ── */}
     {editing === 'health' && (() => {
      const ob = p.onboarding;
      const ALL_CONDITIONS = [...(ob?.conditions||[]),
       { v:'type1_diabetes', l:lbl(COND_L,'type1_diabetes',lang) }, { v:'type2_diabetes', l:lbl(COND_L,'type2_diabetes',lang) },
       { v:'hypertension', l:lbl(COND_L,'hypertension',lang) }, { v:'anemia', l:lbl(COND_L,'anemia',lang) }];
      const MED_OPTIONS = [
       { v:'thyroid_hormone', l:lbl(MED_L,'levothyroxine',lang) }, { v:'metformin', l:lbl(MED_L,'metformin',lang) },
       { v:'insulin', l:tr('Insulina','Insulin') }, { v:'antidepressants', l:lbl(MED_L,'antidepressants',lang) },
       { v:'iron', l:lbl(MED_L,'iron',lang) }, { v:'ssri', l:lbl(MED_L,'ssri',lang) }, { v:'none', l:lbl(MED_L,'none',lang) }];
      return (
       <View>
        {ob?.lifeStages && <>
         <BText style={styles.editSection}>{ob.lifeStageLabel}</BText>
         {ob.lifeStages.map(o => (
          <TouchableOpacity key={o.v} onPress={() => setEditLifeStage(o.v)}
           style={[styles.optRow, editLifeStage === o.v && styles.optRowActive]}>
           <View style={{ flex: 1 }}>
            <BText style={[styles.optLabel, editLifeStage === o.v && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{o.l}</BText>
            {o.d && <BText style={{ fontSize: 11, color: '#737373', fontFamily: F.body }}>{o.d}</BText>}
           </View>
           <View style={[styles.radio, editLifeStage === o.v && styles.radioActive]}>
            {editLifeStage === o.v && <View style={styles.radioDot} />}
           </View>
          </TouchableOpacity>
         ))}
        </>}
        <BText style={[styles.editSection, { marginTop: 16, color: '#EF4444' }]}>{ob?.conditionsLabel || 'CONDICIONES'}</BText>
        <View style={styles.row}>
         {ALL_CONDITIONS.map(o => {
          const sel = editConditions.includes(o.v);
          return (
           <TouchableOpacity key={o.v} onPress={() => toggleExtArr(editConditions, setEditConditions, o.v)}
            style={[styles.chip, sel && { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' }]}>
            <BText style={[styles.chipText, sel && { color: '#EF4444', fontFamily: F.bodyB }]}>{o.l}</BText>
           </TouchableOpacity>
          );
         })}
        </View>
        <BText style={[styles.editSection, { marginTop: 16 }]}>{ob?.contraLabel || 'ANTICONCEPCIÓN'}</BText>
        <View style={styles.yesNoRow}>
         <TouchableOpacity style={[styles.yesNoBtn, editContraUse===true && styles.yesNoBtnActive]} onPress={() => setEditContraUse(true)}>
          <BText style={[styles.yesNoTxt, editContraUse===true && styles.yesNoTxtActive]}>{yesStr}</BText>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.yesNoBtn, editContraUse===false && styles.yesNoBtnActive]} onPress={() => { setEditContraUse(false); setEditContraType(''); }}>
          <BText style={[styles.yesNoTxt, editContraUse===false && styles.yesNoTxtActive]}>{noStr}</BText>
         </TouchableOpacity>
        </View>
        {editContraUse === true && ob?.contraOptions && (
         <View style={[styles.row, { marginTop: 10 }]}>
          {ob.contraOptions.map(o => {
           const sel = editContraType === o.v;
           return (<TouchableOpacity key={o.v} onPress={() => setEditContraType(o.v)}
            style={[styles.chip, sel && { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#0A0A0A' }]}>
            <BText style={[styles.chipText, sel && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{o.l}</BText>
           </TouchableOpacity>);
          })}
         </View>
        )}
        <BText style={[styles.editSection, { marginTop: 16 }]}>{tr('MEDICACIÓN HABITUAL','REGULAR MEDICATION')}</BText>
        <View style={styles.row}>
         {MED_OPTIONS.map(o => {
          const sel = editMedications.includes(o.v);
          return (
           <TouchableOpacity key={o.v} onPress={() => {
            if (o.v==='none') { setEditMedications(sel?[]:['none']); return; }
            const without = editMedications.filter(x=>x!=='none');
            setEditMedications(without.includes(o.v)?without.filter(x=>x!==o.v):[...without,o.v]);
           }} style={[styles.chip, sel && { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#0A0A0A' }]}>
           <BText style={[styles.chipText, sel && { color: '#0A0A0A', fontFamily: F.bodyB }]}>{o.l}</BText>
          </TouchableOpacity>);
         })}
        </View>
        <TouchableOpacity style={s2.modalSaveBtn} onPress={saveHealth} disabled={savingExt}>
         <BText style={s2.modalSaveBtnTxt}>{savingExt ? p.profile.saving : p.profile.save}</BText>
        </TouchableOpacity>
       </View>
      );
     })()}

     {/* ── notifications ── */}
     {editing === 'notifications' && (
      <View>
       {notifStatus === 'ok' && <BText style={styles.calOk}>¡{tr('Recordatorios guardados','Reminders saved')}!</BText>}
       {notifStatus === 'denied' && <BText style={styles.calAlert}>{tr('Permiso denegado. Activa las notificaciones en Ajustes.','Permission denied. Enable notifications in Settings.')}</BText>}
       {[
        { key:'cycle', label:{ es:'Aviso de ciclo', en:'Cycle reminder' }, enabled: notifSettings.cycle!==false },
        { key:'workout', label:{ es:'Recordatorio de entreno', en:'Workout reminder' }, enabled: notifSettings.workout!==false },
        { key:'hydration', label:{ es:'Hidratación diaria', en:'Daily hydration' }, enabled: notifSettings.hydration!==false },
       ].map(item => (
        <View key={item.key} style={styles.notifRow}>
         <BText style={[styles.notifLabel, { flex:1 }]}>{item.label[lang]||item.label.es}</BText>
         <TouchableOpacity onPress={() => handleSaveNotifSettings({ [item.key]: !item.enabled })} disabled={notifSaving}
          style={[styles.toggle, item.enabled && styles.toggleOn]}>
          <View style={[styles.toggleDot, item.enabled && styles.toggleDotOn]} />
         </TouchableOpacity>
        </View>
       ))}
       {notifSettings.workout !== false && (
        <View style={{ marginTop: 12 }}>
         <BText style={styles.editSection}>{tr('HORA DEL RECORDATORIO','REMINDER TIME')}</BText>
         <View style={styles.hoursRow}>
          {NOTIF_HOUR_OPTS.map(h => (
           <TouchableOpacity key={h} onPress={() => handleSaveNotifSettings({ workoutHour: h })}
            style={[styles.hourBtn, (notifSettings.workoutHour||8)===h && styles.hourBtnActive]}>
            <BText style={[styles.hourTxt, (notifSettings.workoutHour||8)===h && styles.hourTxtActive]}>{String(h).padStart(2,'0')}:00</BText>
           </TouchableOpacity>
          ))}
         </View>
        </View>
       )}
      </View>
     )}

     {/* ── calendar ── */}
     {editing === 'calendar' && (
      <View>
       <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <View style={{ flex: 1 }}>
         <BText style={styles.notifLabel}>{tr('Sincronizar agenda','Sync calendar')}</BText>
         <BText style={styles.calSubtitle}>{tr('Añade entrenamientos al calendario','Add workouts to your calendar')}</BText>
        </View>
        <TouchableOpacity onPress={handleToggleCalSync} disabled={calSyncing} style={[styles.toggle, calSyncEnabled && styles.toggleOn]}>
         <View style={[styles.toggleDot, calSyncEnabled && styles.toggleDotOn]} />
        </TouchableOpacity>
       </View>
       {calStatus==='synced' && <BText style={styles.calOk}>{tr('¡Listo! Comprueba tu app Calendario.','Done! Check your Calendar app.')}</BText>}
       {calStatus==='denied' && <BText style={styles.calAlert}>{tr('Permiso denegado.','Permission denied.')}</BText>}
       {calStatus==='error' && <BText style={styles.calAlert}>{tr('Algo fue mal.','Something went wrong.')}</BText>}
       {calSyncEnabled && (
        <View style={{ marginTop: 8 }}>
         <BText style={styles.editSection}>{tr('HORA PREFERIDA','PREFERRED TIME')}</BText>
         <View style={styles.hoursRow}>
          {HOUR_OPTIONS.map(h => (
           <TouchableOpacity key={h} onPress={() => handleChangeHour(h)}
            style={[styles.hourBtn, calSyncHour===h && styles.hourBtnActive]}>
            <BText style={[styles.hourTxt, calSyncHour===h && styles.hourTxtActive]}>{String(h).padStart(2,'0')}:00</BText>
           </TouchableOpacity>
          ))}
         </View>
         <TouchableOpacity style={[styles.resyncBtn, calSyncing && { opacity:0.5 }]} onPress={handleResync} disabled={calSyncing}>
          <BText style={styles.resyncTxt}>{calSyncing ? '…' : tr('Sincronizar esta semana','Sync this week')}</BText>
         </TouchableOpacity>
        </View>
       )}
      </View>
     )}

     {/* ── language ── */}
     {editing === 'language' && (
      <View style={styles.langRow}>
       {LANGUAGES.map(l => (
        <TouchableOpacity key={l.code} onPress={() => changeLang(l.code)}
         style={[styles.langBtn, lang===l.code && styles.langBtnActive]}>
         <BText style={styles.langFlag}>{l.flag}</BText>
         <BText style={[styles.langName, lang===l.code && styles.langNameActive]}>{l.name}</BText>
        </TouchableOpacity>
       ))}
      </View>
     )}

    </ScrollView>
   </SafeAreaView>
  </View>
 </Modal>

 </View>
 );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#FFFFFF' },
 content: { padding: 16, paddingTop: 56, paddingBottom: 40 },

 header: { alignItems: 'center', marginBottom: 20 },
 avatarWrap: { position: 'relative', marginBottom: 10 },
 avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#262626', justifyContent: 'center', alignItems: 'center' },
 avatarImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#262626' },
 avatarText: { fontSize: 30, color: 'white', fontFamily: F.bodyB },
 avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, borderWidth: 1, borderColor: '#E2E8F0' },
 avatarEditTxt: { fontSize: 12, fontFamily: F.body },
 headerName: { fontSize: 22, color: '#0A0A0A', marginBottom: 6, fontFamily: F.heading },

 // Modal de edición de nombre
 nameModalOverlay: { position: 'absolute', top: 0, left: -14, right: -14, bottom: -300, backgroundColor: 'rgba(15,31,74,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
 nameModal: { width: '90%', maxWidth: 360, backgroundColor: 'white', borderRadius: 18, padding: 20 },
 nameModalTitle: { fontSize: 16, color: '#0A0A0A', marginBottom: 12, fontFamily: F.heading },
 nameInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, color: '#0A0A0A', backgroundColor: '#FAFAFA', fontFamily: F.body },
 nameModalBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
 headerMeta: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
 metaChip: { fontSize: 13, color: '#0A0A0A', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontFamily: F.body },
 headerGoal: { fontSize: 13, color: '#737373', marginBottom: 4, textAlign: 'center', fontFamily: F.body },
 headerSub: { fontSize: 12, color: '#737373', marginTop: 4, fontFamily: F.body },
 phaseChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
 phaseChipTxt: { fontSize: 10, fontFamily: F.bodyB, color: '#0A0A0A', letterSpacing: 0.5 },

 card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
 cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
 cardTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 sectionPill: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
 sectionPillTxt: { fontSize: 12, fontFamily: F.bodyB, color: '#525252' },
 profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
 profileRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 profileRowLabel: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 profileRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
 profileRowVal: { fontSize: 14, color: '#0A0A0A', fontFamily: F.bodyB },
 profileRowUnit: { fontSize: 12, color: '#737373', fontFamily: F.body },
 editBtn: { fontSize: 13, color: '#0A0A0A', fontFamily: F.bodyB },

 // Language picker
 langRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
 langBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' },
 langBtnActive: { borderColor: '#0A0A0A', backgroundColor: '#F5F5F5' },
 langFlag: { fontSize: 22, fontFamily: F.body },
 langName: { fontSize: 11, color: '#737373', marginTop: 2, fontFamily: F.body },
 langNameActive: { color: '#0A0A0A', fontFamily: F.bodyB },

 infoGrid: { flexDirection: 'row', gap: 10 },
 infoBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center' },
 infoVal: { fontSize: 22, fontFamily: F.bodyB, color: '#0A0A0A' },
 infoLbl: { fontSize: 11, color: '#737373', marginTop: 2, fontFamily: F.body },

 inputRow: { flexDirection: 'column', gap: 8, marginBottom: 16 },
 inputLabel: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body },
 inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, height: 48, paddingLeft: 8, paddingRight: 4, gap: 8 },
 input: { flex: 1, fontSize: 16, color: '#737373', fontFamily: F.body, paddingVertical: 0 },
 inputUnit: { width: 40, height: 40, backgroundColor: '#262626', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
 inputUnitTxt: { fontSize: 16, color: 'white', fontFamily: F.body, textAlign: 'center' },
 saveBtn: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#0A0A0A', alignItems: 'center' },
 saveBtnText: { color: 'white', fontFamily: F.bodyB, fontSize: 14 },

 row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 6, marginBottom: 6 },
 chipText: { fontSize: 12, color: '#0A0A0A', fontFamily: F.body },
 chipTextBlue: { fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 4 },

 editSection: { fontSize: 12, color: '#737373', fontFamily: F.bodyB, letterSpacing: 0.5, marginBottom: 8 },
 optRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, backgroundColor: '#FAFAFA', marginBottom: 2, minHeight: 56, gap: 8 },
 optRowActive: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#262626' },
 optEmoji: { fontSize: 20, marginRight: 10, fontFamily: F.body },
 optLabel: { fontSize: 16, color: '#0A0A0A', fontFamily: F.body },
 optDesc: { fontSize: 12, color: '#525252', fontFamily: F.body },
 radio: { width: 20, height: 20, borderRadius: 100, borderWidth: 1, borderColor: '#737373', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
 radioActive: { backgroundColor: '#262626', borderColor: '#262626', borderRadius: 24 },
 radioDot: { width: 8, height: 8, borderRadius: 9999, backgroundColor: 'white' },

 daysRow: { flexDirection: 'row', gap: 5 },
 dayChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
 dayChipText: { fontSize: 11, fontFamily: F.bodyB },

 infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
 infoRowIcon: { fontSize: 18, marginRight: 10, marginTop: 1, fontFamily: F.body },
 infoRowBody: { flex: 1 },
 infoRowTitle: { fontSize: 11, color: '#737373', fontFamily: F.bodyB, letterSpacing: 0.3, marginBottom: 2 },
 infoRowValue: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 subLabel: { fontSize: 11, color: '#737373', fontFamily: F.bodyB, letterSpacing: 0.3, marginTop: 6, marginBottom: 4 },

 accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
 accordionTitle: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 accordionArrow: { fontSize: 11, color: '#737373', fontFamily: F.body },
 accordionNote: { fontSize: 12, color: '#737373', marginBottom: 12, lineHeight: 18, fontFamily: F.body },
 accordionSection: { marginBottom: 10 },

 iaDesc: { fontSize: 13, color: '#737373', lineHeight: 20, marginBottom: 12, fontFamily: F.body },
 iaExamples: { backgroundColor: 'white', borderRadius: 12, padding: 12 },
 iaQ: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 iaQText: { fontSize: 13, color: '#737373', fontFamily: F.body },

 // Legal links
 legalLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 legalEmoji: { fontSize: 18, width: 26, fontFamily: F.body },
 legalLabel: { flex: 1, fontSize: 14, color: '#0A0A0A', fontFamily: F.body },
 legalArrow: { fontSize: 16, color: '#737373', fontFamily: F.body },
 legalVersion: { fontSize: 11, color: '#737373', textAlign: 'center', marginTop: 12, fontFamily: F.body },

 // Medical disclaimer
 medCard: { backgroundColor: '#FFF3EB', borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 8, borderWidth: 1, borderColor: '#FDDCB5' },
 medCardTitle: { fontSize: 13, fontFamily: F.bodyB, color: '#9A3412', marginBottom: 6 },
 medCardBody: { fontSize: 12, color: '#7C2D12', lineHeight: 18, fontFamily: F.body },

 pageTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
 pageTitle: { fontSize: 32, fontFamily: 'BricolageGrotesque_800ExtraBold', color: '#0A0A0A' },
 signOutBtn: { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#0A0A0A', alignItems: 'center' },
 signOutText: { fontSize: 15, color: '#FFFFFF', fontFamily: F.bodyB },

 // Delete account
 deleteBtn: { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#FE6004', alignItems: 'center' },
 deleteBtnTxt: { fontSize: 15, color: 'white', fontFamily: F.bodyB },
 deleteConfirmBox: { marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
 deleteConfirmTitle: { fontSize: 15, fontFamily: F.bodyB, color: '#EF4444', marginBottom: 8, textAlign: 'center' },
 deleteConfirmBody: { fontSize: 13, color: '#737373', lineHeight: 20, textAlign: 'center', marginBottom: 16, fontFamily: F.body },
 deleteConfirmBtns: { flexDirection: 'row', gap: 10 },
 deleteCancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
 deleteCancelTxt: { fontSize: 14, color: '#737373', fontFamily: F.body },
 deleteConfirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center' },
 deleteConfirmTxt: { fontSize: 14, color: 'white', fontFamily: F.bodyB },

 // Metrics card
 metaBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
 metaBadgeText: { fontSize: 11, fontFamily: F.bodyB },
 statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
 statBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, alignItems: 'center' },
 statVal: { fontSize: 18, fontFamily: F.bodyB, color: '#0A0A0A' },
 statLbl: { fontSize: 10, color: '#737373', marginTop: 2, textAlign: 'center', fontFamily: F.body },
 progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
 progressBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
 progressFill: { height: 8, borderRadius: 4 },
 progressLbl: { fontSize: 12, fontFamily: F.bodyB, minWidth: 32, textAlign: 'right' },
 // Weight logger
 wLogRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
 wLogLabel: { fontSize: 13, color: '#737373', fontFamily: F.body },
 wControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 wBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F4FA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
 wBtnTxt: { fontSize: 18, fontFamily: F.bodyB, color: '#0A0A0A', lineHeight: 22 },
 wVal: { fontSize: 20, fontFamily: F.headingX, color: '#0A0A0A', minWidth: 72, textAlign: 'center' },
 wSaveBtn: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#E5E5E5' },
 wSaveBtnDone: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
 wSaveBtnTxt: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 setTargetBtn: { paddingVertical: 8, alignItems: 'center' },
 setTargetTxt: { fontSize: 13, color: '#0A0A0A', fontFamily: F.body },
 targetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
 targetInput: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', fontSize: 16, textAlign: 'center', color: '#0A0A0A', fontFamily: F.body },
 targetUnit: { fontSize: 14, color: '#737373', fontFamily: F.body },
 targetSave: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
 targetSaveTxt: { color: 'white', fontSize: 18, fontFamily: F.bodyB },
 chartHint: { fontSize: 12, color: '#737373', textAlign: 'center', paddingVertical: 8, fontFamily: F.body },

 // Notification rows
 notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
 notifEmoji: { fontSize: 22, width: 30, fontFamily: F.body },
 notifLabel: { fontSize: 14, fontFamily: F.bodyB, color: '#0A0A0A' },
 notifSub: { fontSize: 12, color: '#737373', marginTop: 1, fontFamily: F.body },

 // Calendar sync
 calSubtitle: { fontSize: 12, color: '#737373', marginTop: 2, fontFamily: F.body },
 calAlertBox: { marginBottom: 8 },
 calAlert: { fontSize: 12, color: '#EF4444', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 10, lineHeight: 18, marginBottom: 8, fontFamily: F.body },
 calInfoBox: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 10, marginBottom: 10 },
 calInfoTxt: { fontSize: 12, color: '#1E40AF', lineHeight: 18, fontFamily: F.body },
 calOk: { fontSize: 13, color: '#16A34A', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, marginBottom: 8, fontFamily: F.body },
 calTodayBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 4 },
 calTodayLabel: { fontSize: 11, color: '#737373', fontFamily: F.bodyB, letterSpacing: 0.5, marginBottom: 4 },
 calTodayWorkout: { fontSize: 15, color: '#0A0A0A', fontFamily: F.bodyB },
 toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', padding: 2, justifyContent: 'center' },
 toggleOn: { backgroundColor: '#0A0A0A' },
 toggleDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
 toggleDotOn: { alignSelf: 'flex-end' },
 hoursRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
 hourBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' },
 hourBtnActive: { backgroundColor: '#F5F5F5', borderColor: '#0A0A0A' },
 hourTxt: { fontSize: 13, color: '#737373', fontFamily: F.body },
 hourTxtActive: { color: '#0A0A0A', fontFamily: F.bodyB },
 resyncBtn: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5' },
 resyncTxt: { fontSize: 14, color: '#0A0A0A', fontFamily: F.body },

 dietCatLabel: { fontSize: 11, fontFamily: F.bodyB, color: '#737373', letterSpacing: 0.6, marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
 fastingNote: { fontSize: 12, color: '#737373', marginBottom: 8, fontStyle: 'italic', fontFamily: F.body },
 optionDesc: { fontSize: 13, color: '#737373', textAlign: 'center', paddingVertical: 8, fontFamily: F.body },
 pregnantNote: { fontSize: 13, color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginTop: 6, marginBottom: 4, lineHeight: 18, fontFamily: F.body },
 yesNoRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
 yesNoBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5E5', alignItems: 'center', backgroundColor: '#FAFAFA' },
 yesNoBtnActive: { backgroundColor: '#F5F5F5', borderColor: '#0A0A0A' },
 yesNoTxt: { fontSize: 14, fontFamily: F.bodyB, color: '#737373' },
 yesNoTxtActive: { color: '#0A0A0A' },
});

const s2 = StyleSheet.create({
 content: { padding: 16, paddingTop: 56, paddingBottom: 100, gap: 24 },
 navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
 navTitle: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },

 profileCard: { backgroundColor: '#FAFAFA', borderRadius: 24, padding: 8, gap: 24, alignItems: 'center' },
 avatar: { width: 64, height: 64, borderRadius: 16 },
 cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 8, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
 profileName: { fontSize: 18, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 23.4 },
 tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' },
 tag: { backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 8, height: 24, justifyContent: 'center', alignItems: 'center' },
 tagTxt: { fontSize: 10, fontFamily: F.body, color: '#0A0A0A', letterSpacing: 0.3, textTransform: 'uppercase', lineHeight: 12 },

 sectionCard: { backgroundColor: '#F5F5F5', borderRadius: 24, padding: 16, gap: 24 },
 sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 2 },
 sectionHeaderTxt: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', lineHeight: 15.6 },
 navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 8 },
 navItemBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
 navItemLabel: { flex: 1, fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8 },
 navItemValue: { fontSize: 16, fontFamily: F.body, color: '#737373', lineHeight: 20.8, maxWidth: 120 },

 alertCard: { backgroundColor: '#FFDFCD', borderRadius: 8, padding: 8, flexDirection: 'column', gap: 8 },
 alertTxt: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20 },

 signOutBtn: { backgroundColor: '#171717', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 signOutTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },
 deleteBtn: { backgroundColor: '#DF4949', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
 deleteBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },
 deleteConfirmBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, gap: 8 },
 deleteConfirmTitle: { fontSize: 15, fontFamily: F.bodyB, color: '#DF4949' },
 deleteConfirmBody: { fontSize: 13, fontFamily: F.body, color: '#737373', lineHeight: 20 },

 modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1, maxHeight: '90%' },
 modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 48 },
 modalTitle: { flex: 1, fontSize: 24, fontFamily: F.heading, color: '#0A0A0A' },
 modalCloseBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
 modalSaveBtn: { backgroundColor: '#0A0A0A', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
 modalSaveBtnTxt: { fontSize: 18, fontFamily: F.body, color: '#FAFAFA' },

 nameModal: { backgroundColor: 'white', borderRadius: 24, padding: 20, margin: 24 },
 nameModalTitle: { fontSize: 18, fontFamily: F.heading, color: '#0A0A0A', marginBottom: 12 },
 nameInput: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, fontFamily: F.body, color: '#0A0A0A' },
 nameModalBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
