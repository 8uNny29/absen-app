import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../../App';
import {
  Profile,
  getProfiles,
  getActiveProfile,
  setActiveProfileId,
  deleteProfile,
} from '../storage/profileStorage';
import ProfileSwitcher from '../components/ProfileSwitcher';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [formUrl, setFormUrl] = useState('');
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ap, ps, googleLoginStr] = await Promise.all([
        getActiveProfile(),
        getProfiles(),
        AsyncStorage.getItem('isGoogleLoggedIn'),
      ]);
      setActiveProfile(ap);
      setProfiles(ps);
      setIsGoogleLoggedIn(googleLoginStr === 'true');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleSelectProfile(profile: Profile) {
    await setActiveProfileId(profile.id);
    setActiveProfile(profile);
    setSwitcherVisible(false);
  }

  async function handleDeleteProfile(profile: Profile) {
    await deleteProfile(profile.id);
    const updatedProfiles = profiles.filter((p) => p.id !== profile.id);
    setProfiles(updatedProfiles);
    if (activeProfile?.id === profile.id) {
      const next = updatedProfiles[0] ?? null;
      if (next) {
        await setActiveProfileId(next.id);
        setActiveProfile(next);
      } else {
        setActiveProfile(null);
        navigation.replace('Setup');
      }
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Keluar Akun Google',
      'Yakin ingin mengeluarkan akun Google? Kamu perlu login ulang untuk absen berikutnya.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('isGoogleLoggedIn', 'false');
            setIsGoogleLoggedIn(false);
            navigation.navigate('GoogleLogin', { mode: 'logout' });
          },
        },
      ]
    );
  }

  function handleAbsen() {
    if (!activeProfile) {
      Alert.alert('Profil Belum Ada', 'Tambahkan profil terlebih dahulu.');
      return;
    }
    if (!isGoogleLoggedIn) {
      Alert.alert('Belum Login Google', 'Silakan login akun Google terlebih dahulu sebelum absen.');
      return;
    }
    const url = formUrl.trim();
    if (!url) {
      Alert.alert('URL Kosong', 'Paste link Google Form terlebih dahulu.');
      return;
    }
    if (!url.startsWith('http')) {
      Alert.alert('URL Tidak Valid', 'Masukkan URL yang valid (diawali https://).');
      return;
    }
    navigation.navigate('Form', { url, profile: activeProfile });
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Absen Kerja</Text>
            <Text style={styles.appTagline}>Absensi Otomatis · Google Form</Text>
          </View>
          <TouchableOpacity
            style={styles.switcherBtn}
            onPress={() => setSwitcherVisible(true)}
          >
            <Text style={styles.switcherIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Active Profile Card */}
        {activeProfile ? (
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <Text style={styles.profileCardLabel}>Profil Aktif</Text>
              <TouchableOpacity onPress={() => setSwitcherVisible(true)}>
                <Text style={styles.switchLink}>Ganti</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{activeProfile.namaLengkap}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipLabel}>Ops ID</Text>
                <Text style={styles.metaChipValue}>{activeProfile.opsId}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipLabel}>WA</Text>
                <Text style={styles.metaChipValue}>{activeProfile.nomorWa}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                navigation.navigate('Setup', { editingProfile: activeProfile })
              }
            >
              <Text style={styles.editBtnText}>✏️ Edit Profil Ini</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noProfileCard}
            onPress={() => navigation.navigate('Setup')}
          >
            <Text style={styles.noProfileText}>+ Tambah Profil</Text>
          </TouchableOpacity>
        )}

        {/* URL Input */}
        <Text style={styles.sectionLabel}>Link Google Form</Text>
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInputFlex}
            placeholder="Paste URL form di sini..."
            placeholderTextColor="#475569"
            value={formUrl}
            onChangeText={setFormUrl}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="url"
            multiline
          />
          <TouchableOpacity
            style={styles.pasteBtn}
            activeOpacity={0.7}
            onPress={async () => {
              const text = await Clipboard.getStringAsync();
              if (text) setFormUrl(text);
            }}
          >
            <Text style={styles.pasteBtnText}>📋 Paste</Text>
          </TouchableOpacity>
        </View>

        {/* Absen Button */}
        <TouchableOpacity
          style={[styles.absenBtn, (!activeProfile || !isGoogleLoggedIn) && styles.absenBtnDisabled]}
          onPress={handleAbsen}
          activeOpacity={0.8}
        >
          <Text style={styles.absenBtnText}>⚡ ABSEN SEKARANG</Text>
        </TouchableOpacity>

        {/* Google Login / Logout Buttons */}
        <View style={styles.googleRow}>
          <TouchableOpacity
            style={[styles.googleLoginBtn, isGoogleLoggedIn && styles.googleLoginBtnSuccess]}
            onPress={() => navigation.navigate('GoogleLogin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.googleLoginBtnText, isGoogleLoggedIn && styles.googleLoginBtnTextSuccess]}>
              {isGoogleLoggedIn ? '✅ Email Google Tertaut' : '🔑 Login Akun Google Dulu'}
            </Text>
          </TouchableOpacity>
          {isGoogleLoggedIn && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ProfileSwitcher
        visible={switcherVisible}
        profiles={profiles}
        activeProfileId={activeProfile?.id ?? null}
        onSelect={handleSelectProfile}
        onAdd={() => {
          setSwitcherVisible(false);
          navigation.navigate('Setup');
        }}
        onEdit={(p) => {
          setSwitcherVisible(false);
          navigation.navigate('Setup', { editingProfile: p });
        }}
        onDelete={handleDeleteProfile}
        onClose={() => setSwitcherVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  appTagline: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  switcherBtn: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  switcherIcon: {
    fontSize: 20,
  },
  profileCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  switchLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  metaChip: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  metaChipLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaChipValue: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: '600',
    marginTop: 1,
  },
  editBtn: {
    alignSelf: 'flex-start',
  },
  editBtnText: {
    fontSize: 13,
    color: '#64748b',
  },
  noProfileCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#0f3460',
    borderStyle: 'dashed',
  },
  noProfileText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 24,
    gap: 8,
  },
  urlInputFlex: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#0f3460',
    minHeight: 56,
    textAlignVertical: 'top',
  },
  pasteBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pasteBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  absenBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  absenBtnDisabled: {
    opacity: 0.5,
  },
  absenBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  googleLoginBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  googleLoginBtnText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  googleLoginBtnSuccess: {
    backgroundColor: '#064e3b',
    borderColor: '#065f46',
  },
  googleLoginBtnTextSuccess: {
    color: '#34d399',
  },
  googleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  logoutBtn: {
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  logoutBtnText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '700',
  },
});
