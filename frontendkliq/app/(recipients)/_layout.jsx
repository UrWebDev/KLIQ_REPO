import { View, Text, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';  // useRouter for navigation
import { NativeWindStyleSheet } from 'nativewind';

// Tab icon component
const TabIcon = ({ color, name, focused }) => (
  <View className="items-center">
    <Text className={`${focused ? 'text-red-600' : 'text-black'} text-xs`} style={{ color: color }}>
      {name}
    </Text>
  </View>
);

const TabsLayout = () => {
    
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // or use AsyncStorage if needed
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirect to login if not authenticated
      router.push('/authScreen');
    }
  }, [router]);

  // Render the tabs only if the user is authenticated
  if (!isAuthenticated) {
    return null; // You can show a loading screen or return null until authentication is checked
  }

  const handleLogout = () => {
    // Clear authentication data (e.g., token)
    localStorage.removeItem('authToken');
    const checkTokenLogout = localStorage.getItem('authToken')
    console.log(checkTokenLogout)
    // Redirect to login screen
    router.push('/authScreen');
  };
  return (
    <>  <Button title="Logout" onPress={handleLogout} />
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'blue',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 84,
        },
        tabBarActiveTintColor: '#CDCDE0',
        tabBarInactiveTintColor: '#FFA001',
      }}
    >

      <Tabs.Screen
        name="sosMsg"
        options={{
          title: 'SOS TRY FETCH',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="SOS TRY FETCH" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="Contacts" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="SOSsmsg"
        options={{
          title: 'SOSsmsg',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="SOSsmsg" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipientSOSreport"
        options={{
          title: 'SOS reports',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} name="Sos Reports" focused={focused} />
          ),
        }}
      />
    </Tabs>
    </>
  );
};

export default TabsLayout;

NativeWindStyleSheet.setOutput({
  default: 'native',
});


// import { View, Text, Image } from 'react-native'
// import React from 'react'
// import {Tabs, Redirect} from 'expo-router'
// import { NativeWindStyleSheet } from "nativewind";




// const TabIcon =({ color, name, focused}) => {
//     return(
//         <View clasName='item-center'>
//             <Text clasName={`${focused? 'text-red-600' : 'text-black'} text-xs`} style={{color: color}}>
//                 {name}
//             </Text>
//         </View>
//     )
// }

// const TabsLayout = () => {
//   return (
//     <>
//     <Tabs
//         screenOptions={{tabBarShowLabel: false,
//             tabBarStyle:{
//                 backgroundColor: 'blue',
//                 borderTopWidth: 1,
//                 borderTopColor: '#232533',
//                 height:84,
//             },
//             tabBarActiveTintColor: '#CDCDE0',
//             tabBarInactiveTintColor: '#FFA001'
//         }}
//     >
        
        
//         <Tabs.Screen 
//             name='home'
//             options={{
//                 title: 'Home',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "Home"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//         <Tabs.Screen 
//             name='location'
//             options={{
//                 title: 'Location',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "Location"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//         <Tabs.Screen 
//             name='sosMsg'
//             options={{
//                 title: 'SOS',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "SOS"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//         <Tabs.Screen 
//             name='contacts'
//             options={{
//                 title: 'Contacts',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "Contacts"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//         <Tabs.Screen 
//             name='SMS'
//             options={{
//                 title: 'SMS',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "SMS"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//         <Tabs.Screen 
//             name='SOSsmsg'
//             options={{
//                 title: 'SOSsmsg',
//                 headerShown: false,
//                 tabBarIcon: ({color,focused}) => (
//                     <TabIcon 
//                         color={color}
//                         name= "SOSsmsg"
//                         focused={focused}
//                     />
//                 )
//             }}
//         />
//     </Tabs>
//     </>
//   )
// }

// export default TabsLayout

// NativeWindStyleSheet.setOutput({
//     default: "native",
//     });