import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getTopRatedRooms } from "../services/authService";
import { useNavigation } from "@react-navigation/native"; // 👉 thêm dòng này

const TopRatedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // 👉 khởi tạo navigation

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getTopRatedRooms();
        setRooms(data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách phòng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => {
          console.log("📦 Room ID được chọn:", item._id); // kiểm tra ID
          navigation.navigate("RoomDetail", { roomId: item._id });
        }}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.roomImage}
          onError={(e) => console.log("⚠️ Lỗi tải ảnh:", e.nativeEvent.error)}
        />
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.roomAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={styles.roomPrice}>
            {item.price.toLocaleString("vi-VN")} đ/tháng
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phòng được đánh giá cao nhất</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#E53935" />
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  roomItem: {
    width: 250,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  roomInfo: {
    padding: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 14,
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
});

export default TopRatedRooms;
