import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { Profile, getActiveProfile } from './src/storage/profileStorage';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import FormScreen from './src/screens/FormScreen';
import GoogleLoginScreen from './src/screens/GoogleLoginScreen';

export type RootStackParamList = {
  Home: undefined;
  Setup: { editingProfile?: Profile } | undefined;
  Form: { url: string; profile: Profile };
  GoogleLogin: { mode?: 'login' | 'logout' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Home' | 'Setup' | null>(null);

  useEffect(() => {
    getActiveProfile().then((p) => {
      setInitialRoute(p ? 'Home' : 'Setup');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
