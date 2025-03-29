import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, FlatList, Modal
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
  const [selectedContact, setSelectedContact] = useState(null);
  const [NAME, setNamee] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [receivedContactNVS, setReceivedContactNVS] = useState([]);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            scanAndConnect();
            subscription.remove();
        }
    }, true);

    return () => {
        console.log("🛑 Cleaning up BLE Manager...");
        setConnected(false);  // Ensure UI updates on disconnect
        setDevice(null);
        manager.stopDeviceScan();
        // Instead of destroying the manager, just stop scanning to avoid BleManager errors.
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
  


  // const debugBLEServices = async (device) => {
  //   try {
  //     console.log("🔍 Fetching all services and characteristics...");
  //     const services = await device.services();
  
  //     for (const service of services) {
  //       console.log("🛠 Found Service:", service.uuid);
  
  //       const characteristics = await service.characteristics();
  //       for (const characteristic of characteristics) {
  //         console.log("🔍 Found Characteristic:", characteristic.uuid);
  //         console.log("   🔹 Notify:", characteristic.isNotifiable);
  //         console.log("   🔹 Indicate:", characteristic.isIndicatable);
  //         console.log("   🔹 Read:", characteristic.isReadable);
  //         console.log("   🔹 Write:", characteristic.isWritableWithResponse);
  //         console.log("   🔹 Write Without Response:", characteristic.isWritableWithoutResponse);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("❌ Error fetching services and characteristics:", error);
  //   }
  // };
  
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

        // Fetch stored contacts first
        fetchStoredContacts(connectedDevice);
        fetchStoredContactsNVS(connectedDevice);

        // Add a delay before subscribing to notifications
        console.log("⏳ Waiting before subscribing...");
        await new Promise(resolve => setTimeout(resolve, 2000));  

        // Subscribe to notifications one at a time with delays
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
            setReceivedContactNVS([]); // ✅ Ensure state is an empty array
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
            parsedData = JSON.parse(decodedValue); // ✅ Ensure JSON parsing
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
                if (parts.length !== 3) {
                    console.error(`❌ Invalid contact format for ID ${id}:`, data);
                    return null;
                }

                return { id, name: parts[0], number: parts[1], altNumber: parts[2] };
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

    // ✅ Create the contactData as a string (NO OBJECT)
    const contactData = `${name},${number}`;

    console.log("📨 Sending new contact:", contactData);

    // ✅ Now pass the contactData to the sendContactData function
    await sendContactData(contactData, CHARACTERISTIC_UUID);
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

        // ✅ Remove from local state
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
    const formattedContactsNVS = Array.isArray(receivedContactNVS) ? receivedContactNVS : [];

  


    const updateContact = () => {
      if (!selectedContact || !name || !number) {
          Alert.alert("Error", "Please enter both name and number.");
          return;
      }
  
      // ✅ Send the updated contact data to ESP32
      const updatedData = `UPDATE:${selectedContact.id},${name},${number}`;
      sendContactData(updatedData, CHARACTERISTIC_UUID);
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
  const updateContactNVS = async (contactId, newName, newPhoneNum, newDeviceId) => {
    if (!device) {
        Alert.alert('Connection Error', 'Device not found. Try reconnecting.');
        return;
    }

    if (!newName.trim() || !newPhoneNum.trim() || !newDeviceId.trim()) {
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

        console.log('✅ NVS Contact update request sent successfully!');
        Alert.alert("Success", "Contact updated successfully!");

        // ✅ Update local state
        setReceivedContactNVS(prev =>
            prev.split(",")
                .map(c => c.startsWith(`${contactId}:`) ? `${contactId}:${newName}:${newPhoneNum}:${newDeviceId}` : c)
                .join(",")
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
  setNamee(contact.name); // Use setNamee for NVS
  setPhoneNum(contact.number); // Use setPhoneNum for NVS
  setDeviceId(contact.deviceId); // Use setDeviceId for NVS (if applicable)
  setModalVisible(true);
};



// 📡 Send New Contact (NVS)
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
  await sendContactData(contactData, CHARACTERISTIC_UUID_NVS);
  setNamee('');
  setPhoneNum('');
  setDeviceId('');
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📩 Send Contact to NVS</Text>
      <TextInput style={styles.input} placeholder="Name" value={NAME} onChangeText={setNamee} />
      <TextInput style={styles.input} placeholder="Phone Number" value={phoneNum} onChangeText={setPhoneNum} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Device ID" value={deviceId} onChangeText={setDeviceId} />
      <TouchableOpacity style={styles.button} onPress={sendContactNVS} disabled={!connected}>
        <Text style={styles.buttonText}>Send to NVS</Text>
      </TouchableOpacity>
      <FlatList
  data={formattedContactsNVS} // Now an array of objects
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.contactItem}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>{item.number}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>{item.altNumber}</Text>

      {item.id && item.name && item.number ? (
        <>
          <TouchableOpacity onPress={() => openEditModalNVS(item)}>
            <Text style={{ color: "blue" }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteContactNVS(item.id)}>
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
            
            <TextInput
                style={styles.input}
                placeholder="Enter Name"
                value={NAME} // Use NAME state
                onChangeText={setNamee} // Use setNamee for updates
            />
            
            <TextInput
                style={styles.input}
                placeholder="Enter Number"
                value={phoneNum} // Use phoneNum state
                onChangeText={setPhoneNum} // Use setPhoneNum for updates
                keyboardType="phone-pad"
            />
            
            <TouchableOpacity style={styles.button} onPress={updateContactNVS}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>



      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Number" value={number} onChangeText={setNumber} keyboardType="phone-pad" />


      <TouchableOpacity style={styles.button} onPress={sendContact} disabled={!connected}>
        <Text style={styles.buttonText}>Send Contact to eeprom</Text>
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