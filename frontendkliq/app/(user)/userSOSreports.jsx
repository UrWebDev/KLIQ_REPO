import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, FlatList, ActivityIndicator, Modal, Pressable, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this is installed
import axios from 'axios';
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-gifted-charts';

const UserSOSReports = () => {
  const [sosMessages, setSOSMessages] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [deviceId, setDeviceId] = useState(null);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isMonthDropdownVisible, setIsMonthDropdownVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', age: '', bloodType: '' });

  const dropdownAnim = useState(new Animated.Value(0))[0];

  const screenHeight = Dimensions.get('window').height;
  const dynamicPaddingTop = screenHeight * 0.08; // 5% of screen height as top padding

  useEffect(() => {
    if (isMonthDropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isMonthDropdownVisible]);

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

        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/profiles`, {
          params: { uniqueId: deviceId },
        });
        setUserDetails(userResponse.data);
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

  const getBorderColor = (message) => {
    if (!message) return '#000'; // Default black

    const words = message.toLowerCase().split(/\s+/);
    if (words.includes('last')) return '#EF4444'; // Red for "last"
    if (words.includes('safe')) return '#00FF00'; // Green for "safe"

    return '#000'; // Default black
  };

  const totalAlerts = weeklyData.reduce((sum, count) => sum + count, 0);

  const barData = weeklyData.map((value, index) => ({
    value,
    label: `${index + 1}${['st', 'nd', 'rd', 'th'][index]} week`,
    frontColor: '#FF0000',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20, paddingTop: dynamicPaddingTop }}>
      
      {/* User Details Section */}
      <View
        style={{
          backgroundColor: '#D1D5DB',
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#000',
          marginBottom: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          alignSelf: 'flex-end',
          width: '88%'
          
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
            Name:{' '}
          </Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
            {userDetails.name || 'Select a device to view details'}
          </Text>
        </View>
        {userDetails.name && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Age:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#111827' }}>
                {userDetails.age}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                Blood Type:{' '}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#4b5563' }}>
                {userDetails.bloodType}
              </Text>
            </View>
          </>
        )}
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
      {/* TOTAL Message */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            TOTAL:{' '}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            {totalAlerts}{' '}
          </Text>
          <Text style={{ fontSize: 20, fontStyle: 'italic', textAlign: 'center', marginBottom: 8 }}>
            Alert Messages this
          </Text>
        </View>

        {/* Month Selection Button */}
        <TouchableOpacity
          onPress={() => setIsMonthDropdownVisible(true)}
          className="flex-row items-center justify-between bg-gray-100 border border-gray-400 rounded-xl px-5 py-2 shadow-sm"
        >
          <View className="flex-row items-center space-x-2">
            <Text className="text-base text-black">
              {months[selectedMonth]}
            </Text>
          </View>
          <Icon
            name={isMonthDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="black"
          />
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
            onPress={() => setIsMonthDropdownVisible(false)}
          >
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 15,
                width: '80%',
              }}
            >
              {/* Close Button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>Select a Month</Text>
                <TouchableOpacity
                  onPress={() => setIsMonthDropdownVisible(false)}
                >
                  <Icon name="close" size={20} color="black" />
                </TouchableOpacity>
              </View>

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

        {/* Bar Chart */}
        <BarChart
          data={barData}
          barWidth={45}
          noOfSections={5} // Set to 5 for increments of 10 (0 to 50)
          maxValue={50} // Set the maximum value for the Y-axis
          height={220}
          frontColor="#FF0000"
          barBorderRadius={1}
          style={{ marginVertical: 8 }}
          yAxisLabelTexts={['0', '10', '20', '30', '40', '50']} // Custom Y-axis labels
        />
      </View>

      {/* SOS Reports Section */}
      {Object.keys(groupedMessages).map((date) => (
        <View key={date} style={{ marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => toggleExpand(date)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 40,
              paddingVertical: 28,
              backgroundColor: '#D1D5DB',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#000',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3, // For Android
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon
                name={expandedDates[date] ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color="black"
              />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{date}</Text>
            </View>
            <View style={{ height: '150%', width: 1, backgroundColor: 'black', marginHorizontal: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={{ fontSize: 20, fontStyle: 'italic', color: 'black' }}>
                {`${groupedMessages[date].length}+`}
              </Text>
              <Icon name="error" size={25} color="red" />
            </View>
          </TouchableOpacity>

          {expandedDates[date] &&
            groupedMessages[date].map((message, index) => (
              <View
                key={index}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  marginTop: 8,
                  backgroundColor: '#D1D5DB',
                  borderWidth: 1, // Ensure border is visible
                  borderColor: getBorderColor(message.message), // Apply dynamic border color
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-sm text-gray-600">
                  {new Date(message.receivedAt).toLocaleTimeString()}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {message.name}
                </Text>
                <Text className="text-lg font-extrabold text-black mt-3">
                  {message.message}
                </Text>
                <Text className="text-sm text-gray-600 italic mt-3">
                  Coordinates: Lat {message.latitude}, Lng {message.longitude}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps?q=${message.latitude},${message.longitude}`
                    )
                  }
                  className="mt-2"
                >
                  <Text className="text-blue-500 italic underline">
                    View on Google Maps
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
