import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Linking,
  Animated,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL } from "@env";
import { NativeWindStyleSheet } from "nativewind";

const BASE_URL = `${API_URL}/recipients`;

const Hotlines = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("N/A");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [allMessages, setAllMessages] = useState([]);

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
    const fetchRecipientId = async () => {
      const id = await AsyncStorage.getItem("uniqueId");
      if (id) setRecipientId(id);
    };
    fetchRecipientId();
  }, []);

  useEffect(() => {
    if (recipientId) {fetchContacts();fetchUserPhoneNumber();}
  }, [recipientId]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getAllEmergencyContacts`, {
        params: { recipientId },
      });
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchUserPhoneNumber = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/recipients/get-filteredReceived-sosMessages/${recipientId}`
      );
  
      if (response.data && response.data.length > 0) {
        const devices = response.data.reduce((acc, msg) => {
          if (!acc.some((device) => device.deviceId === msg.deviceId)) {
            acc.push({ 
              deviceId: msg.deviceId, 
              name: msg.name || "Unknown Device"
            });
          }
          return acc;
        }, []);
  
        setDeviceList(devices);
        setAllMessages(response.data);
        
        if (devices.length > 0) {
          setSelectedDevice(devices[0].deviceId);
          handleDeviceChange(devices[0].deviceId, response.data);
        }        
      }
    } catch (error) {
      console.error("Error fetching user phone number:", error);
      setUserPhoneNumber("N/A");
    }
  };
  
  const handleDeviceChange = (deviceId, messages = allMessages) => {
    setSelectedDevice(deviceId);
    setDropdownVisible(false);
  
    const filteredByDevice = messages.filter(
      (sos) => sos.deviceId === deviceId
    );
  
    if (filteredByDevice.length > 0) {
      const latestPhoneNumber = filteredByDevice[filteredByDevice.length - 1].phoneNUM;
      setUserPhoneNumber(latestPhoneNumber);
    } else {
      setUserPhoneNumber("N/A");
    }
  };
  

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setEditingContact(null);
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation", "Name and phone number are required.");
      return;
    }
    if (!/^\d+$/.test(phoneNumber.trim())) {
      Alert.alert("Validation", "Please enter a valid numeric phone number.");
      return;
    }
    try {
      const payload = { name: name.trim(), phoneNumber: phoneNumber.trim(), recipientId };
      const response = await axios.post(`${BASE_URL}/addEmergencyContact`, payload);
      setContacts([...contacts, response.data]);
      resetForm();
      Alert.alert("Success", "Contact added successfully!");
    } catch (error) {
      console.error("Error adding contact:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to add contact. Please try again.");
    }
  };

  const handleUpdateContact = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation", "Name and phone number are required.");
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_URL}/updateEmergencyContact/${editingContact._id}`,
        { name: name.trim(), phoneNumber: phoneNumber.trim() }
      );
      setContacts(
        contacts.map((contact) =>
          contact._id === editingContact._id ? response.data : contact
        )
      );
      setModalVisible(false);
      resetForm();
      Alert.alert("Success", "Contact updated successfully!");
    } catch (error) {
      console.error("Error updating contact:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update contact. Please try again.");
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/deleteEmergencyContact/${id}`);
      setContacts(contacts.filter((contact) => contact._id !== id));
      Alert.alert("Success", "Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to delete contact. Please try again.");
    }
  };

  const openUpdateModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhoneNumber(contact.phoneNumber);
    setModalVisible(true);
  };

  const renderContact = ({ item }) => (
    <View className="flex-row justify-between items-center w-full px-5 py-5 mb-3 bg-gray-300 rounded-3xl border border-black shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20">
      {/* Contact Details */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-black">{item.name}</Text>
        <Text className="italic text-gray-700">{item.phoneNumber}</Text>
      </View>

      {/* Vertical Line */}
      <View style={{ height: '100%', width: 1, backgroundColor: 'black', marginHorizontal: 10 }} />

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Contact",
              `Are you sure you want to delete "${item.name}" from your emergency contacts?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteContact(item._id),
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Icon name="delete" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openUpdateModal(item)}>
          <Icon name="edit" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}>
          <Icon name="phone" size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-5" style={{ backgroundColor: "white" }}>

{/* Device Selection Button */}
<View className="relative mt-10 ml-[11%] mr-0 pr-1 mb-4">
  <TouchableOpacity
    onPress={() => setDropdownVisible(!isDropdownVisible)}
    className="flex-row items-center justify-between bg-gray-100 border border-gray-400 rounded-2xl px-4 py-3 shadow-sm w-full"
  >
    <View className="flex-row items-center space-x-2">
      <Icon name="person-outline" size={20} color="black" />
      <Text className="font-extrabold text-base text-black">
        {String(deviceList.find((d) => d.deviceId === selectedDevice)?.name || "Unknown Device")}
      </Text>
    </View>
    <Icon name={isDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color="black" />
  </TouchableOpacity>

  {/* Animated Dropdown List */}
  {isDropdownVisible && (
    <Animated.View
      className="absolute left-7 right-7 z-50 bg-white border border-gray-300 rounded-2xl shadow-sm"
      style={{
        top: '120%',
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
          onPress={() => handleDeviceChange(device.deviceId)}
          className="p-3 border-b border-gray-200 last:border-b-0"
        >
          <Text className="text-black">{String(device.name || "Unknown Device")}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  )}
</View>

      {/* Render Phone Number */}
      <Text className="text-lg font-extrabold mb-3">
        User’s Personal Numbers: {selectedDevice}
      </Text>
      <View className="flex-row justify-between items-center w-full px-6 py-5 mb-4 bg-gray-300 rounded-3xl border border-black shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20">
        <View>
          <Text className="text-xl font-extrabold text-black">
            {userPhoneNumber !== "N/A" ? userPhoneNumber : "N/A"}
          </Text>
          <Text className="italic text-gray-700">Personal Number</Text>
        </View>

        {/* Vertical Line - Moved closer to the phone icon */}
        <View style={{ height: '100%', width: 1, backgroundColor: 'black', marginLeft: 90 }} />

        {/* Phone Icon */}
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            if (userPhoneNumber !== "N/A") {
              Linking.openURL(`tel:${userPhoneNumber}`);
            } else {
              Alert.alert("No phone number found.");
            }
          }}
        >
          <Icon name="phone" size={29} color="black" />
        </TouchableOpacity>
      </View>

      {/* Emergency Hotlines Header */}
      <Text className="text-2xl font-extrabold italic text-center mb-4">
        Emergency Hotlines
      </Text>

      {/* Add Button */}
          <View className="justify-center items-center w-full px-5 py-4 mb-3 bg-gray-300 rounded-3xl border border-black shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20">
            {/* Only the icon is clickable */}
            <TouchableOpacity
              className="w-12 h-12 bg-gray-200 rounded-full justify-center items-center border-4 border-black shadow-md"
              onPress={() => {
                setModalVisible(true);
                resetForm();
              }}
            >
              <Icon name="add" size={30} color="black" />
            </TouchableOpacity>
          </View>

      {/* Emergency Contacts List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      {/* Add/Update Contact Modal */}
<Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View className="flex-1 justify-center items-center bg-black/50">
    <View className="bg-white w-4/5 rounded-2xl p-6 shadow-lg relative">
      {/* Modal Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-extrabold text-black">
          {editingContact ? "Update Emergency Contact" : "Add Emergency Contact"}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Name Input */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-xl p-4 mb-4 bg-white text-gray-800 shadow-sm"
        placeholderTextColor="rgba(0,0,0,0.5)"
      />
      {/* Phone Number Input */}
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        className="border border-gray-300 rounded-xl p-4 mb-5 bg-white text-gray-800 shadow-sm"
        keyboardType="phone-pad"
        placeholderTextColor="rgba(0,0,0,0.5)"
      />

      {/* Primary Button */}
      <TouchableOpacity
        onPress={editingContact ? handleUpdateContact : handleAddContact}
        className="w-full p-4 bg-green-600 rounded-xl mb-3 shadow-md"
      >
        <Text className="text-white text-center font-bold text-lg">
          {editingContact ? "Update Contact" : "Add Contact"}
        </Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        className="w-full p-4 bg-gray-400 rounded-xl shadow"
      >
        <Text className="text-white text-center font-bold text-lg">Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
};

export default Hotlines;

NativeWindStyleSheet.setOutput({
  default: "native",
});