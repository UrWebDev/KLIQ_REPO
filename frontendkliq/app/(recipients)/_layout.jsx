import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;
const tabCount = 3;
const tabWidth = screenWidth / tabCount;

// ✅ Tab Icon Fix
const TabIcon = ({ name, focused }) => (
  <View className="flex-col items-center justify-center pb-[4px]">
    <Text
      className={`text-[13px] uppercase ${
        focused ? 'text-black font-semibold' : 'text-gray-400'
      }`}
    >
      {name}
    </Text>
  </View>
);

const TabsLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translateX = useSharedValue(0);

  useEffect(() => {
    const activeIndex = segments[segments.length - 1] === 'Hotlines' ? 0 : segments[segments.length - 1] === 'SOSInbox' ? 1 : 2;
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 10,
      stiffness: 120,
      mass: 0.5,
    });
  }, [segments]);

  // Sidebar & Auth logic stays the same
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

  const animatedUnderlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            height: 60,
            paddingBottom: 1,
            position: 'relative',
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#808080',
        }}
      >
        <Tabs.Screen
          name="Hotlines"
          options={{
            title: 'HOTLINES',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="HOTLINES" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="SOSInbox"
          options={{
            title: 'INBOX',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="INBOX" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="recipientSOSreport"
          options={{
            title: 'REPORTS',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="REPORTS" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Animated sliding underline */}
      <View className="absolute bottom-0 w-full h-[3px] bg-transparent">
        <Animated.View
          style={[
            {
              height: 3,
              width: tabWidth - 24,
              backgroundColor: 'black',
              borderRadius: 9999,
              marginLeft: 12,
            },
            animatedUnderlineStyle,
          ]}
        />
      </View>
    </>
  );
};

export default TabsLayout;

NativeWindStyleSheet.setOutput({
  default: 'native',
});