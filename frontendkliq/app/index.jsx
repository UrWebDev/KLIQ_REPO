// app/index.jsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to KLIQ</Text>
      {/* <Button title="Get Started" onPress={() => router.push('/chooseRole')} /> */}
      <Button title="Get Started" onPress={() => router.push('/authScreen')} />
    </View>
  );
}

// import {Link} from 'expo-router'
// <Link href={"/contactss"} className='text-yellow-700'>As Kliq Device User</Link>

