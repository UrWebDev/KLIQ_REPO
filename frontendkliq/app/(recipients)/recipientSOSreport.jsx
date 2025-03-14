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
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-gifted-charts'; // Importing BarChart from Gifted Charts

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [recipientId, setRecipientId] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isMonthDropdownVisible, setIsMonthDropdownVisible] = useState(false);

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

        const devices = [...new Set(sortedMessages.map((msg) => msg.deviceId))];
        setDeviceList(devices);

        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0]);
        }

        calculateWeeklyData(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      } finally {
        setLoading(false);
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
    if (!message) return '#e5e7eb'; // Default gray
  
    const words = message.toLowerCase().split(/\s+/);
    if (words.includes('last')) return '#FF0000'; // Red for "last"
    if (words.includes('safe')) return '#00FF00'; // Green for "safe"
  
    return '#e5e7eb'; // Default gray
  };

  const kliqUserDetails =
    sosMessages.find((msg) => msg.deviceId === selectedDevice) || {
      name: '',
      age: '',
      bloodType: '',
    };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  const totalAlerts = weeklyData.reduce((sum, count) => sum + count, 0);

  const barData = weeklyData.map((value, index) => ({
    value,
    label: `${index + 1}${['st', 'nd', 'rd', 'th'][index]} week`,
    frontColor: '#FF0000',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          style={{
            width: '100%',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            padding: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#333' }}>
            {selectedDevice ? `KLIQ USER: ${selectedDevice}` : 'Select Device'}
          </Text>
        </TouchableOpacity>

        {isDropdownVisible && (
          <FlatList
            data={deviceList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDevice(item);
                  setIsDropdownVisible(false);
                  calculateWeeklyData(sosMessages);
                }}
                style={{
                  padding: 10,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text>{`Identifier: ${item}`}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View
        style={{
          backgroundColor: '#f9fafb',
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#111827' }}>
          {kliqUserDetails.name || 'Select a device to view details'}
        </Text>
        {kliqUserDetails.name && (
          <>
            <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 4 }}>
              Age: {kliqUserDetails.age}
            </Text>
            <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 4 }}>
              Blood Type: {kliqUserDetails.bloodType}
            </Text>
          </>
        )}
      </View>

      <ScrollView>
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            TOTAL: {totalAlerts} Alert Messages this
          </Text>

          {/* Month Selection Button */}
          <TouchableOpacity
            onPress={() => setIsMonthDropdownVisible(true)}
            style={{
              width: '50%',
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              padding: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>
              {months[selectedMonth]}
            </Text>
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
              onPress={() => setIsMonthDropdownVisible(false)} // Close when tapping outside
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                }}
              >
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
            barWidth={30}
            noOfSections={5}
            height={220}
            frontColor="lightgray"
            barBorderRadius={4}
            style={{ marginVertical: 8 }}
          />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          SOS Reports
        </Text>

        {Object.keys(groupedMessages).map((date) => (
          <View key={date} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => toggleExpand(date)}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                marginBottom: 3,
                padding: 30,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#e5e7eb',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="chevron-down"
                  size={16}
                  color="black"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>
                  {date}
                </Text>
              </View>
              <Icon name="exclamation-triangle" size={20} color="red" />
            </TouchableOpacity>

            {expandedDates[date] &&
              groupedMessages[date].map((message, index) => (
                <View
                  key={index}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    marginTop: 8,
                    backgroundColor: '#f3f4f6',
                    borderWidth: message.message ? 2 : 1,
                    borderColor: getBorderColor(message.message),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>
                    {new Date(message.receivedAt).toLocaleTimeString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginTop: 8,
                    }}
                  >
                    {message.message}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginTop: 8,
                    }}
                  >
                    {message.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginTop: 8,
                    }}
                  >
                    {message.age}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginTop: 8,
                    }}
                  >
                    {message.bloodType}
                  </Text>
                  <Text style={{ color: '#6b7280', marginTop: 4 }}>
                    Location: Lat {message.latitude}, Lng {message.longitude}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps?q=${message.latitude},${message.longitude}`
                      )
                    }
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={{ color: '#3b82f6', textDecorationLine: 'underline' }}
                    >
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
