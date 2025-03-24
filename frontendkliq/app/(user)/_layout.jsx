import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator, Animated, useWindowDimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeWindStyleSheet } from 'nativewind';
import axios from 'axios';
import { API_URL } from '@env';

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
  const { width: screenWidth } = useWindowDimensions();
  const tabCount = 2; // Number of tabs
  const tabWidth = screenWidth / tabCount;

  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null, to avoid rendering before auth check
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Track active tab index

  const translateX = useRef(new Animated.Value(0)).current;

  // Update active tab index and animate underline
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeTab * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [activeTab, tabWidth]);

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
        setIsAuthenticated(true); // User is authenticated
      } else {
        setIsAuthenticated(false); // User is not authenticated
        router.push('/authScreen'); // Redirect to login screen if not authenticated
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
                  <Text className="text-lg">BloodType: {profile.bloodType}</Text>
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
            height: screenWidth < 400 ? 55 : 65,
            paddingBottom: 1,
            position: 'relative',
            flexDirection: 'row',
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#808080',
        }}
      >
        <Tabs.Screen
          name="addDeviceContact"
          options={{
            title: 'CONTACTS',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="CONTACTS" focused={focused} />
            ),
            tabBarItemStyle: { flex: 1 },
          }}
          listeners={{
            focus: () => setActiveTab(0), // Set active tab index to 0
          }}
        />
        <Tabs.Screen
          name="userSOSreports"
          options={{
            title: 'REPORTS',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="REPORTS" focused={focused} />
            ),
            tabBarItemStyle: { flex: 1 },
          }}
          listeners={{
            focus: () => setActiveTab(1), // Set active tab index to 1
          }}
        />
      </Tabs>

      {/* Animated underline */}
      <View className="absolute bottom-0 w-full h-[3px] bg-transparent">
        <Animated.View
          style={{
            height: 3,
            width: tabWidth,
            backgroundColor: 'black',
            borderRadius: 9999,
            transform: [{ translateX }],
          }}
        />
      </View>

      {/* Long underline */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 1,
          backgroundColor: '#808080',
        }}
      />
    </>
  );
};

export default TabIconTwo;

NativeWindStyleSheet.setOutput({
  default: 'native',
});