// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity } from 'react-native';

// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faPlus, faMinus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { NativeWindStyleSheet } from "nativewind";

// NativeWindStyleSheet.setOutput({
//   default: "native",
// });


// const Contactss = () => {
//   const [kliqNumber, setKliqNumber] = useState('+63 9123 1234 123');
//   const [recipients, setRecipients] = useState([
//     { name: 'Liz', number: '+63 9321 4321 321' },
//     { name: 'Jojo', number: '+63 1435 6666 111' },
//     { name: 'Kev', number: '+63 1234 1456 851' },
//   ]);
//   const [newRecipientName, setNewRecipientName] = useState('');
//   const [newRecipientNumber, setNewRecipientNumber] = useState('');

//   const handleAddRecipient = () => {
//     if (newRecipientName && newRecipientNumber) {
//       setRecipients([...recipients, { name: newRecipientName, number: newRecipientNumber }]);
//       setNewRecipientName('');
//       setNewRecipientNumber('');
//     }
//   };

//   const handleDeleteRecipient = (index) => {
//     setRecipients(recipients.filter((_, i) => i !== index));
//   };

//   return (
//     <View className={`flex p-4`}>
//       <Text className={`text-2xl font-bold mb-4`}>Contact Management</Text>
//       <View className={`mb-4`}>
//         <Text className={`mb-2`}>KLIQ's Number:</Text>
//         <TextInput
//           className={`border border-gray-300 rounded-lg p-2`}
//           value={kliqNumber}
//           onChangeText={setKliqNumber}
//         />
//       </View>
//       <Text className={`mb-4`}>Add Recipients (10):</Text>
//       <View>
//         {recipients.map((recipient, index) => (
//           <View key={index} className={`flex flex-row items-center mb-4`}>
//             <Text className={`flex-1`}>{recipient.name}</Text>
//             <Text className={`ml-2`}>{recipient.number}</Text>
//             <TouchableOpacity onPress={() => handleDeleteRecipient(index)}>
//               <View className={`bg-red-500 rounded-lg p-2`}>
//                 <FontAwesomeIcon icon={faTimes} size={12} color="#fff" />
//                 <Text className={`text-white`}>X</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         ))}
//         <View className={`flex flex-row items-center mb-4`}>
//           <TextInput
//             className={`border border-gray-300 rounded-lg p-2 flex-1 mr-2`}
//             placeholder="Name"
//             value={newRecipientName}
//             onChangeText={setNewRecipientName}
//           />
//           <TextInput
//             className={`border border-gray-300 rounded-lg p-2 flex-1 mr-2`}
//             placeholder="Number"
//             value={newRecipientNumber}
//             onChangeText={setNewRecipientNumber}
//           />
//           <TouchableOpacity onPress={handleAddRecipient}>
//             <View className={`bg-blue-500 rounded-lg p-2`}>
//               <FontAwesomeIcon icon={faPlus} size={12} color="#fff" />
//               <Text className={`text-white`}>+</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default Contactss;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faMinus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

const Contactss = () => {
  const [kliqNumber, setKliqNumber] = useState('+63 9123 1234 123');
  const [recipients, setRecipients] = useState([
    { name: 'Liz', number: '+63 9321 4321 321' },
    { name: 'Jojo', number: '+63 1435 6666 111' },
    { name: 'Kev', number: '+63 1234 1456 851' },
  ]);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientNumber, setNewRecipientNumber] = useState('');
  const [manager, setManager] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    if (Platform.OS === 'android') {
      requestLocationPermission();
    }

    return () => {
      bleManager.destroy();
    };
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs location permission to access Bluetooth',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        return;
      }

      // Adjust this based on your device's name or UUID
      if (device.name === 'KLIQ-Device' || device.id === 'YOUR_DEVICE_UUID') {
        manager.stopDeviceScan();
        device
          .connect()
          .then((connectedDevice) => {
            setConnectedDevice(connectedDevice);
            return connectedDevice.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            console.log('Connected to device:', device.name);
          })
          .catch((error) => console.warn('Connection error:', error));
      }
    });
  };

  const handleAddRecipient = () => {
    if (newRecipientName && newRecipientNumber) {
      setRecipients([...recipients, { name: newRecipientName, number: newRecipientNumber }]);
      setNewRecipientName('');
      setNewRecipientNumber('');
      sendDataToDevice(newRecipientName, newRecipientNumber); // Send the new contact to the device
    }
  };

  const handleDeleteRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const sendDataToDevice = async (name, number) => {
    if (!connectedDevice) {
      console.warn('No connected device');
      return;
    }

    const contactData = `${name}:${number}`;

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        'YOUR_SERVICE_UUID', // Replace with the service UUID
        'YOUR_CHARACTERISTIC_UUID', // Replace with the characteristic UUID
        Buffer.from(contactData).toString('base64')
      );
      console.log('Data sent to device:', contactData);
    } catch (error) {
      console.warn('Error sending data:', error);
    }
  };

  return (
    <View className={`flex p-4`}>
      <Text className={`text-2xl font-bold mb-4`}>Contact Management</Text>
      <View className={`mb-4`}>
        <Text className={`mb-2`}>KLIQ's Number:</Text>
        <TextInput
          className={`border border-gray-300 rounded-lg p-2`}
          value={kliqNumber}
          onChangeText={setKliqNumber}
        />
      </View>
      <TouchableOpacity onPress={scanAndConnect} className={`bg-green-500 rounded-lg p-2 mb-4`}>
        <Text className={`text-white text-center`}>Connect to Device</Text>
      </TouchableOpacity>
      <Text className={`mb-4`}>Add Recipients (10):</Text>
      <View>
        {recipients.map((recipient, index) => (
          <View key={index} className={`flex flex-row items-center mb-4`}>
            <Text className={`flex-1`}>{recipient.name}</Text>
            <Text className={`ml-2`}>{recipient.number}</Text>
            <TouchableOpacity onPress={() => handleDeleteRecipient(index)}>
              <View className={`bg-red-500 rounded-lg p-2`}>
                <FontAwesomeIcon icon={faTimes} size={12} color="#fff" />
                <Text className={`text-white`}>X</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
        <View className={`flex flex-row items-center mb-4`}>
          <TextInput
            className={`border border-gray-300 rounded-lg p-2 flex-1 mr-2`}
            placeholder="Name"
            value={newRecipientName}
            onChangeText={setNewRecipientName}
          />
          <TextInput
            className={`border border-gray-300 rounded-lg p-2 flex-1 mr-2`}
            placeholder="Number"
            value={newRecipientNumber}
            onChangeText={setNewRecipientNumber}
          />
          <TouchableOpacity onPress={handleAddRecipient}>
            <View className={`bg-blue-500 rounded-lg p-2`}>
              <FontAwesomeIcon icon={faPlus} size={12} color="#fff" />
              <Text className={`text-white`}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Contactss;
