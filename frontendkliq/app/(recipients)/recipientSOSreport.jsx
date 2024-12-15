import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env"; // Use your .env file for API_URL
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [recipientId, setRecipientId] = useState(null);

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
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSMessages();
  }, [recipientId]);

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

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 16 }}>
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
                  marginBottom: 8,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#1f2937', fontWeight: 'bold' }}>{date}</Text>
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>

              {expandedDates[date] ? (
                groupedMessages[date].map((message, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      marginTop: 8,
                      borderRadius: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                      {message.message}
                    </Text>
                    <Text style={{ color: '#374151', marginTop: 8 }}>
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

export default RecipientSOSReports;