import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from "@env";

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipients/get-received-sosMessage`);
        setSOSMessages(response.data);
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSMessages();
  }, []);

  // Group SOS messages by date
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
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-3xl font-bold mb-4">SOS Reports</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          {Object.keys(groupedMessages).map((date) => (
            <View key={date} className="mb-4">
              <TouchableOpacity
                onPress={() => toggleExpand(date)}
                className="bg-blue-500 rounded-lg p-4 flex-row justify-between items-center"
              >
                <Text className="text-white font-bold">{date}</Text>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              {expandedDates[date] &&
                groupedMessages[date].map((message, index) => (
                  <View
                    key={index}
                    className="bg-white p-4 border border-gray-300 mt-2 rounded-lg"
                  >
                    <Text className="text-gray-500 text-sm">
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>
                    <Text className="text-lg font-semibold">{message.message}</Text>
                    <Text className="text-gray-700 mt-2">
                      Location: Lat {message.latitude}, Lng {message.longitude}
                    </Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)}
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
