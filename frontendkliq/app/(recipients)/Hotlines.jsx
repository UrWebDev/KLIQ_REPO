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
import { useRef } from 'react'; // Add this with your other imports

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
  const [isInfoPressed, setIsInfoPressed] = useState(false);
  const infoAnim = useRef(new Animated.Value(0)).current;
  const [isPhoneInfoPressed, setIsPhoneInfoPressed] = useState(false);
const phoneInfoAnim = useRef(new Animated.Value(0)).current;

  const dropdownAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(phoneInfoAnim, {
      toValue: isPhoneInfoPressed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isPhoneInfoPressed, phoneInfoAnim]);
  
  useEffect(() => {
    Animated.timing(infoAnim, {
      toValue: isInfoPressed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isInfoPressed, infoAnim]); // Added infoAnim to dependencies

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
      Alert.alert("Invalid", "Name and phone number are required.");
      return;
    }
    if (!/^\d+$/.test(phoneNumber.trim())) {
      Alert.alert("Invalid", "Please enter a valid numeric phone number.");
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
      Alert.alert("Invalid", "Name and phone number are required.");
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
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 60, paddingHorizontal: 20 }}>

{/* Device Selection Button */}
<View className="relative w-full ml-4 px-4 mb-4">
  <TouchableOpacity
    onPress={() => setDropdownVisible(!isDropdownVisible)}
    className="flex-row items-center justify-between w-full bg-gray-100 border border-gray-400 rounded-2xl px-4 py-3 shadow-sm"
  >
    <View className="flex-row items-center space-x-2">
      <Icon name="person-outline" size={20} color="black" />
      <Text className="font-extrabold text-base text-black">
        {String(deviceList.find((d) => d.deviceId === selectedDevice)?.name || "Unknown Device")}
      </Text>
    </View>
    <Icon
      name={isDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
      size={20}
      color="black"
    />
  </TouchableOpacity>

  {/* Animated Dropdown List - untouched as requested */}
  <Animated.View
    className="absolute left-7 right-7 z-50 bg-white border border-gray-300 rounded-2xl shadow-sm"
    style={{
      top: '120%',
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
          onPress={() => handleDeviceChange(device.deviceId)}
          className="p-3 border-b border-gray-200 last:border-b-0"
        >
          <Text className="text-black">{String(device.name || "Unknown Device")}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <View className="p-3">
        <Text className="text-black italic">No users found.</Text>
      </View>
    )}
  </Animated.View>
</View>


      {/* Render Phone Number */}
          <View className="relative mb-3">


      {/* Hidden Phone Info Panel */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 50,
          right: 70,
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          zIndex: 100,
          opacity: phoneInfoAnim,
          transform: [{
            translateY: phoneInfoAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          }],
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          width: '80%',
        }}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 14, lineHeight: 20 }}>
        This section provides the phone number of the selected device user accessible for a one-tap call.
        </Text>
      </Animated.View>
    </View>
      <View className="flex-row justify-between items-center w-full px-6 py-5 mb-4 bg-gray-300 rounded-3xl border border-black shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20">
        <View>
          <Text className="text-xl font-extrabold text-black">
            {userPhoneNumber !== "N/A" ? userPhoneNumber : "N/A"}
          </Text>
          <Text className="italic text-gray-700">{`${deviceList.find((d) => d.deviceId === selectedDevice)?.name || "Unknown Device"}'s Personal Number`}</Text>
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
              Alert.alert("Unavailable", "No phone number found.");
            }
          }}
        >
          <Icon name="phone" size={29} color="black" />
        </TouchableOpacity>
      </View>

      
          {/* Emergency Hotlines Header with Info Icon */}
      <View className="flex-row justify-center items-center mb-4 relative">
        <Text className="text-2xl font-extrabold italic text-center mr-2">
          Emergency Hotlines
        </Text>
        <TouchableOpacity
          onPressIn={() => setIsInfoPressed(true)}
          onPressOut={() => setIsInfoPressed(false)}
          activeOpacity={0.7}
          className="ml-0"
        >
          <Icon name="help" size={17} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Hidden Info Panel - Now with better positioning */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 120, // Better default position
          alignSelf: 'center',
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          zIndex: 100,
          opacity: infoAnim,
          transform: [{
            translateY: infoAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          }],
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          width: '80%',
          maxWidth: 300,
        }}
        pointerEvents="none" // Allows taps to pass through
      >
        <Text style={{ fontSize: 14, lineHeight: 20 }}>
        Emergency hotlines can be added and updated with a one-tap dialing capability, including contacts for local authorities, medical services, or trusted individuals.
        </Text>
      </Animated.View>

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
      {/* Conditional message when no available hotlines */}
      {contacts.length === 0 && (
        <Text className="text-center text-gray-500 mt-3">
          No emergency contact available.
        </Text>
      )}
      {/* Emergency Contacts List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 10 }}
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


      // <View className="flex-row items-center">
      //   <Text className="text-lg font-extrabold">
      //     User's Personal Numbers: {userPhoneNumber} 
      //     {/* seleredDevkce */}
      //   </Text>
      //   <TouchableOpacity
      //     onPressIn={() => setIsPhoneInfoPressed(true)}
      //     onPressOut={() => setIsPhoneInfoPressed(false)}
      //     activeOpacity={0.7}
      //     className="ml-1"
      //   >
      //     <Icon name="help" size={17} color="#007bff" />
      //   </TouchableOpacity>
      // </View>