import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bookViewing } from "../services/authService";

const BookViewingScreen = ({ route, navigation }) => {
  const { roomId, roomName } = route.params;

  const [formData, setFormData] = useState({
    roomId: roomId,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    viewDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Mặc định là ngày mai
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Custom date picker implementation
  const CustomDatePicker = () => {
    const [selectedDate, setSelectedDate] = useState(formData.viewDate);

    // Get tomorrow's date as minimum date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Generate array of next 30 days
    const generateDates = () => {
      const dates = [];
      const startDate = new Date(tomorrow);

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }

      return dates;
    };

    const dates = generateDates();

    return (
      <Modal visible={showDatePicker} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Chọn ngày xem phòng</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dateList}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateItem,
                    isSameDay(date, selectedDate) && styles.selectedDateItem,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateItemText,
                      isSameDay(date, selectedDate) && styles.selectedDateText,
                    ]}
                  >
                    {formatDate(date)} ({getDayName(date)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  handleDateChange(selectedDate);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Get day name
  const getDayName = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (selectedDate) => {
    if (selectedDate) {
      setFormData({
        ...formData,
        viewDate: selectedDate,
      });
    }
  };

  // Hiển thị date picker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập họ tên";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Vui lòng nhập email";
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = "Email không hợp lệ";
    }

    // Validate phone
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Vui lòng nhập số điện thoại";
    } else if (!phoneRegex.test(formData.customerPhone)) {
      newErrors.customerPhone = "Số điện thoại không hợp lệ";
    }

    // Validate date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.viewDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      newErrors.viewDate = "Ngày xem phòng phải từ ngày mai trở đi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Chuẩn bị dữ liệu để gửi đi
      const bookingData = {
        roomId: formData.roomId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        viewDate: formData.viewDate.toISOString(), // Chuyển đổi ngày thành chuỗi ISO
      };

      // Gọi API đặt lịch
      await bookViewing(bookingData);

      setLoading(false);

      // Hiển thị thông báo thành công
      Alert.alert(
        "Đặt lịch thành công",
        "Chúng tôi sẽ liên hệ với bạn để xác nhận lịch xem phòng.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);

      // Xử lý các lỗi từ API
      let errorMessage = "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.";

      if (error.response) {
        // Lấy thông báo lỗi từ API nếu có
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Xử lý các mã lỗi cụ thể
        if (error.response.status === 400) {
          // Lỗi dữ liệu không hợp lệ
          if (error.response.data.message.includes("đã có người đặt lịch")) {
            errorMessage =
              "Phòng đã có người đặt lịch xem vào thời gian này. Vui lòng chọn ngày khác.";
          }
        } else if (error.response.status === 404) {
          // Phòng không tồn tại
          errorMessage = "Phòng không tồn tại hoặc đã bị xóa.";
        }
      }

      Alert.alert("Đặt lịch thất bại", errorMessage);
      console.error("❌ Lỗi khi đặt lịch:", error);
    }
  };

  // Format date để hiển thị
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lịch xem phòng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Thông tin phòng */}
            <View style={styles.roomInfoContainer}>
              <Ionicons
                name="home-outline"
                size={24}
                color="#0066cc"
                style={styles.roomIcon}
              />
              <Text style={styles.roomName}>{roomName || "Phòng trọ"}</Text>
            </View>

            {/* Form đặt lịch */}
            <View style={styles.formContainer}>
              {/* Họ tên */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Họ và tên <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.customerName && styles.inputError,
                  ]}
                  placeholder="Nhập họ tên của bạn"
                  value={formData.customerName}
                  onChangeText={(text) => handleChange("customerName", text)}
                />
                {errors.customerName && (
                  <Text style={styles.errorText}>{errors.customerName}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.customerEmail && styles.inputError,
                  ]}
                  placeholder="Nhập địa chỉ email"
                  value={formData.customerEmail}
                  onChangeText={(text) => handleChange("customerEmail", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.customerEmail && (
                  <Text style={styles.errorText}>{errors.customerEmail}</Text>
                )}
              </View>

              {/* Số điện thoại */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.customerPhone && styles.inputError,
                  ]}
                  placeholder="Nhập số điện thoại"
                  value={formData.customerPhone}
                  onChangeText={(text) => handleChange("customerPhone", text)}
                  keyboardType="phone-pad"
                />
                {errors.customerPhone && (
                  <Text style={styles.errorText}>{errors.customerPhone}</Text>
                )}
              </View>

              {/* Ngày xem phòng */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Ngày xem phòng <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    errors.viewDate && styles.inputError,
                  ]}
                  onPress={showDatePickerModal}
                >
                  <Text style={styles.dateText}>
                    {formatDate(formData.viewDate)}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
                {errors.viewDate && (
                  <Text style={styles.errorText}>{errors.viewDate}</Text>
                )}

                {/* Custom Date Picker */}
                {showDatePicker && <CustomDatePicker />}
              </View>

              {/* Ghi chú */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteText}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#666"
                  />{" "}
                  Lịch xem phòng sẽ được xác nhận qua điện thoại hoặc email.
                </Text>
                <Text style={styles.noteText}>
                  <Ionicons name="time-outline" size={16} color="#666" /> Chủ
                  phòng sẽ duyệt yêu cầu xem phòng của bạn.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Button đặt lịch */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Đặt lịch xem phòng</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  roomInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  roomIcon: {
    marginRight: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0066cc",
    flex: 1,
  },
  formContainer: {
    backgroundColor: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  noteContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#99c2ff",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Custom date picker styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerModal: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  dateList: {
    maxHeight: 300,
  },
  dateItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDateItem: {
    backgroundColor: "#e6f2ff",
    borderRadius: 8,
  },
  dateItemText: {
    fontSize: 16,
  },
  selectedDateText: {
    color: "#0066cc",
    fontWeight: "500",
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default BookViewingScreen;
