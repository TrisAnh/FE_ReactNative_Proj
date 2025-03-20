import axiosInstance from "../api/AxiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);

    // Lưu token vào AsyncStorage khi đăng nhập thành công
    await AsyncStorage.setItem("token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    // Trả về lỗi có thông báo rõ ràng
    if (error.response) {
      throw new Error(error.response.data.message || "Đăng nhập thất bại!");
    } else {
      throw new Error("Không thể kết nối đến server!");
    }
  }
};
// Đăng ký
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Gửi OTP
export const sendOTP = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/send-otp", { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const resendOTP = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
// Xác thực OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const sendOTPForgot = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/send-otpForgot", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const verifyOTPForgot = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otpForgot", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const getProfile = async (token) => {
  try {
    if (!token) throw new Error("Bạn chưa đăng nhập!");

    const response = await axiosInstance.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải thông tin người dùng"
    );
  }
};
// Cập nhật thông tin người dùng
export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(
      "/auth/updateProfile",
      profileData
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Cập nhật avatar
export const updateAvatar = async (userId, avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  try {
    const response = await axiosInstance.put(
      `/auth/update-avatar/${userId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
export const getRoomsByCategory = async (categoryId, page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/rooms?categoryId=${categoryId}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rooms by category:", error);
    throw error;
  }
};
export const getRoomCategories = async () => {
  try {
    const response = await axiosInstance.get("/auth/getAllRoomCategories");
    return response.data;
  } catch (error) {
    console.error("Error fetching room categories:", error);
    throw error;
  }
};

export const getTopViewedRooms = async () => {
  try {
    const response = await axiosInstance.get("/auth/getTopRatedRooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching top viewed rooms:", error);
    throw error;
  }
};
