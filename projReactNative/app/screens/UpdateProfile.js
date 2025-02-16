"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://localhost:5000/api";

const EditProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(route.params.user);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [avatar, setAvatar] = useState(user.avatar);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpFor, setOtpFor] = useState("");

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Xin lỗi",
          "Chúng tôi cần quyền truy cập thư viện ảnh để thay đổi avatar."
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      updateAvatar(result.uri);
    }
  };

  const updateAvatar = async (imageUri) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    });

    try {
      const response = await axios.put(
        `${API_URL}/auth/updateavatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setAvatar(response.data.user.avatar);
      Alert.alert("Thành công", "Cập nhật avatar thành công!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật avatar. Vui lòng thử lại sau.");
    }
  };

  const updateProfile = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/auth/UpdateProfile`,
        { fullName, address },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUser(response.data.user);
      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    }
  };

  const sendOtp = async (type) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/send-change-${type}-otp`,
        { [type]: type === "email" ? newEmail : newPhone },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setShowOtpInput(true);
      setOtpFor(type);
      Alert.alert(
        "Thành công",
        `Mã OTP đã được gửi đến ${type === "email" ? newEmail : newPhone}`
      );
    } catch (error) {
      Alert.alert("Lỗi", `Không thể gửi mã OTP. Vui lòng thử lại sau.`);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/verify-change-${otpFor}`,
        {
          [otpFor]: otpFor === "email" ? newEmail : newPhone,
          otp,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (otpFor === "email") {
        setEmail(newEmail);
      } else {
        setPhone(newPhone);
      }
      setShowOtpInput(false);
      setOtp("");
      Alert.alert(
        "Thành công",
        `${otpFor === "email" ? "Email" : "Số điện thoại"} đã được cập nhật!`
      );
    } catch (error) {
      Alert.alert("Lỗi", "Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ"
          multiline
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text style={styles.buttonText}>Cập nhật thông tin</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email hiện tại</Text>
        <Text style={styles.currentValue}>{email}</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="Nhập email mới"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendOtp("email")}
        >
          <Text style={styles.buttonText}>Gửi mã OTP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điện thoại hiện tại</Text>
        <Text style={styles.currentValue}>{phone}</Text>
        <TextInput
          style={styles.input}
          value={newPhone}
          onChangeText={setNewPhone}
          placeholder="Nhập số điện thoại mới"
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendOtp("phone")}
        >
          <Text style={styles.buttonText}>Gửi mã OTP</Text>
        </TouchableOpacity>
      </View>

      {showOtpInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nhập mã OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Xác nhận OTP</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  currentValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
});

export default EditProfileScreen;
