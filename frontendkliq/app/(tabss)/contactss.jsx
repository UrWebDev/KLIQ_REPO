import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faMinus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
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

  const handleAddRecipient = () => {
    if (newRecipientName && newRecipientNumber) {
      setRecipients([...recipients, { name: newRecipientName, number: newRecipientNumber }]);
      setNewRecipientName('');
      setNewRecipientNumber('');
    }
  };

  const handleDeleteRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
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