import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { sendOTPForgot } from "../services/authService";
import { sendOTP } from "../services/authService";
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email!");
      return;
    }

    console.log("📩 Gửi OTP cho email:", email); // Kiểm tra email trước khi gửi

    try {
      const response = await sendOTPForgot(email);
      console.log("✅ Phản hồi API:", response); // Log phản hồi từ server

      Alert.alert("Thành công", "OTP đã được gửi đến email của bạn!");
      navigation.navigate("otpVerifyForgot", { email });
    } catch (error) {
      console.log("❌ Lỗi API:", error);

      let errorMessage = "Không thể gửi OTP!";
      if (error.response) {
        console.log("🛠 Lỗi chi tiết từ server:", error.response.data);

        if (error.response.status === 400) {
          errorMessage = "Email không hợp lệ hoặc chưa đăng ký!";
        } else if (error.response.status === 500) {
          errorMessage = "Lỗi máy chủ! Vui lòng thử lại sau.";
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server!";
      } else {
        errorMessage = error.message;
      }

      Alert.alert("Lỗi", errorMessage);
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
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email của bạn để nhận mã OTP</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={24}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendOTP}>
          <Text style={styles.sendButtonText}>Gửi OTP</Text>
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
  sendButton: {
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
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
