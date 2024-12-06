// import axios from "axios";
// import { API_URL } from "@env";


// const API = axios.create({ baseURL: `${API_URL}/api`,  headers: {
//     "Content-Type": "application/json", // This is important
//   }, });

// export const register = (data) => API.post("/auth/register", data);
// export const login = (data) => API.post("/auth/login", data);

import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
import { useRouter } from 'expo-router';

// Create an axios instance
const API = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');  // Get token from AsyncStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;  // Add token to request headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,  // If response is successful, just return it
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle expired or invalid token here
      Alert.alert('Session expired', 'Please log in again.');
      // Clear stored token and redirect to login screen
      await AsyncStorage.removeItem('authToken');
      const router = useRouter();  // Import router for navigation
      router.push('/auth');  // Redirect to login page
    }
    return Promise.reject(error);  // If error is not a 401, just reject
  }
);

// Export functions to interact with API
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
