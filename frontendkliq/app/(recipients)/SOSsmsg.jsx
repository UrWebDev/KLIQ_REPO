// import React from 'react';
// import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Material Icons for the call icon

// const SOSMessage = () => {
//   const handleCall = (phoneNumber) => {
//     // Make sure to format the phone number correctly
//     Linking.openURL(`tel:${phoneNumber}`);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.messageContainer}>
//         <View style={styles.messageBox}>
//           <Text style={styles.timestamp}>7/17/24 2:11 PM</Text>
//           <View style={styles.header}>
//             <Text style={styles.phoneNumber}>+63 9123 1234 123</Text>
//             <TouchableOpacity onPress={() => handleCall('+6391231234123')} style={styles.callButton}>
//               <Icon name="call" size={24} color="#007BFF" />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.messageText}>I need Help! Please send help or you can call me or send a text message in my personal phone number.</Text>
//           <Text style={styles.locationLabel}>User's Location:</Text>
//         </View>

//         <View style={styles.messageBox}>
//           <Text style={styles.timestamp}>8/11/24 11:11 PM</Text>
//           <View style={styles.header}>
//             <Text style={styles.phoneNumber}>+63 9123 1234 123</Text>
//             <TouchableOpacity onPress={() => handleCall('+6391231234123')} style={styles.callButton}>
//               <Icon name="call" size={24} color="#007BFF" />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.messageText}>I need Help! Please send help or you can call me or send a text message in my personal phone number.</Text>
//           <Text style={styles.locationLabel}>User's Location:</Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   messageContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   messageBox: {
//     backgroundColor: '#f7f7f7',
//     borderRadius: 8,
//     marginBottom: 16,
//     padding: 16,
//     elevation: 1, // Add shadow for Android
//     shadowColor: '#000', // Add shadow for iOS
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//     borderWidth: 2,
//     borderColor: '#ccc',
//   },
//   timestamp: {
//     color: '#888',
//     fontSize: 12,
//     marginBottom: 8,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   phoneNumber: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   callButton: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 5,
//     backgroundColor: '#f2f2f2',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   messageText: {
//     color: '#000',
//     marginBottom: 8,
//   },
//   locationLabel: {
//     color: '#888',
//     fontSize: 12,
//   },
// });

// export default SOSMessage;


import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
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
        setSOSMessages(response.data);
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
          {sosMessages.length > 0 ? (
            sosMessages.map((sos, index) => (
              <View key={index} className="bg-gray-100 rounded-lg mb-4 p-4">
                <Text className="text-gray-500 text-sm">
                  {new Date(sos.createdAt).toLocaleString()} {/* Format the date */}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold">{sos.message}</Text>
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

