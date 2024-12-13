import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from '@env';

// FilteredSOSMessages Component
const FilteredSOSMessages = ({ recipientId }) => {
  const [filteredSOSMessages, setFilteredSOSMessages] = useState([]);

  useEffect(() => {
    const fetchSOSMessages = async () => {
      if (!recipientId) {
        console.error("Recipient ID is not defined");
        setLoading(false);  // Set loading to false if no recipientId
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`);
        const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error.response || error.message);
      } finally {
        setLoading(false);  // Set loading to false after fetch
      }
    };

    if (recipientId) {
      fetchSOSMessages();
    }
  }, [recipientId]);


  return (
    <View>
      {filteredSOSMessages.length > 0 ? (
        filteredSOSMessages.map((sos, index) => (
          <View key={index} className="bg-gray-100 rounded-3xl mb-4 p-6 border-2 border-gray-300 shadow-md relative">
            <Text className="text-gray-500 text-sm">
              {sos.receivedAt ? new Date(sos.receivedAt).toLocaleString() : 'Date not available'}
            </Text>
            <Text className="text-lg font-extrabold mt-3">{sos.message}</Text>
            <Text className="text-gray-700 mt-2">
              Location: Lat {sos.latitude}, Lng {sos.longitude}
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
        <Text className="text-center text-gray-500">No filtered SOS messages found.</Text>
      )}
    </View>
  );
};

// Main SOSMessage Component
const SOSMessage = ({ recipientId }) => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSOSMessages = async () => {
      if (!recipientId) {
        console.error("Recipient ID is not defined");
        setLoading(false);  // Set loading to false if no recipientId
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`);
        const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error.response || error.message);
      } finally {
        setLoading(false);  // Set loading to false after fetch
      }
    };

    if (recipientId) {
      fetchSOSMessages();
    }
  }, [recipientId]);

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-4">Loading SOS Messages...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Text className="text-3xl font-extrabold text-center mb-4">SOS Messages</Text>
          {sosMessages.length > 0 ? (
            sosMessages.map((sos, index) => (
              <View key={index} className="bg-gray-100 rounded-3xl mb-4 p-6 border-2 border-gray-300 shadow-md relative">
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm">
                    {sos.receivedAt ? new Date(sos.receivedAt).toLocaleString() : 'Date not available'}
                  </Text>
                  <Icon name="exclamation-triangle" size={15} color="red" style={{ marginLeft: 10 }} />
                </View>
                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-lg font-extrabold">{sos.message}</Text>
                </View>
                <Text className="text-gray-700 mt-2">
                  Location: Lat {sos.latitude}, Lng {sos.longitude}
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

          {/* Display filtered SOS messages for a specific recipient */}
          {recipientId && <FilteredSOSMessages recipientId={recipientId} />}
        </ScrollView>
      )}
    </View>
  );
};

export default SOSMessage;
