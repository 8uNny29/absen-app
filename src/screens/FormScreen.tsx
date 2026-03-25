import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { buildFormScript } from '../utils/formScript';

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export default function FormScreen({ navigation, route }: Props) {
  const { url, profile } = route.params;
  const webviewRef = useRef<WebView>(null);
  const successRef = useRef(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const script = buildFormScript({
    opsId: profile.opsId,
    namaLengkap: profile.namaLengkap,
    nomorWa: profile.nomorWa,
  });

  function handleLoadEnd() {
    setLoadState('ready');
    webviewRef.current?.injectJavaScript(script);
  }

  function handleMessage(event: { nativeEvent: { data: string } }) {
    const msg = event.nativeEvent.data;
    if (msg === 'SUCCESS' && !successRef.current) {
      successRef.current = true;
      Alert.alert(
        'Berhasil Absen',
        'Formulir kehadiran Anda telah berhasil dikirim!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else if (msg.startsWith('ERROR:')) {
      console.warn('[FormScreen] Injection error:', msg);
    }
  }

  function handleError() {
    setLoadState('error');
    Alert.alert(
      'Gagal Memuat',
      'Tidak dapat membuka URL form. Periksa koneksi atau link yang dipakai.',
      [{ text: 'Kembali', onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={styles.flex}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Mengisi Form...</Text>
          <Text style={styles.topBarSub} numberOfLines={1}>{profile.namaLengkap}</Text>
        </View>
        <View style={styles.statusDot}>
          {loadState === 'loading' && <ActivityIndicator size="small" color="#6366f1" />}
          {loadState === 'ready' && <Text style={styles.statusOk}>✓</Text>}
        </View>
      </View>

      {/* Injection status banner */}
      {loadState === 'ready' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚡ Formulir sedang diisi otomatis...
          </Text>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={styles.flex}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        // Use a standard browser user agent to bypass Google's "disallowed_useragent" WebView block
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36"
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.flex, styles.center]}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Membuka form...</Text>
          </View>
        )}
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
    color: '#818cf8',
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
  statusOk: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '700',
  },
  banner: {
    backgroundColor: '#1e1b4b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#312e81',
  },
  bannerText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
});
