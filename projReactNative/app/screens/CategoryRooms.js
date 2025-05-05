import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getRoomsByCategory } from "../services/authService";

const CategoryRooms = ({ route, navigation }) => {
  const { categoryName } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 3;
  // console.log("Dữ liệu truyền danh mục: ", categoryName);
  const fetchRooms = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const data = await getRoomsByCategory(categoryName, page, PAGE_SIZE);

      if (data.rooms.length === 0) {
        setHasMore(false);
      } else {
        setRooms((prevRooms) => {
          // Loại bỏ phòng trùng lặp
          const newRooms = data.rooms.filter(
            (room) => !prevRooms.some((prev) => prev._id === room._id)
          );
          return [...prevRooms, ...newRooms].sort((a, b) => a.price - b.price);
        });
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách phòng:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => {
        console.log("📦 Room ID được chọn:", item._id); // kiểm tra ID
        navigation.navigate("RoomDetail", { roomId: item._id });
      }}
    >
      <FlatList
        data={item.images}
        horizontal
        pagingEnabled
        keyExtractor={(img, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.roomImage} />
        )}
      />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomAddress}>{item.address}</Text>
        <Text style={styles.roomPrice}>
          {item.price.toLocaleString("vi-VN")} đ/tháng
        </Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {typeof item.rating === "number"
              ? item.rating.toFixed(1)
              : "Chưa có đánh giá"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={20} color="#4A90E2" />
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Danh sách phòng {categoryName}</Text>
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : `room-${index}`
        }
        onEndReached={fetchRooms}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : !hasMore ? (
            <Text style={styles.endMessage}>🚀 Đã hiển thị toàn bộ phòng</Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#4A90E2",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomImage: {
    width: 300,
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  roomInfo: {
    padding: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 15,
    fontWeight: "500",
    color: "#E53935",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  endMessage: {
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
});

export default CategoryRooms;
