// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // your Flask backend URL
});

// signup API
export const signup = async (data) => {
  const res = await API.post("/signup", data);
  return res.data;
};

// login API
export const login = async (data) => {
  const res = await API.post("/login", data);
  return res.data;
};

// file upload API
export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return res.data;
};

export default API;
