import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// Updated TabIcon component
const TabIcon = ({ name, focused }) => (
  <View className="flex-col items-center justify-center">
    <Text
      className={`text-xs ${
        focused ? 'text-black font-bold' : 'text-gray-500'
      }`}
    >
      {name}
    </Text>
    {/* Underline effect */}
    <View
      className={`h-[2px] w-10 mt-1 rounded-full transition-all duration-300 ${
        focused ? 'bg-black' : 'bg-transparent'
      }`}
    />
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

  const clearAllIntervals = () => {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }
  };

  const handleLogout = async () => {
    setSidebarVisible(false);
    clearAllIntervals();
    await AsyncStorage.removeItem('authToken');
    router.push('/authScreen');
  };

  if (isAuthenticated === null) {
    return <Text>Loading...</Text>;
  }
  if (!isAuthenticated) {
    return null;
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

      {/* Tabs */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#000000',
            height: 60,
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#808080',
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