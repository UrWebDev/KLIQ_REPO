import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const SOSMessage = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [recipientId, setRecipientId] = useState(null);

  useEffect(() => {
    const getRecipientId = async () => {
      try {
        const id = await AsyncStorage.getItem("uniqueId");
        if (id) {
          setRecipientId(id);
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
      try {
        const response = await axios.get(
          `${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`
        );
        const sortedMessages = response.data.sort(
          (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
        );
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error(
          "Error fetching SOS messages:",
          error.response || error.message
        );
      }
    };

    fetchSOSMessages(); // Initial fetch
    const intervalId = setInterval(fetchSOSMessages, 5000); // Auto-refresh every 5s

    return () => clearInterval(intervalId);
  }, [recipientId]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-center mb-6">SOS Messages</Text>
        {sosMessages.length > 0 ? (
          sosMessages.map((sos, index) => (
            <View
              key={index}
              className="bg-gray-100 p-4 mb-4 rounded-2xl shadow-md border border-gray-300"
            >
              {/* Date and Time */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs text-gray-500">
                  {sos.receivedAt
                    ? new Date(sos.receivedAt).toLocaleString()
                    : "Date not available"}
                </Text>
                <Icon name="error" size={24} color="red" />
              </View>

              {/* Sender Info */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-bold">
                    {sos.phoneNumber || "+639765786665"}
                  </Text>
                  <Text className="text-gray-600">{sos.sender || "Juan Dela Cruz"}</Text>
                </View>

                {/* Phone Call Button */}
                <TouchableOpacity
                  onPress={() => {
                    const phoneNumber = sos.phoneNumber || "+639765786665";
                    const telURL = `tel:${phoneNumber}`;

                    Linking.canOpenURL(telURL)
                      .then((supported) => {
                        if (!supported) {
                          console.error("Phone call feature is not supported");
                        } else {
                          return Linking.openURL(telURL);
                        }
                      })
                      .catch((err) => console.error("An error occurred", err));
                  }}
                  className="bg-gray-200 p-3 rounded-full"
                >
                  <Icon name="phone" size={20} color="black" />
                </TouchableOpacity>
              </View>

              {/* Message Content */}
              <Text className="text-base text-gray-800 mt-3">
                {sos.message ||
                  "I need Help! Please send help or call me on my personal phone number."}
              </Text>

              {/* User Location */}
              <View className="mt-3">
                <Text className="text-sm font-bold text-gray-600">
                  User's Location:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`
                    )
                  }
                >
                  <Text className="text-blue-500 underline">
                    {sos.location || "View Location"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-500">No SOS messages found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default SOSMessage;
