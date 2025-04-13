"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { getRoomsDetail } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import RoomImageGallery from "../screens/room-image-gallery";
const { width } = Dimensions.get("window");

const RoomDetailScreen = ({ route }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigation = useNavigation();
  useEffect(() => {
    fetchRoomDetail();
  }, []);

  const fetchRoomDetail = async () => {
    try {
      setLoading(true);
      console.log("Roomid được truyền là: ", roomId);
      const data = await getRoomsDetail(roomId);
      // console.log("dữ liệu phòng chi tiết", data);
      setRoom(data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.");
      setLoading(false);
      console.error("❌ Lỗi khi tải chi tiết phòng:", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoomDetail}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(slideIndex);
            }}
          >
            {room.images && room.images.length > 0 ? (
              room.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.carouselImage}
                />
              ))
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
                <Text style={styles.noImageText}>Không có hình ảnh</Text>
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {room.images && room.images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {room.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    activeImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Room Details */}
        <View style={styles.detailsContainer}>
          {/* Room Name and Rating */}
          <View style={styles.nameRatingContainer}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {room.rating?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          {/* Room Type Badge */}
          <View style={styles.roomTypeBadge}>
            <Text style={styles.roomTypeText}>{room.roomType}</Text>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.addressText}>{room.address}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá phòng</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(room.price)}
              <Text style={styles.priceUnit}>/tháng</Text>
            </Text>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Trạng thái</Text>
            <View style={styles.statusValueContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: room.isActive ? "#4CAF50" : "#F44336" },
                ]}
              />
              <Text style={styles.statusValue}>
                {room.isActive ? "Còn phòng" : "Hết phòng"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Room Features */}
          <Text style={styles.sectionTitle}>Tiện ích phòng</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="wifi-outline" size={24} color="#0066cc" />
              <Text style={styles.featureText}>Wi-Fi</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="car-outline" size={24} color="#0066cc" />
              <Text style={styles.featureText}>Chỗ đậu xe</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="snow-outline" size={24} color="#0066cc" />
              <Text style={styles.featureText}>Điều hòa</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="tv-outline" size={24} color="#0066cc" />
              <Text style={styles.featureText}>TV</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>
            {room.description ||
              "Phòng trọ thoáng mát, sạch sẽ, an ninh tốt. Gần trung tâm, thuận tiện đi lại. Có đầy đủ tiện nghi cơ bản như điều hòa, nóng lạnh, tủ quần áo, bàn ghế."}
          </Text>

          {/* Booking Button */}
          <TouchableOpacity
            style={[styles.bookButton, !room.isActive && styles.disabledButton]}
            disabled={!room.isActive}
            onPress={() => {
              if (room.isActive) {
                navigation.navigate("BookViewingScreen", {
                  roomId: room._id,
                  roomName: room.name,
                });
              }
            }}
          >
            <Text style={styles.bookButtonText}>
              {room.isActive ? "Đặt lịch ngay" : "Hết phòng trống"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0066cc",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCarousel: {
    height: 250,
    width: "100%",
  },
  carouselImage: {
    width,
    height: 250,
    resizeMode: "cover",
  },
  noImageContainer: {
    width,
    height: 250,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 10,
    color: "#999",
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#fff",
  },
  detailsContainer: {
    padding: 16,
  },
  nameRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomName: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#333",
  },
  roomTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  roomTypeText: {
    color: "#0066cc",
    fontWeight: "500",
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0066cc",
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#666",
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  featureItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default RoomDetailScreen;
