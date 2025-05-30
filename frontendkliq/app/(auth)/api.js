import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API = axios.create({ baseURL: `${API_URL}/api`,  headers: {
    "Content-Type": "application/json",
  },  });


  // Request interceptor to attach the token
API.interceptors.request.use(
  async (config) => {
    console.log(config);
    
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    
    console.error('Request Error Interceptor:', error); // Log request errors
    return Promise.reject(error);
  }
);





export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getTokenData = async () => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) return null;

  try {
    const response = await API.get("/auth/token-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authData");
    await AsyncStorage.removeItem("uniqueId");
  } catch (err) {
    console.error("Logout error:", err);
  }
};
