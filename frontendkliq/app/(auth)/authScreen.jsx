import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { register, login, getTokenData } from "./api";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Dimensions } from "react-native";

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  // ✅ FIX: Reset state to prevent stale input and stuck loading
  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setUniqueId("");
    setAge("");
    setName("");
    setBloodType("");
    setPasswordVisible(false);
    setDropdownVisible(false);
    setFocusedInput(null);
  };

  // ✅ FIX: Run on screen focus to avoid stale auth or stuck modal
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          resetForm(); // ✅ clear stale inputs
          setIsLoading(true);
          const token = await AsyncStorage.getItem("authToken");

          if (!token) {
            setIsLoading(false);
            return;
          }

          const userString = await AsyncStorage.getItem("authData");
          const data = JSON.parse(userString);

          console.log("Auth validation success:", {
            role: data.role,
            timestamp: new Date().toISOString(),
          });

          if (data) {
            if (data.role == "recipient") router.replace("/Hotlines");
            else if (data.role == "user") router.replace("/userSOSreports");
          }
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error("Auth Check Error:", {
            error: error.message,
            stack: error.stack,
          });
        }
      };

      checkAuthStatus();

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );

      return () => backHandler.remove();
    }, [router])
  );

  const handleAuth = async () => {
    try {
      setIsLoading(true);

      if (!username.trim() || !password.trim()) {
        Alert.alert("Error", "Username and Password are required.");
        setIsLoading(false);
        return;
      }
      if (!isLogin) {
        if (password !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match.");
          setIsLoading(false);
          return;
        }
        if (!role) {
          Alert.alert("Error", "Please select a role.");
          setIsLoading(false);
          return;
        }
        if (!uniqueId.trim()) {
          Alert.alert(
            "Error",
            `${role === "recipient" ? "Recipient" : "User"} ID is required.`
          );
          setIsLoading(false);
          return;
        }
        if (
          role === "user" &&
          (!age.trim() || !name.trim() || !bloodType.trim())
        ) {
          Alert.alert(
            "Error",
            "Age, Name, and Blood Type are required for users."
          );
          setIsLoading(false);
          return;
        }
        if (role === "recipient" && (!age.trim() || !name.trim())) {
          Alert.alert("Error", "Age and Name are required for recipients.");
          setIsLoading(false);
          return;
        }
      }

      let data;
      if (isLogin) {
        data = { username, password };
      } else {
        if (role === "recipient") {
          data = {
            username,
            password,
            role,
            recipientId: uniqueId,
            name,
            age,
          };
        } else if (role === "user") {
          data = {
            username,
            password,
            role,
            userId: uniqueId,
            age,
            name,
            bloodType,
          };
        }
      }

      const response = isLogin ? await login(data) : await register(data);
      console.log(response, response.data, "logging");

      Alert.alert("Success", response.data.message || "Login Successful");

if (isLogin && response.data.token) {
  await AsyncStorage.setItem("authToken", response.data.token);
  await AsyncStorage.setItem("authData", JSON.stringify({ role: response.data.role }));

  if (response.data.uniqueId) {
    await AsyncStorage.setItem("uniqueId", response.data.uniqueId);
  }

  resetForm();

  setTimeout(() => {
    setIsLoading(false);
    if (response.data.role === "user") {
      router.replace("/userSOSreports");
    } else if (response.data.role === "recipient") {
      router.replace("/SOSInbox");
    }
  }, 200);
} else {
  // If registration was successful, switch to login form
  Alert.alert("Success", response.data.message || "Registration Successful");
  setIsLogin(true);
  resetForm();
  setIsLoading(false);
}



      resetForm(); // ✅ clear input state after login

      setTimeout(() => {
        setIsLoading(false);
        if (response.data.role == "user") {
          router.replace("/userSOSreports");
        } else if (response.data.role == "recipient") {
          router.replace("/SOSInbox");
        }
      }, 200); // ✅ short delay ensures clean UI transition
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "An unexpected error occurred. Please try again."
      );
    }
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Full-screen loading modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg items-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-4 text-lg font-semibold">Loading...</Text>
          </View>
        </View>
      </Modal>

      {/* Header Text - Only show "Sign Up" in header */}
      <Text className="text-center text-3xl font-bold mt-20 mb-6">
        {!isLogin ? "Sign Up" : ""}
      </Text>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          {/* Username Input with Login Title Above */}
          {isLogin && (
            <Text className="text-3xl font-bold mb-6 text-center">Log in</Text>
          )}
{/* Username Input */}
<View className="relative mb-4 w-full">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "username" || username
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Username
  </Text>
  <TextInput
    value={username}
    onChangeText={setUsername}
    onFocus={() => setFocusedInput("username")}
    onBlur={() => setFocusedInput(null)}
    className={`w-full px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "username"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>


{/* Password Input */}
<View className="relative mb-4 w-full">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "password" || password
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-5 text-gray-500"
    }`}
  >
    Password
  </Text>
  <TextInput
    value={password}
    secureTextEntry={!passwordVisible}
    onChangeText={setPassword}
    onFocus={() => setFocusedInput("password")}
    onBlur={() => setFocusedInput(null)}
    className={`w-full px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "password"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
  <TouchableOpacity
    className="absolute top-6 right-5"
    onPress={() => setPasswordVisible(!passwordVisible)}
  >
    <Icon name={passwordVisible ? "visibility" : "visibility-off"} size={22} color="gray" />
  </TouchableOpacity>
</View>



          {/* Additional fields for Sign Up */}
          {!isLogin && (
            <>
{/* Confirm Password */}
<View className="relative mb-4">
<Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "confirmPassword" || confirmPassword
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-5 text-gray-500"
    }`}
  >
    Confirm Password
  </Text>
  <TextInput
    value={confirmPassword}
    secureTextEntry={!passwordVisible}
    onChangeText={setConfirmPassword}
    onFocus={() => setFocusedInput("confirmPassword")}
    onBlur={() => setFocusedInput(null)}
    className={`w-full px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "confirmPassword"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
  <TouchableOpacity
    className="absolute top-7 right-6"
    onPress={() => setPasswordVisible(!passwordVisible)}
  >
    <Icon name={passwordVisible ? "visibility" : "visibility-off"} size={24} color="gray" />
  </TouchableOpacity>
</View>


              {/* Role Dropdown */}
              <TouchableOpacity
                className="w-auto px-7 py-5 mb-6 flex-row justify-between rounded-t-xl border-b border-black bg-gray-300 shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg shadow-black/20"
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
                <View className="w-auto mb-4 border border-black rounded-xl bg-gray-100 shadow-lg shadow-black/20">
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
<View className="relative mb-4 w-full">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "uniqueId" || uniqueId
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    {role === "recipient" ? "Recipient" : "Device User"} Contact +639
  </Text>
  <TextInput
    value={uniqueId}
    onChangeText={setUniqueId}
    onFocus={() => setFocusedInput("uniqueId")}
    onBlur={() => setFocusedInput(null)}
    keyboardType="numeric"
    className={`w-full px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "uniqueId"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>


              {role === "user" && (
                <>
{/* Age */}
<View className="relative mb-4">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "age" || age
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Age
  </Text>
  <TextInput
    value={age}
    onChangeText={setAge}
    onFocus={() => setFocusedInput("age")}
    onBlur={() => setFocusedInput(null)}
    keyboardType="numeric"
    className={`w-auto px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "age"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>
{/* Name */}
<View className="relative mb-4">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "name" || name
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Name
  </Text>
  <TextInput
    value={name}
    onChangeText={setName}
    onFocus={() => setFocusedInput("name")}
    onBlur={() => setFocusedInput(null)}
    className={`w-auto px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "name"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>
{/* Blood Type */}
<View className="relative mb-4">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "bloodType" || bloodType
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Blood Type
  </Text>
  <TextInput
    value={bloodType}
    onChangeText={setBloodType}
    onFocus={() => setFocusedInput("bloodType")}
    onBlur={() => setFocusedInput(null)}
    className={`w-auto px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "bloodType"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>

                </>
              )}

              {role === "recipient" && (
                <>
{/* Age */}
<View className="relative mb-4">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "age" || age
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Age
  </Text>
  <TextInput
    value={age}
    onChangeText={setAge}
    onFocus={() => setFocusedInput("age")}
    onBlur={() => setFocusedInput(null)}
    keyboardType="numeric"
    className={`w-auto px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "age"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>
{/* Name */}
<View className="relative mb-4">
  <Text
    className={`absolute left-5 z-10 transition-all ${
      focusedInput === "name" || name
        ? "top-1 bg-gray-300 text-xs px-1 rounded-full"
        : "top-7 text-gray-500"
    }`}
  >
    Name
  </Text>
  <TextInput
    value={name}
    onChangeText={setName}
    onFocus={() => setFocusedInput("name")}
    onBlur={() => setFocusedInput(null)}
    className={`w-auto px-7 pt-6 pb-5 rounded-full border ${
      focusedInput === "name"
        ? "border-[2px] border-black"
        : "border border-black"
    } bg-gray-300 text-gray-700 italic shadow-[inset_0_5px_8px_rgba(0,0,0,0.2)] shadow-lg`}
  />
</View>
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
          <View className="flex-row justify-center">
            <Text className="text-center text-sm text-gray-800">
              {isLogin ? "don't have an account? " : "already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-sm font-bold italic text-gray-800">
                {isLogin ? "Sign up" : "Log in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AuthScreen;
