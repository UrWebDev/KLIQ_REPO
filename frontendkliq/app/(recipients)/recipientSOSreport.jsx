import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [recipientId, setRecipientId] = useState(null);
  const [deviceList, setDeviceList] = useState([]); // List of unique device IDs
  const [selectedDevice, setSelectedDevice] = useState(''); // Selected device for filtering

  useEffect(() => {
    const fetchRecipientId = async () => {
      try {
        const storedRecipientId = await AsyncStorage.getItem('uniqueId');
        if (storedRecipientId) {
          setRecipientId(storedRecipientId);
        } else {
          console.error("Recipient ID not found in storage");
        }
      } catch (error) {
        console.error("Error fetching recipient ID from storage:", error);
      }
    };

    fetchRecipientId();
  }, []);

  useEffect(() => {
    if (!recipientId) return;

    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`);
        const sortedMessages = response.data.sort((a, b) => {
          return new Date(b.receivedAt) - new Date(a.receivedAt);
        });

        setSOSMessages(sortedMessages);

        // Extract unique device IDs
        const devices = [...new Set(sortedMessages.map((msg) => msg.deviceId))];
        setDeviceList(devices);

        // Automatically select the first device
        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0]);
        }
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      }
    };

    fetchSOSMessages(); // Initial fetch
    const intervalId = setInterval(fetchSOSMessages, 1000); // Refresh every second

    return () => clearInterval(intervalId);
  }, [recipientId, selectedDevice]);

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
    sosMessages.filter((msg) => msg.deviceId === selectedDevice) // Filter by selected device
  );

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const containsLastWord = (message) => {
    if (!message) return false;
    return message.toLowerCase().split(/\s+/).includes("last");
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      {/* Device Selector */}
      <View style={{ marginBottom: 16 }}>
        <Picker
          selectedValue={selectedDevice}
          onValueChange={(itemValue) => setSelectedDevice(itemValue)}
          style={{
            width: '100%',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            padding: 10,
          }}
        >
          {deviceList.map((device) => (
            <Picker.Item key={device} label={`Identifier: ${device}`} value={device} />
          ))}
        </Picker>
      </View>

      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
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
                <Icon name="chevron-down" size={16} color="black" style={{ marginRight: 8 }} />
                <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>
                  {date}
                </Text>
              </View>
              <Icon name="exclamation-triangle" size={20} color="red" />
            </TouchableOpacity>

            {expandedDates[date] ? (
              groupedMessages[date].map((message, index) => (
                <View
                  key={index}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    marginTop: 8,
                    backgroundColor: '#f3f4f6',
                    borderWidth: containsLastWord(message.message) ? 2 : 1,
                    borderColor: containsLastWord(message.message) ? '#FF0000' : '#e5e7eb',
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
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
                    {message.message}
                  </Text>
                  <Text style={{ color: '#6b7280', marginTop: 4 }}>
                    Location: Lat {message.latitude}, Lng {message.longitude}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)
                    }
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }}>
                      View on Google Maps
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RecipientSOSReports;