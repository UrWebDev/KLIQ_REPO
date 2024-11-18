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

const TabIconTwo = () => {
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