// global.Buffer = require('buffer').Buffer;
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   Alert,
//   StyleSheet,
//   TouchableOpacity
// } from 'react-native';
// import { BleManager } from 'react-native-ble-plx';


// const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
// const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";


// const Contactss = () => {
//   const [manager] = useState(new BleManager());
//   const [device, setDevice] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [name, setName] = useState('');
//   const [number, setNumber] = useState('');


//   useEffect(() => {
//     const subscription = manager.onStateChange((state) => {
//       if (state === 'PoweredOn') {
//         scanAndConnect();
//         subscription.remove();
//       }
//     }, true);


//     return () => {
//       manager.destroy();
//     };
//   }, [manager]);


//   const scanAndConnect = () => {
//     manager.startDeviceScan(null, null, async (error, scannedDevice) => {
//       if (error) {
//         console.error("Scan error:", error);
//         return;
//       }


//       // Look for the specific device by name
//       if (scannedDevice && scannedDevice.name === 'ESP32-ContactDevice') {
//         manager.stopDeviceScan();
//         try {
//           await connectToDevice(scannedDevice);
//         } catch (error) {
//           console.error("Initial connection attempt failed:", error);
//           Alert.alert("Retrying connection", "Attempting to reconnect...");
//           // Retry connection after a delay
//           setTimeout(() => connectToDevice(scannedDevice), 3000);
//         }
//       }
//     });
//   };


//   const connectToDevice = async (scannedDevice) => {
//     try {
//       // Attempt to connect to the device
//       const connectedDevice = await scannedDevice.connect();
//       await connectedDevice.discoverAllServicesAndCharacteristics();


//       // Introduce a short delay after connection to stabilize
//       setTimeout(async () => {
//         // Verify the connection status after delay
//         const isConnected = await connectedDevice.isConnected();
//         if (isConnected) {
//           setDevice(connectedDevice);
//           setConnected(true);
//           Alert.alert("Success", "Connected to device!");
//         } else {
//           throw new Error("Failed to establish a reliable connection");
//         }
//       }, 1000);  // Wait for 1 second before verifying the connection


//     } catch (error) {
//       console.error("Connection error:", error);
//       Alert.alert("Error", "Failed to connect to device. Please try again.");
//     }
//   };


//   const sendContactData = async (contactData) => {
//     if (!device || !connected) {
//       console.error('Device is not connected!');
//       Alert.alert('Connection Error', 'Please connect to the device first.');
//       return;
//     }


//     try {
//       // Ensure the device is connected before proceeding
//       const isConnected = await device.isConnected();
//       console.log("Device connection status:", isConnected); // Log connection status


//       // If not connected, attempt reconnection
//       if (!isConnected) {
//         console.log('Attempting to reconnect...');
//         await connectToDevice(device);  // Try to reconnect
//         const isConnectedRetry = await device.isConnected();
//         if (!isConnectedRetry) {
//           console.error('Device still not connected!');
//           Alert.alert('Connection Error', 'Unable to reconnect to the device.');
//           return;
//         }
//       }


//       // Convert contact data to Base64 before sending
//       const base64Data = Buffer.from(contactData).toString('base64'); // Convert to Base64 string
 
//       // Discover services and characteristics
//       await device.discoverAllServicesAndCharacteristics();
 
//       // Write the Base64 encoded data to the ESP32 device
//       await device.writeCharacteristicWithoutResponseForService(
//         SERVICE_UUID,          // The service UUID
//         CHARACTERISTIC_UUID,   // The characteristic UUID
//         base64Data             // The Base64 encoded data
//       );
     
//       console.log('Contact data sent successfully!');
//       Alert.alert("Success", "Contact sent successfully!");
//     } catch (error) {
//       console.error('Failed to send contact data:', error);
//       Alert.alert('Error', 'Failed to send contact data');
//     }
//   };


//   const sendContact = async () => {
//     if (!connected || !device) {
//       Alert.alert("Error", "Not connected to a device.");
//       return;
//     }


//     if (!name || !number) {
//       Alert.alert("Error", "Please enter both name and number.");
//       return;
//     }


//     const contactData = `${name},${number}`;
   
//     // Use sendContactData function
//     await sendContactData(contactData);
//   };


//   const disconnectDevice = async () => {
//     if (device) {
//       try {
//         // Check if the device is actually connected
//         const isConnected = await device.isConnected();
//         if (isConnected) {
//           // Attempt to cancel the connection if still connected
//           await device.cancelConnection();
//           console.log("Device disconnected successfully.");
//         } else {
//           console.log("Device was already disconnected.");
//         }
 
//         // Update the states regardless to ensure UI reflects the status correctly
//         setConnected(false);
//         setDevice(null);
//         Alert.alert("Disconnected", "Device has been disconnected.");
       
//       } catch (error) {
//         console.error('Failed to disconnect:', error);
//         Alert.alert('Error', 'Failed to disconnect the device.');
//       }
//     } else {
//       Alert.alert('Error', 'No device to disconnect.');
//     }
//   };
 
 


//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Emergency Contact App</Text>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Contact Name"
//           value={name}
//           onChangeText={setName}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Contact Number"
//           value={number}
//           onChangeText={setNumber}
//           keyboardType="phone-pad"
//         />
//       </View>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={sendContact}
//         disabled={!connected}
//       >
//         <Text style={styles.buttonText}>Send Contact</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={disconnectDevice}
//         disabled={!connected} // Disable when not connected
//       >
//   <Text style={styles.buttonText}>Disconnect</Text>
// </TouchableOpacity>


//       <Text style={styles.status}>
//         Status: {connected ? "Connected" : "Not Connected"}
//       </Text>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   inputContainer: {
//     width: '80%',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#DDD',
//     padding: 10,
//     marginVertical: 10,
//     borderRadius: 8,
//     backgroundColor: '#FFF',
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     padding: 15,
//     borderRadius: 8,
//     marginVertical: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   status: {
//     fontSize: 16,
//     marginTop: 20,
//   },
// });


// export default Contactss;