import { View, Text, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';  // useRouter for navigation
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Tab icon component
const TabIcon = ({ color, name, focused }) => (
  <View className="items-center">
    <Text className={`${focused ? 'text-red-600' : 'text-black'} text-xs`} style={{ color }}>{name}</Text>
  </View>
);


const TabsLayout = () => {
    
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // // Check authentication status
  // useEffect(() => {
  //   const token = localStorage.getItem('authToken'); // or use AsyncStorage if needed
  //   if (token) {
  //     setIsAuthenticated(true);
  //   } else {
  //     setIsAuthenticated(false);
  //     // Redirect to login if not authenticated
  //     router.push('/authScreen');
  //   }
  // }, [router]);

  // // Render the tabs only if the user is authenticated
  
  // const handleLogout = () => {
  //   // Clear authentication data (e.g., token)
  //   localStorage.removeItem('authToken');
  //   const checkTokenLogout = localStorage.getItem('authToken')
  //   console.log(checkTokenLogout)
  //   // Redirect to login screen
  //   router.push('/authScreen');
  // };
  // Check authentication status
useEffect(() => {
  const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('authToken'); // Use AsyncStorage
      if (token) {
          setIsAuthenticated(true);
      } else {
          setIsAuthenticated(false);
          // Redirect to login if not authenticated
          router.push('/authScreen');
      }
  };

  checkAuthStatus();
}, [router]);

// Handle logout
const handleLogout = async () => {
  // Clear authentication data (e.g., token)
  await AsyncStorage.removeItem('authToken');
  const checkTokenLogout = await AsyncStorage.getItem('authToken');
  console.log(checkTokenLogout); // Should be null after removal
  // Redirect to login screen
  router.push('/authScreen');
};
  if (!isAuthenticated) {
    return null; // You can show a loading screen or return null until authentication is checked
  }
  return (
    <>
    <Button title="Logout" onPress={handleLogout} />
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'blue',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 84,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#778899',
      }}
    >

      <Tabs.Screen
        name="Hotlines"
        options={{
          title: 'Hotlines',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="Hotlines" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="SOSInbox"
        options={{
          title: 'SOSInbox',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="SOSInbox" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipientSOSreport"
        options={{
          title: 'SOS reports',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="SOSReports" focused={focused} />
          ),
        }}
      />
    </Tabs>
    </>
  );
};

export default TabsLayout;

NativeWindStyleSheet.setOutput({
  default: 'native',
});