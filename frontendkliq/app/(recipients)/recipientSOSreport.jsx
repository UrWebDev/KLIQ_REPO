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

  const containsLastWord = (message) => {
    if (!message) return false;
    const words = message.trim().toLowerCase().split(/\s+/);
    return words.includes('last');
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          <Text className="text-2xl font-bold text-center mb-4">SOS Reports</Text>

          {Object.keys(groupedMessages).map((date) => (
            <View key={date} className="mb-2">
              <TouchableOpacity
                onPress={() => toggleExpand(date)}
                className="bg-white rounded-xl mb-2 p-4 border-2 border-blue-500 shadow-sm flex-row justify-between items-center"
              >
                <Text className="text-gray-800 font-bold">{date}</Text>
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>

              {expandedDates[date] &&
                groupedMessages[date].map((message, index) => (
                  <View
                    key={index}
                    className={`p-4 border mt-2 rounded-xl shadow-sm ${
                      containsLastWord(message.message)
                        ? 'bg-red-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text className="text-gray-500 text-xs">
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>
                    <Text className="text-lg font-bold mt-2 text-gray-800">{message.message}</Text>
                    <Text className="text-gray-600 mt-2">
                      Location: Lat {message.latitude}, Lng {message.longitude}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)
                      }
                      className="mt-2"
                    >
                      <Text className="text-blue-500 underline">View on Google Maps</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default RecipientSOSReports;