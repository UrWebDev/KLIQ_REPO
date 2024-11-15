import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const SOSMessage = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">SOS Reports</Text>
        <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
          <Text className="text-gray-700">X</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        <View className="bg-gray-100 rounded-lg mb-4 p-4">
          <Text className="text-gray-500 text-sm">7/17/24 2:11 PM</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">+63 9123 1234 123</Text>
            <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
              <Text className="text-white">Call</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-700 mt-2">I need Help! Please send help or you can call me or send a text message in my personal phone number.</Text>
          <Text className="text-gray-500 mt-2">User's Location:</Text>
        </View>

        <View className="bg-gray-100 rounded-lg mb-4 p-4">
          <Text className="text-gray-500 text-sm">8/11/24 11:11 PM</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">+63 9123 1234 123</Text>
            <TouchableOpacity className="bg-blue-500 p-2 rounded-full">
              <Text className="text-white">Call</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-700 mt-2">I need Help! Please send help or you can call me or send a text message in my personal phone number.</Text>
          <Text className="text-gray-500 mt-2">User's Location:</Text>
        </View>
      </View>

    </View>
  );
};

export default SOSMessage;