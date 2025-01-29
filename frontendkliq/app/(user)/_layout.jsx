import { View, Text, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to import AsyncStorage

const TabIcon = ({ name, focused }) => {
  return (
    <View className="items-center">
      {/* Tab text */}
      <Text
        className={`text-xs ${
          focused ? 'text-black font-bold' : 'text-gray-500'
        }`}
      >
        {name}
      </Text>
      {/* Bottom underline for active tab */}
      <View
        className={`h-[2px] w-full ${
          focused ? 'bg-black' : 'bg-transparent'
        } mt-1`}
      ></View>
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

   //hanlde clear interval so its not fetching when logged out
   const clearAllIntervals = () => {
    // Add this function to clear intervals if necessary
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
        window.clearTimeout(id); // Will clear timeouts and intervals
    }
  };
  // Handle logout
  const handleLogout = async () => {
    clearAllIntervals();
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
            backgroundColor: 'transparent', // Transparent background
            borderBottomWidth: 1, // Bottom border
            borderBottomColor: '#000000', // Black color for the border
            height: 60, // Adjust the height
          },
        }}
      >
        {/* Tab 1: Add Device Contact */}
        <Tabs.Screen
          name="addDeviceContact"
          options={{
            title: 'Contacts',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="Contact Management" focused={focused} />
            ),
          }}
        />
        {/* Tab 2: User SOS Reports */}
        <Tabs.Screen
          name="userSOSreports"
          options={{
            title: 'SOS Reports',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="SOS Reports" focused={focused} />
            ),
          }}
        />
        {/* Tab 2: User Profile*/}
        <Tabs.Screen
          name="userProfile"
          options={{
            title: 'User Profile',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="User Profile" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabIconTwo;
