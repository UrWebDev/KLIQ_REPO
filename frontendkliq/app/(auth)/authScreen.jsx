import React, { useState } from "react";
import { View, Text, TextInput, Alert, Picker, TouchableOpacity, StyleSheet } from "react-native";
import { register, login } from "./api";
import { useRouter } from "expo-router";

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
    const [role, setRole] = useState("user");
    const router = useRouter();

    const handleAuth = async () => {
        if (!isLogin && password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

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
            
            if (response.data.role === 'user') {
                router.push("/userSOSreports");
            } else if (response.data.role === 'recipient') {
                router.push("/SOSsmsg");
            }
        } catch (error) {
            console.log(error); // Log the error details
            Alert.alert("Error", error.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>
            <TextInput
                placeholder="Enter Username or Phone Number"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
            <TextInput
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
            {!isLogin && (
                <>
                    <TextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    />
                    <Picker
                        selectedValue={role}
                        onValueChange={(value) => setRole(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="KLIQ User" value="user" />
                        <Picker.Item label="Recipient" value="recipient" />
                    </Picker>
                </>
            )}
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                <Text style={styles.switchButtonText}>
                    Switch to {isLogin ? "Register" : "Login"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 15,
        padding: 10,
        fontSize: 16,
        fontStyle: 'italic',
    },
    picker: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    switchButtonText: {
        color: 'gray',
        fontSize: 16,
    },
});

export default AuthScreen;