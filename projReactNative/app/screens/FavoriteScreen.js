"use client";

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getProfile,
  getFavoriteByUser,
  createFavorite,
  removeFavorite,
} from "../services/authService";

const { width } = Dimensions.get("window");

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  // Tải lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Tải dữ liệu yêu thích
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Bạn cần đăng nhập để xem danh sách yêu thích");
        setLoading(false);
        return;
      }

      // Lấy thông tin người dùng
      const userData = await getProfile(token);
      setCurrentUser(userData);

      // Lấy danh sách yêu thích
      const favoritesData = await getFavoriteByUser(userData._id);
      console.log("Dữ liệu yêu thích:", favoritesData);

      if (Array.isArray(favoritesData)) {
        setFavorites(favoritesData);
      } else if (favoritesData && Array.isArray(favoritesData.favorites)) {
        setFavorites(favoritesData.favorites);
      } else {
        console.warn("Dữ liệu yêu thích không đúng định dạng:", favoritesData);
        setFavorites([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách yêu thích:", error);
      setError(error.message || "Không thể tải danh sách yêu thích");
      setLoading(false);
    }
  };

  // Xử lý kéo để làm mới
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Xử lý xóa khỏi yêu thích
  const handleRemoveFavorite = async (roomId) => {
    try {
      if (!currentUser) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa phòng này khỏi danh sách yêu thích?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              const response = await removeFavorite(currentUser._id, roomId);

              if (response && response.status === "success") {
                setFavorites(
                  favorites.filter((item) => item.roomId._id !== roomId)
                );
                Alert.alert("Thành công", "Đã xóa khỏi danh sách yêu thích");
              } else {
                Alert.alert(
                  "Thông báo",
                  "Có lỗi xảy ra khi xóa khỏi yêu thích"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Lỗi khi xử lý xoá yêu thích:", error);
      Alert.alert("Lỗi", "Không thể xóa khỏi danh sách yêu thích");
    }
  };

  // Xử lý chuyển đến trang chi tiết phòng
  const handleViewRoomDetail = (roomId) => {
    navigation.navigate("RoomDetail", { roomId });
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Render mỗi item trong danh sách yêu thích
  const renderFavoriteItem = ({ item }) => {
    // Kiểm tra cấu trúc dữ liệu
    const room = item.roomId || item;

    if (!room || typeof room !== "object") {
      console.warn("Dữ liệu phòng không hợp lệ:", item);
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => handleViewRoomDetail(room._id)}
      >
        {/* Hình ảnh phòng */}
        <View style={styles.imageContainer}>
          {room.images && room.images.length > 0 ? (
            <Image source={{ uri: room.images[0] }} style={styles.roomImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          {room.isActive === false && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Hết phòng</Text>
            </View>
          )}
        </View>

        {/* Thông tin phòng */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name || "Phòng không tên"}
          </Text>

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.addressText} numberOfLines={1}>
              {room.address || "Không có địa chỉ"}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(room.price || 0)}
                <Text style={styles.priceUnit}>/tháng</Text>
              </Text>
            </View>

            <View style={styles.roomTypeContainer}>
              <Text style={styles.roomTypeText}>
                {room.roomType || "Phòng trọ"}
              </Text>
            </View>
          </View>
        </View>

        {/* Nút xóa khỏi yêu thích */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(room._id)}
        >
          <Ionicons name="heart" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render trạng thái trống
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có phòng yêu thích</Text>
        <Text style={styles.emptySubtitle}>
          Hãy thêm phòng vào danh sách yêu thích để xem sau
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate("mainHome")}
        >
          <Text style={styles.browseButtonText}>Tìm phòng ngay</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render trạng thái lỗi
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFavorites}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phòng yêu thích</Text>
      </View>

      {/* Hiển thị lỗi nếu có */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item, index) =>
            item.roomId?._id || item._id || index.toString()
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            favorites.length > 0 ? (
              <Text style={styles.listHeader}>
                {favorites.length} phòng trong danh sách yêu thích
              </Text>
            ) : null
          }
          ListFooterComponent={
            loading && favorites.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>
                  Đang tải danh sách yêu thích...
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  listHeader: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  favoriteItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: "relative",
  },
  roomImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    paddingVertical: 2,
  },
  unavailableText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  roomInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: 10,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0066cc",
  },
  priceUnit: {
    fontSize: 10,
    color: "#666",
  },
  roomTypeContainer: {
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomTypeText: {
    fontSize: 10,
    color: "#0066cc",
    fontWeight: "500",
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

export default FavoritesScreen;
