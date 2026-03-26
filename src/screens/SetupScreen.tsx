import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { addProfile, setActiveProfileId, updateProfile } from '../storage/profileStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export default function SetupScreen({ navigation, route }: Props) {
  const editingProfile = route.params?.editingProfile ?? null;

  const [opsId, setOpsId] = useState(editingProfile?.opsId ?? '');
  const [namaLengkap, setNamaLengkap] = useState(editingProfile?.namaLengkap ?? '');
  const [nomorWa, setNomorWa] = useState(editingProfile?.nomorWa ?? '');
  const [loading, setLoading] = useState(false);

  const isEditing = editingProfile !== null;
  const title = isEditing ? 'Edit Profil' : 'Buat Profil Pertama';
  const subtitle = isEditing
    ? 'Perbarui informasi profil ini.'
    : 'Isi data dirimu untuk memulai absensi otomatis.';

  async function handleSave() {
    if (!opsId.trim() || !namaLengkap.trim() || !nomorWa.trim()) {
      Alert.alert('Lengkapi Data', 'Semua field wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      if (isEditing && editingProfile) {
        await updateProfile({ ...editingProfile, opsId, namaLengkap, nomorWa });
        navigation.goBack();
      } else {
        const newProfile = await addProfile({ opsId, namaLengkap, nomorWa });
        await setActiveProfileId(newProfile.id);
        navigation.replace('Home');
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan profil.');
    } finally {
      setLoading(false);
    }
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
        <View style={styles.topDecor} />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Ops ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: OPS-001"
            placeholderTextColor="#475569"
            value={opsId}
            onChangeText={setOpsId}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama sesuai data"
            placeholderTextColor="#475569"
            value={namaLengkap}
            onChangeText={setNamaLengkap}
          />

          <Text style={styles.label}>Nomor WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="08xxxxxxxxxx"
            placeholderTextColor="#475569"
            value={nomorWa}
            onChangeText={setNomorWa}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Menyimpan...' : 'Simpan Profil'}</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Batal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f0f1a' },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  topDecor: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3b82f6',
    opacity: 0.12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#0f0f1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 15,
  },
});
