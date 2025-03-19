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
  const [isDropdownVisible, setDropdownVisible] = useState(false);

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

        const devices = sortedMessages.reduce((acc, msg) => {
          if (!acc.some((d) => d.deviceId === msg.deviceId)) {
            acc.push({ deviceId: msg.deviceId, name: msg.name || "Unknown Device" });
          }
          return acc;
        }, []);
        
        setDeviceList(devices);

        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0].deviceId); // Set the first deviceId instead of "Unknown Device"
        }        
      } catch (error) {
        console.error(
          "Error fetching SOS messages:",
          error.response || error.message
        );
      }
    };

    fetchSOSMessages();
    const intervalId = setInterval(fetchSOSMessages, 1000);

    return () => clearInterval(intervalId);
  }, [recipientId, selectedDevice]);

  return (
    <View className="flex-1 bg-white">
      {/* Device Dropdown */}
      <View className="p-4 relative z-50">
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)}
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="person" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: "#000", fontWeight: "600" }}>
  {selectedDevice
    ? deviceList.find((d) => d.deviceId === selectedDevice)?.name ||
      deviceList[0]?.name || "Loading..."
    : "Select Device"}
</Text>

          </View>
          <Icon
            name={isDropdownVisible ? "arrow-drop-up" : "arrow-drop-down"}
            size={24}
            color="#000"
          />
        </TouchableOpacity>

        {isDropdownVisible && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 10,
              marginTop: 5,
              borderWidth: 1,
              borderColor: "#ccc",
              elevation: 3,
            }}
          >
{deviceList.map((device, index) => (
  <TouchableOpacity
    key={index}
    onPress={() => {
      setSelectedDevice(device.deviceId); // Still stores `deviceId`
      setDropdownVisible(false);
    }}
    style={{
      paddingVertical: 10,
      paddingHorizontal: 5,
    }}
  >
    <Text style={{ fontSize: 14, color: "#333" }}>
      {device.name} {/* Show Name instead of deviceId */}
    </Text>
  </TouchableOpacity>
))}

          </View>
        )}
      </View>

      {/* SOS Messages */}
      <ScrollView className="flex-1 p-4 -mt-2">
        {sosMessages.length > 0 ? (
          sosMessages
            .filter((sos) => sos.deviceId === selectedDevice)
            .map((sos, index) => (
              <View
                key={index}
                className={`bg-gray-100 p-4 mb-4 rounded-2xl shadow-md border ${
                  sos.message && sos.message.toLowerCase().includes("last")
                    ? "border-red-500"
                    : sos.message && sos.message.toLowerCase().includes("safe")
                    ? "border-green-500"
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
                      Linking.openURL(telURL)
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
                      {sos.location || "Click Here to see my location!"}
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