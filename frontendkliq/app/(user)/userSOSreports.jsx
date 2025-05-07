import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, FlatList, ActivityIndicator, Modal, Pressable, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this is installed
import axios from 'axios';
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-gifted-charts';

const UserSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [deviceId, setDeviceId] = useState(null);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isMonthDropdownVisible, setIsMonthDropdownVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', age: '', bloodType: '' });

  const dropdownAnim = useState(new Animated.Value(0))[0];

  const screenHeight = Dimensions.get('window').height;
  const dynamicPaddingTop = screenHeight * 0.08; // 5% of screen height as top padding
  const [isUserDetailsHelpPressed, setIsUserDetailsHelpPressed] = useState(false);
  const userDetailsHelpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(userDetailsHelpAnim, {
      toValue: isUserDetailsHelpPressed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isUserDetailsHelpPressed, userDetailsHelpAnim]);
  
  useEffect(() => {
    if (isMonthDropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isMonthDropdownVisible]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem('uniqueId');
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          console.error("Device ID not found in storage");
        }
      } catch (error) {
        console.error("Error fetching device ID from storage:", error);
      }
    };

    fetchDeviceId();
  }, []);

  useEffect(() => {
    if (!deviceId) return;
  
    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/get-filteredSosMessages/${deviceId}`);
        const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        setSOSMessages(sortedMessages);
        calculateWeeklyData(sortedMessages); // Calculate weekly data for the selected month
  
        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/profiles`, {
          params: { uniqueId: deviceId },
        });
        setUserDetails(userResponse.data);
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      }
    };
  
    fetchSOSMessages(); // Initial fetch
    const intervalId = setInterval(fetchSOSMessages, 1000); // Refresh every 1s
  
    return () => clearInterval(intervalId);
  }, [deviceId, selectedMonth]); // Dependency on selectedMonth

  const calculateWeeklyData = (messages) => {
    const weeks = [0, 0, 0, 0];
    messages
      .filter((msg) => new Date(msg.receivedAt).getMonth() === selectedMonth) // Ensure filtering by selected month
      .forEach((msg) => {
        const sosDate = new Date(msg.receivedAt);
        const week = Math.ceil(sosDate.getDate() / 7) - 1; // Determine the week of the month
        weeks[week] += 1;
      });
    setWeeklyData(weeks);
  };  

  const groupMessagesByDate = (messages) => {
    return messages
      .filter((msg) => new Date(msg.receivedAt).getMonth() === selectedMonth) // Filter by selected month
      .reduce((acc, message) => {
        const date = new Date(message.receivedAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {});
  };

  const groupedMessages = groupMessagesByDate(sosMessages);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getBorderColor = (message) => {
    if (!message) return '#000'; // Default black

    const words = message.toLowerCase().split(/\s+/);
    if (words.includes('last')) return '#EF4444'; // Red for "last"
    if (words.includes('safe')) return '#22C55E'; // Green for "safe"

    return '#000'; // Default black
  };

  const totalAlerts = weeklyData.reduce((sum, count) => sum + count, 0);

  const barData = weeklyData.map((value, index) => ({
    value,
    label: `${index + 1}${['st', 'nd', 'rd', 'th'][index]} week`,
    frontColor: '#FF0000',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20, paddingTop: dynamicPaddingTop }}>
      
      {/* User Details Section */}
      <View
        style={{
          backgroundColor: '#D1D5DB',
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#000',
          marginBottom: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          alignSelf: 'flex-end',
          width: '88%'
        }}
      >
        {/* Help Icon - Placed in top-right corner inside the card */}
        <View style={{ 
          position: 'absolute', 
          top: 20, 
          right: 30,
          zIndex: 1 
        }}>
          <TouchableOpacity
            onPressIn={() => setIsUserDetailsHelpPressed(true)}
            onPressOut={() => setIsUserDetailsHelpPressed(false)}
            activeOpacity={0.7}
          >
            <Icon name="help" size={17} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Hidden Info Panel */}
        <Animated.View 
          style={{
            position: 'absolute',
            top: 10, // Appears below the help icon
            right: 70,
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            zIndex: 100,
            opacity: userDetailsHelpAnim,
            transform: [{
              translateY: userDetailsHelpAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-5, 0], // Smooth slide up
              }),
            }],
            elevation: 5,
            width: '85%',
            maxWidth: 300,
          }}
          pointerEvents="none"
        >
          <Text style={{ fontSize: 14, lineHeight: 20 }}>
          Minor details of your registered profile information, which are also visible to the recipients you have added.
          </Text>
        </Animated.View>

        {/* Keep all your existing user details content */}
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
            Name:{' '}
          </Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
            {userDetails.name || 'Select a device to view details'}
          </Text>
        </View>
        {userDetails.name && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Age:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
                {userDetails.age}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Blood Type:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#4b5563' }}>
                {userDetails.bloodType}
              </Text>
            </View>
          </>
        )}
    </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
      {/* TOTAL Message */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            TOTAL:{' '}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            {totalAlerts}{' '}
          </Text>
          <Text style={{ fontSize: 20, fontStyle: 'italic', textAlign: 'center', marginBottom: 8 }}>
            Alert Messages this
          </Text>
        </View>

        {/* Month Selection Button */}
        <TouchableOpacity
          onPress={() => setIsMonthDropdownVisible(true)}
          className="flex-row items-center justify-between bg-gray-100 border border-gray-400 rounded-xl px-5 py-2 shadow-sm"
        >
          <View className="flex-row items-center space-x-2">
            <Text className="text-base text-black">
              {months[selectedMonth]}
            </Text>
          </View>
          <Icon
            name={isMonthDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        {/* Month Selection Modal */}
        <Modal
          visible={isMonthDropdownVisible}
          transparent={true}
          animationType="fade"
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setIsMonthDropdownVisible(false)}
          >
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 15,
                width: '80%',
              }}
            >
              {/* Close Button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>Select a Month</Text>
                <TouchableOpacity
                  onPress={() => setIsMonthDropdownVisible(false)}
                >
                  <Icon name="close" size={20} color="black" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={months}
                keyExtractor={(item, index) => index.toString()}
                nestedScrollEnabled={true}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMonth(index);
                      setIsMonthDropdownVisible(false);
                    }}
                    style={{
                      padding: 10,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Bar Chart */}
        <BarChart
          data={barData}
          barWidth={45}
          noOfSections={5} // Set to 5 for increments of 10 (0 to 50)
          maxValue={50} // Set the maximum value for the Y-axis
          height={220}
          frontColor="#FF0000"
          barBorderRadius={1}
          style={{ marginVertical: 8 }}
          yAxisLabelTexts={['0', '10', '20', '30', '40', '50']} // Custom Y-axis labels
        />
      </View>
    {totalAlerts === 0 && (
      <View style={{
        padding: 30,
        borderRadius: 16,
        marginTop: 5,
        backgroundColor: '#D1D5DB',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      }}>
        <Icon name="info" size={20} color="#007bff" />
        <Text style={{ fontSize: 16, fontStyle: 'italic' }}>
          No available messages for {months[selectedMonth]}
        </Text>
      </View>
    )}  
      {/* SOS Reports Section */}
      {Object.keys(groupedMessages).map((date) => (
        <View key={date} style={{ marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => toggleExpand(date)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 40,
              paddingVertical: 28,
              backgroundColor: '#D1D5DB',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#000',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3, // For Android
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon
                name={expandedDates[date] ? "arrow-drop-up" : "arrow-drop-down"}
                size={25}
                color="black"
              />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{date}</Text>
            </View>
            <View style={{ height: '150%', width: 1, backgroundColor: 'black', marginHorizontal: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={{ fontSize: 20, fontStyle: 'italic', color: 'black' }}>
                {`${groupedMessages[date].length}+`}
              </Text>
              <Icon name="error" size={25} color="red" />
            </View>
          </TouchableOpacity>

          {expandedDates[date] &&
            groupedMessages[date].map((message, index) => (
              <View
                key={index}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  marginTop: 8,
                  backgroundColor: '#D1D5DB',
                  borderWidth: 1, // Ensure border is visible
                  borderColor: getBorderColor(message.message), // Apply dynamic border color
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-sm text-gray-600">
                  {new Date(message.receivedAt).toLocaleTimeString()}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {message.name}
                </Text>
                <Text className="text-lg font-extrabold text-black mt-3">
                  {message.message}
                </Text>
                <Text className="text-sm text-gray-600 italic mt-3">
                  Coordinates: Lat {message.latitude}, Lng {message.longitude}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps?q=${message.latitude},${message.longitude}`
                    )
                  }
                  className="mt-2"
                >
                  <Text className="text-blue-500 italic underline">
                    View on Google Maps
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      ))}
      </ScrollView>
    </View>
  );
};

export default UserSOSReports;