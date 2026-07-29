/**
 * SwipeableTabs — envuelve el contenido de una pantalla para detectar
 * swipes horizontales y cambiar de sub-pestaña.
 *
 * Usa react-native-gesture-handler que se integra correctamente con
 * ScrollView nativo y permite que el scroll vertical funcione normalmente
 * mientras el swipe horizontal cambia de pestaña.
 *
 * Props:
 * tabs [] array de ids de pestañas en orden
 * current string id actualmente activo
 * onChange (newTabId) => void se llama al detectar swipe completo
 * children contenido a renderizar
 */
import React from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const SWIPE_THRESHOLD = 50; // distancia mínima X para considerar swipe completo
const FAIL_RATIO = 1.6; // si dy supera dx × este ratio, falla → ScrollView coge el gesto

export default function SwipeableTabs({ tabs, current, onChange, children, style }) {
 const pan = Gesture.Pan()
 // Umbral alto para no interferir con taps en Android (RNGH v2)
 .activeOffsetX([-30, 30])
 .failOffsetY([-10, 10])
 .onEnd((e) => {
 if (Math.abs(e.translationX) < SWIPE_THRESHOLD) return;
 if (Math.abs(e.translationY) > Math.abs(e.translationX) * FAIL_RATIO) return;

 const idx = tabs.indexOf(current);
 if (idx === -1) return;

 if (e.translationX < 0 && idx < tabs.length - 1) {
 onChange(tabs[idx + 1]);
 } else if (e.translationX > 0 && idx > 0) {
 onChange(tabs[idx - 1]);
 }
 })
 .runOnJS(true);

 return (
 <GestureDetector gesture={pan}>
 <View style={[{ flex: 1 }, style]}>
 {children}
 </View>
 </GestureDetector>
 );
}
