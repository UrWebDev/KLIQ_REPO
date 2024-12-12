import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library
import { register, login } from "./api";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const roles = [
    { label: "KLIQ User", value: "user" },
    { label: "Recipient", value: "recipient" },
];

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState(""); // Start with an empty role
    const [dropdownVisible, setDropdownVisible] = useState(false);
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
                console.log("Storing token in AsyncStorage:", response.data.token); 
                await AsyncStorage.setItem("authToken", response.data.token); 
            } else {
                console.log("No token received in response.");
            }
            
            if (response.data.role === 'user') {
                router.push("/userSOSreports");
            } else if (response.data.role === 'recipient') {
                router.push("/SOSInbox");
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
                    <TouchableOpacity 
                        style={styles.dropdown} 
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Text style={styles.dropdownText}>
                            {role ? roles.find(r => r.value === role)?.label : "Select Role"} {/* Tooltip text */}
                        </Text>
                        <Icon name="arrow-drop-down" size={24} color="#333" />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownOptions}>
                            {roles.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.dropdownOption}
                                    onPress={() => {
                                        setRole(item.value);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={styles.dropdownOptionText}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <TextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                        />
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
    dropdown: {
        flexDirection: 'row', // Align items horizontally
        justifyContent: 'space-between', // Space between text and icon
        alignItems: 'center', // Center vertically
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownOptions: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    dropdownOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownOptionText: {
        fontSize: 16,
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
// const handleAuth = async () => {
//     if (!isLogin && password !== confirmPassword) {
//         Alert.alert("Error", "Passwords do not match.");
//         return;
//     }

//     try {
//         const data = { username, password, role };
//         const response = isLogin ? await login(data) : await register(data);
//         console.log(response); 
//         Alert.alert("Success", response.data.message || "Login Successful");
        
//         if (response.data.token) {
//             console.log("Storing token in localStorage:", response.data.token); 
//             localStorage.setItem("authToken", response.data.token); 
//         } else {
//             console.log("No token received in response.");
//         }
        
//         if (response.data.role === 'user') {
//             router.push("/userSOSreports");
//         } else if (response.data.role === 'recipient') {
//             router.push("/SOSsmsg");
//         }
//     } catch (error) {
//         console.log(error); // Log the error details
//         Alert.alert("Error", error.response?.data?.error || "Something went wrong");
//     }
// };