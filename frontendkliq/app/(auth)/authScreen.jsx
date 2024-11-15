import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Picker } from "react-native";
import { register, login } from "./api";
import { useRouter } from "expo-router";

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user")
    const router = useRouter()
    const handleAuth = async () => {
        try {
            const data = { username, password, role };
            const response = isLogin ? await login(data) : await register(data);
            console.log(response); 
            Alert.alert("Success", response.data.message || "Login Successful");
            
            if (response.data.token) {
                console.log("Storing token in localStorage:", response.data.token); 
                localStorage.setItem("authToken", response.data.token); 
            } else {
                console.log("No token received in response.");
            }
            
            if(response.data.role === 'user'){
                router.push("/contactManagement")
            }else if(response.data.role === 'recipient'){
                router.push("/SOSsmsg")
            }
        } catch (error) {
            console.log(error); // Log the error details
            Alert.alert("Error", error.response?.data?.error || "Something went wrong");
        }
    };
    
    

    return (
        <View style={{ padding: 20 }}>
            <Text>{isLogin ? "Login" : "Register"}</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            {!isLogin && (
                <Picker
                    selectedValue={role}
                    onValueChange={(value) => setRole(value)}
                    style={{ marginBottom: 20 }}
                >
                    <Picker.Item label="User" value="user" />
                    <Picker.Item label="Recipient" value="recipient" />
                </Picker>
            )}
            <Button title={isLogin ? "Login" : "Register"} onPress={handleAuth} />
            <Button
                title={`Switch to ${isLogin ? "Register" : "Login"}`}
                onPress={() => setIsLogin(!isLogin)}
                color="gray"
            />
        </View>
    );
};

export default AuthScreen;
