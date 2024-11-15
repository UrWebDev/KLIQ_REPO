import React from 'react';
import { View, Text } from 'react-native';

import { NativeWindStyleSheet } from "nativewind";


const Contacts = () => {
  return (
    <View className={`flex items-center justify-center bg-gray-100`}>
      <Text className={`text-2xl font-bold mb-4`}>Emergency Contact Card</Text>
      <View className={`mb-4`}>
        <Text className={`text-lg mb-2`}>User's Primary Number:</Text>
        <View className={`flex flex-row items-center bg-blue-500 rounded-md p-2`}>
          <Text className={`text-white mr-2`}>📞</Text>
          <Text className={`text-white`}>+63 9123 1234 123</Text>
        </View>
      </View>
      <Text className={`text-2xl font-bold mb-4`}>Emergency Hotlines</Text>
      <View className={`mb-2`}>
        <View className={`flex flex-row items-center bg-blue-500 rounded-md p-2`}>
          <Text className={`text-white mr-2`}>📞</Text>
          <Text className={`text-white`}>9-1-1</Text>
        </View>
      </View>
      <View className={`mb-2`}>
        <View className={`flex flex-row items-center bg-blue-500 rounded-md p-2`}>
          <Text className={`text-white mr-2`}>📞</Text>
          <Text className={`text-white`}>1-1-7</Text>
        </View>
      </View>
      <View className={`mb-2`}>
        <View className={`flex flex-row items-center bg-blue-500 rounded-md p-2`}>
          <Text className={`text-white mr-2`}>📞</Text>
          <Text className={`text-white`}>1-2-3</Text>
        </View>
      </View>
    </View>
  );
};

export default Contacts;
NativeWindStyleSheet.setOutput({
  default: "native",
});
