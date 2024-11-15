import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const SOSReports = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">SOS Reports</Text>
        <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
          <Text className="text-gray-700">X</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">7/17/24 2:11 PM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">8/11/24 11:11 PM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">9/11/24 12:11 PM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">10/11/24 4:11 PM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">11/11/24 11:11 AM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">11/11/24 11:11 AM</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 rounded-lg p-4 mb-2">
          <Text className="text-red-500 text-lg font-semibold">9/17/24 8:00 AM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SOSReports;