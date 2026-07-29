import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileAvatarButton({ navigationRef }) {
 const insets = useSafeAreaInsets();

 return (
 <TouchableOpacity
 style={[styles.btn, { top: insets.top + 8 }]}
 activeOpacity={0.85}
 onPress={() => navigationRef.current?.navigate('Perfil')}
 >
 <User size={20} color="white" strokeWidth={2} />
 </TouchableOpacity>
 );
}

const styles = StyleSheet.create({
 btn: {
 position: 'absolute', right: 16, zIndex: 50,
 width: 40, height: 40, borderRadius: 20,
 backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center',
 ...Platform.select({
 ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
 android: { elevation: 3 },
 }),
 },
});
