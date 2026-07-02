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
        <Text style={styles.emoji}>🌙</Text>
        <Text style={styles.title}>Meirins</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? t.welcome : t.createAccount}</Text>

        <View style={styles.toggle}>
          {[{ id: 'login', l: t.login }, { id: 'register', l: t.register }].map(tab => (
            <TouchableOpacity key={tab.id} style={[styles.toggleBtn, mode === tab.id && styles.toggleActive]}
              onPress={() => { setMode(tab.id); setError(''); }}>
              <Text style={[styles.toggleText, mode === tab.id && styles.toggleTextActive]}>{tab.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor="rgba(255,255,255,0.4)"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t.password} placeholderTextColor="rgba(255,255,255,0.4)"
          value={password} onChangeText={setPassword} secureTextEntry />

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
  outer:            { flex: 1, backgroundColor: '#0F1F4A' },
  container:        { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji:            { fontSize: 56, marginBottom: 10 },
  title:            { fontFamily: 'serif', fontSize: 32, color: 'white', fontWeight: '700', marginBottom: 4 },
  subtitle:         { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  toggle:           { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 30, padding: 3, marginBottom: 20, width: '100%' },
  toggleBtn:        { flex: 1, paddingVertical: 9, borderRadius: 26, alignItems: 'center' },
  toggleActive:     { backgroundColor: 'white' },
  toggleText:       { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  toggleTextActive: { color: '#1A56DB', fontWeight: '700' },
  input:            { width: '100%', padding: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 16, marginBottom: 12 },
  error:            { color: '#FCA5A5', fontSize: 13, marginTop: 8, textAlign: 'center' },
  btn:              { width: '100%', padding: 15, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', marginTop: 16 },
  btnDisabled:      { backgroundColor: 'rgba(255,255,255,0.2)' },
  btnText:          { color: '#1A56DB', fontSize: 16, fontWeight: '700' },
  forgotText:       { color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecorationLine: 'underline' },
});
