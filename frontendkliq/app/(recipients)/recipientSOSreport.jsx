import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this is installed
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-gifted-charts';
import { useRef } from 'react';

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [recipientId, setRecipientId] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isMonthDropdownVisible, setIsMonthDropdownVisible] = useState(false);
  const [isUserDetailsHelpPressed, setIsUserDetailsHelpPressed] = useState(false);
  const userDetailsHelpAnim = useRef(new Animated.Value(0)).current;

  const dropdownAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(userDetailsHelpAnim, {
      toValue: isUserDetailsHelpPressed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isUserDetailsHelpPressed, userDetailsHelpAnim]);

  useEffect(() => {
    if (isDropdownVisible) {
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
  }, [isDropdownVisible]);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    const fetchRecipientId = async () => {
      try {
        const storedRecipientId = await AsyncStorage.getItem('uniqueId');
        if (storedRecipientId) {
          setRecipientId(storedRecipientId);
        } else {
          console.error('Recipient ID not found in storage');
        }
      } catch (error) {
        console.error('Error fetching recipient ID from storage:', error);
      }
    };

    fetchRecipientId();
  }, []);

  useEffect(() => {
    if (!recipientId) return;

    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`
        );
        const sortedMessages = response.data.sort((a, b) => {
          return new Date(b.receivedAt) - new Date(a.receivedAt);
        });

        setSOSMessages(sortedMessages);

        const devices = [];
        sortedMessages.forEach((msg) => {
          if (!devices.some((device) => device.deviceId === msg.deviceId)) {
            devices.push({ deviceId: msg.deviceId, name: msg.name || 'Unknown Device' });
          }
        });

        setDeviceList(devices);

        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0].deviceId);
        }

        calculateWeeklyData(sortedMessages);
      } catch (error) {
        console.error('RECIPIENTSOSREPORT ERROR: ', error?.message, error?.response?.data);
      }
    };

    fetchSOSMessages();
    const intervalId = setInterval(fetchSOSMessages, 1000);

    return () => clearInterval(intervalId);
  }, [recipientId, selectedDevice, selectedMonth]);

  const calculateWeeklyData = (messages) => {
    const weeks = [0, 0, 0, 0];
    messages
      .filter(
        (msg) =>
          msg.deviceId === selectedDevice &&
          new Date(msg.receivedAt).getMonth() === selectedMonth
      )
      .forEach((msg) => {
        const sosDate = new Date(msg.receivedAt);
        const week = Math.ceil(sosDate.getDate() / 7) - 1;
        weeks[week] += 1;
      });
    setWeeklyData(weeks);
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.receivedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(
    sosMessages.filter(
      (msg) =>
        msg.deviceId === selectedDevice &&
        new Date(msg.receivedAt).getMonth() === selectedMonth
    )
  );

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

  const kliqUserDetails =
    sosMessages.find((msg) => msg.deviceId === selectedDevice) || {
      name: '',
      phoneNUM: '',
      deviceId: '',
    };

  // if (loading) {
  //   return <ActivityIndicator size="large" />;
  // }

  const totalAlerts = weeklyData.reduce((sum, count) => sum + count, 0);

  const barData = weeklyData.map((value, index) => ({
    value,
    label: `${index + 1}${['st', 'nd', 'rd'][index] || 'th'} week`,
    frontColor: '#FF0000',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 60, paddingHorizontal: 20 }}>
      
      {/* Device Selection Button */}
    <View className="relative ml-[11%] mr-0 pr-1 mb-4">
      <TouchableOpacity
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
        className="flex-row items-center justify-between bg-gray-100 border border-gray-400 rounded-2xl px-4 py-3 shadow-sm w-full"
      >
        <View className="flex-row items-center space-x-2">
          <Icon name="person-outline" size={20} color="black" />
          <Text className="font-extrabold text-base text-black">
            {String(deviceList.find((d) => d.deviceId === selectedDevice)?.name || "Unknown Device")}
          </Text>
        </View>
        <Icon
          name={isDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color="black"
        />
      </TouchableOpacity>

      {/* Animated Dropdown List */}
      {isDropdownVisible && (
        <Animated.View
          className="absolute left-7 right-7 z-50 bg-white border border-gray-300 rounded-2xl shadow-sm"
          style={{
            top: '120%',
            opacity: dropdownAnim,
            transform: [
              {
                translateY: dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0], // Slide down effect
                }),
              },
            ],
          }}
        >
          {deviceList.length > 0 ? (
            deviceList.map((device, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedDevice(device.deviceId);
                  setIsDropdownVisible(false);
                  calculateWeeklyData(sosMessages);
                }}
                className="p-3 border-b border-gray-200 last:border-b-0"
              >
                <Text className="text-black">{String(device.name || "Unknown Device")}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="p-3">
              <Text className="text-black italic">No users found.</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>

      {/* User Details Section */}
      <View style={{ 
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
      }}>
        {/* Help Icon Container - absolute positioned */}
        <View style={{ 
          position: 'absolute', 
          top: 20, 
          right: 30,
          zIndex: 1 // Ensure it stays above other elements
        }}>
          <TouchableOpacity
            onPressIn={() => setIsUserDetailsHelpPressed(true)}
            onPressOut={() => setIsUserDetailsHelpPressed(false)}
            activeOpacity={0.7}
          >
            <Icon name="help" size={17} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Info Panel - absolute positioned */}
        <Animated.View style={{
          position: 'absolute',
          top: 10, // Adjusted to appear below the icon
          right: 60,
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
              outputRange: [-5, 0], // Smoother slide
            }),
          }],
          elevation: 5,
          width: '85%',
          maxWidth: 300,
        }}>
          <Text style={{ fontSize: 14, lineHeight: 20 }}>
            User details help identify who sent the SOS and show up automatically when you pick a device above.
          </Text>
        </Animated.View>
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
            Name:{' '}
          </Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
            {kliqUserDetails.name || 'Select a device to view details'}
          </Text>
        </View>
        {kliqUserDetails.name && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                {`${kliqUserDetails.name}'s Number`}:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
                {kliqUserDetails.phoneNUM}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Device Number:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#4b5563' }}>
                {kliqUserDetails.deviceId}
              </Text>
            </View>
          </>
          
        )}
      </View>
            {/* <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Phone Number:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#4b5563' }}>
                {kliqUserDetails.phoneNUM}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Kliq Sim Number:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#4b5563' }}>
                {kliqUserDetails.deviceId}
              </Text>
            </View> */}
      <ScrollView>
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
        marginTop: 3,
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

export default RecipientSOSReports;