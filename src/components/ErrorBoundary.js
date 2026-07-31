/**
 * ErrorBoundary — captura cualquier error de React en el árbol de hijos
 * y muestra una pantalla amable en lugar de pantalla en blanco.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { captureError } from '../lib/analytics';
import { F } from '../theme/fonts';
import BText from './BText';

export default class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null, componentStack: null };
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
  <View style={s.card}>
   {/* Error icon */}
   <View style={s.iconBox}>
    <View style={s.iconInner} />
   </View>

   {/* Text block */}
   <View style={{ gap: 8, alignSelf: 'stretch' }}>
    <BText style={s.title}>Algo no fue bien</BText>
    <BText style={s.body}>
     La app encontró un problema inesperado. Hemos guardado el error para arreglarlo pronto.
    </BText>
   </View>

   {__DEV__ && this.state.error && (
    <BText style={s.devDetail}>{String(this.state.error?.message || this.state.error)}</BText>
   )}

   {/* Button */}
   <View style={{ alignSelf: 'stretch' }}>
    <TouchableOpacity style={s.btn} onPress={this.reset}>
     <BText style={s.btnTxt}>Intentar de nuevo</BText>
    </TouchableOpacity>
   </View>
  </View>
 </View>
 );
 }
 return this.props.children;
 }
}

const s = StyleSheet.create({
 container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF' },
 card: { backgroundColor: '#F9DCDC', borderRadius: 24, padding: 16, gap: 32, alignItems: 'center', alignSelf: 'stretch' },
 iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#DF4949', alignItems: 'center', justifyContent: 'center' },
 iconInner: { width: 29, height: 27, backgroundColor: '#5F2121' },
 title: { fontSize: 24, fontFamily: F.heading, color: '#0A0A0A', lineHeight: 28.8, textAlign: 'center' },
 body: { fontSize: 16, fontFamily: F.body, color: '#0A0A0A', lineHeight: 20.8, textAlign: 'center' },
 devDetail: { fontSize: 11, color: '#EF4444', fontFamily: 'monospace', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, maxWidth: '100%' },
 btn: { height: 48, backgroundColor: '#171717', borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
 btnTxt: { color: '#FAFAFA', fontFamily: F.body, fontSize: 18, lineHeight: 24 },
});
