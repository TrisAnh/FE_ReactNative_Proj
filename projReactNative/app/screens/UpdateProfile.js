import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  sendOTP,
  verifyOTP,
} from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const UpdateProfile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [otpFieldType, setOtpFieldType] = useState(""); // "email" or "phone"
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token:", token);

      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        navigation.goBack();
        return;
      }

      const data = await getProfile(token);
      setUser(data);
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setOriginalEmail(data.email || "");
      setOriginalPhone(data.phone || "");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng!");
      navigation.goBack();
    }
  };
  const handleChoosePhoto = () => {
    console.log("Bắt đầu mở thư viện ảnh");
    const options = {
      mediaType: "photo",
      quality: 1,
    };

    try {
      launchImageLibrary(options, (response) => {
        console.log("Phản hồi từ image picker:", response);
        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImage({
            uri: selectedImage.uri,
            type: selectedImage.type || "image/jpeg",
            fileName: selectedImage.fileName || `photo_${Date.now()}.jpg`,
          });
        }
      });
    } catch (error) {
      console.error("Lỗi khi mở thư viện ảnh:", error);
    }
  };
  const handleUpdateAvatar = async () => {
    if (!image) {
      Alert.alert("Lỗi", "Vui lòng chọn một ảnh!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("avatar", {
      uri: image.uri,
      type: image.type || "image/jpeg", // Đảm bảo có type
      name: image.fileName || "avatar.jpg",
    });

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }

      const updatedUser = await updateAvatar(formData, token);
      setUser(updatedUser);
      Alert.alert("Thành công", "Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật avatar:", error);
      Alert.alert("Lỗi", "Lỗi cập nhật ảnh đại diện: " + error);
    } finally {
      setLoading(false);
    }
  };
  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }

      // Always send OTP to email
      await sendOTP(email, token);

      setOtpSent(true);
      Alert.alert("Thành công", `Mã OTP đã được gửi đến ${email}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã OTP: " + error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset all OTP related states
  const resetOtpStates = () => {
    setOtp("");
    setOtpSent(false);
    setPendingChanges({});
    setOtpModalVisible(false);
    setOtpFieldType("");
  };

  const handleUpdateProfile = async () => {
    const isEmailChanged = email !== originalEmail;
    const isPhoneChanged = phone !== originalPhone;
    const changes = {};

    if (fullName !== user.fullName) changes.fullName = fullName;
    if (address !== user.address) changes.address = address;
    if (isEmailChanged) changes.email = email;
    if (isPhoneChanged) changes.phone = phone;

    // Nếu không có thay đổi gì
    if (Object.keys(changes).length === 0) {
      Alert.alert("Thông báo", "Không có thay đổi nào để cập nhật");
      return;
    }

    // Nếu có thay đổi email hoặc số điện thoại, gửi OTP
    if (isEmailChanged || isPhoneChanged) {
      // Reset OTP states before starting a new OTP process
      resetOtpStates();

      setPendingChanges(changes);

      // Set the field type that requires OTP
      if (isEmailChanged) {
        setOtpFieldType("email");
      } else if (isPhoneChanged) {
        setOtpFieldType("phone");
      }

      await handleSendOtp(); // Gửi OTP đến email
      setOtpModalVisible(true); // Mở modal nhập OTP
    } else {
      // Nếu chỉ thay đổi tên hoặc địa chỉ thì cập nhật ngay mà không cần OTP
      await handleConfirmUpdateProfile(changes);
    }
  };

  const handleConfirmUpdateProfile = async (changes) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }

      const updatedUser = await updateProfile(changes, token);
      setUser(updatedUser);

      // Update original values to match the new values
      if (changes.email) {
        setOriginalEmail(changes.email);
      }
      if (changes.phone) {
        setOriginalPhone(changes.phone);
      }

      Alert.alert("Thành công", "Thông tin đã được cập nhật!");

      // Reset OTP states after successful update
      resetOtpStates();
    } catch (error) {
      Alert.alert("Lỗi", "Lỗi cập nhật thông tin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setOtpLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }

      // Xác thực OTP
      const isVerified = await verifyOTP(email, otp);

      if (isVerified) {
        // Chỉ khi OTP đã được xác thực thành công, mới thực hiện cập nhật thông tin
        await handleConfirmUpdateProfile(pendingChanges);
      } else {
        Alert.alert("Lỗi", "Mã OTP không chính xác");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Xác thực OTP thất bại: " + error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5AE0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                image?.uri || user.avatar || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <View style={styles.avatarButtonsContainer}>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChoosePhoto}
            >
              <Text style={styles.changePhotoText}>Chọn ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateAvatarButton}
              onPress={handleUpdateAvatar}
              disabled={!image || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.updateAvatarText}>Cập nhật ảnh</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWithNote}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
              />
              {email !== originalEmail && (
                <Text style={styles.noteText}>Yêu cầu xác thực OTP</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <View style={styles.inputWithNote}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
              />
              {phone !== originalPhone && (
                <Text style={styles.noteText}>Yêu cầu xác thực OTP</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Địa chỉ"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* OTP Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => {
          resetOtpStates();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác thực OTP</Text>

            <Text style={styles.modalDescription}>
              Vui lòng nhập mã OTP đã được gửi đến {email} để xác nhận thay đổi
              {otpFieldType === "email"
                ? " email"
                : otpFieldType === "phone"
                ? " số điện thoại"
                : " thông tin"}
              .
            </Text>

            {!otpSent ? (
              <TouchableOpacity
                style={styles.otpButton}
                onPress={handleSendOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.otpButtonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Nhập mã OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <View style={styles.otpButtonsRow}>
                  <TouchableOpacity
                    style={[styles.otpButton, styles.otpResendButton]}
                    onPress={handleSendOtp}
                    disabled={otpLoading}
                  >
                    <Text style={styles.otpResendButtonText}>Gửi lại</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.otpButton}
                    onPress={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.otpButtonText}>Xác nhận</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={resetOtpStates}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#333333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#6A5AE0",
  },
  avatarButtonsContainer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "center",
  },
  changePhotoButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  changePhotoText: {
    color: "#6A5AE0",
    fontSize: 14,
    fontWeight: "500",
  },
  updateAvatarButton: {
    backgroundColor: "#6A5AE0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  updateAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  inputWithNote: {
    position: "relative",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#FAFAFA",
  },
  noteText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  updateButton: {
    backgroundColor: "#6A5AE0",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6A5AE0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  otpInputContainer: {
    width: "100%",
    alignItems: "center",
  },
  otpInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#6A5AE0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    color: "#333333",
    backgroundColor: "#FAFAFA",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 16,
  },
  otpButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  otpButton: {
    backgroundColor: "#6A5AE0",
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  otpResendButton: {
    backgroundColor: "#F0F0F0",
  },
  otpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  otpResendButtonText: {
    color: "#6A5AE0",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
  },
  closeButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default UpdateProfile;
