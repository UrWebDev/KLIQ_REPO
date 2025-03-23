import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { register, login } from "./api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const roles = [
  { label: "Device User", value: "user" },
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
  const [focusedInput, setFocusedInput] = useState(null);
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

      const response = isLogin ? await login(data) : await register(data);

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
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Text */}
      <Text className="text-center text-3xl font-bold mt-20 mb-6">
        {isLogin ? "Log in" : "Sign Up"}
      </Text>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          {/* Username Input */}
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setFocusedInput("username")}
            onBlur={() => setFocusedInput(null)}
            className={`w-full px-7 py-6 mb-4 rounded-full border ${
              focusedInput === "username" ? "border-[2px] border-black" : "border border-black"
            } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
          />

          {/* Password Input */}
          <View className="relative w-full mb-4">
            <TextInput
              placeholder="Password"
              value={password}
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              className={`w-full px-7 py-6 rounded-full border ${
                focusedInput === "password" ? "border-[2px] border-black" : "border border-black"
              } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
            />
            <TouchableOpacity
              className="absolute top-5 right-6"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Icon name={passwordVisible ? "visibility" : "visibility-off"} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Additional fields for Sign Up */}
          {!isLogin && (
            <>
              {/* Confirm Password */}
              <View className="relative w-full mb-4">
                <TextInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  secureTextEntry={!passwordVisible}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  className={`w-full px-7 py-6 rounded-full border ${
                    focusedInput === "confirmPassword" ? "border-[2px] border-black" : "border border-black"
                  } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                />
                <TouchableOpacity
                  className="absolute top-5 right-6"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Icon
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              {/* Role Dropdown */}
              <TouchableOpacity
                className="w-full px-7 py-5 mb-4 flex-row justify-between rounded-t-xl border-b border-black bg-gray-300 shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20"
                onPress={() => setDropdownVisible(!dropdownVisible)}
              >
                <View className="flex-row items-center">
                  <Text className="text-gray-700 italic mr-2">
                    {role ? roles.find((r) => r.value === role)?.label : "Select Role"}
                  </Text>
                  <View className="h-6 w-px bg-black mr-4" />
                </View>
                <Icon name="arrow-drop-down" size={24} color="gray" />
              </TouchableOpacity>

              {dropdownVisible && (
                <View className="w-full mb-4 border border-black rounded-xl bg-gray-100 shadow-lg shadow-black/20">
                  {roles.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      className="px-4 py-3 border-b border-gray-300 last:border-b-0"
                      onPress={() => {
                        setRole(item.value);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text className="text-gray-700 italic">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Unique ID */}
              <TextInput
                placeholder={`${role === "recipient" ? "Recipient" : "User"} Contact # (serves as unique ID)`}
                value={uniqueId}
                onChangeText={setUniqueId}
                onFocus={() => setFocusedInput("uniqueId")}
                onBlur={() => setFocusedInput(null)}
                className={`w-full px-7 py-6 mb-4 rounded-full border ${
                  focusedInput === "uniqueId" ? "border-[2px] border-black" : "border border-black"
                } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />

              {role === "user" && (
                <>
                  <TextInput
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput("age")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-7 py-6 mb-4 rounded-full border ${
                      focusedInput === "age" ? "border-[2px] border-black" : "border border-black"
                    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  />
                  <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-7 py-6 mb-4 rounded-full border ${
                      focusedInput === "name" ? "border-[2px] border-black" : "border border-black"
                    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  />
                  <TextInput
                    placeholder="Blood Type"
                    value={bloodType}
                    onChangeText={setBloodType}
                    onFocus={() => setFocusedInput("bloodType")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-7 py-6 mb-4 rounded-full border ${
                      focusedInput === "bloodType" ? "border-[2px] border-black" : "border border-black"
                    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
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
                    onFocus={() => setFocusedInput("age")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-7 py-6 mb-4 rounded-full border ${
                      focusedInput === "age" ? "border-[2px] border-black" : "border border-black"
                    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  />
                  <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-7 py-6 mb-4 rounded-full border ${
                      focusedInput === "name" ? "border-[2px] border-black" : "border border-black"
                    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20`}
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  />
                </>
              )}
            </>
          )}

          {/* Auth Button */}
          <TouchableOpacity
            className="w-4/5 py-3.5 mb-3 rounded-full bg-black shadow-lg shadow-black/40 items-center self-center"
            onPress={handleAuth}
          >
            <Text className="text-white text-lg font-bold italic">
              {isLogin ? "Log in" : "Sign in"}
            </Text>
          </TouchableOpacity>

          {/* Toggle between login/sign up */}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-center text-sm text-gray-500">
              {isLogin ? (
                <>
                  don’t have an account?{" "}
                  <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>Sign up</Text>
                </>
              ) : (
                <>
                  already have an account?{" "}
                  <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>Log in</Text>
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthScreen;