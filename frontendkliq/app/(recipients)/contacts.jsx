import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import axios from "axios";

const BASE_URL = "http://localhost:3000/recipients";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch all contacts
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
    if (!name || !phoneNumber) {
      Alert.alert("Validation", "Please fill out all fields.");
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/addEmergencyContact`, {
        name,
        phoneNumber,
      });
      setContacts([...contacts, response.data]);
      setName("");
      setPhoneNumber("");
      Alert.alert("Success", "Contact added successfully!");
    } catch (error) {
      console.error("Error adding contact:", error);
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
        {
          name,
          phoneNumber,
        }
      );
      setContacts(
        contacts.map((contact) =>
          contact._id === selectedContact._id ? response.data : contact
        )
      );
      setModalVisible(false);
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

  const renderContact = ({ item }) => (
    <View className="flex flex-row justify-between items-center bg-blue-500 rounded-md p-2 mb-2">
      <View>
        <Text className="text-white font-bold">{item.name}</Text>
        <Text className="text-white">{item.phoneNumber}</Text>
      </View>
      <View className="flex flex-row">
        <TouchableOpacity
          onPress={() => openUpdateModal(item)}
          className="bg-green-500 p-1 rounded mr-2"
        >
          <Text className="text-white">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteContact(item._id)}
          className="bg-red-500 p-1 rounded"
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold mb-4">Emergency Contacts</Text>

      {/* Add Contact */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-md p-2 mb-2"
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        className="border border-gray-300 rounded-md p-2 mb-4"
      />
      <TouchableOpacity
        onPress={selectedContact ? handleUpdateContact : handleAddContact}
        className={`p-2 rounded-md ${
          selectedContact ? "bg-green-500" : "bg-blue-500"
        }`}
      >
        <Text className="text-white text-center">
          {selectedContact ? "Update Contact" : "Add Contact"}
        </Text>
      </TouchableOpacity>

      {/* Contact List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
      />

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-md p-4 w-4/5">
            <Text className="text-lg font-bold mb-4">Update Contact</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-md p-2 mb-2"
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="border border-gray-300 rounded-md p-2 mb-4"
            />
            <TouchableOpacity
              onPress={handleUpdateContact}
              className="bg-green-500 p-2 rounded-md mb-2"
            >
              <Text className="text-white text-center">Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-red-500 p-2 rounded-md"
            >
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Contacts;
