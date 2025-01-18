import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOSMessage = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState(null);

  useEffect(() => {
    const getRecipientId = async () => {
      try {
        const id = await AsyncStorage.getItem('uniqueId');
        if (id) {
          setRecipientId(id); // Set recipientId from AsyncStorage
        }
      } catch (error) {
        console.error("Error retrieving uniqueId from AsyncStorage:", error);
      }
    };

    getRecipientId();
  }, []);

  useEffect(() => {
    if (!recipientId) return;

    const fetchSOSMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`);
        const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error.response || error.message);
      } finally {
        setLoading(false);
      }
    };

    // Refresh the messages every 1 second
    const intervalId = setInterval(fetchSOSMessages, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [recipientId]);

  // Function to check if the message contains the word "last"
  const containsWordLast = (message) => {
    if (!message) return false;
    return message.toLowerCase().includes("last");
  };

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-4">Loading SOS Messages...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Text className="text-2xl font-bold text-center mb-4">SOS Messages</Text>
          {sosMessages.length > 0 ? (
            sosMessages.map((sos, index) => (
              <View
                key={index}
                className={`p-4 mb-4 rounded-xl shadow-sm border-2 ${
                  containsWordLast(sos.message)
                    ? 'bg-red-600 border-red-400'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                <Text className="text-gray-500 text-xs">
                  {sos.receivedAt ? new Date(sos.receivedAt).toLocaleString() : 'Date not available'}
                </Text>
                <Text className="text-lg font-bold mt-2">{sos.message}</Text>
                <Text className="text-gray-700 mt-2">
                  Location: Lat {sos.latitude}, Lng {sos.longitude}
                </Text>
                <Text className="text-gray-700 mt-2">
                  From: {sos.deviceId || 'Unknown Device'}
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`)}
                  className="mt-2"
                >
                  <Text className="text-blue-500 underline">View on Google Maps</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500">No SOS messages found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SOSMessage;
