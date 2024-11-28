import { View, Text, Image, Button } from 'react-native'
import React, { useEffect, useState } from 'react';
import {Tabs, useRouter} from 'expo-router'
import { NativeWindStyleSheet } from "nativewind";



const TabIcon =({ color, name, focused}) => {
    

    return(
        <View clasName='item-center'>
            <Text clasName={`${focused? 'text-red-600' : 'text-black'} text-xs`} style={{color: color}}>
                {name}
            </Text>
        </View>
    )
}

const TabIconTwo = () => {
    const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
//   useEffect(() => {
//     const token = localStorage.getItem('authToken'); // or use AsyncStorage if needed
//     if (token) {
//       setIsAuthenticated(true);
//     } else {
//       setIsAuthenticated(false);
//       // Redirect to login if not authenticated
//       router.push('/authScreen');
//     }
//   }, [router]);

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
    <>
    <Button title="Logout" onPress={handleLogout} />
    <Tabs
        screenOptions={{tabBarShowLabel: false,
            tabBarStyle:{
                backgroundColor: 'blue',
                borderTopWidth: 1,
                borderTopColor: '#232533',
                height:84,
            },
            tabBarActiveTintColor: '#CDCDE0',
            tabBarInactiveTintColor: '#FFA001'
        }}
    >
        
        
        <Tabs.Screen 
            name='addDeviceContact'
            options={{
                title: 'Contacts',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "Contacts"
                        focused={focused}
                    />
                )
            }}
        />
        <Tabs.Screen 
            name='userSOSreports'
            options={{
                title: 'SOS Reports',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "SOS Reports"
                        focused={focused}
                    />
                )
            }}
        />
    </Tabs>
    </>
  )
}

export default TabIconTwo

NativeWindStyleSheet.setOutput({
    default: "native",
    });