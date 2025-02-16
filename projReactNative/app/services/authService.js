import axiosInstance from "../api/AxiosClient";

// API Đăng nhập

export const login = (credentials) => {
  return axiosInstance.post("/auth/login", credentials);
};
