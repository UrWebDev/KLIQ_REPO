import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env'; // Ensure your `.env` is set up correctly

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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipient profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uniqueId = await AsyncStorage.getItem('uniqueId');
        if (!uniqueId) {
          setError('Unique ID not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/profiles`, {
          params: { uniqueId },
        });

        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  // Handle clear interval so it's not fetching when logged out
  const clearAllIntervals = () => {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id); // Will clear timeouts and intervals
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setSidebarVisible(false);
    clearAllIntervals();
    await AsyncStorage.removeItem('authToken');
    router.push('/authScreen');
  };

    // If authentication is not checked yet (isAuthenticated is null), show nothing or a loading state
    if (isAuthenticated === null) {
      return <Text>Loading...</Text>; // You can show a loading spinner here
    }
  if (!isAuthenticated) {
    return null; // Show a loading indicator if needed
  }

  return (
    <>
      {/* Sidebar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center">
          <View className="bg-white m-4 p-6 rounded-lg">
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text className="text-red-500 text-center">{error}</Text>
            ) : (
              profile && (
                <View>
                  <Text className="text-xl font-bold mb-4">Recipient Profile</Text>
                  <Text className="text-lg">Name: {profile.name}</Text>
                  <Text className="text-lg">Age: {profile.age}</Text>
                </View>
              )
            )}
            <Button title="Logout" onPress={handleLogout} color="red" />
            <Button title="Close" onPress={() => setSidebarVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Hamburger Button */}
      <View className="absolute top-4 left-4 z-10">
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Text className="text-2xl font-bold">≡</Text>
        </TouchableOpacity>
      </View>

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
        <Tabs.Screen
          name="recipientProfile"
          options={{
            title: 'Recipient Profile',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="Recipient Profile" focused={focused} />
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
