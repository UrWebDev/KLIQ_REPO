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
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility

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

        // Extract unique device IDs
        const devices = [...new Set(sortedMessages.map((msg) => msg.deviceId))];
        setDeviceList(devices);

        // Set default device
        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0]);
        }
      } catch (error) {
        console.error(
          "Error fetching SOS messages:",
          error.response || error.message
        );
      }
    };

    fetchSOSMessages(); // Initial fetch
    const intervalId = setInterval(fetchSOSMessages, 1000); // Auto-refresh every second

    return () => clearInterval(intervalId);
  }, [recipientId, selectedDevice]);

  return (
    <View className="flex-1 bg-white">
      {/* Device Selection Button */}
      <View className="p-4">
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)} // Toggle dropdown visibility
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: "#000" }}>
            {selectedDevice
              ? `KLIQ User: ${selectedDevice}`
              : "Select a device"}
          </Text>
        </TouchableOpacity>

        {/* Dropdown List */}
        {isDropdownVisible && (
          <View
            style={{
              position: "absolute",
              top: 50, // Adjusted to ensure the dropdown appears below the button
              left: 10,
              right: 10,
              backgroundColor: "white",
              borderRadius: 8,
              padding: 10,
              elevation: 5,
              zIndex: 1000, // Increased zIndex to bring it to the front
            }}
          >
            {deviceList.map((device, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedDevice(device);
                  setDropdownVisible(false); // Close dropdown after selection
                }}
                style={{
                  padding: 15,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 16 }}>{`Identifier: ${device}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* SOS Messages */}
      <ScrollView
        className="flex-1 p-4"
        style={{
          marginTop: isDropdownVisible ? 90 : 0, // Add margin top when dropdown is visible
        }}
      >
        <Text className="text-2xl font-bold text-center mb-6">SOS Messages</Text>
        {sosMessages.length > 0 ? (
          sosMessages
            .filter((sos) => sos.deviceId === selectedDevice) // Filter by selected device
            .map((sos, index) => (
              <View
                key={index}
                className={`bg-gray-100 p-4 mb-4 rounded-2xl shadow-md border ${
                  sos.message && sos.message.toLowerCase().includes("last")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs text-gray-500">
                    {sos.receivedAt
                      ? new Date(sos.receivedAt).toLocaleString()
                      : "Date not available"}
                  </Text>
                  <Icon name="error" size={24} color="red" />
                </View>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-bold">
                      {sos.phoneNUM || "+639765786665"}
                    </Text>
                    <Text className="text-gray-600">
                      {sos.name || "Juan Dela Cruz"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const phoneNumber = sos.phoneNumber || "+639765786665";
                      const telURL = `tel:${phoneNumber}`;
                      Linking.canOpenURL(telURL)
                        .then((supported) => {
                          if (!supported) {
                            console.error("Phone call not supported");
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
                <Text className="text-base text-gray-800 mt-3 font-bold">
                  {sos.message}
                </Text>
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
