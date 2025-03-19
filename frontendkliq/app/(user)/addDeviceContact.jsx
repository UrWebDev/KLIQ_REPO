import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, FlatList, Modal
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';


const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

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
  const [selectedContact, setSelectedContact] = useState(null);
  const [Name, setNamee] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);


    return () => {
      manager.destroy();
    };
  }, [manager]);


  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          // Android 12+ (API 31+)
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
          // Android 11 and below
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


        // 🚀 Request higher MTU before anything else
        await connectedDevice.requestMTU(517);
        console.log("✅ MTU size increased to 512");


        startListeningForNotifications(connectedDevice);
        fetchStoredContacts(connectedDevice);
    } catch (error) {
        console.error("❌ Connection error:", error);
        Alert.alert("Error", "Failed to connect. Please try again.");
    }
};

const startListeningForNotifications = async (connectedDevice) => {
  try {
    console.log("Checking if device is connected for notifications...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    let isConnected = await connectedDevice.isConnected();
    if (!isConnected) {
      console.log("❌ Device lost connection, retrying...");
      return;
    }

    console.log("📡 Subscribing to notifications...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Service UUID:", SERVICE_UUID);
    console.log("Characteristic UUID:", CHARACTERISTIC_UUID);

    const transactionId = "monitor";
    const subscriptionType = "all"; // or "notification" or "indication"

    bleManager.monitorCharacteristicForDevice(
      connectedDevice.id, // deviceIdentifier
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error("❌ Notification error:", error);
          return;
        }

        console.log("📩 Received characteristic:", characteristic);

        try {
          if (characteristic?.value) {
            const decodedValue = Buffer.from(characteristic.value, "base64").toString("utf-8");
            console.log("📩 Received Data:", decodedValue);
          } else {
            console.warn("⚠️ Received characteristic without a value!");
          }
        } catch (decodeError) {
          console.error("❌ Error decoding Base64:", decodeError);
        }
      },
      transactionId,
      subscriptionType // ✅ Added subscriptionType
    );

    console.log("✅ Subscribed to notifications successfully!");
  } catch (error) {
    console.error("❌ Failed to start notifications:", error);
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

  const sendContact = async () => {
    if (!connected || !device) {
        Alert.alert("Error", "Not connected to a device.");
        return;
    }

    if (!name || !number) {
        Alert.alert("Error", "Please enter both name and number.");
        return;
    }

    // ✅ Create the contactData as a string (NO OBJECT)
    const contactData = `${name},${number}`;

    console.log("📨 Sending new contact:", contactData);

    // ✅ Now pass the contactData to the sendContactData function
    await sendContactData(contactData);
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
  
      // ✅ Send delete request in proper format: "DELETE:ID"
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
  
      // ✅ Remove from local state to update UI
      setReceivedContact((prevContacts) =>
        prevContacts.split(",").filter(c => !c.startsWith(`${contactId}:`)).join(",")
      );
  
    } catch (error) {
      console.error('❌ Failed to send delete request:', error);
      Alert.alert('Error', 'Failed to delete contact. Check connection.');
    }
  };
  
  
  const sendContactData = async (contactData) => {
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
            CHARACTERISTIC_UUID,
            base64Data
        );

        console.log('✅ Contact data sent successfully!');
        Alert.alert("Success", "Contact added successfully!");
    } catch (error) {
        console.error('❌ Failed to send contact data:', error);
        Alert.alert('Error', 'Failed to send contact data. Check connection.');
    }
};

  
  
  // ✅ Fix duplicate key issue
  const formattedContacts = receivedContact
    .split(",")
    .map(contact => {
        const parts = contact.split(":");
        return parts.length === 3 ? { id: parts[0], name: parts[1], number: parts[2] } : null;
    })
    .filter(Boolean) // Remove invalid entries
    .reduce((acc, contact) => {
      if (!acc.some(c => c.id === contact.id)) acc.push(contact);
      return acc;
    }, []); // Ensure unique IDs

    const updateContact = () => {
      if (!selectedContact || !name || !number) {
          Alert.alert("Error", "Please enter both name and number.");
          return;
      }
  
      // ✅ Send the updated contact data to ESP32
      const updatedData = `UPDATE:${selectedContact.id},${name},${number}`;
      sendContactData(updatedData);
      // ✅ Close the modal
      setModalVisible(false);
  
      // ✅ Manually update the FlatList (REAL-TIME)
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
  
    
const openEditModal = (contact) => {
  setSelectedContact(contact);
  setName(contact.name);
  setNumber(contact.number);
  setModalVisible(true);
};

//for devicde id
const sendContactt = async () => {
  if (!connected || !device) {
    Alert.alert("Error", "Not connected to ESP32.");
    return;
  }

  if (!Name || !phoneNum || !deviceId) {
    Alert.alert("Error", "Please fill out all fields.");
    return;
  }

  const contactData = `${Name},${phoneNum},${deviceId}`;
  const base64Data = Buffer.from(contactData, 'utf-8').toString('base64');
  
  try {
    await device.writeCharacteristicWithoutResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      base64Data
    );
    console.log("✅ Contact sent:", contactData);
    Alert.alert("Success", "Contact sent to ESP32!");
  } catch (error) {
    console.error("❌ Failed to send contact:", error);
    Alert.alert("Error", "Failed to send contact.");
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Contact</Text>
      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setNamee} />
      <TextInput style={styles.input} placeholder="Enter Phone Number" value={phoneNum} onChangeText={setPhoneNum} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Enter Device ID" value={deviceId} onChangeText={setDeviceId} />
      <TouchableOpacity style={styles.button} onPress={sendContactt} disabled={!connected}> 
        <Text style={styles.buttonText}>Send Contact</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Number" value={number} onChangeText={setNumber} keyboardType="phone-pad" />


      <TouchableOpacity style={styles.button} onPress={sendContact} disabled={!connected}>
        <Text style={styles.buttonText}>Send Contact</Text>
      </TouchableOpacity>


      <Text>Status: {connected ? "Connected" : "Not Connected"}</Text>
      <FlatList
  data={formattedContacts}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.contactItem}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>{item.number}</Text>

      {item.id && item.name && item.number ? (
        <>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <Text style={{ color: "blue" }}>Edit</Text>
            </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteContact(item.id)}>
            <Text style={{ color: "red" }}>Delete</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  )}
/>
<Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Contact</Text>
            <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Enter Number" value={number} onChangeText={setNumber} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.button} onPress={updateContact}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};


const styles = StyleSheet.create({
  contactItem: { fontSize: 10, padding: 5, borderBottomWidth: 1, borderBottomColor: '#ccc', display: 'flex' },
  
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
},
updateButton: {
    backgroundColor: '#f1c40f',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
},contactItem: {
  fontSize: 10,
  padding: 5,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%'
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  padding: 10,
  width: 250,
  marginBottom: 10,
},
button: {
  backgroundColor: '#4CAF50',
  padding: 15,
  borderRadius: 5,
  marginBottom: 10,
},
cancelButton: {
  backgroundColor: 'red',
  padding: 15,
  borderRadius: 5,
  marginBottom: 10,
},
buttonText: {
  color: 'white',
  fontSize: 16,
},
//main
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 250,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
  },
  receivedContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  receivedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  receivedText: {
    fontSize: 16,
    color: '#333',
  },
});


export default Contactss;