import React from 'react';
import { View, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChooseRole() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      
      <Button title="Enter as User" onPress={() => router.push('/userLogin')} />
      <Button title="Enter as Recipient" onPress={() => router.push('/recipientLogin')} />
    </View>
  );
}