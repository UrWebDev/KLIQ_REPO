import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { register, login } from "./api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const roles = [
  { label: "KLIQ User", value: "user" },
  { label: "Recipient", value: "recipient" },
];

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        Alert.alert("Error", "Username and Password are required.");
        return;
      }
      if (!isLogin) {
        if (password !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match.");
          return;
        }
        if (!role) {
          Alert.alert("Error", "Please select a role.");
          return;
        }
        if (!uniqueId.trim()) {
          Alert.alert("Error", `${role === "recipient" ? "Recipient" : "User"} ID is required.`);
          return;
        }

        // Additional validation for user roleaa
        if (role === "user" && (!age.trim() || !name.trim() || !bloodType.trim())) {
          Alert.alert("Error", "Age, Name, and Blood Type are required for users.");
          return;
        }
        if (role === "recipient" && (!age.trim() || !name.trim())) {
          Alert.alert("Error", "Age and Name are required for recipients.");
          return;
        }
      }

      let data;
      if (isLogin) {
        data = { username, password };
      } else {
        if (role === "recipient") {
          data = { username, password, role, recipientId: uniqueId, name, age };
        } else if (role === "user") {
          data = { username, password, role, userId: uniqueId, age, name, bloodType };
        }
      }

      console.log("Sending Data:", data);

      const response = isLogin ? await login(data) : await register(data);

      console.log(response);
      Alert.alert("Success", response.data.message || "Login Successful");

      if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token);
        if (response.data.uniqueId) {
          await AsyncStorage.setItem("uniqueId", response.data.uniqueId);
        }
      }

      if (response.data.role === "user") {
        router.push("/userSOSreports");
      } else if (response.data.role === "recipient") {
        router.push("/SOSInbox");
      }
    } catch (error) {
      console.error("Auth Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <Text className="text-center text-3xl font-bold mb-6">
        {isLogin ? "Log in" : "Sign Up"}
      </Text>

      <TextInput
        placeholder="Input"
        value={username}
        onChangeText={setUsername}
        className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
        placeholderTextColor="rgba(0, 0, 0, 0.3)"
      />

      <View className="relative w-full mb-4">
        <TextInput
          placeholder="Password"
          value={password}
          secureTextEntry={!passwordVisible}
          onChangeText={setPassword}
          className="w-full px-4 py-3 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
        />
        <TouchableOpacity
          className="absolute top-3 right-4"
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Icon name={passwordVisible ? "visibility" : "visibility-off"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            secureTextEntry
            onChangeText={setConfirmPassword}
            className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          <TouchableOpacity
            className="w-full px-4 py-3 mb-4 flex-row justify-between items-center rounded-full border border-gray-300 bg-gray-100"
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Text className="text-gray-700">
              {role ? roles.find((r) => r.value === role)?.label : "Select Role"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="gray" />
          </TouchableOpacity>

          {dropdownVisible && (
            <View className="w-full mb-4 border border-gray-300 rounded-lg bg-white">
              {roles.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  className="px-4 py-3 border-b border-gray-200 last:border-b-0"
                  onPress={() => {
                    setRole(item.value);
                    setDropdownVisible(false);
                  }}
                >
                  <Text className="text-gray-700">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            placeholder={`${role === "recipient" ? "Recipient" : "User"} Contact Number (serves as unique ID)`}
            value={uniqueId}
            onChangeText={setUniqueId}
            className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          {role === "user" && (
            <>
              <TextInput
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
              />
              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
              />
              <TextInput
                placeholder="Blood Type"
                value={bloodType}
                onChangeText={setBloodType}
                className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
              />
            </>
          )}
          {role === "recipient" && (
            <>
            <TextInput
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="w-full px-4 py-3 mb-4 rounded-full border border-gray-300 bg-gray-100 text-gray-700"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
          </>
          )}
        </>
      )}

      <TouchableOpacity
        className="w-full py-3 mb-4 rounded-full bg-black items-center"
        onPress={handleAuth}
      >
        <Text className="text-white text-lg font-bold">
          {isLogin ? "Log in" : "Sign in"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text className="text-center text-sm text-gray-500">
          {isLogin ? (
            <>
              don’t have an account? <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>Sign up</Text>
            </>
          ) : (
            <>
              already have an account? <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>Log in</Text>
            </>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
