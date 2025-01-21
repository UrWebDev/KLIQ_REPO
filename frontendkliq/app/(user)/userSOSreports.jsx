import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env"; // Use your .env file for API_URL
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem('uniqueId');
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          console.error("Recipient ID not found in storage");
        }
      } catch (error) {
        console.error("Error fetching recipient ID from storage:", error);
      }
    };

    fetchDeviceId();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/get-filteredSosMessages/${deviceId}`);
        const sortedMessages = response.data.sort((a, b) => {
          return new Date(b.receivedAt) - new Date(a.receivedAt);
        });
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSMessages();
  }, [deviceId]);

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

  const groupedMessages = groupMessagesByDate(sosMessages);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const containsLastWord = (message) => {
    if (!message) return false;
    return String(message).toLowerCase().split(/\s+/).includes("last");
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}> 
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
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
                      borderWidth: 2,
                      borderColor: containsLastWord(message.message) ? '#FF0000' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>

                    {message.message ? (
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
                        {String(message.message)}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
                        (No Message)
                      </Text>
                    )}

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
      )}
    </View>
  );
};

export default UserSOSReports;