import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform 
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

const Contactss = () => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [receivedContact, setReceivedContact] = useState('');

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
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        if (
          granted["android.permission.BLUETOOTH_SCAN"] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted["android.permission.BLUETOOTH_CONNECT"] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted["android.permission.ACCESS_FINE_LOCATION"] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.error("Bluetooth permissions denied.");
          Alert.alert("Permission Denied", "Bluetooth permissions are required.");
          return false;
        }

        console.log("Bluetooth permissions granted.");
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const scanAndConnect = async () => {
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

    // Stop scanning after 10 seconds if no device is found
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
        console.log("Device lost connection, retrying...");
        return;
      }
  
      console.log("Subscribing to notifications...");
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      console.log("Service UUID:", SERVICE_UUID);
      console.log("Characteristic UUID:", CHARACTERISTIC_UUID);
  
      // Correct function usage with only required arguments
      await connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID, 
        CHARACTERISTIC_UUID, 
        (error, characteristic) => {
          if (error) {
            console.error("❌ Notification error:", error);
            return;
          }
      
          if (characteristic?.value) {
            const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            console.log("📩 Received Data:", decodedValue);
            setReceivedContact(prevContacts => [...prevContacts, decodedValue]);
            // Debugging: Log raw BLE data
            console.log("🛠 Raw Base64 Data:", characteristic.value);
          } else {
            console.log("⚠️ No data received.");
          }
        }
      );
      
      
  
      console.log("✅ Subscribed to notifications successfully!");
    } catch (error) {
      console.error("Failed to start notifications:", error);
    }
  };
  useEffect(() => {
    if (device) {
        device.monitorCharacteristicForService(
            SERVICE_UUID, CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    console.error("BLE Error:", error);
                    return;
                }
                let receivedData = atob(characteristic.value);
                console.log("📩 Raw BLE Data:", receivedData);
                handleBLEData(receivedData);
            }
        );
    }
}, [device]);

  let contactBuffer = "";

const handleBLEData = (data) => {
    let receivedText = data.value;  // Convert BLE data to string
    console.log("📩 Received BLE Data:", receivedText);

    contactBuffer += receivedText; // Append incoming data

    // Check if the full data is received (e.g., ends with a newline or specific marker)
    if (contactBuffer.includes("✅ All contacts sent.")) {
        processContacts(contactBuffer);
        contactBuffer = ""; // Reset buffer
    }
};

const processContacts = (fullData) => {
    console.log("📋 Full contact data received:", fullData);

    let contactsArray = fullData.split(",").map(contact => {
        let parts = contact.split(":");
        return {
            id: parts[0]?.trim(),
            name: parts[1]?.trim(),
            number: parts[2]?.trim()
        };
    });

    setReceivedContact(contactsArray);  // Ensure `setReceivedContacts` is defined in useState
};

  

  const sendContactData = async (contactData) => {
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

        const base64Data = Buffer.from(contactData, 'utf-8').toString('base64');
        console.log("🛠 Encoded Base64 Data:", base64Data);

        await device.writeCharacteristicWithoutResponseForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            base64Data
        );

        console.log('✅ Contact data sent successfully!');
        Alert.alert("Success", "Contact sent successfully!");
    } catch (error) {
        console.error('❌ Failed to send contact data:', error);
        Alert.alert('Error', 'Failed to send contact data. Check connection.');
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
    await sendContactData(contactData);
  };

  const disconnectDevice = async () => {
    if (device) {
      try {
        const isConnected = await device.isConnected();
        if (isConnected) {
          await device.cancelConnection();
        }
        setConnected(false);
        setDevice(null);
        Alert.alert("Disconnected", "Device has been disconnected.");
      } catch (error) {
        console.error('Failed to disconnect:', error);
        Alert.alert('Error', 'Failed to disconnect the device.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput style={styles.input} placeholder="Enter Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter Number" value={number} onChangeText={setNumber} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.button} onPress={sendContact} disabled={!connected}>
        <Text style={styles.buttonText}>Send Contact</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={disconnectDevice} disabled={!connected}>
        <Text style={styles.buttonText}>Disconnect</Text>
      </TouchableOpacity>

      <Text>Status: {connected ? "Connected" : "Not Connected"}</Text>
      {receivedContact ? <Text>Received Contact: {receivedContact}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
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