// app/recipients/contactList.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ContactList = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">Contacts List</Text>
        <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
          <Text className="text-gray-700">X</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-lg font-semibold px-4 py-4">User's Primary Number:</Text>
        <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">Primary Number</Text>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
            <Text className="text-white">+63 9123 1234 123</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-semibold px-4 py-4">Emergency Hotlines</Text>
        <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">Philippine National Emergency</Text>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
            <Text className="text-white">9-1-1</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">PNP</Text>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
            <Text className="text-white">1-1-7</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">Cavite Medical Hospital</Text>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
            <Text className="text-white">1-2-3</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ContactList;