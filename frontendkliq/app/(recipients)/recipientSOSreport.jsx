import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env"; // Use your .env file for API_URL

const RecipientSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]); // State for storing SOS messages
  const [loading, setLoading] = useState(true); // State for loading spinner
  const [expandedDates, setExpandedDates] = useState({}); // Track expanded/collapsed state of each date
  const [recipientId, setRecipientId] = useState(null);  // Store recipientId for current user

  // Fetch recipientId dynamically, for example, from an authentication context
  useEffect(() => {
    const fetchRecipientId = async () => {
      // Assuming the recipientId is fetched from a global state or authentication context
      // Here, it's manually set for this example. Replace with actual method to fetch recipientId
      setRecipientId('someRecipientId'); // Example static ID, replace with actual method
    };

    fetchRecipientId();
  }, []); // Empty dependency array ensures this runs once when component mounts

  // Fetch SOS messages when recipientId changes
  useEffect(() => {
    if (!recipientId) return; // Don't fetch if recipientId is not available

    const fetchSOSMessages = async () => {
      try {
        // Call backend API to get SOS messages for the specific recipient
        const response = await axios.get(`${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`);

        // Sort messages by received time in descending order
        const sortedMessages = response.data.sort((a, b) => {
          return new Date(b.receivedAt) - new Date(a.receivedAt);
        });

        setSOSMessages(sortedMessages); // Set the SOS messages into state
      } catch (error) {
        console.error('Error fetching SOS messages:', error); // Log any errors from the API call
      } finally {
        setLoading(false); // Stop the loading spinner after data is fetched or error occurs
      }
    };

    fetchSOSMessages(); // Invoke the function to fetch SOS messages
  }, [recipientId]); // Re-run effect when recipientId changes

  // Group SOS messages by date for better presentation
  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.receivedAt).toLocaleDateString(); // Format receivedAt to date string
      if (!acc[date]) {
        acc[date] = []; // Create a new array if this date doesn't exist in accumulator
      }
      acc[date].push(message); // Push the message into the appropriate date group
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(sosMessages); // Group messages by date

  // Toggle the expansion/collapse of messages for a specific date
  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date], // Toggle the expanded state for the given date
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 16 }}>
      {/* Display a loading spinner while fetching SOS messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          {/* Header title */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
            SOS Reports
          </Text>

          {/* Iterate over the grouped messages to render each date */}
          {Object.keys(groupedMessages).map((date) => (
            <View key={date} style={{ marginBottom: 8 }}>

              {/* Date header, clickable to toggle expanded view */}
              <TouchableOpacity
                onPress={() => toggleExpand(date)} // Toggle expand/collapse on date click
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
                {/* Date display */}
                <Text style={{ color: '#1f2937', fontWeight: 'bold' }}>{date}</Text>

                {/* SOS alert icon */}
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>

              {/* Render messages for the specific date if expanded */}
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
                    {/* Display received time */}
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>

                    {/* SOS message content */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                      {message.message}
                    </Text>

                    {/* Location information */}
                    <Text style={{ color: '#374151', marginTop: 8 }}>
                      Location: Lat {message.latitude}, Lng {message.longitude}
                    </Text>

                    {/* Link to view location on Google Maps */}
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
