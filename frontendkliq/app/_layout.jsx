import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Stack} from 'expo-router'

const RootLayout = () => {
  return (
    <>
    <Stack>
    <Stack.Screen name='index' options={{headerShown:false}} />
    </Stack>

    </>
  )
}

export default RootLayout



// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import {Slot} from 'expo-router'

// const RootLayout = () => {
//   return (
//     <>
//     <Text>HEAHER</Text>
//     <Slot />
//     <Text>FOOTER</Text>
//     </>
//   )
// }

// export default RootLayout
