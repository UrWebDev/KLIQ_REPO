import React, { useState, useEffect } from "react";
import {View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL } from "@env";
import { NativeWindStyleSheet } from "nativewind";

const BASE_URL = `${API_URL}/recipients`;

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getAllEmergencyContacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation", "Name and phone number are required.");
      return;
    }
    try {
      const payload = { name: name.trim(), phoneNumber: phoneNumber.trim() };
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
    if (!name || !phoneNumber) {
      Alert.alert("Validation", "Please fill out all fields.");
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_URL}/updateEmergencyContact/${selectedContact._id}`,
        { name, phoneNumber }
      );
      setContacts(
        contacts.map((contact) =>
          contact._id === selectedContact._id ? response.data : contact
        )
      );
      setModalVisible(false);
      resetForm();
      Alert.alert("Success", "Contact updated successfully!");
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/deleteEmergencyContact/${id}`);
      setContacts(contacts.filter((contact) => contact._id !== id));
      Alert.alert("Success", "Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const openUpdateModal = (contact) => {
    setSelectedContact(contact);
    setName(contact.name);
    setPhoneNumber(contact.phoneNumber);
    setModalVisible(true);
  };

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setSelectedContact(null);
  };

  const renderContact = ({ item }) => (
    <View className="flex-row justify-between items-center bg-gray-100 p-4 mb-2 rounded-lg border border-gray-300">
      <View>
        <Text className="text-lg font-bold">{item.name}</Text>
        <Text className="text-gray-600">{item.phoneNumber}</Text>
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => openUpdateModal(item)}
          className="bg-green-500 p-2 rounded"
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteContact(item._id)}
          className="bg-red-500 p-2 rounded"
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-3xl font-bold italic text-center mb-4">Emergency Hotlines</Text>
      <TextInput
        placeholder="Emergency Name"
        value={name}
        onChangeText={setName}
        className="border border-gray-400 rounded-full p-3 mb-3 bg-white italic"
        placeholderTextColor="rgba(0,0,0,0.5)"
      />
      <TextInput
        placeholder="Contact Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        className="border border-gray-400 rounded-full p-3 mb-3 bg-white italic"
        keyboardType="phone-pad"
        placeholderTextColor="rgba(0,0,0,0.5)"
      />
      <TouchableOpacity
        onPress={selectedContact ? handleUpdateContact : handleAddContact}
        className={`p-4 rounded-lg ${
          selectedContact ? "bg-green-500" : "bg-blue-500"
        }`}
      >
        <Text className="text-white text-center font-bold">
          {selectedContact ? "Update Contact" : "Add Contact"}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 rounded-lg p-4">
            <Text className="text-xl font-bold mb-3">Update Contact</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="border border-gray-400 rounded-full p-3 mb-3 bg-white italic"
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="border border-gray-400 rounded-full p-3 mb-3 bg-white italic"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              onPress={handleUpdateContact}
              className="p-4 bg-green-500 rounded-lg mb-2"
            >
              <Text className="text-white text-center font-bold">Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="p-4 bg-red-500 rounded-lg"
            >
              <Text className="text-white text-center font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


export default Contacts;

NativeWindStyleSheet.setOutput({
  default: 'native',
});