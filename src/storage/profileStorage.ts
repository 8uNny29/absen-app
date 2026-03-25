import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  id: string;
  opsId: string;
  namaLengkap: string;
  nomorWa: string;
}

const PROFILES_KEY = '@absen_profiles';
const ACTIVE_PROFILE_KEY = '@absen_active_profile';

export async function getProfiles(): Promise<Profile[]> {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export async function addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
  const profiles = await getProfiles();
  const newProfile: Profile = { ...profile, id: Date.now().toString() };
  profiles.push(newProfile);
  await saveProfiles(profiles);
  return newProfile;
}

export async function updateProfile(updated: Profile): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex((p) => p.id === updated.id);
  if (idx !== -1) {
    profiles[idx] = updated;
    await saveProfiles(profiles);
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  await saveProfiles(filtered);

  // If deleted profile was active, clear active
  const activeId = await getActiveProfileId();
  if (activeId === id) {
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export async function getActiveProfileId(): Promise<string | null> {
  return await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
}

export async function setActiveProfileId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export async function getActiveProfile(): Promise<Profile | null> {
  const activeId = await getActiveProfileId();
  if (!activeId) return null;
  const profiles = await getProfiles();
  return profiles.find((p) => p.id === activeId) ?? null;
}
