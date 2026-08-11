import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { F } from '../theme/fonts';
import BText from './BText';

const { width: SW, height: SH } = Dimensions.get('window');

// Place your exported mp4 files here:
//   assets/splash/menstrual.mp4
//   assets/splash/folicular.mp4
//   assets/splash/ovulacion.mp4
//   assets/splash/lutea.mp4
const PHASE_VIDEOS = {
 menstrual: require('../../assets/splash/menstrual.mp4'),
 folicular: require('../../assets/splash/folicular.mp4'),
 ovulacion: require('../../assets/splash/ovulacion.mp4'),
 lutea: require('../../assets/splash/lutea.mp4'),
};

function resolveSource(phase) {
 return PHASE_VIDEOS[phase] || PHASE_VIDEOS.folicular;
}

// ─── SplashVideo ──────────────────────────────────────────────────────────────
// Requires: npx expo install expo-video
// Falls back to a static branded screen until expo-video is installed or videos
// are placed in assets/splash/.
export default function SplashVideo({ phase }) {
 const [ExpoVideo, setExpoVideo] = useState(null);

 useEffect(() => {
   try {
     const mod = require('expo-video');
     if (mod.VideoView && mod.useVideoPlayer) setExpoVideo(mod);
   } catch { /* expo-video not installed yet */ }
 }, []);

 if (!ExpoVideo) return <SplashFallback />;
 return <VideoSplash phase={phase} mod={ExpoVideo} />;
}

// ─── Video player ─────────────────────────────────────────────────────────────
function VideoSplash({ phase, mod }) {
 const { VideoView, useVideoPlayer } = mod;
 const [error, setError] = useState(false);
 const [ready, setReady] = useState(false);
 const source = resolveSource(phase);

 const player = useVideoPlayer(source, p => {
   p.loop = true;
   p.muted = true;
   try { p.play(); } catch { setError(true); }
 });

 // Oculta el splash nativo en cuanto el vídeo está visible
 useEffect(() => {
   if (ready || error) {
     SplashScreen.hideAsync().catch(() => {});
   }
 }, [ready, error]);

 if (error) return <SplashFallback />;

 return (
   <View style={s.container}>
     <VideoView
       player={player}
       style={StyleSheet.absoluteFill}
       contentFit="cover"
       nativeControls={false}
       onError={() => setError(true)}
       onFirstFrameRender={() => setReady(true)}
     />
     <View style={s.overlay} />
     <Logo />
   </View>
 );
}

// ─── Static fallback ──────────────────────────────────────────────────────────
function SplashFallback() {
 useEffect(() => {
   SplashScreen.hideAsync().catch(() => {});
 }, []);
 return (
   <View style={[s.container, { backgroundColor: '#0A0A0A' }]}>
     <View style={s.overlay} />
     <Logo />
   </View>
 );
}

function Logo() {
 return (
   <View style={s.logoWrap}>
     <BText style={s.logo}>Blumm</BText>
   </View>
 );
}

const s = StyleSheet.create({
 container: { flex: 1, width: SW, height: SH },
 overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },
 logoWrap: {
   position: 'absolute',
   top: SH * 0.47,
   left: 0, right: 0,
   alignItems: 'center',
 },
 logo: {
   width: 181,
   textAlign: 'center',
   fontSize: 40,
   fontFamily: F.headingX,
   color: '#FFFFFF',
   letterSpacing: -1,
 },
});
