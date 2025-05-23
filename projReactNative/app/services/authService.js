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
// export const getUserProfile = async (token) => {
//   try {
//     if (!token) throw new Error("Bạn chưa đăng nhập!");

//     const response = await axiosInstance.get("/auth/me", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Không thể tải thông tin người dùng"
//     );
//   }
// };
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/auth/getUserById/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi đặt lịch xem phòng:", error);
    throw error;
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
export const getRoomCategories = async () => {
  try {
    const response = await axiosInstance.get("/auth/room-categories");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh mục phòng:", error);
    throw error;
  }
};

// 2️⃣ Lấy 10 phòng có rating cao nhất
export const getTopRatedRooms = async () => {
  try {
    const response = await axiosInstance.get("/auth/getTopRatedRooms");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy phòng có rating cao nhất:", error);
    throw error;
  }
};

export const getRoomsByCategory = async (category) => {
  try {
    const response = await axiosInstance.get(`/auth/category/${category}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách phòng:", error);
    throw error;
  }
};
export const getRoomsByOwner = async (ownerId) => {
  try {
    const response = await axiosInstance.get(
      `/auth/getRoomsByOwner/${ownerId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách phòng theo chủ trọ:", error);
    throw error;
  }
};
export const updateRoomCategory = async (roomId, roomData) => {
  try {
    const response = await axiosInstance.put(
      `/auth/updateRoomCategory/${roomId}`,
      roomData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi chỉnh sửa:", error);
    throw error;
  }
};
export const deleteRoomCategory = async (roomId) => {
  try {
    const response = await axiosInstance.delete(
      `/auth/deleteRoomCategory/${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi chỉnh sửa:", error);
    throw error;
  }
};
export const searchAndFilterRooms = async (filters) => {
  try {
    const response = await axiosInstance.get("/auth/search", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm & lọc phòng:", error);
    throw error;
  }
};
export const getRoomsDetail = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/auth/detail/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách phòng:", error);
    throw error;
  }
};
export const bookViewing = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/viewings", formData);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi đặt lịch xem phòng:", error);
    throw error;
  }
};
export const getAllViewings = async () => {
  try {
    const response = await axiosInstance.get("/auth/getAllViewings");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi đặt lịch xem phòng:", error);
    throw error;
  }
};
export const getSentViewings = async () => {
  try {
    const response = await axiosInstance.get("/auth/getSentViewings");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách gửi yêu cầu", error);
    throw error;
  }
};
export const getPendingViewings = async () => {
  try {
    const response = await axiosInstance.get("/auth/getPendingViewings");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách duyệt", error);
    throw error;
  }
};
export const getViewingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/auth/getViewing/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi đặt lịch xem phòng:", error);
    throw error;
  }
};
export const updateViewingStatus = async (id, status) => {
  try {
    // Truyền `status` vào body của request
    const response = await axiosInstance.put(`/auth/approveViewing/${id}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi duyệt đặt lịch:", error);
    throw error;
  }
};

export const createRoomCategory = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/createRoom", formData);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo phòng:", error);
    throw error;
  }
};
export const getRoomComments = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/auth/getComment/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy comment:", error);
    throw error;
  }
};
export const createComment = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/createComment", formData);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi gửi bình luận:", error);
    throw error;
  }
};
export const updateComment = async (commentId, commentData) => {
  try {
    console.log("Updating comment ID:", commentId);
    console.log("Updating comment with data:", commentData);

    const response = await axiosInstance.put(
      `/auth/updateComment/${commentId}`,
      commentData
    );

    console.log("Update comment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật bình luận:", error);
    throw error;
  }
};
export const deleteComment = async (commmentId) => {
  try {
    const response = await axiosInstance.delete(
      `/auth/deleteComment/${commmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xoá comment", error);
    throw error;
  }
};
export const createFavorite = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/createFavorite", formData);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi yêu thích:", error);
    throw error;
  }
};
export const getFavoriteByUser = async (UserId) => {
  try {
    const response = await axiosInstance.get(`/auth/getFavorite/${UserId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy yêu thích:", error);
    throw error;
  }
};
export const checkFavorite = async (userId, roomId) => {
  try {
    const response = await axiosInstance.get(
      `/auth/checkFavorite?userId=${userId}&roomId=${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra yêu thích:", error);
    return { isFavorite: false };
  }
};
export const removeFavorite = async (userId, roomId) => {
  try {
    const response = await axiosInstance.delete("/auth/removeFavorite", {
      data: { userId, roomId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xoá yêu thích:", error);
    return { status: "error" };
  }
};
