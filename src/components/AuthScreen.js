import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import T from '../i18n/translations';

export default function AuthScreen({ lang = 'es' }) {
  const t = (T[lang] || T.es).auth;

  const [mode, setMode] = useState('login');
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
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setConfirmed(true);
  };

  if (resetSent) return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📩</Text>
      <Text style={styles.title}>{t.resetSent}</Text>
      <Text style={styles.subtitle}>{t.resetEmailSent}{'\n'}<Text style={{ fontWeight: '700' }}>{email}</Text></Text>
      <TouchableOpacity style={styles.btn} onPress={() => { setResetSent(false); setMode('login'); }}>
        <Text style={styles.btnText}>{t.backToLogin}</Text>
      </TouchableOpacity>
    </View>
  );

  if (confirmed) return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📬</Text>
      <Text style={styles.title}>{t.checkEmail}</Text>
      <Text style={styles.subtitle}>{t.emailSent}{'\n'}<Text style={{ fontWeight: '700' }}>{email}</Text></Text>
      <TouchableOpacity style={styles.btn} onPress={() => { setConfirmed(false); setMode('login'); }}>
        <Text style={styles.btnText}>{t.goToLogin}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandChip}>
          <Text style={styles.brandTitle}>Blumm</Text>
        </View>
        <Text style={styles.subtitle}>{mode === 'login' ? t.welcome : t.createAccount}</Text>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
          onPress={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? '...' : mode === 'login' ? t.enter : t.createBtn}</Text>
        </TouchableOpacity>

        {mode === 'login' && (
          <TouchableOpacity onPress={handleResetPassword} disabled={loading} style={{ marginTop: 16 }}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer:            { flex: 1, backgroundColor: 'white' },
  container:        { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji:            { fontSize: 56, marginBottom: 10 },
  brandChip:        { backgroundColor: '#FECA04', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  brandTitle:       { fontSize: 24, color: '#0A0A0A', fontWeight: '800' },
  title:            { fontSize: 28, color: '#0A0A0A', fontWeight: '800', marginBottom: 4 },
  subtitle:         { fontSize: 14, color: '#525252', marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  toggle:           { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 3, marginBottom: 20, width: '100%' },
  toggleBtn:        { flex: 1, paddingVertical: 9, borderRadius: 13, alignItems: 'center' },
  toggleActive:     { backgroundColor: '#171717' },
  toggleText:       { fontSize: 13, color: '#525252' },
  toggleTextActive: { color: 'white', fontWeight: '700' },
  input:            { width: '100%', height: 48, borderRadius: 16, backgroundColor: '#FAFAFA', paddingHorizontal: 14, color: '#0A0A0A', fontSize: 16, marginBottom: 12 },
  error:            { color: '#DC2626', fontSize: 13, marginTop: 8, textAlign: 'center' },
  btn:              { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  btnDisabled:      { opacity: 0.4 },
  btnText:          { color: '#FAFAFA', fontSize: 18, fontWeight: '700' },
  forgotText:       { color: '#525252', fontSize: 13, textDecorationLine: 'underline' },
});
