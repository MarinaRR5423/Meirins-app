import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Moon, Salad, SportShoe, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROUTE_ICONS = { Inicio: Home, Ciclo: Moon, "Nutrición": Salad, Gimnasio: SportShoe };
const OPTIONAL_ROUTES = { "Nutrición": 'nutricion', Gimnasio: 'ejercicio' };

const TXT = {
  close:    { es: 'Cerrar', en: 'Close', fr: 'Fermer', it: 'Chiudi' },
  addTitle: { es: 'Añadir', en: 'Add', fr: 'Ajouter', it: 'Aggiungi' },
  ciclo:    { es: 'Ciclo', en: 'Cycle', fr: 'Cycle', it: 'Ciclo' },
  agua:     { es: 'Agua', en: 'Water', fr: 'Eau', it: 'Acqua' },
  ejercicio:{ es: 'Ejercicio', en: 'Exercise', fr: 'Exercice', it: 'Esercizio' },
};

export default function FloatingTabBar({ state, descriptors, navigation, enabledTabs, onToggleTab, lang = 'es' }) {
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const tr = (key) => (TXT[key]?.[lang] || TXT[key]?.es || key);

  const visibleRoutes = state.routes.filter((route) => {
    if (route.name === 'Perfil') return false;
    const flag = OPTIONAL_ROUTES[route.name];
    if (!flag) return true;
    return enabledTabs?.[flag] !== false;
  });

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={styles.pillGroup}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index].key === route.key;
          const Icon = ROUTE_ICONS[route.name] || Home;
          const label = options.tabBarLabel ?? route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[styles.item, isFocused && styles.itemActive]}
            >
              <Icon size={20} color={isFocused ? '#0A0A0A' : '#171717'} strokeWidth={2} />
              <Text style={[styles.itemLabel, isFocused && styles.itemLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>

      <TouchableOpacity style={styles.plusBtn} activeOpacity={0.85} onPress={() => setPickerOpen(true)}>
        <Plus size={24} color="white" strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={[styles.sheet, { marginBottom: Math.max(insets.bottom, 16) + 90 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{tr('addTitle')}</Text>

            <View style={styles.actionGrid}>
              {[
                { key: 'ciclo',     emoji: '🌙', screen: 'Ciclo' },
                { key: 'agua',      emoji: '💧', screen: null },
                { key: 'ejercicio', emoji: '👟', screen: 'Gimnasio' },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.actionBtn}
                  onPress={() => {
                    setPickerOpen(false);
                    if (item.screen) navigation.navigate(item.screen);
                  }}
                >
                  <Text style={styles.actionEmoji}>{item.emoji}</Text>
                  <Text style={styles.actionLabel}>{tr(item.key)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerOpen(false)}>
              <Text style={styles.closeBtnTxt}>{tr('close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 16,
  },
  pillGroup: {
    flex: 1, flexDirection: 'row', gap: 2, padding: 8,
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  item: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingHorizontal: 4, paddingVertical: 8, borderRadius: 16,
  },
  itemActive: { backgroundColor: 'white' },
  itemLabel: {
    fontSize: 8, fontWeight: '600', color: '#171717',
    textTransform: 'uppercase', letterSpacing: 0.2,
  },
  itemLabelActive: { color: '#0A0A0A' },
  plusBtn: {
    width: 66, height: 66, borderRadius: 16,
    backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet:         { width: '90%', backgroundColor: 'white', borderRadius: 24, padding: 20, paddingTop: 12 },
  sheetHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E5E5', alignSelf: 'center', marginBottom: 14 },
  sheetTitle:    { fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 18, textAlign: 'center' },
  actionGrid:    { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
  actionBtn:     { flex: 1, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 18 },
  actionEmoji:   { fontSize: 28, marginBottom: 6 },
  actionLabel:   { fontSize: 12, fontWeight: '700', color: '#0A0A0A' },
  closeBtn:      { marginTop: 14, alignItems: 'center', paddingVertical: 10 },
  closeBtnTxt:   { color: '#737373', fontWeight: '600', fontSize: 13 },
});
