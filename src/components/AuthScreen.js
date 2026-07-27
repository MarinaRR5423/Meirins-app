import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, ImageBackground, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import T from '../i18n/translations';
import { F } from '../theme/fonts';

const { width: SW, height: SH } = Dimensions.get('window');

export default function AuthScreen({ lang = 'es' }) {
  const t = (T[lang] || T.es).auth;

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
      <Text style={styles.feedbackEmoji}>📩</Text>
      <Text style={styles.feedbackTitle}>{t.resetSent}</Text>
      <Text style={styles.feedbackSubtitle}>{t.resetEmailSent}{'\n'}<Text style={{ fontFamily: F.bodyB }}>{email}</Text></Text>
      <TouchableOpacity style={styles.blackBtn} onPress={() => { setResetSent(false); setMode('login'); }}>
        <Text style={styles.blackBtnText}>{t.backToLogin}</Text>
      </TouchableOpacity>
    </View>
  );

  if (confirmed) return (
    <View style={styles.feedbackScreen}>
      <Text style={styles.feedbackEmoji}>📬</Text>
      <Text style={styles.feedbackTitle}>{t.checkEmail}</Text>
      <Text style={styles.feedbackSubtitle}>{t.emailSent}{'\n'}<Text style={{ fontFamily: F.bodyB }}>{email}</Text></Text>
      <TouchableOpacity style={styles.blackBtn} onPress={() => { setConfirmed(false); setMode('login'); }}>
        <Text style={styles.blackBtnText}>{t.goToLogin}</Text>
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
        <Text style={styles.pillText}>CICLO</Text>
      </View>
      <View style={[styles.pill, styles.pillOrange, { top: SH * 0.22, right: SW * 0.12 }]}>
        <Text style={styles.pillText}>NUTRICIÓN</Text>
      </View>
      <View style={[styles.pill, styles.pillBlue, { top: SH * 0.08, right: SW * 0.06 }]}>
        <Text style={styles.pillText}>ENTRENAMIENTO</Text>
      </View>

      {/* Logo */}
      <View style={styles.logoArea}>
        <Text style={styles.logoText}>Blumm</Text>
      </View>

      {/* Frosted glass bottom container */}
      <View style={styles.glassContainer}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.glassInner}>
          <Text style={styles.headline}>Sincroniza tu cuerpo y entrenamiento</Text>
          <Text style={styles.body}>
            Descubre el poder de entrenar y nutrirte en sintonía con las diferentes fases de tu ciclo menstrual.
          </Text>

          {/* Email button */}
          <TouchableOpacity style={styles.blackBtn} onPress={() => setMode('register')}>
            <Text style={styles.blackBtnText}>Correo electrónico</Text>
          </TouchableOpacity>

          {/* Apple + Google row */}
          <View style={styles.oauthRow}>
            <TouchableOpacity style={[styles.blackBtn, styles.oauthBtn]}>
              <Text style={styles.blackBtnText}>􀣺  Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.blackBtn, styles.oauthBtn]}>
              <Text style={styles.blackBtnText}>G  Google</Text>
            </TouchableOpacity>
          </View>

          {/* Already have account */}
          <TouchableOpacity onPress={() => setMode('login')} style={{ marginTop: 20 }}>
            <Text style={styles.loginLink}>
              Si ya tienes cuenta,{' '}
              <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            Al continuar aceptas nuestras{' '}
            <Text style={styles.termsBold}>condiciones de uso</Text>
            {' '}y{' '}
            <Text style={styles.termsBold}>política de privacidad</Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );

  // ── Email form (register / login) ─────────────────────────────────────────
  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView style={styles.formOuter} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back to welcome */}
        <TouchableOpacity style={styles.backBtn} onPress={() => { setMode('welcome'); setError(''); }}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.brandChip}>
          <Text style={styles.brandTitle}>Blumm</Text>
        </View>
        <Text style={styles.formTitle}>{isLogin ? t.welcome : t.createAccount}</Text>

        <View style={styles.toggle}>
          {[{ id: 'login', l: t.login }, { id: 'register', l: t.register }].map(tab => (
            <TouchableOpacity key={tab.id} style={[styles.toggleBtn, mode === tab.id && styles.toggleActive]}
              onPress={() => { setMode(tab.id); setError(''); }}>
              <Text style={[styles.toggleText, mode === tab.id && styles.toggleTextActive]}>{tab.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor="#737373"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput style={[styles.input, { paddingRight: 44 }]} placeholder={t.password} placeholderTextColor="#737373"
            value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[styles.blackBtn, loading && styles.btnDisabled]}
          onPress={isLogin ? handleLogin : handleRegister} disabled={loading}>
          <Text style={styles.blackBtnText}>{loading ? '...' : isLogin ? t.enter : t.createBtn}</Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity onPress={handleResetPassword} disabled={loading} style={{ marginTop: 16 }}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ── Full-screen background ─────────────────────────────────────────────────
  bgFull:      { flex: 1 },
  bgOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,30,0.35)' },

  // ── Logo ───────────────────────────────────────────────────────────────────
  logoArea:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  logoText:    { fontSize: 52, fontFamily: F.headingX, color: '#FFFFFF', letterSpacing: -1 },

  // ── Pills ──────────────────────────────────────────────────────────────────
  pill:        { position: 'absolute', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  pillText:    { fontSize: 10, fontFamily: F.bodyB, color: '#FFFFFF', letterSpacing: 0.3, textTransform: 'uppercase' },
  pillGreen:   { backgroundColor: '#49CF38' },
  pillOrange:  { backgroundColor: '#FE6004' },
  pillBlue:    { backgroundColor: '#429FE7' },

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
  glassInner:  { padding: 24 },
  headline:    { fontSize: 30, fontFamily: F.heading, color: '#FFFFFF', marginBottom: 10, lineHeight: 36 },
  body:        { fontSize: 14, fontFamily: F.body, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 24 },

  // ── OAuth row ──────────────────────────────────────────────────────────────
  oauthRow:    { flexDirection: 'row', gap: 10, marginTop: 10 },
  oauthBtn:    { flex: 1 },

  // ── Login link ─────────────────────────────────────────────────────────────
  loginLink:     { fontSize: 14, fontFamily: F.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  loginLinkBold: { fontFamily: F.bodyB, color: '#FFFFFF', textDecorationLine: 'underline' },

  // ── Terms ──────────────────────────────────────────────────────────────────
  terms:       { fontSize: 11, fontFamily: F.body, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 16, lineHeight: 16 },
  termsBold:   { fontFamily: F.bodyB, color: 'rgba(255,255,255,0.8)' },

  // ── Shared black button ────────────────────────────────────────────────────
  blackBtn:        { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  blackBtnText:    { color: '#FAFAFA', fontSize: 16, fontFamily: F.body },
  btnDisabled:     { opacity: 0.4 },

  // ── Email form ─────────────────────────────────────────────────────────────
  formOuter:     { flex: 1, backgroundColor: '#FFFFFF' },
  formContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backBtn:       { position: 'absolute', top: 56, left: 20, padding: 8 },
  backBtnText:   { fontSize: 24, fontFamily: F.body, color: '#0A0A0A' },
  brandChip:     { backgroundColor: '#FECA04', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  brandTitle:    { fontSize: 24, fontFamily: F.headingX, color: '#0A0A0A' },
  formTitle:     { fontSize: 22, fontFamily: F.heading, color: '#0A0A0A', marginBottom: 24 },
  toggle:        { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 3, marginBottom: 20, width: '100%' },
  toggleBtn:     { flex: 1, paddingVertical: 9, borderRadius: 13, alignItems: 'center' },
  toggleActive:  { backgroundColor: '#171717' },
  toggleText:    { fontSize: 13, fontFamily: F.body, color: '#525252' },
  toggleTextActive: { fontFamily: F.bodyB, color: 'white' },
  input:         { width: '100%', height: 48, borderRadius: 16, backgroundColor: '#FAFAFA', paddingHorizontal: 14, fontFamily: F.body, color: '#0A0A0A', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E5E5E5' },
  errorText:     { fontFamily: F.body, color: '#DC2626', fontSize: 13, marginTop: 4, marginBottom: 4, textAlign: 'center' },
  forgotText:    { fontFamily: F.body, color: '#525252', fontSize: 13, textDecorationLine: 'underline' },

  // ── Feedback screens (confirm / reset) ────────────────────────────────────
  feedbackScreen:   { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 32 },
  feedbackEmoji:    { fontSize: 56, marginBottom: 16 },
  feedbackTitle:    { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', marginBottom: 8, textAlign: 'center' },
  feedbackSubtitle: { fontSize: 14, fontFamily: F.body, color: '#525252', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
