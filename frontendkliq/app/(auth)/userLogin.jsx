// // app/auth/userLogin.jsx
// import React from 'react';
// import { View, Text } from 'react-native';

// export default function UserLogin() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>User Login</Text>
//     </View>
//   );
// }

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

export default function UserLogin({props}) {
  const router = useRouter(); // Initialize the router

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOGIN PAGE</Text>

      <TextInput
        style={styles.input}
        placeholder="Mobile Number or Name"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

      <TouchableOpacity onPress={() => console.log("Forgot Password clicked!")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => console.log("Log in clicked!")}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* Sign up button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/sign-up')}>
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
  forgotText: {
    color: '#007bff',
    marginTop: 10,
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
