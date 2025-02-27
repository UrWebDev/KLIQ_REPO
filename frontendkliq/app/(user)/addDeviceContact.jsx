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
  const [characteristic, setCharacteristic] = useState(null);


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
  useEffect(() => {
    if (device && characteristic) {
      const subscription = characteristic.monitor((error, characteristic) => {
        if (error) {
          console.error("Error receiving data:", error);
          return;
        }
        if (characteristic?.value) {
          const decodedValue = atob(characteristic.value); // Decode from Base64
          console.log("📥 Received contact data:", decodedValue);
          setReceivedContact((prev) => (prev ? `${prev},${decodedValue}` : decodedValue));
        }
      });
  
      return () => subscription.remove(); // Cleanup on unmount
    }
  }, [device, characteristic]);
  

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


const connectToDevice = async (device) => {
  try {
    await device.connect();
    console.log("✅ Connected to device:", device.id);
    setDevice(device);

    const services = await device.discoverAllServicesAndCharacteristics();
    console.log("🔍 Services discovered");

    // Find the correct BLE Service
    const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"; // Change if needed
    const service = await device.services().then(services => 
      services.find(s => s.uuid === serviceUUID)
    );

    if (!service) {
      console.error("❌ Service not found!");
      return;
    }

    // Find the correct BLE Characteristic
    const charUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"; // Change if needed
    const char = await service.characteristics().then(chars =>
      chars.find(c => c.uuid === charUUID)
    );

    if (!char) {
      console.error("❌ Characteristic not found!");
      return;
    }

    console.log("📡 Characteristic found:", char.uuid);
    setCharacteristic(char); // Save characteristic in state

    // Subscribe to notifications
    char.monitor((error, characteristic) => {
      if (error) {
        console.error("⚠️ Error receiving data:", error);
        return;
      }
      if (characteristic?.value) {
        const decodedValue = atob(characteristic.value); // Decode Base64
        console.log("📥 Received contact data:", decodedValue);
        setReceivedContact((prev) => (prev ? `${prev},${decodedValue}` : decodedValue));
      }
    });

    setConnected(true);
  } catch (error) {
    console.error("❌ Connection error:", error);
    setConnected(false);
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

    // 🛠 Read stored contacts first
    const characteristic = await connectedDevice.readCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID
    );

    if (characteristic?.value) {
      const initialValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
      console.log("📩 Initial Data:", initialValue);
      setReceivedContact(initialValue); // Update UI
    }

    // ✅ Start listening for notifications
    console.log("📡 Waiting before enabling notifications...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Give ESP32 time to send notifications

    connectedDevice.monitorCharacteristicForService(
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
          setReceivedContact(decodedValue);
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
  
      {receivedContact ? (
  <View style={styles.receivedContainer}>
    <Text style={styles.receivedTitle}>Received Contacts:</Text>
    {receivedContact.split(',').map((contact, index) => (
      <Text key={index} style={styles.receivedText}>{contact}</Text>
    ))}
  </View>
) : <Text>Waiting for contact to render.....</Text>}
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