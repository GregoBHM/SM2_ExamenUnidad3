import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginWithGoogle } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_WEB_CLIENT_ID } from '../config/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// Configure Google Sign-In only if not in Expo Go, to avoid crashes
const isExpoGo = Constants.appOwnership === 'expo';
if (!isExpoGo) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Plataforma no soportada', 'Google Sign-In nativo no funciona en la versión Web. Por favor usa un emulador de Android/iOS o el botón de Dev Login.');
      return;
    }
    
    if (isExpoGo) {
      Alert.alert('Expo Go detectado', 'Google Sign-In requiere módulos nativos. Por favor usa el botón "Dev Login" de abajo.');
      return;
    }

    setIsLoadingGoogle(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      try { await GoogleSignin.signOut(); } catch (_) {}
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('No se recibió token de Google');

      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUser = await signInWithCredential(auth, credential);

      const firebaseIdToken = await firebaseUser.user.getIdToken();
      const userData = await loginWithGoogle(firebaseIdToken);
      await signIn(userData);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code !== statusCodes.SIGN_IN_CANCELLED && error.code !== statusCodes.IN_PROGRESS) {
        Alert.alert('Error de Autenticación', error.message || 'No se pudo iniciar sesión.', [{ text: 'OK' }]);
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleDevLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      // 1. Intentar obtener un usuario real del Leaderboard para evitar IDs falsos
      const response = await fetch(`${API.ENDPOINTS.LEADERBOARD}?limit=1`);
      const users = await response.json();
      
      if (users && users.length > 0) {
        const userRes = await fetch(API.ENDPOINTS.USER_PROFILE(users[0].id));
        if (userRes.ok) {
           const userData = await userRes.json();
           await signIn(userData);
           return;
        }
      }
      
      // 2. Si la DB está vacía o falla, usamos un mock por defecto
      await signIn({
        id: 1,
        firebase_uid: "dev_mock_uid",
        email: "dev@virtual.upt.pe",
        display_name: "Usuario Dev (Expo Go)",
        photo_url: "https://ui-avatars.com/api/?name=Dev+User",
        role: "student",
        career: "Ingeniería de Sistemas",
        student_code: "2024000000"
      });
    } catch (error) {
      Alert.alert('Error Dev', error.message);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Top gradient section */}
      <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={44} color={COLORS.textLight} />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.brandName}>
          RCE UPT
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.brandLine} />
        <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={styles.brandSub}>
          Red Colaborativa Estudiantil
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700).duration(400)} style={styles.brandInstitution}>
          Universidad Privada de Tacna
        </Animated.Text>
      </View>

      {/* Bottom card */}
      <Animated.View entering={FadeInUp.delay(300).duration(700)} style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <Text style={styles.welcomeTitle}>Bienvenido</Text>
        <Text style={styles.welcomeSub}>
          Conecta con la comunidad académica. Publica dudas, ofrece mentoría y gana experiencia.
        </Text>

        <TouchableOpacity
          style={[styles.googleBtn, isLoadingGoogle && styles.googleBtnDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoadingGoogle}
          activeOpacity={0.8}
        >
          {isLoadingGoogle ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.loadingText}>Conectando...</Text>
            </View>
          ) : (
            <View style={styles.googleBtnContent}>
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleBtnLabel}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {(isExpoGo || Platform.OS === 'web') && (
          <TouchableOpacity
            style={[styles.googleBtn, { marginTop: SPACING.md, backgroundColor: COLORS.primarySoft }]}
            onPress={handleDevLogin}
            disabled={isLoadingGoogle}
            activeOpacity={0.8}
          >
            <View style={styles.googleBtnContent}>
              <Ionicons name="code-slash" size={20} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
              <Text style={styles.googleBtnLabel}>Dev Login (Bypass)</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.domainNotice}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.domainText}>Solo para miembros de la UPT</Text>
        </View>

        <Text style={styles.footerText}>
          Plataforma de mentoría académica P2P
        </Text>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  topSection: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl,
    overflow: 'hidden', position: 'relative',
  },
  decorCircle1: {
    position: 'absolute', top: -60, right: -50,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorCircle2: {
    position: 'absolute', bottom: -30, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  logoContainer: { marginBottom: SPACING.lg },
  logoCircle: {
    width: 90, height: 90, borderRadius: RADIUS.full, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.large,
  },
  brandName: {
    fontSize: FONTS.sizes.display, fontWeight: '800', color: COLORS.textLight,
    textAlign: 'center', letterSpacing: 2, marginBottom: SPACING.sm,
  },
  brandLine: { width: 44, height: 3, borderRadius: 2, backgroundColor: COLORS.accent, marginBottom: SPACING.md },
  brandSub: { fontSize: FONTS.sizes.lg, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  brandInstitution: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginTop: SPACING.xs },
  bottomSection: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl,
    ...SHADOWS.large,
  },
  welcomeTitle: { fontSize: FONTS.sizes.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  welcomeSub: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.xl },
  googleBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, paddingVertical: 16, paddingHorizontal: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium,
  },
  googleBtnDisabled: { opacity: 0.7 },
  googleBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { width: 22, height: 22, marginRight: SPACING.md },
  googleBtnLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.primary },
  domainNotice: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
  },
  domainText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  footerText: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl,
  },
});
