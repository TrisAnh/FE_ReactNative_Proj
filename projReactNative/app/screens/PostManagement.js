import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/authContext"; // Adjust path as needed
import { getRoomsByOwner } from "../services/authService"; // Adjust path as needed

const OwnerRoomsList = ({ navigation }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch rooms
  const fetchOwnerRooms = async () => {
    if (!user || !user._id) {
      setError("Không tìm thấy thông tin người dùng");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const ownerId = user._id;
      console.log("Đang tải danh sách phòng cho chủ trọ ID:", ownerId);

      const response = await getRoomsByOwner(ownerId);

      // Check if response has the rooms property and it's an array
      if (response && response.rooms && Array.isArray(response.rooms)) {
        console.log(`Đã tải ${response.rooms.length} phòng từ API`);
        setRooms(response.rooms);
      } else {
        console.error("Định dạng phản hồi API không đúng:", response);
        setError("Dữ liệu phòng không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
      setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOwnerRooms();
  }, [user]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchOwnerRooms();
  };

  // Render each room item
  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => navigation.navigate("RoomDetail", { roomId: item._id })}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{item.name || "Phòng không tên"}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? "#10b981" : "#ef4444" },
          ]}
        >
          <Text style={styles.statusText}>
            {item.isActive ? "Đang hiển thị" : "Đã ẩn"}
          </Text>
        </View>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.address || "Chưa có địa chỉ"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {item.price
              ? `${item.price.toLocaleString("vi-VN")} đ/tháng`
              : "Chưa có giá"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="eye-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{item.views || 0} lượt xem</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="bed-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {item.roomType || "Chưa phân loại"}
          </Text>
        </View>
      </View>

      <View style={styles.roomFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("EditRoom", {
              ownerId: user._id,
              roomId: item._id,
            })
          }
        >
          <Ionicons name="create-outline" size={16} color="#0066cc" />
          <Text style={styles.actionText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("ViewingsListScreen", { roomId: item._id })
          }
        >
          <Ionicons name="calendar-outline" size={16} color="#10b981" />
          <Text style={[styles.actionText, { color: "#10b981" }]}>
            Lịch xem phòng
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOwnerRooms}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (rooms.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="home-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Chưa có phòng nào</Text>
        <Text style={styles.emptyText}>
          Bạn chưa có phòng trọ nào. Hãy thêm phòng mới.
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateRoom")}
        >
          <Text style={styles.addButtonText}>Thêm phòng mới</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rooms list
  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreateRoom")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for floating button
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
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
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0066cc",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  roomInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
  },
  roomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#0066cc",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default OwnerRoomsList;
