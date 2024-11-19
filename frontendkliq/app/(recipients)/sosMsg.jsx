// import React from 'react';
// import { View, Text } from 'react-native';
// import { NativeWindStyleSheet } from "nativewind";

// NativeWindStyleSheet.setOutput({
//   default: "native",
// });

// const SOSMSG = () => {
//   const messages = [
//     {
//       timestamp: '7/17/24 2:11 PM',
//       phoneNumber: '+63 9123 1234 123',
//       message: 'I need Help! Please send help or you can call me or send a text message in my primary phone number.',
//       location: 'User\'s Location:',
//     },
//     {
//       timestamp: '8/11/24 11:11 PM',
//       phoneNumber: '+63 9123 1234 123',
//       message: 'I need Help! Please send help or you can call me or send a text message in my primary phone number.',
//       location: 'User\'s Location: (logic - google api i guess :>)',
//     },
//   ];

//   return (
//     <View className={`flex p-4`}>
//       {messages.map((message, index) => (
//         <View key={index} className={`border border-gray-300 rounded-lg p-4 mb-4`}>
//           <Text className={`text-sm text-gray-500 mb-2`}>{message.timestamp}</Text>
//           <Text className={`font-bold mb-2`}>{message.phoneNumber}</Text>
//           <Text className={`mb-2`}>{message.message}</Text>
//           <Text className={`text-sm text-gray-500`}>{message.location}</Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// export default SOSMSG;

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const SOSMSG = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://ad6b-180-190-97-248.ngrok-free.app/sms'); // Use your actual URL
        console.log("Response data:", response.data); // Log response data
        setMessages(Array.isArray(response.data) ? response.data : []); // Set messages state
      } catch (error) {
        console.error("Error fetching messages:", error.response ? error.response.data : error.message);
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    

    fetchMessages();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <View key={message._id} className="border border-gray-300 rounded-lg p-4 mb-4">
            <Text className="text-sm text-gray-500 mb-2">
              {new Date(message.receivedAt).toLocaleString()}
            </Text>
            <Text className="font-bold mb-2">{message.phoneNumber}</Text>
            <Text className="mb-2">{message.message}</Text>
          </View>
        ))
      ) : (
        <Text className="text-center text-gray-500">No messages available</Text>
      )}
    </View>
  );
};

export default SOSMSG;