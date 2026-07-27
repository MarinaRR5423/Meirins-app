/**
 * ErrorBoundary — captura cualquier error de React en el árbol de hijos
 * y muestra una pantalla amable en lugar de pantalla en blanco.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { captureError } from '../lib/analytics';
import { F } from '../theme/fonts';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, { componentStack: errorInfo?.componentStack });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <Text style={s.emoji}>🌙</Text>
          <Text style={s.title}>Algo no fue bien</Text>
          <Text style={s.body}>
            La app encontró un problema inesperado. Hemos guardado el error para arreglarlo pronto.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={s.devDetail}>{String(this.state.error?.message || this.state.error)}</Text>
          )}
          <TouchableOpacity style={s.btn} onPress={this.reset}>
            <Text style={s.btnTxt}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#F0F4FA' },
  emoji:     { fontSize: 64, marginBottom: 16 },
  title:     { fontSize: 22, fontFamily: F.bodyB, color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  body:      { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  devDetail: { fontSize: 11, color: '#EF4444', fontFamily: 'monospace', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 20, maxWidth: '100%' },
  btn:       { backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50 },
  btnTxt:    { color: 'white', fontFamily: F.bodyB, fontSize: 15 },
});
