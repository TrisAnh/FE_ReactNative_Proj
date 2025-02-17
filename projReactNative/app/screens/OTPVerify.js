"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { verifyOTP, resendOTP, register } from "../services/authService";

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false); // Biến để kiểm tra trạng thái gửi lại OTP
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName, email, phone, address, password, confirmPassword } =
    route.params;
  const handleVerifyOTP = async () => {
    try {
      const response = await verifyOTP(email, otp);
      if (response.data.success) {
        console.log("OTP xác nhận thành công");

        // Gửi dữ liệu đăng ký sau khi xác nhận OTP
        const userData = {
          fullName,
          email,
          phone,
          address,
          password,
          confirmPassword,
        };
        await register(userData);

        Alert.alert("Thành công", "Đăng ký thành công!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Lỗi", "Mã OTP không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi xác nhận OTP:", error);
      Alert.alert("Lỗi", "Không thể xác nhận OTP. Vui lòng thử lại.");
    }
  };
  const handleResendOTP = async () => {
    setIsResending(true); // Bật chế độ gửi lại OTP
    try {
      const response = await resendOTP(email); // Gọi API để gửi lại OTP
      if (response.success) {
        Alert.alert("Thành công", "Mã OTP đã được gửi lại đến email của bạn.");
      } else {
        Alert.alert("Lỗi", response.message || "Gửi lại OTP thất bại.");
      }
    } catch (error) {
      console.log("Lỗi gửi lại OTP:", error); // Kiểm tra lỗi
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Đã xảy ra lỗi khi gửi lại OTP."
      );
    } finally {
      setIsResending(false); // Tắt chế độ gửi lại OTP
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#61dafb" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>Nhập mã OTP đã được gửi đến {email}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="key-outline"
            size={24}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
          />
        </View>
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
          <Text style={styles.verifyButtonText}>Xác thực</Text>
        </TouchableOpacity>

        {/* Nút gửi lại OTP */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={isResending} // Vô hiệu hóa nút khi đang gửi lại OTP
        >
          <Text style={styles.resendButtonText}>
            {isResending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: "#61dafb",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resendButton: {
    marginTop: 15,
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resendButtonText: {
    color: "#61dafb",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
