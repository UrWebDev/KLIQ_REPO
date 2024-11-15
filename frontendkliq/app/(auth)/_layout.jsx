// app/auth/_layout.jsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="recipientLogin" options={{ title: 'Recipient Login' }} />
      <Stack.Screen name="userLogin" options={{ title: 'User Login' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign Up' }} />
    </Stack>
  );
}
