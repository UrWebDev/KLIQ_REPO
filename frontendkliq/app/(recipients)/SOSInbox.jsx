// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
// import axios from 'axios';
// import { API_URL } from "@env";

// const SOSMessage = () => {
//   const [sosMessages, setSOSMessages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch SOS messages from the backend
//     const fetchSOSMessages = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/recipients/get-received-sosMessage`);
//         setSOSMessages(response.data);
//       } catch (error) {
//         console.error('Error fetching SOS messages:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSOSMessages();
//   }, []);

//   return (
//     <View className="flex-1 bg-white">
//       {loading ? (
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#0000ff" />
//           <Text className="text-gray-500 mt-4">Loading SOS Messages...</Text>
//         </View>
//       ) : (
//         <ScrollView className="flex-1 p-4">
//           {sosMessages.length > 0 ? (
//             sosMessages.map((sos, index) => (
//               <View key={index} className="bg-gray-100 rounded-lg mb-4 p-4 border border-gray-300 shadow-md">
//                 <Text className="text-gray-500 text-sm">
//                   {new Date(sos.createdAt).toLocaleString()} {/* Format the date */}
//                 </Text>
//                 <View className="flex-row justify-between items-center">
//                   <Text className="text-lg font-semibold">{sos.message}</Text>
//                 </View>
//                 <Text className="text-gray-700 mt-2">
//                   Location: Lat {sos.latitude}, Lng {sos.longitude}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => Linking.openURL(`http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`)}
//                   className="mt-2"
//                 >
//                   <Text className="text-blue-500 underline">View on Google Maps</Text>
//                 </TouchableOpacity>
//               </View>
//             ))
//           ) : (
//             <Text className="text-center text-gray-500">No SOS messages found.</Text>
//           )}
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// export default SOSMessage;


import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env";

const SOSMessage = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch SOS messages from the backend
    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipients/get-received-sosMessage`);
        const sortedMessages = response.data.sort((a, b) => {
          // Sort messages by receivedAt date in descending order
          return new Date(b.receivedAt) - new Date(a.receivedAt);
        });
        setSOSMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching SOS messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSMessages();
  }, []);

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-4">Loading SOS Messages...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Text className="text-3xl font-extrabold text-center mb-4">SOS Messages</Text>
          {sosMessages.length > 0 ? (
            sosMessages.map((sos, index) => (
              <View key={index} className="bg-gray-100 rounded-3xl mb-4 p-6 border-2 border-gray-300 shadow-md relative">
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm">
                    {sos.receivedAt
                      ? new Date(sos.receivedAt).toLocaleString() // This will show the date and time
                      : 'Date not available'}
                  </Text>
                  <Icon
                    name="exclamation-triangle"
                    size={15}
                    color="red"
                    style={{ marginLeft: 10 }}
                  />
                </View>
                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-lg font-extrabold">{sos.message}</Text>
                </View>
                <Text className="text-gray-700 mt-2">
                  Location: Lat {sos.latitude}, Lng {sos.longitude}
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`http://maps.google.com/maps?q=${sos.latitude},${sos.longitude}`)}
                  className="mt-2"
                >
                  <Text className="text-blue-500 underline">View on Google Maps</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500">No SOS messages found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SOSMessage;