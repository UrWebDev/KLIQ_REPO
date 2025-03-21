// app/_layout.jsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ title: 'Welcome', headerShown: false }} />
    </Stack>
  );
}
