// app/auth/_layout.jsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="authScreen" options={{ title: 'Recipient Login', headerShown: false }} />
    </Stack>
  );
}
