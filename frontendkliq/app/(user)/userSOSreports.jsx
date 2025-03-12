  import React, { useEffect, useState } from 'react';
  import { View, Text, TouchableOpacity, ScrollView, Linking, FlatList, ActivityIndicator, Modal, Pressable } from 'react-native';
  import Icon from 'react-native-vector-icons/FontAwesome';
  import axios from 'axios';
  import { API_URL } from "@env";
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { BarChart } from 'react-native-gifted-charts'; // Importing BarChart from Gifted Charts

  const UserSOSReports = () => {
    const [sosMessages, setSOSMessages] = useState([]);
    const [expandedDates, setExpandedDates] = useState({});
    const [deviceId, setDeviceId] = useState(null);
    const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [isMonthDropdownVisible, setIsMonthDropdownVisible] = useState(false);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
      'October', 'November', 'December'
    ];

    useEffect(() => {
      const fetchDeviceId = async () => {
        try {
          const storedDeviceId = await AsyncStorage.getItem('uniqueId');
          if (storedDeviceId) {
            setDeviceId(storedDeviceId);
          } else {
            console.error("Device ID not found in storage");
          }
        } catch (error) {
          console.error("Error fetching device ID from storage:", error);
        }
      };

      fetchDeviceId();
    }, []);

    useEffect(() => {
      if (!deviceId) return;

      const fetchSOSMessages = async () => {
        try {
          const response = await axios.get(`${API_URL}/users/get-filteredSosMessages/${deviceId}`);
          const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
          setSOSMessages(sortedMessages);
          calculateWeeklyData(sortedMessages);
        } catch (error) {
          console.error('Error fetching SOS messages:', error);
        }
      };

      fetchSOSMessages(); // Initial fetch
      const intervalId = setInterval(fetchSOSMessages, 1000); // Refresh every 1s

      return () => clearInterval(intervalId);
    }, [deviceId, selectedMonth]);

    const calculateWeeklyData = (messages) => {
      const weeks = [0, 0, 0, 0];
      messages.filter((msg) => new Date(msg.receivedAt).getMonth() === selectedMonth)
        .forEach((msg) => {
          const sosDate = new Date(msg.receivedAt);
          const week = Math.ceil(sosDate.getDate() / 7) - 1;
          weeks[week] += 1;
        });
      setWeeklyData(weeks);
    };

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

    const containsLastWord = (message) => {
      if (!message) return false;
      return String(message).toLowerCase().split(/\s+/).includes("last");
    };

    const totalAlerts = weeklyData.reduce((sum, count) => sum + count, 0);
    
    const barData = weeklyData.map((value, index) => ({
      value,
      label: `${index + 1}${['st', 'nd', 'rd', 'th'][index]} week`,
      frontColor: '#FF0000',
    }));

    return (
      <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
        <ScrollView>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          TOTAL: {totalAlerts} Alert Messages this
        </Text>

        {/* Month Selection Button */}
        <TouchableOpacity
          onPress={() => setIsMonthDropdownVisible(true)}
          style={{
            width: '50%',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            padding: 10,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: '#333' }}>
            {months[selectedMonth]}
          </Text>
        </TouchableOpacity>

        {/* Month Selection Modal */}
        <Modal
          visible={isMonthDropdownVisible}
          transparent={true}
          animationType="fade"
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setIsMonthDropdownVisible(false)} // Close when tapping outside
          >
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                width: '80%',
              }}
            >
              <FlatList
                data={months}
                keyExtractor={(item, index) => index.toString()}
                nestedScrollEnabled={true}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMonth(index);
                      setIsMonthDropdownVisible(false);
                    }}
                    style={{
                      padding: 10,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        <BarChart
          data={barData}
          barWidth={30}
          noOfSections={5}
          height={220}
          frontColor="lightgray"
          barBorderRadius={4}
          style={{ marginVertical: 8 }}
        />

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
                  marginBottom: 3,
                  padding: 30,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: '#e5e7eb',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="chevron-down" size={16} color="black" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>
                    {date}
                  </Text>
                </View>
                <Icon name="exclamation-triangle" size={20} color="red" />
              </TouchableOpacity>

              {expandedDates[date] ? (
                groupedMessages[date].map((message, index) => (
                  <View
                    key={index}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      marginTop: 8,
                      backgroundColor: '#f3f4f6',
                      borderWidth: 2,
                      borderColor: containsLastWord(message.message) ? '#FF0000' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(message.receivedAt).toLocaleTimeString()}
                    </Text>

                    {message.message ? (
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
                        {String(message.message)}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
                        (No Message)
                      </Text>
                    )}

                    <Text style={{ color: '#6b7280', marginTop: 4 }}>
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
      </View>
    );
  };

  export default UserSOSReports;

// ----------------------------



// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import axios from 'axios';
// import { API_URL } from "@env";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const UserSOSReports = () => {
//   const [sosMessages, setSOSMessages] = useState([]);
//   const [expandedDates, setExpandedDates] = useState({});
//   const [deviceId, setDeviceId] = useState(null);

//   useEffect(() => {
//     const fetchDeviceId = async () => {
//       try {
//         const storedDeviceId = await AsyncStorage.getItem('uniqueId');
//         if (storedDeviceId) {
//           setDeviceId(storedDeviceId);
//         } else {
//           console.error("Device ID not found in storage");
//         }
//       } catch (error) {
//         console.error("Error fetching device ID from storage:", error);
//       }
//     };

//     fetchDeviceId();
//   }, []);

//   useEffect(() => {
//     if (!deviceId) return;

//     const fetchSOSMessages = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/users/get-filteredSosMessages/${deviceId}`);
//         const sortedMessages = response.data.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
//         setSOSMessages(sortedMessages);
//       } catch (error) {
//         console.error('Error fetching SOS messages:', error);
//       }
//     };

//     fetchSOSMessages(); // Initial fetch
//     const intervalId = setInterval(fetchSOSMessages, 1000); // Refresh every 5s

//     return () => clearInterval(intervalId);
//   }, [deviceId]);

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

//   const containsLastWord = (message) => {
//     if (!message) return false;
//     return String(message).toLowerCase().split(/\s+/).includes("last");
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
//       <ScrollView>
//         <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
//           SOS Reports
//         </Text>

//         {Object.keys(groupedMessages).map((date) => (
//           <View key={date} style={{ marginBottom: 8 }}>
//             <TouchableOpacity
//               onPress={() => toggleExpand(date)}
//               style={{
//                 backgroundColor: 'white',
//                 borderRadius: 16,
//                 marginBottom: 3,
//                 padding: 30,
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 borderWidth: 3,
//                 borderColor: '#e5e7eb',
//               }}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Icon name="chevron-down" size={16} color="black" style={{ marginRight: 8 }} />
//                 <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>
//                   {date}
//                 </Text>
//               </View>
//               <Icon name="exclamation-triangle" size={20} color="red" />
//             </TouchableOpacity>

//             {expandedDates[date] ? (
//               groupedMessages[date].map((message, index) => (
//                 <View
//                   key={index}
//                   style={{
//                     padding: 16,
//                     borderRadius: 16,
//                     marginTop: 8,
//                     backgroundColor: '#f3f4f6',
//                     borderWidth: 2,
//                     borderColor: containsLastWord(message.message) ? '#FF0000' : '#e5e7eb',
//                   }}
//                 >
//                   <Text style={{ color: '#6b7280', fontSize: 12 }}>
//                     {new Date(message.receivedAt).toLocaleTimeString()}
//                   </Text>

//                   {message.message ? (
//                     <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
//                       {String(message.message)}
//                     </Text>
//                   ) : (
//                     <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
//                       (No Message)
//                     </Text>
//                   )}

//                   <Text style={{ color: '#6b7280', marginTop: 4 }}>
//                     Location: Lat {message.latitude}, Lng {message.longitude}
//                   </Text>

//                   <TouchableOpacity
//                     onPress={() =>
//                       Linking.openURL(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`)
//                     }
//                     style={{ marginTop: 8 }}
//                   >
//                     <Text style={{ color: '#3b82f6', textDecorationLine: 'underline' }}>
//                       View on Google Maps
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ))
//             ) : null}
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// export default UserSOSReports;
