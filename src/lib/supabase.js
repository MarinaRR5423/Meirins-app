import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPA_URL = 'https://lpcvkzmfemxziuhdmzpx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g';

// SecureStore cifra con Keychain (iOS) / Keystore (Android). Blumm guarda datos de
// salud sensibles tras el login, así que el access/refresh token de la sesión no
// puede vivir en AsyncStorage plano. SecureStore limita cada valor a ~2KB, así que
// la sesión de Supabase (que puede superarlo) se trocea en varias claves.
const CHUNK_SIZE = 1800;

async function getAllChunks(key) {
 const chunks = [];
 let i = 0;
 while (true) {
 const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
 if (chunk == null) break;
 chunks.push(chunk);
 i += 1;
 }
 return chunks.length ? chunks.join('') : null;
}

async function clearChunks(key) {
 let i = 0;
 while (true) {
 const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
 if (chunk == null) break;
 await SecureStore.deleteItemAsync(`${key}_${i}`);
 i += 1;
 }
}

const SecureStorageAdapter = {
 getItem: (key) => getAllChunks(key),
 setItem: async (key, value) => {
 await clearChunks(key);
 const chunks = [];
 for (let i = 0; i < value.length; i += CHUNK_SIZE) {
 chunks.push(value.slice(i, i + CHUNK_SIZE));
 }
 await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}_${i}`, chunk)));
 },
 removeItem: (key) => clearChunks(key),
};

export const supabase = createClient(SUPA_URL, SUPA_KEY, {
 auth: {
 storage: SecureStorageAdapter,
 autoRefreshToken: true,
 persistSession: true,
 detectSessionInUrl: false,
 },
});