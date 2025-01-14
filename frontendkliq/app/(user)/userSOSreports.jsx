import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from "@env"; // Use your .env file for API_URL
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem('uniqueId');
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          console.error("Recipient ID not found in storage");
        }
      } catch (error) {
        console.error("Error fetching recipient ID from storage:", error);
      }
    };

    fetchDeviceId();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const fetchSOSMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/get-filteredSosMessages/${deviceId}`);
        const sortedMessages = response.data.sort((a, b) => {
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
  }, [deviceId]);

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.receivedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(sosMessages);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 16 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
            SOS Reports
          </Text>

          {Object.keys(groupedMessages).map((date) => (
            <View key={date} style={{ marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => toggleExpand(date)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  marginBottom: 8,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#1f2937', fontWeight: 'bold' }}>{date}</Text>
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>

              {expandedDates[date] ? (
                groupedMessages[date].map((message, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      marginTop: 8,
                      borderRadius: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                      {message.message}
                    </Text>
                    <Text style={{ color: '#374151', marginTop: 8 }}>
                      Location: Lat {message.latitude}, Lng {message.longitude}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)
                      }
                      style={{ marginTop: 8 }}
                    >
                      <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }}>
                        View on Google Maps
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default UserSOSReports;

// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// import axios from 'axios';
// import { API_URL } from "@env";

// const UserSOSReports = () => {
//   const [sosMessages, setSOSMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedDates, setExpandedDates] = useState({});

//   useEffect(() => {
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

//   const groupMessagesByDate = (messages) => {
//     return messages.reduce((acc, message) => {
//       const date = new Date(message.receivedAt).toLocaleDateString();
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push(message);
//       return acc;
//     }, {});
//   };

//   const groupedMessages = groupMessagesByDate(sosMessages);

//   const toggleExpand = (date) => {
//     setExpandedDates((prev) => ({
//       ...prev,
//       [date]: !prev[date],
//     }));
//   };

//   return (
//     <View className="flex-1 bg-gray-100 p-4">
//       <Text className="text-3xl font-bold mb-4">SOS Reports</Text>
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <ScrollView>
//           {Object.keys(groupedMessages).map((date) => (
//             <View key={date} className="mb-4">
//               <TouchableOpacity
//                 onPress={() => toggleExpand(date)}
//                 className="bg-blue-500 rounded-lg p-4 flex-row justify-between items-center"
//               >
//                 <Text className="text-white font-bold">{date}</Text>
//                 <View>
//                   <FontAwesomeIcon icon={faExclamationTriangle} size={20} color="white" />
//                 </View>
//               </TouchableOpacity>
//               {expandedDates[date] ? (
//                 groupedMessages[date].map((message, index) => (
//                   <View key={index} className="bg-white p-4 border border-gray-300 mt-2 rounded-lg">
//                     <Text className="text-gray-500 text-sm">
//                       {new Date(message.receivedAt).toLocaleTimeString()}
//                     </Text>
//                     <Text className="text-lg font-semibold">{message.message}</Text>
//                     <Text className="text-gray-700 mt-2">
//                       Location: Lat {message.latitude}, Lng {message.longitude}
//                     </Text>
//                     <TouchableOpacity
//                       onPress={() =>
//                         Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)
//                       }
//                       className="mt-2"
//                     >
//                       <Text className="text-blue-500 underline">View on Google Maps</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))
//               ) : null}
//             </View>
//           ))}
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// export default UserSOSReports;
