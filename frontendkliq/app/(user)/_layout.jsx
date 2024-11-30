import { View, Text, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to import AsyncStorage

const TabIcon = ({ color, name, focused }) => {
  return (
    <View className="item-center">
      <Text className={`${focused ? 'text-red-600' : 'text-black'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
};

const TabIconTwo = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null, to avoid rendering before auth check

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true); // User is authenticated
      } else {
        setIsAuthenticated(false); // User is not authenticated
        router.push('/authScreen'); // Redirect to login screen if not authenticated
      }
    };

    checkAuthStatus();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    const checkTokenLogout = await AsyncStorage.getItem('authToken');
    console.log(checkTokenLogout); // Should be null after removal
    // Redirect to login screen
    router.push('/authScreen');
  };

  // If authentication is not checked yet (isAuthenticated is null), show nothing or a loading state
  if (isAuthenticated === null) {
    return <Text>Loading...</Text>; // You can show a loading spinner here
  }

  // If not authenticated, don't render the tabs
  if (!isAuthenticated) {
    return null;
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
          name="addDeviceContact"
          options={{
            title: 'Contacts',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} name="Contacts" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="userSOSreports"
          options={{
            title: 'SOS Reports',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} name="SOS Reports" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabIconTwo;
