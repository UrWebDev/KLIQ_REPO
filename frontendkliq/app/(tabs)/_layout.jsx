import { View, Text, Image } from 'react-native'
import React from 'react'
import {Tabs, Redirect} from 'expo-router'
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

const TabsLayout = () => {
  return (
    <>
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
            name='home'
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "Home"
                        focused={focused}
                    />
                )
            }}
        />
        <Tabs.Screen 
            name='location'
            options={{
                title: 'Location',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "Location"
                        focused={focused}
                    />
                )
            }}
        />
        <Tabs.Screen 
            name='sosMsg'
            options={{
                title: 'SOS',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "SOS"
                        focused={focused}
                    />
                )
            }}
        />
        <Tabs.Screen 
            name='contacts'
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
            name='SMS'
            options={{
                title: 'SMS',
                headerShown: false,
                tabBarIcon: ({color,focused}) => (
                    <TabIcon 
                        color={color}
                        name= "SMS"
                        focused={focused}
                    />
                )
            }}
        />
    </Tabs>
    </>
  )
}

export default TabsLayout

NativeWindStyleSheet.setOutput({
    default: "native",
    });