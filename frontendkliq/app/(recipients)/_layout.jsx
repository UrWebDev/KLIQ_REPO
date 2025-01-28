import { View, Text, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tab icon component replicating the design
const TabIcon = ({ name, focused }) => (
  <View className="items-center">
    <Text
      className={`text-xs ${
        focused ? 'text-black font-bold' : 'text-black-500'
      }`}
    >
      {name}
    </Text>
    {/* Black underline for the active tab */}
    <View
      className={`h-[2px] w-full ${
        focused ? 'bg-red' : 'bg-transparent'
      } mt-1`}
    ></View>
  </View>
);

const TabsLayout = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/authScreen');
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
    router.push('/authScreen');
  };

  if (!isAuthenticated) {
    return null; // Show a loading indicator if needed
  }

  return (
    <>
      <Button title="Logout" onPress={handleLogout} />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent', // Transparent background for the tab bar
            borderBottomWidth: 1, // Bottom border to separate tab bar
            borderBottomColor: '#000000', // Black bottom border
            height: 60, // Adjust the height for the design
          },
          tabBarActiveTintColor: '#000000', // Black text for active tabs
          tabBarInactiveTintColor: '#808080', // Gray text for inactive tabs
        }}
      >
        <Tabs.Screen
          name="Hotlines"
          options={{
            title: 'Hotlines',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="Hotlines" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="SOSInbox"
          options={{
            title: 'SOS Inbox',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="SOS Inbox" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="recipientSOSreport"
          options={{
            title: 'SOS Reports',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="SOS Reports" focused={focused} />
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
