import { View, Text, Button, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to import AsyncStorage
import { NativeWindStyleSheet } from 'nativewind';
import axios from 'axios';
import { API_URL } from '@env'; // Ensure your `.env` is set up correctly


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
        setIsAuthenticated(true); // User is authenticated
        const userString = await AsyncStorage.getItem("authData");
        const data = JSON.parse(userString)
        console.log(data, "user layout");

        if(data.role == 'recipient') router.replace("/Hotlines")
      } else {
        setIsAuthenticated(false); // User is not authenticated
        router.replace('authScreen'); // Redirect to login screen if not authenticated
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
    setSidebarVisible(false);
    clearAllIntervals();
    await AsyncStorage.removeItem('authToken');
    const checkTokenLogout = await AsyncStorage.getItem('authToken');
    console.log(checkTokenLogout); // Should be null after removal
    // Redirect to login screen
    router.replace('/authScreen');
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
      </Tabs>
    </>
  );
};

export default TabIconTwo;
