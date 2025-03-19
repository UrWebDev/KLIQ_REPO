import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  kliqButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D9D9D9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center', // Added to ensure content is centered
    alignItems: 'center', // Added to ensure content is centered
  },
  innerButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF0101',
    borderColor: '#000',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1,
    justifyContent: 'center', // Added to ensure content is centered inside inner button
    alignItems: 'center', // Added to ensure content is centered inside inner button
  },
  text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  }
});


export default function LandingPage() {
  const router = useRouter();

  const handleButtonClick = () => {
    // router.push('/addDeviceContact');
    // router.push('/SOSsmsg');
    // router.push('/userSOSreports')
    // router.push('/userSOSreports')
    router.push('/authScreen')
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.kliqButton} onPress={handleButtonClick}>
        <View style={styles.innerButton}>
          <Text style={styles.text}>KLIQ</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}