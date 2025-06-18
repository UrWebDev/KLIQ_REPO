// app/_layout.jsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) {
          router.replace('/onboardTut');
        }
      } catch (e) {
        console.error('Failed to check onboarding:', e);
      }
    };

    checkOnboarding();
  }, []);
//   useEffect(() => {
//   if (__DEV__) {
//     AsyncStorage.removeItem('hasSeenOnboarding');
//   }
// }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Welcome' }} />
      <Stack.Screen name="onboardTut" options={{ headerShown: false }} />
    </Stack>
  );
}
