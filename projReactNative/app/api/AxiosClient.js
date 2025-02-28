import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy token từ AsyncStorage (hàm bất đồng bộ)
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
    return null;
  }
};

// Tạo instance axios với baseURL
const axiosInstance = axios.create({
  baseURL: "http://10.0.2.2:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm token vào request trước khi gửi
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // Đợi lấy token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
