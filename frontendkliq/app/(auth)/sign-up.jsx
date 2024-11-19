import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { tw } from 'nativewind'; // Importing NativeWind for styling

export default function Signup() {
  const router = useRouter();

  // Define state variables
  const [name, setName] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [password, setPassword] = useState('');
  const [mobilePhoneNumberVerify, setmobilePhoneNumberVerify] = useState(false);
  const [nameVerify, setNameVerify] = useState(false);
  const [passwordVerify, setPasswordVerify] = useState(false);

  // Handle form submission
  function handleSubmit() {
    const userData = {
      name: name,
      mobilePhone: mobilePhone,
      password: password,
    };

    axios
      .post('https://localhost:3000/register', userData)
      .then((res) => {
        console.log(res.data);
        // Optionally redirect or show a success message here
      })
      .catch((e) => {
        console.log(e);
      });
  }

  // Handle name input
  function handleName(e) {
    const nameHolder = e.nativeEvent.text;
    setName(nameHolder);
  }

  // Handle mobile number input and validation
  function handleMobile(e) {
    const mobileHolder = e.nativeEvent.text;
    setMobilePhone(mobileHolder);
    setmobilePhoneNumberVerify(false);

    // Check if the mobile number matches the format (simple validation for 10 digits)
    if (/^[0-9]{10}$/.test(mobileHolder)) {
      setmobilePhoneNumberVerify(true);
    }
  }

  // Handle password input and validation
  function handlePassword(e) {
    const passHolder = e.nativeEvent.text;
    setPassword(passHolder);
    setPasswordVerify(false);

    // Password validation: must contain at least one digit, one lowercase letter, and one uppercase letter
    if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(passHolder)) {
      setPassword(passHolder);
      setPasswordVerify(true);
    }
  }

  return (
    <View style={tw`flex-1 justify-center items-center p-4 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Sign Up</Text>

      {/* Name Input */}
      <TextInput
        style={tw`w-full p-3 mb-4 border border-gray-300 rounded-md`}
        placeholder="Name"
        keyboardType="default"
        onChange={handleName}
      />

      {/* Mobile Number Input */}
      <TextInput
        style={tw`w-full p-3 mb-4 border border-gray-300 rounded-md`}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10} // Limit to 10 digits for mobile number
        onChange={handleMobile}
      />

      {/* Password Input */}
      <TextInput
        style={tw`w-full p-3 mb-4 border border-gray-300 rounded-md`}
        placeholder="Password"
        secureTextEntry
        onChange={handlePassword}
      />

      {/* Submit Button */}
      <TouchableOpacity 
        style={tw`w-full bg-blue-600 p-3 rounded-md mt-4`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-white text-center text-lg font-semibold`}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}