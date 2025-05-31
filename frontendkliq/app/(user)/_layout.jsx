import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Animated, useWindowDimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeWindStyleSheet } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '@env';
import { logout } from '../(auth)/api.js'

const TabIcon = ({ name, focused }) => {
  return (
    <View className="items-center">
      <Text
        className={`text-xs ${
          focused ? 'text-black font-bold' : 'text-gray-500'
        }`}
      >
        {name}
      </Text>
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
  const tabCount = 2;
  const tabWidth = screenWidth / tabCount;

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(1);

  const translateX = useRef(new Animated.Value(0)).current;

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeTab * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [activeTab, tabWidth]);

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
        const userString = await AsyncStorage.getItem("authData");
        const data = JSON.parse(userString);
        
        if(data.role == 'recipient') {
          router.replace("/Hotlines");
        } else {
          // Ensure underline matches initial tab
          setTimeout(() => setActiveTab(1), 100); 
        }
      } else {
        setIsAuthenticated(false);
        router.replace('authScreen');
      }
    };
    checkAuthStatus();
  }, [router]);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: sidebarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  const clearAllIntervals = () => {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }
  };

const handleLogout = async () => {
    await logout();
  setSidebarVisible(false);
  clearAllIntervals();

  // Clear all stored user data
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('authData');
  await AsyncStorage.removeItem('uniqueId');

  // Optional: confirm token was cleared
  const checkTokenLogout = await AsyncStorage.getItem('authToken');
  console.log("After logout, authToken:", checkTokenLogout); // Should be null

  // // Optional: reset form state if it's in this scope
  // if (typeof resetForm === 'function') {
  //   resetForm();
  // }

  // Navigate to login screen
  router.replace('/authScreen');
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
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 rounded-2xl p-6 shadow-lg relative">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-black">
                Exit Account?
              </Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Profile Content */}


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
            focus: () => setActiveTab(0),
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
            focus: () => setActiveTab(1),
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