import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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
      {/* <Text className="text-3xl font-bold mb-4">SOS Reports</Text> */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          {Object.keys(groupedMessages).map((date) => (
            <View key={date} className="mb-2">
              <TouchableOpacity
                onPress={() => toggleExpand(date)}
                className="bg-gray-100 rounded-2xl mb-2 p-9 border border-gray-300 shadow-md relative flex-row justify-between items-center"
              >
                <Text className="text-gray-900 font-bold">{date}</Text>
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>
              {expandedDates[date] ? (
                groupedMessages[date].map((message, index) => (
                  <View key={index} className="bg-gray-100 p-6 border border-gray-300 mt-2 rounded-lg shadow-md">
                    <Text className="text-gray-500 text-sm">
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>
                    <Text className="text-lg font-extrabold">{message.message}</Text>
                    <Text className="text-gray-700 mt-2">
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