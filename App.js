import React, { useEffect, useState, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync().catch(() => {});
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import Loading from './src/components/Loading';
import SplashVideo from './src/components/SplashVideo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Flower, Salad, SportShoe, User } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

const navigationRef = createNavigationContainerRef();
import * as Localization from 'expo-localization';
import { useProfile } from './src/hooks/useProfile';
import { supabase } from './src/lib/supabase';
import T from './src/i18n/translations';
import { getPhaseInfo } from './src/data/phases';
import AuthScreen from './src/components/AuthScreen';
import SetupScreen from './src/components/SetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CicloScreen from './src/screens/CicloScreen';
import NutriScreen from './src/screens/NutriScreen';
import GimnasioScreen from './src/screens/GimnasioScreen';
import PerfilScreen from './src/screens/UserScreen';
import { useHealthData } from './src/hooks/useHealthData';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './src/components/ErrorBoundary';
import FloatingTabBar from './src/components/FloatingTabBar';
import { initAnalytics, wrapWithSentry, trackEvent, identifyUser, setPostHogClient, Events } from './src/lib/analytics';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

// Configurar sesión de audio al cargar el módulo (antes del primer render)
// para que la música del sistema no se interrumpa al abrir la app.
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: false,
  staysActiveInBackground: false,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: false,
}).catch(() => {});
import { useTodayMenu } from './src/hooks/useTodayMenu';
import { useHomeWidgets } from './src/hooks/useHomeWidgets';

// Conector entre el contexto de PostHog y nuestro módulo analytics.js
function PostHogBridge() {
  const ph = usePostHog();
  useEffect(() => { setPostHogClient(ph || null); }, [ph]);
  return null;
}

// Apply Aglet Mono as the default font for all Text components app-wide


const Tab = createBottomTabNavigator();

// ─── Detectar idioma del dispositivo ──────────────────────────────────────────
function getDeviceLang() {
  const supported = ['es', 'en', 'fr', 'it'];
  const locales = Localization.getLocales?.() ?? [];
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase();
    if (supported.includes(code)) return code;
  }
  return 'en';
}

// Detecta si el dispositivo usa sistema imperial (EE.UU., UK, etc.)
function getDeviceUnitSystem() {
  const locales = Localization.getLocales?.() ?? [];
  const imperialRegions = ['US', 'GB', 'LR', 'MM'];
  for (const locale of locales) {
    if (imperialRegions.includes(locale.regionCode?.toUpperCase())) return 'imperial';
  }
  return 'metric';
}

// ─── Handle email confirmation deep link ───────────────────────────────────────
async function handleAuthUrl(url) {
  if (!url) return;
  try {
    // PKCE flow: meirins://auth?code=xxx
    const codeMatch = url.match(/[?&]code=([^&]+)/);
    if (codeMatch) {
      await supabase.auth.exchangeCodeForSession(codeMatch[1]);
      return;
    }
    // Token hash flow: meirins://auth#access_token=xxx&refresh_token=xxx
    const hashMatch = url.match(/#(.*)/);
    if (hashMatch) {
      const params = {};
      hashMatch[1].split('&').forEach(p => {
        const [k, v] = p.split('=');
        params[k] = v;
      });
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    }
  } catch (e) {
    console.log('Auth URL error:', e);
  }
}

// ─── Banner de sin conexión ────────────────────────────────────────────────────
function OfflineBanner({ lang }) {
  const msg = {
    es: 'Sin conexión — mostrando datos en caché',
    en: 'Offline — showing cached data',
    fr: 'Hors ligne — affichage des données en cache',
    it: 'Offline — visualizzazione dati in cache',
  };
  return (
    <View style={{ backgroundColor: '#FEF3C7', paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '500' }}>{msg[lang] || msg.es}</Text>
    </View>
  );
}

function App() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    AgletMono_Regular: require('./assets/fonts/AgletMono-Regular.otf'),
    AgletMono_Bold:    require('./assets/fonts/AgletMono-Bold.otf'),
  });
  useEffect(() => {
    if (fontError) console.warn('[Fonts] Error loading fonts:', fontError);
    console.log('[Fonts] loaded:', fontsLoaded, 'error:', fontError?.message);
  }, [fontsLoaded, fontError]);
  const profile    = useProfile();
  const healthData = useHealthData();
  const [setupLang, setSetupLang] = React.useState(getDeviceLang);
  const [setupUnits, setSetupUnits] = React.useState(getDeviceUnitSystem);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedPhase, setCachedPhase] = useState(null);

  // Analytics init (no-op si no está configurado)
  useEffect(() => { initAnalytics(); }, []);

  // Cache de fase para el splash video
  useEffect(() => {
    AsyncStorage.getItem('@blumm/lastPhase').then(v => { if (v) setCachedPhase(v); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (pi?.phase) AsyncStorage.setItem('@blumm/lastPhase', pi.phase).catch(() => {});
  }, [pi?.phase]);

  // Identifica al usuario tras login (sin traits identificables — ver analytics.js)
  useEffect(() => {
    if (profile?.user?.id) {
      identifyUser(profile.user.id);
    }
  }, [profile?.user?.id]);

  // Deep link listener (email confirmation)
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleAuthUrl(url));
    Linking.getInitialURL().then(url => handleAuthUrl(url));
    return () => sub.remove();
  }, []);

  // Navegación desde notificación tap (no soportado en web)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // App abierta desde notificación (estaba cerrada)
    Notifications.getLastNotificationResponseAsync().then(response => {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (screen && navigationRef.isReady()) {
        navigationRef.navigate(screen);
      }
    });

    // App en foreground/background — usuario toca la notificación
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (screen) {
        if (navigationRef.isReady()) {
          navigationRef.navigate(screen);
        }
      }
    });
    return () => sub.remove();
  }, []);

  // Detector de conexión — ping ligero a Supabase cada 30s
  // Primer check retrasado 10s para no competir con la carga inicial (vídeo + perfil + fonts)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const check = async () => {
      try {
        await supabase.from('profiles').select('id').limit(1).maybeSingle();
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };
    const firstCheck = setTimeout(check, 10000);
    const interval = setInterval(check, 30000);
    return () => { clearTimeout(firstCheck); clearInterval(interval); };
  }, []);
  const { authState, profileLoaded, setupDone, lastPeriod, cycleLength } = profile;
  const lang = profile.profileExtended?.language || setupLang;
  const tabs = (T[lang] || T.es).tabs;
  const { periodEnd, sleepLog } = profile;
  const pi = lastPeriod ? getPhaseInfo(lastPeriod, cycleLength, periodEnd) : null;
  const { todayMenu } = useTodayMenu({
    phase: pi?.phase,
    lang,
    profileExtended: profile.profileExtended,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    weight: profile.weight,
    height: profile.height,
    age: profile.age,
    trainDays: profile.trainDays,
  });
  const { widgets, toggle: toggleWidget } = useHomeWidgets();
  const enabledTabs = profile.profileExtended?.enabledTabs;
  const handleToggleTab = (key, value) =>
    profile.saveProfileExtended({ enabledTabs: { ...(profile.profileExtended?.enabledTabs || {}), [key]: value } });

  if (authState === 'loading' || (authState === 'authenticated' && !profileLoaded) || (!fontsLoaded && !fontError)) {
    return <SplashVideo phase={cachedPhase} />;
  }

  if (authState === 'unauthenticated') return <ErrorBoundary><AuthScreen lang={setupLang} /></ErrorBoundary>;
  if (!setupDone) return (
    <ErrorBoundary>
      <SetupScreen
        onDone={(data) => profile.handleSetupDone({ ...data, lang: setupLang, unitSystem: setupUnits })}
        lang={setupLang}
        onLangChange={setSetupLang}
        unitSystem={setupUnits}
        onUnitSystemChange={setSetupUnits}
      />
    </ErrorBoundary>
  );

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY} options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST, captureScreens: false }}>
    <PostHogBridge />
    <ErrorBoundary>
    <NavigationContainer ref={navigationRef}>
      {isOffline && <OfflineBanner lang={lang} />}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          lazy: true,
          freezeOnBlur: true,
        }}
        tabBar={(props) => (
          <FloatingTabBar {...props} enabledTabs={enabledTabs} onToggleTab={handleToggleTab} lang={lang} widgets={widgets} toggleWidget={toggleWidget} />
        )}>
        <Tab.Screen name="Inicio" options={{ tabBarLabel: tabs.home, tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}>
          {() => <HomeScreen lang={lang} pi={pi} healthData={healthData} logCycleDay={profile.logCycleDay} logRecipeDone={profile.logRecipeDone} todayMenu={todayMenu} widgets={widgets} toggleWidget={toggleWidget} cycleDailyLogs={profile.cycleDailyLogs} profile={{
            age: profile.age, weight: profile.weight, height: profile.height,
            activityLevel: profile.activityLevel, goal: profile.goal,
            trainDays: profile.trainDays,
            profileExtended: profile.profileExtended,
          }} />}
        </Tab.Screen>
        <Tab.Screen name="Ciclo" options={{ tabBarLabel: tabs.cycle, tabBarIcon: ({ color, size }) => <Flower color={color} size={size} /> }}>
          {() => <CicloScreen lang={lang} pi={pi} lastPeriod={lastPeriod} setLastPeriod={profile.setLastPeriod} setCycleLength={profile.setCycleLength} periodEnd={periodEnd} setPeriodEnd={profile.setPeriodEnd} sleepLog={sleepLog} logSleep={profile.logSleep} profileExtended={profile.profileExtended} saveProfileExtended={profile.saveProfileExtended} logCycleDay={profile.logCycleDay} cyclePeriods={profile.cyclePeriods} cycleDailyLogs={profile.cycleDailyLogs} savePeriod={profile.savePeriod} deletePeriod={profile.deletePeriod} importPeriods={profile.importPeriods} />}
        </Tab.Screen>
        <Tab.Screen name="Nutrición" options={{ tabBarLabel: tabs.nutri, tabBarIcon: ({ color, size, focused }) => <Salad color={focused ? "#F97316" : color} size={size} />, unmountOnBlur: true }}>
          {() => <NutriScreen lang={lang} pi={pi}
            goal={profile.goal} activityLevel={profile.activityLevel} dietary={profile.dietary}
            profileExtended={profile.profileExtended}
            age={profile.age} weight={profile.weight} height={profile.height}
            trainDays={profile.trainDays}
            saveAll={profile.saveAll} saveProfileExtended={profile.saveProfileExtended}
            toggleFavoriteRecipe={profile.toggleFavoriteRecipe}
            skipRecipe={profile.skipRecipe}
            logRecipeDone={profile.logRecipeDone} />}
        </Tab.Screen>
        <Tab.Screen name="Gimnasio" options={{ tabBarLabel: tabs.gym, tabBarIcon: ({ color, size, focused }) => <SportShoe color={focused ? "#60A5FA" : color} size={size} />, unmountOnBlur: true }}>
          {() => <GimnasioScreen lang={lang} pi={pi} trainDays={profile.trainDays} setTrainDays={profile.setTrainDays} healthData={healthData} goal={profile.goal}
            profileExtended={profile.profileExtended} saveProfileExtended={profile.saveProfileExtended}
            toggleFavoriteWorkout={profile.toggleFavoriteWorkout}
            skipWorkout={profile.skipWorkout}
            logWorkoutDone={profile.logWorkoutDone}
            sleepLog={sleepLog} logSleep={profile.logSleep}
            age={profile.age}
            weight={profile.weight} height={profile.height} logWeight={profile.logWeight} />}
        </Tab.Screen>
        <Tab.Screen name="Perfil" options={{ tabBarLabel: tabs.profile, tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}>
          {() => <PerfilScreen pi={pi} profile={{
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
            dietary: profile.dietary,
            trainDays: profile.trainDays,
            saveAll: profile.saveAll,
            profileExtended: profile.profileExtended,
            saveProfileExtended: profile.saveProfileExtended,
            logWeight: profile.logWeight,
          }} signOut={profile.signOut} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
    </PostHogProvider>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
export default wrapWithSentry(App);
