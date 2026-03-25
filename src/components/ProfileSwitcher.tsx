import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Profile } from '../storage/profileStorage';

interface Props {
  visible: boolean;
  profiles: Profile[];
  activeProfileId: string | null;
  onSelect: (profile: Profile) => void;
  onAdd: () => void;
  onEdit: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
  onClose: () => void;
}

export default function ProfileSwitcher({
  visible,
  profiles,
  activeProfileId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  function handleDelete(profile: Profile) {
    Alert.alert(
      'Hapus Profil',
      `Hapus profil "${profile.namaLengkap}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDelete(profile) },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Profil</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada profil tersimpan.</Text>
            }
            renderItem={({ item }) => {
              const isActive = item.id === activeProfileId;
              return (
                <View style={[styles.profileCard, isActive && styles.profileCardActive]}>
                  <TouchableOpacity style={styles.profileInfo} onPress={() => onSelect(item)}>
                    {isActive && <Text style={styles.activeBadge}>● AKTIF</Text>}
                    <Text style={styles.profileName}>{item.namaLengkap}</Text>
                    <Text style={styles.profileSub}>
                      {item.opsId}  ·  {item.nomorWa}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                      <Text style={styles.actionEdit}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                      <Text style={styles.actionDelete}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>+ Tambah Profil Baru</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  closeBtn: {
    fontSize: 20,
    color: '#94a3b8',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#0f3460',
  },
  profileCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  profileInfo: {
    flex: 1,
  },
  activeBadge: {
    fontSize: 10,
    color: '#818cf8',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  profileSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  actionEdit: {
    fontSize: 18,
  },
  actionDelete: {
    fontSize: 18,
  },
  addBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 16,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
