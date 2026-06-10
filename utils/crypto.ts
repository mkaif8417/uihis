/**
 * utils/crypto.ts
 *
 * AES-CBC encrypt / decrypt — mirrors Angular's encryptData / decryptData exactly.
 * Uses EXPO_PUBLIC_ prefix so Expo's Metro bundler inlines them at build time.
 */
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.EXPO_PUBLIC_SECRET_KEY ?? '';
const SECRET_IV  = process.env.EXPO_PUBLIC_SECRET_IV  ?? '';

if (__DEV__ && (!SECRET_KEY || !SECRET_IV)) {
  console.warn('[crypto] SECRET_KEY or SECRET_IV is empty — check your .env file');
}

export function encryptData(data: unknown): string {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv  = CryptoJS.enc.Utf8.parse(SECRET_IV);
  return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

export function decryptData<T = unknown>(cipherText: string): T {
  const key   = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv    = CryptoJS.enc.Utf8.parse(SECRET_IV);
  const bytes = CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
}