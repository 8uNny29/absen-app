import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleLogin'>;

export default function GoogleLoginScreen({ navigation, route }: Props) {
  const webviewRef = useRef<WebView>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const isLogoutMode = route.params?.mode === 'logout';

  const handleNavigationStateChange = async (navState: any) => {
    const url = navState.url;

    // Kalau mode logout, jangan set login flag — biarkan user di halaman login
    if (isLogoutMode) return;

    // Kalau mode login, deteksi redirect ke account management sebagai tanda berhasil
    if (url.includes('myaccount.google.com') || url.includes('myactivity.google.com') || url.includes('myadcenter.google.com')) {
      await AsyncStorage.setItem('isGoogleLoggedIn', 'true');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Login Akun Google</Text>
          <Text style={styles.topBarSub} numberOfLines={1}>accounts.google.com</Text>
        </View>
        <View style={styles.statusDot}>
          {loadState === 'loading' && <ActivityIndicator size="small" color="#3b82f6" />}
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          🔐 Silakan login dengan akun Google Anda. Sesi akan tersimpan untuk formulir absen.
        </Text>
      </View>

      <WebView
        ref={webviewRef}
        source={{ uri: isLogoutMode ? 'https://accounts.google.com/logout' : 'https://accounts.google.com/ServiceLogin' }}
        style={styles.flex}
        onLoadStart={() => setLoadState('loading')}
        onLoadEnd={() => setLoadState('ready')}
        onError={() => setLoadState('error')}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 22,
    color: '#60a5fa',
  },
  topBarCenter: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  topBarSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  statusDot: {
    width: 32,
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#172554',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
  },
  bannerText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
});
