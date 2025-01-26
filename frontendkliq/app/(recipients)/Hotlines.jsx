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

  useEffect(() => {
    const fetchRecipientId = async () => {
      const id = await AsyncStorage.getItem("uniqueId");
      if (id) setRecipientId(id);
    };
    fetchRecipientId();
  }, []);

  useEffect(() => {
    if (recipientId) fetchContacts();
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
    <View className="flex-row justify-between items-center bg-gray-100 p-4 mb-2 rounded-2xl shadow-md border border-gray-300">
      <View>
        <Text className="text-lg font-bold">{item.name}</Text>
        <Text className="text-gray-500">{item.phoneNumber}</Text>
      </View>
      <View className="flex-row space-x-2">
        {/* Call Button */}
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}
          className="bg-blue-500 p-2 rounded-full"
        >
          <Icon name="phone" size={20} color="white" />
        </TouchableOpacity>
        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => openUpdateModal(item)}
          className="bg-green-500 p-2 rounded-full"
        >
          <Icon name="edit" size={20} color="white" />
        </TouchableOpacity>
        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => handleDeleteContact(item._id)}
          className="bg-red-500 p-2 rounded-full"
        >
          <Icon name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: "white" }}>
      {/* User's Personal Numbers */}
      <Text className="text-lg font-bold mb-4">User's Personal Numbers:</Text>
      <View className="flex-row justify-between items-center bg-gray-100 p-4 mb-6 rounded-2xl shadow-md border border-gray-300">
        <View>
          <Text className="text-lg font-bold">+639765786665</Text>
          <Text className="text-gray-600">Juan Dela Cruz</Text>
        </View>
        <TouchableOpacity
  className="bg-blue-500 p-2 rounded-full"
  onPress={() => {
    const phoneNumber = "+639765786665";
    const telURL = `tel:${phoneNumber}`;
    Linking.canOpenURL(telURL)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "Phone call feature is not supported on this device.");
        } else {
          return Linking.openURL(telURL);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  }}
>
  <Icon name="phone" size={20} color="#fff" />
</TouchableOpacity>
      </View>
      {/* Emergency Hotlines Header */}
      <Text className="text-2xl font-bold italic text-center mb-4">
        Emergency Hotlines
      </Text>
      {/* Add Button */}
      <TouchableOpacity
        className="w-12 h-12 bg-gray-200 rounded-full justify-center items-center mb-6 self-center shadow-md"
        onPress={() => {
          setModalVisible(true);
          resetForm();
        }}
      >
        <Icon name="add" size={30} color="black" />
      </TouchableOpacity>
      {/* Emergency Contacts List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      {/* Add/Update Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 rounded-lg p-5 shadow-md">
            <Text className="text-lg font-bold mb-4">
              {editingContact ? "Update Emergency Hotlines" : "Add Emergency Hotlines"}
            </Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-full p-3 mb-3 bg-white text-gray-800"
              placeholderTextColor="rgba(0,0,0,0.5)"
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="border border-gray-300 rounded-full p-3 mb-4 bg-white text-gray-800"
              keyboardType="phone-pad"
              placeholderTextColor="rgba(0,0,0,0.5)"
            />
            <TouchableOpacity
              onPress={editingContact ? handleUpdateContact : handleAddContact}
              className="w-full p-3 bg-blue-500 rounded-full mb-3"
            >
              <Text className="text-white text-center font-bold">
                {editingContact ? "Update" : "Add"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-full p-3 bg-red-500 rounded-full"
            >
              <Text className="text-white text-center font-bold">Cancel</Text>
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
