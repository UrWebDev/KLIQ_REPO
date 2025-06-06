import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  Animated,
  Platform,
  AppState,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const SOSMessage = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [recipientId, setRecipientId] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [newMessagesMap, setNewMessagesMap] = useState({});
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const lastSeenTimestampsRef = useRef({});
  const lastFetchedTimestampRef = useRef(0);
  const dropdownAnim = useState(new Animated.Value(0))[0];
  const soundRef = useRef(null);
  const pushTokenRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Configure notifications on mount
  useEffect(() => {
    const configureNotifications = async () => {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Android-specific channel configuration
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('sos-alerts', {
          name: 'SOS Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'alert.mp3',
        });
      }
    };

    configureNotifications();
  }, []);

  // App state tracking
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  // Register for push notifications
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === "granted") {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          pushTokenRef.current = token;
          const id = await AsyncStorage.getItem("uniqueId");
          if (id) {
            await axios.post(`${API_URL}/register-push-token`, {
              userId: id,
              token,
            });
          }
        } else {
          console.warn("Push notification permissions not granted");
        }
      } else {
        console.warn("Must use a physical device for push notifications");
      }
    };
    registerForPushNotifications();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Dropdown animation
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: isDropdownVisible ? 1 : 0,
      duration: isDropdownVisible ? 200 : 150,
      useNativeDriver: true,
    }).start();
  }, [isDropdownVisible]);

  useEffect(() => {
    const loadRecipientId = async () => {
      const id = await AsyncStorage.getItem("uniqueId");
      if (id) setRecipientId(id);
    };
    loadRecipientId();
  }, []);

  useEffect(() => {
    const loadLastSeenTimestamps = async () => {
      const data = await AsyncStorage.getItem("lastSeenTimestamps");
      if (data) {
        lastSeenTimestampsRef.current = JSON.parse(data);
      }
    };
    loadLastSeenTimestamps();
  }, []);

  // Main polling logic
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
        const latestMessage = sortedMessages[0];
        const latestTimestamp = new Date(latestMessage?.receivedAt || 0).getTime();

        if (latestTimestamp > lastFetchedTimestampRef.current) {
          // Play sound only when app is in foreground
          if (initialFetchDone && appState.current === 'active') {
            const { sound } = await Audio.Sound.createAsync(
              require("../../assets/alert.mp3")
            );
            soundRef.current = sound;
            await sound.playAsync();

                      // Always show notification (works in background/closed)
          const notificationBody = latestMessage.message || "New SOS alert received.";
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `New SOS from ${latestMessage.name || "Unknown Device"}`,
              body: notificationBody,
              data: latestMessage,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              channelId: 'sos-alerts',
            },
            trigger: null,
          });
          }

          lastFetchedTimestampRef.current = latestTimestamp;
          setSOSMessages(sortedMessages);

          const devices = sortedMessages.reduce((acc, msg) => {
            if (!acc.some((d) => d.deviceId === msg.deviceId)) {
              acc.push({ deviceId: msg.deviceId, name: msg.name || "Unknown Device" });
            }
            return acc;
          }, []);
          setDeviceList(devices);

          if (devices.length > 0 && !selectedDevice) {
            setSelectedDevice(devices[0].deviceId);
          }

          const updatedMap = { ...newMessagesMap };
          devices.forEach((device) => {
            const deviceMessages = sortedMessages.filter(
              (msg) => msg.deviceId === device.deviceId
            );
            const newMessages = deviceMessages.filter((msg) => {
              const latestTime = new Date(msg.receivedAt).getTime();
              const lastSeen = lastSeenTimestampsRef.current[device.deviceId] || 0;
              return latestTime > lastSeen;
            });
            updatedMap[device.deviceId] = newMessages.length || 0;
          });
          setNewMessagesMap(updatedMap);
          setInitialFetchDone(true);
        }
      } catch (error) {
        console.error("Error fetching SOS messages:", error.response || error.message);
      }
    };

    fetchSOSMessages();
    const intervalId = setInterval(fetchSOSMessages, 5000);
    return () => clearInterval(intervalId);
  }, [recipientId, initialFetchDone]);

  const handleDeviceSelect = async (deviceId) => {
    setSelectedDevice(deviceId);
    setDropdownVisible(false);
    setNewMessagesMap((prev) => ({ ...prev, [deviceId]: false }));
    const latestMessage = sosMessages.find((msg) => msg.deviceId === deviceId);
    if (latestMessage) {
      lastSeenTimestampsRef.current[deviceId] = new Date(latestMessage.receivedAt).getTime();
      await AsyncStorage.setItem(
        "lastSeenTimestamps",
        JSON.stringify(lastSeenTimestampsRef.current)
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 60, paddingHorizontal: 20 }}>
      {/* Dropdown Selection Button */}
      <View className="relative ml-[11%] mr-0 pr-1 mb-4">
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
          <View className="flex-row items-center space-x-2">
            {Object.values(newMessagesMap).some(count => count > 0) && (
              <View className="relative w-5 h-5 rounded-full bg-red-500 mr-1 flex justify-center items-center">
                <Text className="text-xs text-white font-bold">
                  {
                    Object.values(newMessagesMap).reduce((total, count) => total + count, 0)
                  }
                </Text>
              </View>
            )}
            <Icon
              name={isDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color="black"
            />
          </View>
        </TouchableOpacity>

        {/* Animated Dropdown List */}
        <Animated.View
          className="absolute left-7 right-7 z-50 bg-white border border-gray-300 rounded-2xl shadow-sm"
          style={{
            top: "120%",
            opacity: dropdownAnim,
            transform: [
              {
                translateY: dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
            display: isDropdownVisible ? 'flex' : 'none',
          }}
        >
          {deviceList.length > 0 ? (
            deviceList.map((device, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDeviceSelect(device.deviceId)}
                className="p-3 border-b border-gray-200 last:border-b-0"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black">
                    {String(device.name || "Unknown Device")}
                  </Text>
                  {newMessagesMap[device.deviceId] > 0 && (
                    <View className="relative w-5 h-5 rounded-full bg-red-500 ml-2 flex justify-center items-center">
                      <Text className="text-xs text-white font-bold">
                        {newMessagesMap[device.deviceId]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="p-3">
              <Text className="text-black italic">No users found.</Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* SOS Messages */}
      <ScrollView className="flex-1 p-4 -mt-2">
        {sosMessages.length > 0 ? (
          sosMessages
            .filter((sos) => sos.deviceId === selectedDevice)
            .map((sos, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row items-center ml-5 mb-2">
                  <Text className="text-lg font-black ml-1">
                    {sos.receivedAt
                      ? new Date(sos.receivedAt).toLocaleString()
                      : "Date not available"}
                  </Text>
                  <Icon name="error" size={23} color="red" style={{ marginLeft: 5 }} />
                </View>

                <View
                  className={`bg-gray-300 p-5 rounded-3xl border ${
                    sos.message && sos.message.toLowerCase().includes("last")
                      ? "border-red-500"
                      : sos.message && sos.message.toLowerCase().includes("safe")
                      ? "border-green-500"
                      : "border-black-500"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-xl font-extrabold ml-2 tracking-wider">
                        {sos.phoneNUM || "+63 9765 786 665"}
                      </Text>
                      <Text className="text-gray-600 ml-3 italic">
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
                    <Text className="font-extrabold ml-2 text-gray-600">
                      {`${sos.name}'s Location:`}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(
                          `http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`
                        )
                      }
                    >
                      <Text className="text-blue-500 italic underline m-1">
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