/**
 * DeptOfficialLogin.tsx  —  Expo-compatible
 *
 * Login API: POST https://localhost:7065/api/UIHis/Login
 *
 * Payload:  { encryptedData: string }   ← AES-CBC encrypted JSON
 * Response: { encryptedData: string }   ← AES-CBC encrypted JSON (decrypted on success)
 *
 * ⚠️  Replace the two placeholders below with values from your Angular project:
 *      src/environments/environment.ts → secretKey / secretIv
 *
 * Dependencies:
 *   npx expo install expo-asset expo-sharing @expo/vector-icons
 *   npx expo install react-native-safe-area-context react-native-screens
 *   npm install crypto-js
 *   npm install --save-dev @types/crypto-js
 */
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CryptoJS from 'crypto-js';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Captcha from '../../../components/Captcha';

// ── Navigation / Redux (restore when wiring up) ──────────────────────────────
// import { StackNavigationProp } from '@react-navigation/stack';
// import { useDispatch } from 'react-redux';
// import { setOfficialSession } from '../../redux/authSlice';
// import { AppDispatch } from '../../redux/store';

//
const SECRET_KEY    = Constants.expoConfig?.extra?.secretKey ?? '';
const SECRET_IV     = Constants.expoConfig?.extra?.secretIv  ?? '';
const LOGIN_API_URL = Constants.expoConfig?.extra?.apiUrl    ?? '';

// ─────────────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────
const BLUE_DARK  = '#1A4971';
const BLUE_MID   = '#2A6091';
const BLUE_TEXT  = '#0D2D45';
const GREEN_BG   = '#8FAF8F';

const SCREEN_WIDTH = Dimensions.get('window').width;


const TICKER_TEXT =
  '  🔔  Logins are Blocked for Tech, District & Block Officers — Please contact your administrator.   |   🔔  Logins are Blocked for Tech, District & Block Officers — Please contact your administrator.   ';

// ─── AES-CBC Helpers (mirrors your Angular encryptData / decryptData) ─────────
function encryptData(data: any): string {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv  = CryptoJS.enc.Utf8.parse(SECRET_IV);
  return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function decryptData(cipherText: string): any {
  const key   = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv    = CryptoJS.enc.Utf8.parse(SECRET_IV);
  const bytes = CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// ─── CAPTCHA Generator ────────────────────────────────────────────────────────
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCaptcha(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return result;
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = { navigation?: any; route?: any };

// ─── Marquee Ticker ───────────────────────────────────────────────────────────
function MarqueeTicker() {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: -SCREEN_WIDTH * 6, duration: 22000, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: SCREEN_WIDTH,      duration: 0,     useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={styles.tickerBar}>
      <Animated.Text style={[styles.tickerText, { transform: [{ translateX }] }]} numberOfLines={1}>
        {TICKER_TEXT}
      </Animated.Text>
    </View>
  );
}

// ─── Fade-in helper ───────────────────────────────────────────────────────────
type FadeInProps = { children: React.ReactNode; delay?: number; style?: object };

function FadeInView({ children, delay = 0, style }: FadeInProps) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DepartmentOfficialLoginScreen({ navigation }: Props) {
  // const dispatch = useDispatch<AppDispatch>();

  const [username,      setUsername]      = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [captchaCode,   setCaptchaCode]   = useState<string>(generateCaptcha());

  // ── Refresh CAPTCHA ───────────────────────────────────────────────────────
  const handleRefreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaAnswer('');
  }, []);

  // ── Open PDF ──────────────────────────────────────────────────────────────
  const handleOpenPdf = async () => {
    try {
      const [asset] = await Asset.loadAsync(require('../../../assets/Password_Policy.pdf'));
      const localUri = asset.localUri ?? asset.uri;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Info', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to open PDF');
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    // ── Validation ──────────────────────────────────────────────────────────
    if (!username.trim()) {
      Alert.alert('Missing Field', 'Please enter your Email Address / Username.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing Field', 'Please enter your Password.');
      return;
    }
    if (captchaAnswer.toUpperCase().trim() !== captchaCode) {
      Alert.alert('Wrong CAPTCHA', 'Please enter the CAPTCHA correctly.');
      handleRefreshCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      // ── Build & encrypt payload (same structure as Angular Credentials) ──
      const credentials = {
        username: username.trim(),
        password: password.trim(),
      };

      const encryptedData = encryptData(credentials);
      console.log('Sending encryptedData =>', encryptedData.slice(0, 30) + '...');
console.log("LOGIN_API_URL =", LOGIN_API_URL);
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ encryptedData }),
      });

      // ── Handle non-2xx HTTP ──────────────────────────────────────────────
      if (!response.ok) {
        const errorText = await response.text();
        console.log('HTTP Error:', response.status, errorText);
        Alert.alert('Login Failed', `Server error ${response.status}. Please try again.`);
        handleRefreshCaptcha();
        return;
      }

      const responseJson = await response.json();
      console.log('Raw response =>', responseJson);

      // ── Decrypt the response (mirrors Angular map operator) ──────────────
      let data: any;
      try {
        data = decryptData(responseJson.encryptedData);
        console.log('Decrypted response =>', data);
      } catch (decryptError) {
        console.log('Decryption failed =>', decryptError);
        Alert.alert('Error', 'Failed to read server response. Please try again.');
        handleRefreshCaptcha();
        return;
      }

      // ── Check login result ───────────────────────────────────────────────
      if (
        data?.success === true  ||
        data?.Success === true  ||
        data?.status  === 'success' ||
        data?.Status  === 'success'
      ) {
        // dispatch(setOfficialSession({ token: data.token, user: data.user }));
        Alert.alert(
          'Login Successful',
          `Welcome, ${data?.userName ?? data?.UserName ?? username}!`,
        );
        // navigation?.navigate('Dashboard');
      } else {
        const msg =
          data?.message      ??
          data?.Message      ??
          data?.errorMessage ??
          data?.ErrorMessage ??
          'Invalid credentials. Please try again.';
        Alert.alert('Login Failed', msg);
        handleRefreshCaptcha();
      }

    } catch (error: any) {
      console.log('Login error =>', error);

      if (error?.message?.includes('Network request failed')) {
        Alert.alert('Network Error', 'Unable to reach the server. Check your connection and try again.');
      } else {
        Alert.alert('Error', error?.message ?? 'Something went wrong. Please try again.');
      }

      handleRefreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE_DARK} />

      {/* ── HEADER IMAGE ── */}
      <View style={styles.headerImageWrapper}>
        <Image
          source={require('../../../assets/images/header-banner.png')}
          style={styles.headerImage}
          resizeMode="stretch"
        />
      </View>

      {/* ── MOVING TICKER ── */}
      <MarqueeTicker />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1️⃣ HERO HEADER */}
          <FadeInView style={styles.header}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="account-balance" size={36} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Department Official's Login</Text>
          </FadeInView>

          {/* 2️⃣ LOGIN CARD */}
          <FadeInView style={styles.loginCard} delay={80}>
            <Text style={styles.loginCardTitle}>Sign In</Text>
            <View style={styles.formDivider} />

            {/* Username */}
            <Text style={styles.fieldLabel}>Email Address / Username</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="email" size={22} color={BLUE_MID} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor="#A8BECC"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="lock" size={22} color={BLUE_MID} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A8BECC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={BLUE_MID}
                />
              </TouchableOpacity>
            </View>

            {/* CAPTCHA */}
            <Text style={styles.fieldLabel}>CAPTCHA Verification</Text>
            <View style={styles.captchaRow}>
              <Captcha value={captchaCode} />
              <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshCaptcha} activeOpacity={0.75}>
                <Ionicons name="refresh" size={22} color={BLUE_DARK} />
              </TouchableOpacity>
              <TextInput
                style={styles.captchaInput}
                placeholder="Type here"
                placeholderTextColor="#A8BECC"
                value={captchaAnswer}
                onChangeText={setCaptchaAnswer}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.primaryBtnText}>Login</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.btnIcon} />
                </View>
              )}
            </TouchableOpacity>

            {/* PDF Note */}
            <TouchableOpacity onPress={handleOpenPdf} activeOpacity={0.7} style={styles.noteWrap}>
              <View style={styles.noteInner}>
                <MaterialIcons name="picture-as-pdf" size={16} color="#CC0000" style={styles.noteIcon} />
                <Text style={styles.noteText}>Note: Password Policy Document to create password</Text>
              </View>
            </TouchableOpacity>
          </FadeInView>

          {/* 3️⃣ INSTRUCTIONS CARD */}
          <FadeInView style={styles.infoCard} delay={160}>
            <Text style={styles.welcomeTitle}>WELCOME TO HARYANA</Text>
            <View style={styles.divider} />
            <Text style={styles.instructionsHeading}>Instructions for Department Users</Text>
            <View style={styles.divider} />
            <View style={styles.instructionsList}>
              <View style={styles.instructionRow}>
                <MaterialIcons name="looks-one" size={18} color="#1a1a1a" style={styles.bulletIcon} />
                <Text style={styles.instructionItem}>
                  Enter your Email Address while registering against Username.
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <MaterialIcons name="looks-two" size={18} color="#1a1a1a" style={styles.bulletIcon} />
                <Text style={styles.instructionItem}>
                  Enter your Password created while registering against your Username.
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <MaterialIcons name="looks-3" size={18} color="#1a1a1a" style={styles.bulletIcon} />
                <Text style={styles.instructionItem}>
                  If this is the first time, kindly click on "SHM New User? Register Here" to register.
                </Text>
              </View>
            </View>
          </FadeInView>

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.backRow} onPress={() => navigation?.goBack()}>
              <Ionicons name="arrow-back" size={16} color="#fff" />
              <Text style={styles.footerLink}>Back to Role Selection</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BLUE_DARK },
  scroll:   { flexGrow: 1, paddingBottom: 40 },

  headerImageWrapper: { width: '95%', alignSelf: 'center', overflow: 'hidden', borderRadius: 24, marginTop: 2 },
  headerImage:        { width: '100%', height: 110 },

  tickerBar:  { backgroundColor: '#1a1a1a', paddingVertical: 7, overflow: 'hidden' },
  tickerText: { color: '#FFD700', fontSize: 13, fontWeight: '700', letterSpacing: 0.3, width: SCREEN_WIDTH * 6 },

  header:      { backgroundColor: BLUE_DARK, alignItems: 'center', paddingTop: 5, paddingBottom: 0, paddingHorizontal: 24 },
  iconWrap:    { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  loginCard:      { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 28, paddingBottom: 24 },
  loginCardTitle: { fontSize: 20, fontWeight: '900', color: BLUE_TEXT, textAlign: 'center', marginBottom: 14, letterSpacing: 0.8 },
  formDivider:    { height: 1.5, backgroundColor: '#D0E4F0', marginBottom: 20 },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: BLUE_TEXT, marginBottom: 6, letterSpacing: 0.3 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F6FF', borderRadius: 12, borderWidth: 1.5, borderColor: '#B8D4E8', paddingHorizontal: 12, marginBottom: 18 },
  inputIcon:  { marginRight: 8 },
  input:      { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 13 },

  captchaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  refreshBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F4FD', borderWidth: 1.5, borderColor: '#7EB8D8', alignItems: 'center', justifyContent: 'center' },
  captchaInput: { width: 90, backgroundColor: '#F0F6FF', borderRadius: 12, borderWidth: 1.5, borderColor: '#B8D4E8', textAlign: 'center', fontSize: 16, fontWeight: '800', color: BLUE_TEXT, paddingVertical: 13 },

  primaryBtn:     { backgroundColor: BLUE_DARK, borderRadius: 14, paddingVertical: 15, alignItems: 'center', elevation: 6, shadowColor: BLUE_DARK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, marginBottom: 16 },
  btnDisabled:    { backgroundColor: '#7EB8D8', shadowOpacity: 0, elevation: 0 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  btnInner:       { flexDirection: 'row', alignItems: 'center' },
  btnIcon:        { marginLeft: 8 },

  noteWrap:  { alignSelf: 'center' },
  noteInner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#CC0000', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  noteIcon:  { marginRight: 6 },
  noteText:  { fontSize: 13, color: '#CC0000', fontWeight: '600', textDecorationLine: 'underline' },

  infoCard:            { backgroundColor: GREEN_BG, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 20, marginTop: 12, borderRadius: 16, marginHorizontal: 10 },
  welcomeTitle:        { fontSize: 18, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', marginBottom: 14, letterSpacing: 1 },
  divider:             { height: 1.5, backgroundColor: '#5a7a5a', marginBottom: 14 },
  instructionsHeading: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 10 },
  instructionsList:    { marginBottom: 6 },
  instructionRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bulletIcon:          { marginRight: 8, marginTop: 1 },
  instructionItem:     { flex: 1, fontSize: 13, color: '#1a1a1a', lineHeight: 20 },

  footer:    { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  backRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLink:{ fontSize: 13, color: '#fff', fontWeight: '700' },
});