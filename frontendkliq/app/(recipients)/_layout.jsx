import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator, Dimensions, Animated, useWindowDimensions } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon for the close button

const TabIcon = ({ name, focused }) => {
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
  const scale = useRef(new Animated.Value(focused ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.95,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      style={{ opacity, transform: [{ scale }] }}
    >
      <Text
        className="uppercase"
        style={{
          fontSize: 12,
          fontWeight: focused ? '600' : '400',
          color: focused ? '#000000' : '#808080',
        }}
      >
        {name}
      </Text>
    </Animated.View>
  );
};

const TabsLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const { width: screenWidth } = useWindowDimensions();
  const tabCount = 3;
  const tabWidth = screenWidth / tabCount;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: sidebarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);
  
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activeIndex =
      segments[segments.length - 1] === 'Hotlines'
        ? 0
        : segments[segments.length - 1] === 'SOSInbox'
        ? 1
        : 2;
    Animated.spring(translateX, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [segments, tabWidth]);

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
        animationType="fade" // Changed to fade animation
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 rounded-2xl p-6 shadow-lg relative">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-black">
                Recipient Profile
              </Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Profile Content */}
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text className="text-red-500 text-center">{error}</Text>
            ) : (
              profile && (
                <View>
                  <Text className="text-lg mb-2">Name: {profile.name}</Text>
                  <Text className="text-lg mb-4">Age: {profile.age}</Text>
                </View>
              )
            )}

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="w-full p-4 bg-red-600 rounded-xl mb-3 shadow-md"
            >
              <Text className="text-white text-center font-bold text-lg">
                Logout
              </Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSidebarVisible(false)}
              className="w-full p-4 bg-gray-400 rounded-xl shadow"
            >
              <Text className="text-white text-center font-bold text-lg">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hamburger Button */}
          <View className="absolute top-[14vw] left-[5vw] z-10">
      <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)}>
        <Animated.Text
          style={{
            fontSize: screenWidth < 40 ? 24 : 50,
            fontWeight: 'bold',
            transform: [{ rotate: rotateInterpolate }],
          }}
        >
          ≡
        </Animated.Text>
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
          name="Hotlines"
          options={{
            title: 'HOTLINES',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name="HOTLINES" focused={focused} />
            ),
            tabBarItemStyle: { flex: 1 },
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
            tabBarItemStyle: { flex: 1 },
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
            tabBarItemStyle: { flex: 1 },
          }}
        />
      </Tabs>

      {/* Animated underline */}
      <View className="absolute bottom-0 w-full h-[3px] bg-transparent">
        <Animated.View
          style={{
            height: 3,
            width: tabWidth * 0.7,
            backgroundColor: 'black',
            borderRadius: 9999,
            marginLeft: tabWidth * 0.15,
            transform: [{ translateX }],
          }}
        />
      </View>
    </>
  );
};

export default TabsLayout;

NativeWindStyleSheet.setOutput({
  default: 'native',
});