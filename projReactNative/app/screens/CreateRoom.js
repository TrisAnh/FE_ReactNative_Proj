"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createRoomCategory, getProfile } from "../services/authService";
import { useNavigation } from "@react-navigation/native";

const roomTypes = [
  "Phòng đơn",
  "Phòng đôi",
  "Căn hộ",
  "Chung cư",
  "Phòng ghép",
];

const CreateRoomScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    price: "",
    isActive: true,
    order: 0,
    roomType: "",
    utilities: {
      wifi: false,
      parking: false,
      airConditioner: false,
      washingMachine: false,
      kitchen: false,
    },
  });

  // Request permission for image library
  // useEffect(() => {
  //   ;(async () => {
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  //     if (status !== "granted") {
  //       Alert.alert("Thông báo", "Cần quyền truy cập thư viện ảnh để tải ảnh lên")
  //     }
  //   })()
  // }, [])

  // Handle text input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Handle price input with formatting
  const handlePriceChange = (value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData({
      ...formData,
      price: numericValue,
    });
    if (errors.price) {
      setErrors({
        ...errors,
        price: null,
      });
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle utility toggle
  const handleUtilityToggle = (utility) => {
    setFormData({
      ...formData,
      utilities: {
        ...formData.utilities,
        [utility]: !formData.utilities[utility],
      },
    });
  };

  // Handle room type selection
  const handleRoomTypeSelect = (type) => {
    setFormData({
      ...formData,
      roomType: type,
    });
    setShowRoomTypeDropdown(false);
    if (errors.roomType) {
      setErrors({
        ...errors,
        roomType: null,
      });
    }
  };

  // Pick images from library
  // const pickImages = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsMultipleSelection: true,
  //       quality: 0.8,
  //       aspect: [16, 9],
  //     })

  //     if (!result.canceled && result.assets) {
  //       // Add new images to existing images
  //       setImages([...images, ...result.assets])
  //       if (errors.images) {
  //         setErrors({
  //           ...errors,
  //           images: null,
  //         })
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error picking images:", error)
  //     Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.")
  //   }
  // }

  const addImageUrl = () => {
    if (!imageUrl.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đường dẫn ảnh");
      return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlPattern.test(imageUrl.trim())) {
      Alert.alert(
        "Lỗi",
        "Đường dẫn ảnh không hợp lệ. Vui lòng nhập URL hợp lệ (http/https) kết thúc bằng .png, .jpg, .jpeg, .gif hoặc .webp"
      );
      return;
    }

    // Add the URL to images array
    setImages([...images, { uri: imageUrl.trim() }]);
    setImageUrl(""); // Clear the input

    // Clear error if there was one
    if (errors.images) {
      setErrors({
        ...errors,
        images: null,
      });
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên phòng";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.price) {
      newErrors.price = "Vui lòng nhập giá phòng";
    } else if (Number.parseInt(formData.price) <= 0) {
      newErrors.price = "Giá phòng phải lớn hơn 0";
    }

    if (!formData.roomType) {
      newErrors.roomType = "Vui lòng chọn loại phòng";
    }

    if (images.length === 0) {
      newErrors.images = "Vui lòng thêm ít nhất 1 ảnh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Get current user information using the token
      let ownerId;
      try {
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert(
            "Lỗi",
            "Bạn chưa đăng nhập. Vui lòng đăng nhập để đăng tin."
          );
          setLoading(false);
          return;
        }

        const userProfile = await getProfile(token);
        ownerId = userProfile._id;
      } catch (userError) {
        console.error("❌ Lỗi khi lấy thông tin người dùng:", userError);
        Alert.alert(
          "Lỗi",
          userError.message ||
            "Không thể xác định thông tin chủ trọ. Vui lòng đăng nhập lại."
        );
        setLoading(false);
        return;
      }

      // In a real app, you would upload images to a server and get URLs back
      // For this example, we'll simulate image URLs
      const imageUrls = images.map((img) => img.uri);

      // Prepare data for API
      const roomData = {
        ...formData,
        price: Number.parseInt(formData.price),
        images: imageUrls,
        owner: ownerId, // Use the current user's ID
      };

      // Call API to create room
      await createRoomCategory(roomData);
      setLoading(false);

      // Show success message
      Alert.alert("Thành công", "Đăng bài thành công", [
        {
          text: "OK",
          onPress: () => {
            // Reset form and navigate back
            setFormData({
              name: "",
              address: "",
              price: "",
              isActive: true,
              order: 0,
              roomType: "",
              utilities: {
                wifi: false,
                parking: false,
                airConditioner: false,
                washingMachine: false,
                kitchen: false,
              },
            });
            setImages([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", "Đăng bài thất bại. Vui lòng thử lại sau.");
      console.error("❌ Lỗi khi đăng bài:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng tin cho thuê</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

              {/* Room Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Tên phòng <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nhập tên phòng"
                  value={formData.name}
                  onChangeText={(text) => handleChange("name", text)}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Room Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Loại phòng <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    errors.roomType && styles.inputError,
                  ]}
                  onPress={() => setShowRoomTypeDropdown(!showRoomTypeDropdown)}
                >
                  <Text
                    style={
                      formData.roomType
                        ? styles.dropdownSelectedText
                        : styles.dropdownPlaceholder
                    }
                  >
                    {formData.roomType || "Chọn loại phòng"}
                  </Text>
                  <Ionicons
                    name={showRoomTypeDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {errors.roomType && (
                  <Text style={styles.errorText}>{errors.roomType}</Text>
                )}

                {showRoomTypeDropdown && (
                  <View style={styles.dropdownList}>
                    {roomTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownItem,
                          formData.roomType === type &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => handleRoomTypeSelect(type)}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            formData.roomType === type &&
                              styles.dropdownItemTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Address */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Địa chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  placeholder="Nhập địa chỉ đầy đủ"
                  value={formData.address}
                  onChangeText={(text) => handleChange("address", text)}
                  multiline
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              {/* Price */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Giá phòng (VNĐ/tháng) <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.priceInputContainer,
                    errors.price && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Nhập giá phòng"
                    value={formatPrice(formData.price)}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceSuffix}>VNĐ/tháng</Text>
                </View>
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>

              {/* Status */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Trạng thái phòng</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>
                    {formData.isActive ? "Còn phòng" : "Hết phòng"}
                  </Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => handleChange("isActive", value)}
                    trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                    thumbColor={formData.isActive ? "#0066cc" : "#9ca3af"}
                    ios_backgroundColor="#d1d5db"
                  />
                </View>
              </View>
            </View>

            {/* Utilities Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Tiện ích phòng</Text>

              <View style={styles.utilitiesContainer}>
                <TouchableOpacity
                  style={styles.utilityItem}
                  onPress={() => handleUtilityToggle("wifi")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.utilityIconContainer,
                      formData.utilities.wifi
                        ? styles.utilityIconActive
                        : styles.utilityIconInactive,
                    ]}
                  >
                    <Ionicons
                      name="wifi"
                      size={24}
                      color={formData.utilities.wifi ? "#0066cc" : "#9ca3af"}
                    />
                  </View>
                  <Text style={styles.utilityText}>Wi-Fi</Text>
                  <View style={styles.utilityCheckbox}>
                    {formData.utilities.wifi && (
                      <Ionicons name="checkmark" size={16} color="#0066cc" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.utilityItem}
                  onPress={() => handleUtilityToggle("parking")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.utilityIconContainer,
                      formData.utilities.parking
                        ? styles.utilityIconActive
                        : styles.utilityIconInactive,
                    ]}
                  >
                    <Ionicons
                      name="car"
                      size={24}
                      color={formData.utilities.parking ? "#0066cc" : "#9ca3af"}
                    />
                  </View>
                  <Text style={styles.utilityText}>Chỗ đậu xe</Text>
                  <View style={styles.utilityCheckbox}>
                    {formData.utilities.parking && (
                      <Ionicons name="checkmark" size={16} color="#0066cc" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.utilityItem}
                  onPress={() => handleUtilityToggle("airConditioner")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.utilityIconContainer,
                      formData.utilities.airConditioner
                        ? styles.utilityIconActive
                        : styles.utilityIconInactive,
                    ]}
                  >
                    <Ionicons
                      name="snow"
                      size={24}
                      color={
                        formData.utilities.airConditioner
                          ? "#0066cc"
                          : "#9ca3af"
                      }
                    />
                  </View>
                  <Text style={styles.utilityText}>Điều hòa</Text>
                  <View style={styles.utilityCheckbox}>
                    {formData.utilities.airConditioner && (
                      <Ionicons name="checkmark" size={16} color="#0066cc" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.utilityItem}
                  onPress={() => handleUtilityToggle("washingMachine")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.utilityIconContainer,
                      formData.utilities.washingMachine
                        ? styles.utilityIconActive
                        : styles.utilityIconInactive,
                    ]}
                  >
                    <Ionicons
                      name="water"
                      size={24}
                      color={
                        formData.utilities.washingMachine
                          ? "#0066cc"
                          : "#9ca3af"
                      }
                    />
                  </View>
                  <Text style={styles.utilityText}>Máy giặt</Text>
                  <View style={styles.utilityCheckbox}>
                    {formData.utilities.washingMachine && (
                      <Ionicons name="checkmark" size={16} color="#0066cc" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.utilityItem}
                  onPress={() => handleUtilityToggle("kitchen")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.utilityIconContainer,
                      formData.utilities.kitchen
                        ? styles.utilityIconActive
                        : styles.utilityIconInactive,
                    ]}
                  >
                    <Ionicons
                      name="restaurant"
                      size={24}
                      color={formData.utilities.kitchen ? "#0066cc" : "#9ca3af"}
                    />
                  </View>
                  <Text style={styles.utilityText}>Bếp</Text>
                  <View style={styles.utilityCheckbox}>
                    {formData.utilities.kitchen && (
                      <Ionicons name="checkmark" size={16} color="#0066cc" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Images Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>
                  Hình ảnh phòng <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>Tối đa 10 ảnh</Text>
              </View>

              {errors.images && (
                <Text style={styles.errorText}>{errors.images}</Text>
              )}

              {/* Image URL Input */}
              <View style={styles.imageUrlContainer}>
                <TextInput
                  style={styles.imageUrlInput}
                  placeholder="Nhập đường dẫn ảnh (URL)"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[
                    styles.addUrlButton,
                    images.length >= 10 && styles.disabledButton,
                  ]}
                  onPress={addImageUrl}
                  disabled={images.length >= 10}
                >
                  <Text style={styles.addUrlButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.imageHelpText}>
                Nhập đường dẫn ảnh kết thúc bằng .jpg, .png, .jpeg, .gif hoặc
                .webp
              </Text>

              {/* Image Previews */}
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4d4f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Đăng tin</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  formSection: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: "#111827",
    fontSize: 16,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f9ff",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
  },
  dropdownItemTextSelected: {
    color: "#0066cc",
    fontWeight: "500",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  priceSuffix: {
    color: "#6b7280",
    fontSize: 14,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchText: {
    fontSize: 16,
    color: "#111827",
  },
  utilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  utilityItem: {
    width: "33.33%",
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  utilityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  utilityIconActive: {
    backgroundColor: "#e6f2ff",
  },
  utilityIconInactive: {
    backgroundColor: "#f3f4f6",
  },
  utilityText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  utilityCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  imagePreviewContainer: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 4,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addImageButton: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 8,
    margin: 4,
  },
  addImageText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  imageHelpText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageUrlContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageUrlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  addUrlButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addUrlButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default CreateRoomScreen;
