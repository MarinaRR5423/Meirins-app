import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ImageBackground, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import * as Localization from 'expo-localization';
import { TERMS_URL, PRIVACY_URL } from '../lib/legalLinks';
import { supabase } from '../lib/supabase';
import T from '../i18n/translations';
import { F } from '../theme/fonts';
import BText from './BText';

const { width: SW, height: SH } = Dimensions.get('window');

// Detecta el idioma del dispositivo y lo mapea a los idiomas soportados
function detectLang() {
 const locale = Localization.getLocales?.()?.[0]?.languageCode || 'es';
 if (locale.startsWith('fr')) return 'fr';
 if (locale.startsWith('it')) return 'it';
 if (locale.startsWith('en')) return 'en';
 return 'es';
}

export default function AuthScreen({ lang }) {
 const detectedLang = lang || detectLang();
 const t = (T[detectedLang] || T.es).auth;

 // welcome → email-register → login
 const [mode, setMode] = useState('welcome');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [confirmed, setConfirmed] = useState(false);
 const [resetSent, setResetSent] = useState(false);

 const handleLogin = async () => {
 if (!email || !password) return setError(t.fillFields);
 setLoading(true); setError('');
 const { error: err } = await supabase.auth.signInWithPassword({ email, password });
 setLoading(false);
 if (err) setError(err.message === 'Invalid login credentials' ? t.wrongCredentials : err.message);
 };

 const handleResetPassword = async () => {
 if (!email) return setError(t.enterEmailFirst);
 setLoading(true); setError('');
 const redirectTo = Linking.createURL('auth');
 const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
 setLoading(false);
 if (err) setError(err.message);
 else setResetSent(true);
 };

 const handleRegister = async () => {
 if (!email || !password) return setError(t.fillFields);
 if (password.length < 6) return setError(t.passwordMin);
 setLoading(true); setError('');
 const redirectTo = Linking.createURL('auth');
 const { error: err } = await supabase.auth.signUp({
 email, password,
 options: { emailRedirectTo: redirectTo },
 });
 setLoading(false);
 if (err) setError(err.message);
 else setConfirmed(true);
 };

 // ── Confirmation / reset screens ──────────────────────────────────────────
 if (resetSent) return (
 <View style={styles.feedbackScreen}>
 <BText style={styles.feedbackEmoji}></BText>
 <BText style={styles.feedbackTitle}>{t.resetSent}</BText>
 <BText style={styles.feedbackSubtitle}>{t.resetEmailSent}{'\n'}<BText style={{ fontFamily: F.bodyB }}>{email}</BText></BText>
 <TouchableOpacity style={styles.blackBtn} onPress={() => { setResetSent(false); setMode('login'); }}>
 <BText style={styles.blackBtnText}>{t.backToLogin}</BText>
 </TouchableOpacity>
 </View>
 );

 if (confirmed) return (
 <View style={styles.feedbackScreen}>
 <BText style={styles.feedbackEmoji}></BText>
 <BText style={styles.feedbackTitle}>{t.checkEmail}</BText>
 <BText style={styles.feedbackSubtitle}>{t.emailSent}{'\n'}<BText style={{ fontFamily: F.bodyB }}>{email}</BText></BText>
 <TouchableOpacity style={styles.blackBtn} onPress={() => { setConfirmed(false); setMode('login'); }}>
 <BText style={styles.blackBtnText}>{t.goToLogin}</BText>
 </TouchableOpacity>
 </View>
 );

 // ── Welcome screen ────────────────────────────────────────────────────────
 if (mode === 'welcome') return (
 <ImageBackground
 source={require('../../assets/onboarding-bg.png')}
 style={styles.bgFull}
 resizeMode="cover"
 >
 {/* Dark overlay so text stays readable */}
 <View style={styles.bgOverlay} />

 {/* Floating pills */}
 <View style={[styles.pill, styles.pillGreen, { top: SH * 0.14, left: SW * 0.06 }]}>
 <BText style={[styles.pillText, { color: '#0B1F08' }]}>{t.pillCycle}</BText>
 </View>
 <View style={[styles.pill, styles.pillOrange, { top: SH * 0.22, right: SW * 0.12 }]}>
 <BText style={[styles.pillText, { color: '#260E01' }]}>{t.pillNutri}</BText>
 </View>
 <View style={[styles.pill, styles.pillBlue, { top: SH * 0.08, right: SW * 0.06 }]}>
 <BText style={[styles.pillText, { color: '#0A1823' }]}>{t.pillTrain}</BText>
 </View>

 {/* Logo */}
 <View style={styles.logoArea}>
 <BText style={styles.logoText}>Blumm</BText>
 </View>

 {/* Frosted glass bottom container */}
 <View style={styles.glassContainer}>
 <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
 <View style={styles.glassInner}>
 <BText style={styles.headline}>{t.welcomeHeadline}</BText>
 <BText style={styles.body}>{t.welcomeBody}</BText>

 {/* Email button */}
 <TouchableOpacity style={styles.blackBtn} onPress={() => setMode('register')}>
 <BText style={styles.blackBtnText}>{t.welcomeEmail}</BText>
 </TouchableOpacity>

 {/* Apple + Google row */}
 <View style={styles.oauthRow}>
 <TouchableOpacity style={[styles.blackBtn, styles.oauthBtn]}>
 <BText style={styles.blackBtnText}>􀣺 Apple</BText>
 </TouchableOpacity>
 <TouchableOpacity style={[styles.blackBtn, styles.oauthBtn]}>
 <BText style={styles.blackBtnText}>G Google</BText>
 </TouchableOpacity>
 </View>

 {/* Already have account */}
 <TouchableOpacity onPress={() => setMode('login')} style={{ marginTop: 20 }}>
 <BText style={styles.loginLink}>
 {t.welcomeAlready}{' '}
 <BText style={styles.loginLinkBold}>{t.welcomeLogin}</BText>
 </BText>
 </TouchableOpacity>

 {/* Terms */}
 <BText style={styles.terms}>
 Al continuar aceptas nuestras{' '}
 <BText style={styles.termsBold} onPress={() => Linking.openURL(TERMS_URL)}>condiciones de uso</BText>
 {' '}y{' '}
 <BText style={styles.termsBold} onPress={() => Linking.openURL(PRIVACY_URL)}>política de privacidad</BText>
 </BText>
 </View>
 </View>
 </ImageBackground>
 );

 // ── Email form (register / login) ─────────────────────────────────────────
 const isLogin = mode === 'login';

 return (
 <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
 <ImageBackground
  source={require('../../assets/onboarding-bg.png')}
  style={{ flex: 1 }}
  resizeMode="cover"
 >
  <View style={styles.bgOverlay} />

  {/* Floating pills */}
  <View style={[styles.pill, styles.pillGreen, { top: SH * 0.14, left: SW * 0.06 }]}>
   <BText style={[styles.pillText, { color: '#0B1F08' }]}>{t.pillCycle}</BText>
  </View>
  <View style={[styles.pill, styles.pillOrange, { top: SH * 0.22, right: SW * 0.12 }]}>
   <BText style={[styles.pillText, { color: '#260E01' }]}>{t.pillNutri}</BText>
  </View>
  <View style={[styles.pill, styles.pillBlue, { top: SH * 0.08, right: SW * 0.06 }]}>
   <BText style={[styles.pillText, { color: '#0A1823' }]}>{t.pillTrain}</BText>
  </View>

  {/* White panel from bottom */}
  <ScrollView
   contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
   keyboardShouldPersistTaps="handled"
   showsVerticalScrollIndicator={false}
  >
   <View style={styles.formPanel}>
    {/* Back button */}
    <TouchableOpacity style={styles.backBtn} onPress={() => { setMode('welcome'); setError(''); }}>
     <BText style={styles.backBtnText}>{t.backBtn}</BText>
    </TouchableOpacity>

    {/* Title + toggle */}
    <View style={{ gap: 12 }}>
     <BText style={styles.formTitle}>{isLogin ? t.welcome : t.createAccount}</BText>
     <View style={styles.toggle}>
      {[{ id: 'login', l: t.login }, { id: 'register', l: t.register }].map(tab => (
       <TouchableOpacity key={tab.id} style={[styles.toggleBtn, mode === tab.id && styles.toggleActive]}
        onPress={() => { setMode(tab.id); setError(''); }}>
        <BText style={[styles.toggleText, mode === tab.id && styles.toggleTextActive]}>{tab.l}</BText>
       </TouchableOpacity>
      ))}
     </View>
    </View>

    {/* Fields */}
    <View style={{ gap: 8 }}>
     <View style={{ gap: 8 }}>
      <BText style={styles.fieldLabel}>Email</BText>
      <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor="#737373"
       value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
     </View>
     <View style={{ gap: 8 }}>
      <BText style={styles.fieldLabel}>{t.password}</BText>
      <View style={{ position: 'relative' }}>
       <TextInput style={[styles.input, { paddingRight: 44 }]} placeholder={t.password} placeholderTextColor="#737373"
        value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
       <TouchableOpacity onPress={() => setShowPassword(v => !v)}
        style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
        <BText style={{ fontSize: 18 }}>{showPassword ? '' : ''}</BText>
       </TouchableOpacity>
      </View>
     </View>
     {isLogin && (
      <View style={{ paddingHorizontal: 24, paddingVertical: 8, alignItems: 'center' }}>
       <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
        <BText style={styles.forgotText}>{t.forgotPassword}</BText>
       </TouchableOpacity>
      </View>
     )}
    </View>

    {error ? <BText style={styles.errorText}>{error}</BText> : null}

    {/* Submit */}
    <View>
     <TouchableOpacity style={[styles.blackBtn, loading && styles.btnDisabled]}
      onPress={isLogin ? handleLogin : handleRegister} disabled={loading}>
      <BText style={styles.blackBtnText}>{loading ? '...' : isLogin ? t.enter : t.createBtn}</BText>
     </TouchableOpacity>
    </View>
   </View>
  </ScrollView>
 </ImageBackground>
 </KeyboardAvoidingView>
 );
}

const styles = StyleSheet.create({
 // ── Full-screen background ─────────────────────────────────────────────────
 bgFull: { flex: 1 },
 bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,30,0.35)' },

 // ── Logo ───────────────────────────────────────────────────────────────────
 logoArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
 logoText: { fontSize: 52, fontFamily: F.headingX, color: '#FFFFFF', letterSpacing: -1 },

 // ── Pills ──────────────────────────────────────────────────────────────────
 pill: { position: 'absolute', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
 pillText: { fontSize: 10, fontFamily: F.body, letterSpacing: 0.3, textTransform: 'uppercase' },
 pillGreen: { backgroundColor: '#b6ecaf' },
 pillOrange: { backgroundColor: '#ffbf9b' },
 pillBlue: { backgroundColor: '#aecfed' },

 // ── Frosted glass container ────────────────────────────────────────────────
 glassContainer: {
 marginHorizontal: 16,
 marginBottom: 32,
 borderRadius: 24,
 overflow: 'hidden',
 backgroundColor: 'rgba(255,255,255,0.18)',
 borderWidth: 1,
 borderColor: 'rgba(255,255,255,0.3)',
 },
 glassInner: { padding: 24 },
 headline: { fontSize: 24, fontFamily: F.heading, color: '#FFFFFF', marginBottom: 10, lineHeight: 28.8 },
 body: { fontSize: 14, fontFamily: F.body, color: 'rgba(255,255,255,0.85)', lineHeight: 19.6, marginBottom: 24 },

 // ── OAuth row ──────────────────────────────────────────────────────────────
 oauthRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
 oauthBtn: { flex: 1 },

 // ── Login link ─────────────────────────────────────────────────────────────
 loginLink: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', textAlign: 'center' },
 loginLinkBold: { fontFamily: F.bodyB, color: '#0A0A0A', textDecorationLine: 'underline' },

 // ── Terms ──────────────────────────────────────────────────────────────────
 terms: { fontSize: 12, fontFamily: F.body, color: '#0A0A0A', textAlign: 'center', marginTop: 16, lineHeight: 15.6 },
 termsBold: { fontFamily: F.bodyB, color: '#0A0A0A' },

 // ── Shared black button ────────────────────────────────────────────────────
 blackBtn: { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
 blackBtnText: { color: '#FAFAFA', fontSize: 18, fontFamily: F.body },
 btnDisabled: { opacity: 0.4 },

 // ── Email form ─────────────────────────────────────────────────────────────
 formPanel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 16, paddingBottom: 48, gap: 48 },
 backBtn: { height: 32, paddingHorizontal: 8, backgroundColor: '#F5F5F5', borderRadius: 8, alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center' },
 backBtnText: { fontSize: 14, fontFamily: F.body, color: '#0A0A0A', lineHeight: 24 },
 formTitle: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 28.8 },
 toggle: { flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 20, padding: 4 },
 toggleBtn: { flex: 1, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
 toggleActive: { backgroundColor: '#FFFFFF' },
 toggleText: { fontSize: 16, fontFamily: F.body, color: 'white', lineHeight: 24 },
 toggleTextActive: { color: '#0A0A0A' },
 fieldLabel: { fontSize: 16, fontFamily: F.body, color: '#171717', lineHeight: 20.8 },
 input: { width: '100%', height: 48, borderRadius: 16, backgroundColor: '#FAFAFA', paddingHorizontal: 8, fontFamily: F.body, color: '#0A0A0A', fontSize: 16, lineHeight: 20.8 },
 errorText: { fontFamily: F.body, color: '#DC2626', fontSize: 13, marginTop: 4, marginBottom: 4, textAlign: 'center' },
 forgotText: { fontFamily: F.bodyB, color: '#0A0A0A', fontSize: 14, textDecorationLine: 'underline', lineHeight: 19.6, textAlign: 'center' },

 // ── Feedback screens (confirm / reset) ────────────────────────────────────
 feedbackScreen: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 32 },
 feedbackEmoji: { fontSize: 56, marginBottom: 16, fontFamily: F.body },
 feedbackTitle: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', marginBottom: 8, textAlign: 'center' },
 feedbackSubtitle: { fontSize: 14, fontFamily: F.body, color: '#525252', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
