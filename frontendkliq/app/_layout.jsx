// app/_layout.jsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Welcome' }} />
      <Stack.Screen name="auth" options={{ title: 'Authentication' }} />
      <Stack.Screen name="recipients" options={{ title: 'Recipient' }} />
      <Stack.Screen name="user" options={{ title: 'User' }} />
    </Stack>
  );
}
