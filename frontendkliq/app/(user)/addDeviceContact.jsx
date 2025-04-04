import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, FlatList, Modal, ScrollView
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { decode as atob } from 'react-native-quick-base64';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const CHARACTERISTIC_UUID_NVS = "d1b8b50f-3e27-482e-91af-4b74e0030c6e";  // NVS

const bleManager = new BleManager();
const Contactss = () => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [receivedContact, setReceivedContact] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleNVS, setModalVisibleNVS] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [NAME, setNamee] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [receivedContactNVS, setReceivedContactNVS] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);
  const [addRecipientModalVisible, setAddRecipientModalVisible] = useState(false);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            scanAndConnect();
            subscription.remove();
        }
    }, true);

    return () => {
        console.log("🛑 Cleaning up BLE Manager...");
        setConnected(false);
        setDevice(null);
        manager.stopDeviceScan();
    };
}, [manager]);

const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
  
          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.error("❌ Bluetooth permissions denied.");
            Alert.alert("Permission Denied", "Bluetooth permissions are required.");
            return false;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
  
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.error("❌ Location permission denied.");
            Alert.alert("Permission Denied", "Location permission is required.");
            return false;
          }
        }
  
        console.log("✅ Bluetooth permissions granted.");
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
};

const scanAndConnect = async () => {
    const hasPermissions = await requestBluetoothPermissions();
    if (!hasPermissions) {
      console.log("🚫 Cannot scan, permissions not granted.");
      return;
    }
  
    if (isScanning) {
      console.warn("⚠️ BLE scan already running. Skipping new scan.");
      return;
    }
  
    console.log("📡 Starting BLE scan...");
    setIsScanning(true);
  
    manager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        console.error("❌ Scan error:", error);
        setIsScanning(false);
        return;
      }
  
      if (scannedDevice && scannedDevice.name === 'ESP32-ContactDevice') {
        console.log("✅ Found ESP32. Stopping scan and connecting...");
        manager.stopDeviceScan();
        setIsScanning(false);
        await connectToDevice(scannedDevice);
      }
    });
  
    setTimeout(() => {
      console.log("⏳ Stopping BLE scan after timeout...");
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
};

const connectToDevice = async (scannedDevice) => {
    try {
        console.log("📡 Connecting to:", scannedDevice.id);

        const connectedDevice = await scannedDevice.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();

        console.log("✅ Device successfully connected:", connectedDevice.id);
        setDevice(connectedDevice);
        setConnected(true);
        Alert.alert("🎉 Success", "Connected to ESP32!");

        await connectedDevice.requestMTU(517);
        console.log("✅ MTU size increased to 512");

        fetchStoredContacts(connectedDevice);
        fetchStoredContactsNVS(connectedDevice);

        console.log("⏳ Waiting before subscribing...");
        await new Promise(resolve => setTimeout(resolve, 2000));  

        setTimeout(() => {
          startListeningForNotifications(connectedDevice, CHARACTERISTIC_UUID);
        }, 500);
        setTimeout(() => {
          startListeningForNotifications(connectedDevice, CHARACTERISTIC_UUID_NVS);
        }, 1500);

    } catch (error) {
        console.error("❌ Connection error:", error);
        Alert.alert("Error", "Failed to connect. Please try again.");
    }
};

const startListeningForNotifications = async (device, characteristicUUID) => {
  try {
    console.log(`📡 Checking characteristic existence: ${characteristicUUID}`);
    const services = await device.services();
    for (const service of services) {
      const characteristics = await service.characteristics();
      for (const char of characteristics) {
        console.log(`🔍 Found characteristic: ${char.uuid}`);
      }
    }

    console.log(`📡 Subscribing to: ${characteristicUUID}`);
    const characteristic = await device.readCharacteristicForService(
      SERVICE_UUID,
      characteristicUUID
    );

    if (!characteristic) {
      console.error(`❌ Characteristic ${characteristicUUID} not found`);
      return;
    }

    device.monitorCharacteristicForService(SERVICE_UUID, characteristicUUID, (error, char) => {
      if (error) {
        console.error(`🚨 Notification error: ${error.message}`);
        return;
      }
      console.log(`✅ Notification received: ${char?.value}`);
      if (char?.value) {
        const decodedValue = Buffer.from(char.value, 'base64').toString('utf-8');
        console.log(`✅ Notification received: ${decodedValue}`);
        setReceivedContact(prev => decodedValue !== prev ? decodedValue : prev);
      }
    });

    console.log(`✅ Successfully subscribed to ${characteristicUUID}`);
    
  } catch (error) {
    console.error(`🚨 Error in startListeningForNotifications:`, error);
  }
};

const fetchStoredContacts = async (connectedDevice) => {
  try {
    const characteristic = await connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
    if (characteristic?.value) {
      const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
      setReceivedContact(decodedValue);
      console.log("📩 Retrieved Stored Data:", decodedValue);
    }
  } catch (error) {
    console.error("❌ Failed to fetch stored contacts:", error);
  }
};

const fetchStoredContactsNVS = async (connectedDevice) => {
  try {
      console.log("📡 Fetching stored contacts from NVS...");

      const characteristic = await connectedDevice.readCharacteristicForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID_NVS
      );

      if (!characteristic?.value) {
          console.warn("⚠️ No NVS data found.");
          setReceivedContactNVS([]);
          return;
      }

      console.log("📩 Raw characteristic value (Base64):", characteristic.value);

      let decodedValue;
      try {
          decodedValue = Buffer.from(characteristic.value, "base64").toString("utf-8").trim();
      } catch (decodeError) {
          console.error("❌ Error decoding Base64:", decodeError);
          setReceivedContactNVS([]); 
          return;
      }

      console.log("📩 Decoded NVS Data:", decodedValue);

      let parsedData;
      try {
          parsedData = JSON.parse(decodedValue);
          console.log("📩 Parsed NVS Data:", parsedData);
      } catch (jsonError) {
          console.error("❌ Failed to parse NVS JSON:", jsonError);
          setReceivedContactNVS([]);
          return;
      }

      if (!parsedData || typeof parsedData !== "object") {
          console.error("❌ Parsed data is not a valid object:", parsedData);
          setReceivedContactNVS([]);
          return;
      }

      const formattedContacts = Object.entries(parsedData)
          .map(([id, data]) => {
              if (typeof data !== "string") {
                  console.error(`❌ Data format error for ID ${id}:`, data);
                  return null;
              }

              const parts = data.split(",");
              
              if (parts.length < 3) {
                  console.error(`❌ Invalid contact format for ID ${id}:`, data);
                  return null;
              }

              return { 
                  id, 
                  name: parts[0], 
                  number: parts[1], 
                  deviceId: parts[2] || ""
              };
          })
          .filter(Boolean);

      console.log("✅ Formatted Contacts Array:", formattedContacts);
      setReceivedContactNVS(formattedContacts.length ? formattedContacts : []);

  } catch (error) {
      console.error("❌ Failed to fetch NVS contacts:", error);
      setReceivedContactNVS([]);
  }
};

const sendContact = async () => {
  if (!connected || !device) {
      Alert.alert("Error", "Not connected to a device.");
      return;
  }

  if (!name || !number) {
      Alert.alert("Error", "Please enter both name and number.");
      return;
  }

  const contactData = `${name},${number}`;
  console.log("📨 Sending new contact:", contactData);

  await sendContactData(contactData, CHARACTERISTIC_UUID);

  setReceivedContact(prev =>
      prev ? `${prev},${contactData}` : contactData
  );

  setName('');
  setNumber('');

  Alert.alert("Success", "Contact added successfully!");
};

const deleteContact = async (contactId) => {
  if (!device) {
    Alert.alert('Connection Error', 'Device not found. Try reconnecting.');
    return;
  }

  try {
    let isConnected = await device.isConnected();
    if (!isConnected) {
      console.log('Reconnecting...');
      await connectToDevice(device);
    }

    const deleteCommand = `DELETE:${contactId}`;
    const base64Data = Buffer.from(deleteCommand, 'utf-8').toString('base64');
    console.log("🛠 Encoded Base64 Data:", base64Data);

    await device.writeCharacteristicWithoutResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      base64Data
    );

    console.log('✅ Contact delete request sent successfully!');
    Alert.alert("Success", "Contact deleted successfully!");

    setReceivedContact((prevContacts) =>
      prevContacts.split(",").filter(c => !c.startsWith(`${contactId}:`)).join(",")
    );

  } catch (error) {
    console.error('❌ Failed to send delete request:', error);
    Alert.alert('Error', 'Failed to delete contact. Check connection.');
  }
};

const deleteContactNVS = async (contactId) => {
  if (!device) {
      Alert.alert('Connection Error', 'Device not found. Try reconnecting.');
      return;
  }

  try {
      let isConnected = await device.isConnected();
      if (!isConnected) {
          console.log('Reconnecting...');
          await connectToDevice(device);
      }

      const deleteCommand = `DELETE_NVS:${contactId}`;
      const base64Data = Buffer.from(deleteCommand, 'utf-8').toString('base64');

      await device.writeCharacteristicWithoutResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID_NVS,
          base64Data
      );

      console.log('✅ NVS Contact delete request sent successfully!');
      Alert.alert("Success", "Contact deleted successfully!");

      setReceivedContactNVS(prevContacts =>
        prevContacts.filter(contact => contact.id !== contactId)
      );
  } catch (error) {
      console.error('❌ Failed to send delete request:', error);
      Alert.alert('Error', 'Failed to delete contact. Check connection.');
  }
};

const sendContactData = async (contactData, characteristicUUID) => {
  if (!device) {
      Alert.alert('Connection Error', 'Device not found. Try reconnecting.');
      return;
  }

  if (typeof contactData !== 'string') {
      console.error('❌ contactData must be a string. Received:', contactData);
      Alert.alert('Error', 'Invalid contact data.');
      return;
  }

  try {
      let isConnected = await device.isConnected();
      if (!isConnected) {
          console.log('Reconnecting...');
          await connectToDevice(device);
      }

      const base64Data = Buffer.from(contactData, 'utf-8').toString('base64');
      console.log("🛠 Encoded Base64 Data:", base64Data);

      await device.writeCharacteristicWithoutResponseForService(
          SERVICE_UUID,
          characteristicUUID,
          base64Data
      );

      console.log('✅ Contact data sent successfully!');
      Alert.alert("Success", "Contact added successfully!");
  } catch (error) {
      console.error('❌ Failed to send contact data:', error);
      Alert.alert('Error', 'Failed to send contact data. Check connection.');
  }
};

const updateContact = () => {
  if (!selectedContact || !name || !number) {
      Alert.alert("Error", "Please enter both name and number.");
      return;
  }

  const updatedData = `UPDATE:${selectedContact.id},${name},${number}`;
  sendContactData(updatedData, CHARACTERISTIC_UUID);
  setModalVisible(false);

  setReceivedContact(prev =>
      prev
          .split(",")
          .map(contact => {
              const parts = contact.split(":");
              if (parts[0] === selectedContact.id) {
                  return `${selectedContact.id}:${name}:${number}`;
              }
              return contact;
          })
          .join(",")
  );
};

const updateContactNVS = async (contactId, newName, newPhoneNum, newDeviceId) => {
  console.log("📩 Updating contact:", contactId, newName, newPhoneNum, newDeviceId);

  if (!device) {
      Alert.alert('Connection Error', 'Device not found. Try reconnecting.');
      return;
  }

  if (!newName?.trim() || !newPhoneNum?.trim() || !newDeviceId?.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
  }

  try {
      let isConnected = await device.isConnected();
      if (!isConnected) {
          console.log('Reconnecting...');
          await connectToDevice(device);
      }

      const updateCommand = `UPDATE_NVS:${contactId},${newName},${newPhoneNum},${newDeviceId}`;
      sendContactData(updateCommand, CHARACTERISTIC_UUID_NVS);

      setModalVisibleNVS(false);
      console.log('✅ NVS Contact update request sent successfully!');
      Alert.alert("Success", "Contact updated successfully!");
      
      setReceivedContactNVS(prevContacts =>
        prevContacts.map(contact =>
            contact.id === contactId
                ? { ...contact, name: newName, number: newPhoneNum, deviceId: newDeviceId }
                : contact
        )
      );
  } catch (error) {
      console.error('❌ Failed to send update request:', error);
      Alert.alert('Error', 'Failed to update contact. Check connection.');
  }
};

const openEditModal = (contact) => {
  setSelectedContact(contact);
  setName(contact.name);
  setNumber(contact.number);
  setModalVisible(true);
};

const openEditModalNVS = (contact) => {
  setSelectedContact(contact);
  setNamee(contact.name);
  setPhoneNum(contact.number);
  setDeviceId(contact.deviceId);
  setModalVisibleNVS(true);
};

const sendContactNVS = async () => {
  if (!connected || !device) {
    Alert.alert("Error", "Not connected to ESP32.");
    return;
  }

  if (!NAME.trim() || !phoneNum.trim() || !deviceId.trim()) {
    Alert.alert("Error", "All fields are required.");
    return;
  }

  const contactData = `${NAME},${phoneNum},${deviceId}`;
  console.log("📨 Sending new contact:", contactData);

  await sendContactData(contactData, CHARACTERISTIC_UUID_NVS);

  setReceivedContactNVS(prevContacts => [
    ...prevContacts,
    { id: prevContacts.length + 1, name: NAME, number: phoneNum, deviceId: deviceId }
  ]);

  setNamee('');
  setPhoneNum('');
  setDeviceId('');
};

const formattedContacts = receivedContact
    .split(",")
    .map(contact => {
        const parts = contact.split(":");
        return parts.length === 3 ? { id: parts[0], name: parts[1], number: parts[2] } : null;
    })
    .filter(Boolean)
    .reduce((acc, contact) => {
      if (!acc.some(c => c.id === contact.id)) acc.push(contact);
      return acc;
    }, []);

  const formattedContactsNVS = Array.isArray(receivedContactNVS) ? receivedContactNVS : [];

  return (
    <View className="flex-1 justify-start items-center p-8 bg-white">
      <Text className="text-2xl font-extrabold mb-5 text-gray-800 mt-10 mr-40">Connectivity:</Text>

        {/* NOTE Container */}
        <View className="bg-gray-300 border border-black rounded-lg p-6 mb-4 w-full shadow-md">
      <Text className="text-base italic">
        <Text className="text-red-600 font-bold">*</Text>
        <Text className="text-black">NOTE: </Text>
        <Text className="text-black">A single device should be linked to a single data entry (1:1). Please prevent any duplicate records.</Text>
      </Text>
    </View>
        
        {/* Bluetooth Status indicator */}
        <Text className="text-base mb-4">
          <Text className="text-red-600">*</Text>
          <Text className="italic text-black">STATUS: </Text>
          <Text className={`italic ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? "Connected." : "Not Connected."}
          </Text>
        </Text>

        <TextInput 
          className={`border ${focusedInput === 'NAME' ? 'border-black-500' : 'border-gray-300'} rounded-lg p-3 w-full mb-3 bg-gray-100`}
          placeholder="Name" 
          value={NAME} 
          onChangeText={setNamee}
          onFocus={() => setFocusedInput('NAME')}
          onBlur={() => setFocusedInput(null)}
        />
        <TextInput 
          className={`border ${focusedInput === 'phoneNum' ? 'border-black-500' : 'border-gray-300'} rounded-lg p-3 w-full mb-3 bg-gray-100`}
          placeholder="Phone Number" 
          value={phoneNum} 
          onChangeText={setPhoneNum}
          onFocus={() => setFocusedInput('phoneNum')}
          onBlur={() => setFocusedInput(null)}
          keyboardType="phone-pad" 
        />
        <TextInput 
          className={`border ${focusedInput === 'deviceId' ? 'border-black-500' : 'border-gray-300'} rounded-lg p-3 w-full mb-3 bg-gray-100`}
          placeholder="Device ID" 
          value={deviceId} 
          onChangeText={setDeviceId}
          onFocus={() => setFocusedInput('deviceId')}
          onBlur={() => setFocusedInput(null)}
          keyboardType="phone-pad"
        />
        
        <TouchableOpacity 
          className={`bg-green-600 p-4 rounded-full mb-3 w-full items-center ${!connected ? 'opacity-500' : ''}`}
          onPress={sendContactNVS} 
          disabled={!connected}
        >
          <Text className="text-white text-base font-semibold">Register</Text>
        </TouchableOpacity>

        <FlatList
          data={formattedContactsNVS}
          keyExtractor={(item) => item.id.toString()}
          className="w-full"
          renderItem={({ item }) => (
            <View className="p-4 border-b border-gray-200 w-full bg-white mb-2 rounded">
              <Text className="text-base font-bold mb-1 text-gray-800">{item.name}</Text>
              <Text className="text-sm text-gray-600 mb-1">{item.number}</Text>
              <Text className="text-sm text-gray-600 mb-1">{item.deviceId}</Text>

              {item.id && item.name && item.number ? (
                <View className="mt-2">
                  <TouchableOpacity onPress={() => openEditModalNVS(item)}>
                    <Text className="text-blue-500 mt-2 font-semibold">Edit NVS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteContactNVS(item.id)}>
                    <Text className="text-red-500 mt-1 font-semibold">Delete NVS</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        />

        <Modal visible={modalVisibleNVS} animationType="slide" transparent>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-11/12 max-w-md items-center">
              <Text className="text-xl font-bold mb-4 text-gray-800">Edit Contact NVS</Text>
              
              <TextInput
                className="border border-gray-300 rounded p-3 w-full mb-3 bg-white"
                placeholder="Enter Name"
                value={NAME}
                onChangeText={setNamee}
              />
              
              <TextInput
                className="border border-gray-300 rounded p-3 w-full mb-3 bg-white"
                placeholder="Enter Number"
                value={phoneNum}
                onChangeText={setPhoneNum}
                keyboardType="phone-pad"
              />

              <TextInput
                className="border border-gray-300 rounded p-3 w-full mb-3 bg-white"
                placeholder="Enter Device Id"
                value={deviceId}
                onChangeText={setDeviceId}
                keyboardType="phone-pad"
              />
              
              <TouchableOpacity 
                className="bg-green-600 p-4 rounded mb-3 w-full items-center"
                onPress={() => updateContactNVS(selectedContact.id, NAME, phoneNum, deviceId)}
              >
                <Text className="text-white text-base font-semibold">Save NVS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-red-600 p-4 rounded mb-3 w-full items-center"
                onPress={() => setModalVisibleNVS(false)}
              >
                <Text className="text-white text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text className="text-2xl font-extrabold mb-5 text-gray-800 mt-6">Add Recipients(10):</Text>
        
        {/* Add Recipient Card Trigger */}
        <View className="bg-gray-300 border border-black rounded-xl p-4 w-full mb-4 items-center justify-center">
      <TouchableOpacity 
        onPress={() => setAddRecipientModalVisible(true)}
        className="w-12 h-12 border-4 border-black rounded-full items-center justify-center bg-gray-200"
      >
        <View className="relative w-full h-full items-center justify-center">
          <View className="absolute w-4 h-1 bg-black rounded-full"></View>
          <View className="absolute w-1 h-4 bg-black rounded-full"></View>
        </View>
      </TouchableOpacity>
    </View>


        {/* Add Recipient Modal */}
        <Modal
      animationType="fade"
      transparent={true}
      visible={addRecipientModalVisible}
      onRequestClose={() => setAddRecipientModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-4/5 rounded-2xl p-6 shadow-lg">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-extrabold text-black">
              Add Trusted Recipient
            </Text>
            <TouchableOpacity 
              onPress={() => setAddRecipientModalVisible(false)}
              className="p-2"
            >
              <View className="w-6 h-6 items-center justify-center">
                <View className="absolute w-5 h-0.5 bg-black rotate-45"></View>
                <View className="absolute w-5 h-0.5 bg-black -rotate-45"></View>
              </View>
            </TouchableOpacity>
          </View>

              {/* Name Input */}
              <TextInput
                placeholder="Enter Name (e.g. Guardian, Friend, etc.)" 
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-xl p-4 mb-4 bg-white text-gray-800 shadow-sm"
              />
              
              {/* Phone Number Input */}
              <TextInput
                placeholder="Enter Phone #"
                value={number}
                onChangeText={setNumber}
                className="border border-gray-300 rounded-xl p-4 mb-5 bg-white text-gray-800 shadow-sm"
                keyboardType="phone-pad"
              />

              {/* Add Button */}
              <TouchableOpacity
                onPress={() => {
                  sendContact();
                  setAddRecipientModalVisible(false);
                }}
                className={`w-full p-4 bg-green-600 rounded-xl mb-3 shadow-md ${!connected ? 'opacity-500' : ''}`}
                disabled={!connected}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Send Contact to EEPROM
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setAddRecipientModalVisible(false)}
                className="w-full p-4 bg-gray-400 rounded-xl shadow"
              >
                <Text className="text-white text-center font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={formattedContacts}
          keyExtractor={(item) => item.id.toString()}
          className="w-full"
          renderItem={({ item }) => (
            <View className="p-4 border-b border-gray-200 w-full bg-white mb-2 rounded">
              <Text className="text-base font-bold mb-1 text-gray-800">{item.name}</Text>
              <Text className="text-sm text-gray-600 mb-1">{item.number}</Text>

              {item.id && item.name && item.number ? (
                <View className="mt-2">
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Text className="text-blue-500 mt-2 font-semibold">Edit EEPROM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteContact(item.id)}>
                    <Text className="text-red-500 mt-1 font-semibold">Delete EEPROM</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-11/12 max-w-md items-center">
              <Text className="text-xl font-bold mb-4 text-gray-800">Edit Contact EEPROM</Text>
              <TextInput 
                className="border border-gray-300 rounded p-3 w-full mb-3 bg-white"
                placeholder="Enter Name" 
                value={name} 
                onChangeText={setName} 
              />
              <TextInput 
                className="border border-gray-300 rounded p-3 w-full mb-3 bg-white"
                placeholder="Enter Number" 
                value={number} 
                onChangeText={setNumber} 
                keyboardType="phone-pad" 
              />
              <TouchableOpacity 
                className="bg-green-600 p-4 rounded mb-3 w-full items-center"
                onPress={updateContact}
              >
                <Text className="text-white text-base font-semibold">Save EEPROM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-red-600 p-4 rounded mb-3 w-full items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
};

export default Contactss;