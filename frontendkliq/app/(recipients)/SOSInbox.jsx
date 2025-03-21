import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  Animated,
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

  const dropdownAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (isDropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isDropdownVisible]);

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
    <View className="flex-1 p-5" style={{ backgroundColor: "white" }}>
      {/* Dropdown Selection Button */}
      <View className="relative mt-10 ml-[11%] mr-0 pr-1 mb-4">
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)}
          className="flex-row items-center justify-between bg-gray-100 border border-gray-400 rounded-2xl px-4 py-3 shadow-sm w-full"
        >
          <View className="flex-row items-center space-x-2">
            <Icon name="person-outline" size={20} color="black" />
            <Text className="font-extrabold text-base text-black">
              {String(
                deviceList.find((d) => d.deviceId === selectedDevice)?.name ||
                  "Unknown Device"
              )}
            </Text>
          </View>
          <Icon
            name={isDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        {/* Animated Dropdown List */}
        {isDropdownVisible && (
          <Animated.View
            className="absolute left-7 right-7 z-50 bg-white border border-gray-300 rounded-2xl shadow-sm"
            style={{
              top: "120%",
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0], // Slide down effect
                  }),
                },
              ],
            }}
          >
            {deviceList.map((device, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedDevice(device.deviceId);
                  setDropdownVisible(false);
                }}
                className="p-3 border-b border-gray-200 last:border-b-0"
              >
                <Text className="text-black">
                  {String(device.name || "Unknown Device")}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      {/* SOS Messages */}
      <ScrollView className="flex-1 p-4 -mt-2">
        {sosMessages.length > 0 ? (
          sosMessages
            .filter((sos) => sos.deviceId === selectedDevice)
            .map((sos, index) => (
              <View key={index} className="mb-4">
                {/* Timestamp with Red Triangle Exclamation Point */}
                <View className="flex-row items-center ml-5 mb-2">
                  <Icon name="error" size={20} color="red" />
                  <Text className="text-lg font-black ml-1">
                    {sos.receivedAt
                      ? new Date(sos.receivedAt).toLocaleString()
                      : "Date not available"}
                  </Text>
                </View>

                {/* SOS Message Container */}
                <View
                  className={`bg-gray-300 p-4 rounded-3xl border ${
                    sos.message && sos.message.toLowerCase().includes("last")
                      ? "border-red-500"
                      : sos.message && sos.message.toLowerCase().includes("safe")
                      ? "border-green-500"
                      : "border-black-300"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4, // For Android
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-lg font-bold ml-2 tracking-wider">
                        {sos.phoneNUM || "+63 9765 786 665"}
                      </Text>
                      <Text className="text-gray-600 ml-2 italic">
                        {sos.name || "Juan Dela Cruz"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const phoneNumber = sos.phoneNumber || "+63 9765 786 665";
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
                      className="p-3 rounded-full"
                    >
                      <Icon name="phone" size={29} color="black" />
                    </TouchableOpacity>
                  </View>
                  <Text className="tracking-tighter text-xl ml-2 text-gray-800 mt-5 mb-5 font-extrabold">
                    {sos.message}
                  </Text>
                  <View className="mt-3">
                    <Text className="text-lg font-bold ml-2 text-gray-600">
                      User's Location:
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(
                          `http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`
                        )
                      }
                    >
                      <Text className="text-blue-400 italic underline m-1">
                        {sos.location || "Click Here to see location!"}
                      </Text>
                    </TouchableOpacity>
                  </View>
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