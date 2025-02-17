import axiosInstance from "../api/AxiosClient";

// Đăng nhập
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
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
export const updateAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  try {
    const response = await axiosInstance.post("/auth/updateAvatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Gửi OTP thay đổi email
export const sendChangeEmailOTP = async (newEmail) => {
  try {
    const response = await axiosInstance.post("/auth/sendChangeEmailOTP", {
      newEmail,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Xác thực và thay đổi email
export const verifyAndChangeEmail = async (otp, newEmail) => {
  try {
    const response = await axiosInstance.post("/auth/verifyAndChangeEmail", {
      otp,
      newEmail,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Gửi OTP thay đổi số điện thoại
export const sendChangePhoneOTP = async (newPhone) => {
  try {
    const response = await axiosInstance.post("/auth/sendChangePhoneOTP", {
      newPhone,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Xác thực và thay đổi số điện thoại
export const verifyAndChangePhone = async (otp, newPhone) => {
  try {
    const response = await axiosInstance.post("/auth/verifyAndChangePhone", {
      otp,
      newPhone,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
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
