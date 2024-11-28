import axios from "axios";

const API = axios.create({ baseURL: "http://192.168.254.106:3000/api" });

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
