import { StatusBar, Text, View } from 'react-native'
import React from 'react'
import {Link} from 'expo-router'
// App.js

import { NativeWindStyleSheet } from "nativewind";


const Index = () => {
  return (
    <View className='bg-black flex-1 items-center justify-center'>
      <Text className="text-3xl text-white">KLIQ</Text>
      <StatusBar style="auto"/>
      <Link href={"/home"} className='text-yellow-700'>As Recipients</Link>
      <Link href={"/contactss"} className='text-yellow-700'>As Kliq Device User</Link>
      {/* <Link href={"/sosMsg"} className='text-yellow-700'>Contacts</Link>
      <Link href={"/SMS"} className='text-yellow-700'>Contacts</Link>
      <Link href={"/location"}className='text-yellow-700'>Contacts</Link> */}
    </View>
  )
}

export default Index

NativeWindStyleSheet.setOutput({
  default: "native",
});

// import { NativeWindStyleSheet } from "nativewind";

// NativeWindStyleSheet.setOutput({
//   default: "native",
// });