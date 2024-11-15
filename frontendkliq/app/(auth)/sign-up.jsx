import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

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
      mobilePhone: mobilePhone, // Fix variable here
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
    <View style={styles.container}>
      <Text style={styles.title}>Signup PAGE</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        keyboardType="default"
        onChange={handleName}
      />

      {/* Mobile Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10} // Limit to 10 digits for mobile number
        onChange={handleMobile}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChange={handlePassword}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
