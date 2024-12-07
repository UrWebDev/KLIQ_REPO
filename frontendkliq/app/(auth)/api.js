import axios from "axios";
import { API_URL } from "@env";


const API = axios.create({ baseURL: `${API_URL}/api`,  headers: {
    "Content-Type": "application/json", // This is important
  }, });

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
