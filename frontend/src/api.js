import axios from "axios";

// ✅ Axios instance
const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Signup API
export const signup = async (data) => {
  try {
    const res = await API.post("/signup", data);
    return res.data;
  } catch (error) {
    console.error("Signup API Error:", error);
    throw error.response ? error.response.data : error;
  }
};

// ✅ Login API
export const login = async (data) => {
  try {
    const res = await API.post("/login", data);
    return res.data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error.response ? error.response.data : error;
  }
};

// ✅ File Upload API
export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("http://127.0.0.1:5000/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("File Upload Error:", error);
    throw error.response ? error.response.data : error;
  }
};

// ✅ Fetch Fraud Data for Charts
export const fetchFraudData = async () => {
  try {
    const res = await API.get("/fraud-data");
    return res.data;
  } catch (error) {
    console.error("Fraud Data Fetch Error:", error);
    throw error.response ? error.response.data : error;
  }
};

export default API;
