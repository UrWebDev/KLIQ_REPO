import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Material Icons

const BASE_URL = "http://192.168.254.106:3000/recipients";

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
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation", "Name and phone number are required.");
      return;
    }
  
    try {
      const payload = { name: name.trim(), phoneNumber: phoneNumber.trim() };
      console.log("Sending payload:", payload); // Debugging payload
      const response = await axios.post(`${BASE_URL}/addEmergencyContact`, payload);
      console.log("Server response:", response.data); // Debugging response
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
    <View style={styles.contactCard}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => openUpdateModal(item)}
          style={styles.editButton}
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteContact(item._id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontStyle: 'italic' }]}>Emergency Hotlines</Text>

      {/* Add Contact */}
      <TextInput
        placeholder="Emergency Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="rgba(0, 0, 0, 0.5)" // Lower opacity for placeholder
      />
      <TextInput
        placeholder="Contact Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="rgba(0, 0, 0, 0.5)" // Lower opacity for placeholder
      />
      
      <TouchableOpacity
        onPress={selectedContact ? handleUpdateContact : handleAddContact}
        style={[styles.submitButton, selectedContact ? styles.updateButton : styles.addButton]}
      >
        <Text style={styles.submitButtonText}>
          {selectedContact ? "Update Contact" : "Add Contact"}
        </Text>
      </TouchableOpacity>

      {/* Contact List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }} // To avoid cut-off at bottom
      />

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Contact</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              onPress={handleUpdateContact}
              style={[styles.submitButton, styles.updateButton]}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.submitButton, styles.cancelButton]}
            >
              <Text style={styles.submitButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  
   input: {
     borderWidth: 2,
     borderColor: '#ccc',
     borderRadius: 25,
     padding: 12,
     marginBottom: 12,
     backgroundColor: '#fff',
     fontStyle: 'italic', // Italic text for input
   },
  
   submitButton: {
     paddingVertical: 12,
     borderRadius: 16,
     alignItems: 'center',
     marginVertical: 12,
   },
   addButton: {
     backgroundColor: '#007BFF',
   },
   updateButton: {
     backgroundColor: '#28a745',
   },
   cancelButton: {
     backgroundColor: '#dc3545',
   },
   submitButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
   },
  
   // Updated contactCard to include a border and shadow for better visibility
   contactCard: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     backgroundColor: '#F2F2F2',
     paddingVertical:16 ,
     paddingHorizontal :16 ,
     borderRadius :25 ,
     marginBottom :10 ,
     borderWidth : 2,
     borderColor :'#ccc',
     shadowColor:'#000', // Optional shadow for elevation effect
     shadowOffset:{width :0 , height :2}, 
     shadowOpacity :0.3 ,
     shadowRadius :2 ,
     elevation :2 , // For Android shadow effect 
   },
   contactName: {
     color: '#333', // Changed to dark color for better readability
     fontWeight: 'bold',
   },
   contactPhone:{
     color:'#666', // Lighter color for phone number for distinction
   },
   actionButtons:{
     flexDirection:'row'
   },
   editButton:{
     backgroundColor:'#28a745',
     paddingHorizontal :10,
     paddingVertical :6,
     borderRadius :5,
     marginRight :5
   },
   deleteButton:{
     backgroundColor:'#dc3545',
     paddingHorizontal :10,
     paddingVertical :6,
     borderRadius :5
   },
   modalOverlay:{
     flex :1,
     justifyContent:'center',
     alignItems:'center',
     backgroundColor:'rgba(0,0,0,0.5)'
   },
   modalContent:{
     width:'80%',
     backgroundColor:'#fff',
     borderRadius :10 ,
     padding :20
   },
   modalTitle:{
     fontSize :20 ,
     fontWeight:'bold' ,
     marginBottom :10 
   }
});

export default Contacts;