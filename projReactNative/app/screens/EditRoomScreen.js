"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  getRoomsByOwner,
  updateRoomCategory,
  deleteRoomCategory,
} from "../services/authService";

// Danh sách loại phòng từ model
const ROOM_TYPES = [
  "Phòng đơn",
  "Phòng đôi",
  "Căn hộ",
  "Chung cư",
  "Phòng ghép",
];

const EditRoomScreen = ({ route, navigation }) => {
  const { ownerId, roomId } = route.params;
  console.log("room id", ownerId);
  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [utilities, setUtilities] = useState({
    wifi: false,
    parking: false,
    airConditioner: false,
    washingMachine: false,
    kitchen: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showRoomTypes, setShowRoomTypes] = useState(false);
  const [error, setError] = useState(null);

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await getRoomsByOwner(ownerId);
        console.log("API Response:", response);

        // Find the room with matching ID from the rooms array
        let roomData = null;
        if (response.rooms && Array.isArray(response.rooms)) {
          roomData = response.rooms.find((room) => room._id === roomId);
        } else if (response.roomCategory) {
          roomData = response.roomCategory;
        } else {
          roomData = response;
        }

        console.log("Room data to display:", roomData);

        if (!roomData) {
          throw new Error("Không tìm thấy thông tin phòng");
        }

        // Populate form with existing data
        setName(roomData.name || "");
        setAddress(roomData.address || "");
        setPrice(roomData.price ? roomData.price.toString() : "");
        setRoomType(roomData.roomType || "");
        setImages(roomData.images || []);
        setIsActive(roomData.isActive !== undefined ? roomData.isActive : true);

        // Set utilities
        if (roomData.utilities) {
          setUtilities({
            wifi: roomData.utilities.wifi || false,
            parking: roomData.utilities.parking || false,
            airConditioner: roomData.utilities.airConditioner || false,
            washingMachine: roomData.utilities.washingMachine || false,
            kitchen: roomData.utilities.kitchen || false,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Lỗi khi tải thông tin phòng:", error);
        setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Handle image URL input
  const addImageUrl = () => {
    Alert.prompt(
      "Thêm ảnh",
      "Nhập URL của ảnh",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Thêm",
          onPress: (url) => {
            if (url && url.trim()) {
              setImages([...images, url.trim()]);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Toggle utility
  const toggleUtility = (key) => {
    setUtilities({
      ...utilities,
      [key]: !utilities[key],
    });
  };

  // Format price with commas
  const formatPrice = (text) => {
    if (!text) return "";
    // Chỉ định dạng số, không cập nhật state
    return text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // Save room changes
  const handleSave = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên phòng");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }

    if (!price || Number.parseInt(price) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!roomType) {
      Alert.alert("Lỗi", "Vui lòng chọn loại phòng");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một ảnh");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for API
      const roomData = {
        name,
        address,
        price: Number.parseInt(price),
        roomType,
        images,
        isActive,
        utilities,
      };
      console.log("Dữ liêu  gửi đi:", roomData);
      // Call API to update room
      await updateRoomCategory(roomId, roomData);

      setSaving(false);

      // Show success message
      Alert.alert("Thành công", "Cập nhật thông tin phòng thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      setSaving(false);
      console.error("❌ Lỗi khi cập nhật phòng:", error);
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật thông tin phòng. Vui lòng thử lại sau."
      );
    }
  };

  // Delete room
  const confirmDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRoomCategory(roomId);
      setDeleting(false);

      // Show success message and navigate back
      Alert.alert("Thành công", "Xóa phòng thành công", [
        {
          text: "OK",
          onPress: () => navigation.navigate("OwnerRoomsList"),
        },
      ]);
    } catch (error) {
      setDeleting(false);
      console.error("❌ Lỗi khi xóa phòng:", error);
      Alert.alert("Lỗi", "Không thể xóa phòng. Vui lòng thử lại sau.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa phòng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa phòng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace("EditRoom", { roomId })}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa phòng</Text>
          <TouchableOpacity
            onPress={confirmDelete}
            style={styles.deleteButton}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={styles.deleteButtonText}>🗑️</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Room Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên phòng</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên phòng"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ đầy đủ"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Giá thuê (VNĐ/tháng)</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.input}
                value={price ? formatPrice(price) : ""}
                onChangeText={(text) => {
                  // Chỉ lấy số từ input và cập nhật state
                  const numericValue = text.replace(/[^0-9]/g, "");
                  setPrice(numericValue);
                }}
                placeholder="Nhập giá thuê"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
              <Text style={styles.priceSuffix}>đ/tháng</Text>
            </View>
          </View>

          {/* Room Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại phòng</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowRoomTypes(!showRoomTypes)}
            >
              <Text
                style={
                  roomType ? styles.dropdownText : styles.dropdownPlaceholder
                }
              >
                {roomType || "Chọn loại phòng"}
              </Text>
              <Text style={styles.dropdownIcon}>
                {showRoomTypes ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {showRoomTypes && (
              <View style={styles.dropdownMenu}>
                {ROOM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      roomType === type && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setRoomType(type);
                      setShowRoomTypes(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        roomType === type && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                    {roomType === type && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Active Status */}
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.label}>Trạng thái hiển thị</Text>
                <Text style={styles.switchDescription}>
                  {isActive
                    ? "Phòng đang được hiển thị công khai"
                    : "Phòng đang bị ẩn"}
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={isActive ? "#0066cc" : "#9ca3af"}
                ios_backgroundColor="#d1d5db"
                onValueChange={() => setIsActive(!isActive)}
                value={isActive}
              />
            </View>
          </View>

          {/* Images */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Hình ảnh phòng</Text>
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={addImageUrl}
              >
                <Text style={styles.addImageText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Utilities */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tiện ích</Text>
            <View style={styles.utilitiesContainer}>
              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  utilities.wifi && styles.utilityItemSelected,
                ]}
                onPress={() => toggleUtility("wifi")}
              >
                <Text style={styles.utilityIcon}>📶</Text>
                <Text
                  style={[
                    styles.utilityText,
                    utilities.wifi && styles.utilityTextSelected,
                  ]}
                >
                  Wifi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  utilities.parking && styles.utilityItemSelected,
                ]}
                onPress={() => toggleUtility("parking")}
              >
                <Text style={styles.utilityIcon}>🚗</Text>
                <Text
                  style={[
                    styles.utilityText,
                    utilities.parking && styles.utilityTextSelected,
                  ]}
                >
                  Chỗ để xe
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  utilities.airConditioner && styles.utilityItemSelected,
                ]}
                onPress={() => toggleUtility("airConditioner")}
              >
                <Text style={styles.utilityIcon}>❄️</Text>
                <Text
                  style={[
                    styles.utilityText,
                    utilities.airConditioner && styles.utilityTextSelected,
                  ]}
                >
                  Máy lạnh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  utilities.washingMachine && styles.utilityItemSelected,
                ]}
                onPress={() => toggleUtility("washingMachine")}
              >
                <Text style={styles.utilityIcon}>🧺</Text>
                <Text
                  style={[
                    styles.utilityText,
                    utilities.washingMachine && styles.utilityTextSelected,
                  ]}
                >
                  Máy giặt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  utilities.kitchen && styles.utilityItemSelected,
                ]}
                onPress={() => toggleUtility("kitchen")}
              >
                <Text style={styles.utilityIcon}>🍳</Text>
                <Text
                  style={[
                    styles.utilityText,
                    utilities.kitchen && styles.utilityTextSelected,
                  ]}
                >
                  Nhà bếp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.saveButtonIcon}>💾</Text>
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceSuffix: {
    marginLeft: 8,
    fontSize: 16,
    color: "#6b7280",
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dropdownIcon: {
    fontSize: 14,
    color: "#6b7280",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f9ff",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownItemTextSelected: {
    color: "#0066cc",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 16,
    color: "#0066cc",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
  },
  switchDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  addImageButton: {
    width: 100,
    height: 100,
    margin: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  addImageText: {
    fontSize: 40,
    color: "#9ca3af",
  },
  utilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  utilityItem: {
    width: "30%",
    marginBottom: 12,
    marginHorizontal: "1.5%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  utilityItemSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: "#0066cc",
  },
  utilityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  utilityText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  utilityTextSelected: {
    color: "#0066cc",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  saveButtonIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#0066cc",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default EditRoomScreen;
