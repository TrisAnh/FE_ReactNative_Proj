import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const dummyRooms = [
  {
    id: "1",
    name: "Phòng đơn cao cấp",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    price: 3000000,
    rating: 4.8,
    image: "https://example.com/room1.jpg",
  },
  {
    id: "2",
    name: "Căn hộ view đẹp",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    price: 5000000,
    rating: 4.7,
    image: "https://example.com/room2.jpg",
  },
  {
    id: "3",
    name: "Phòng đôi tiện nghi",
    address: "789 Đường LMN, Quận 3, TP.HCM",
    price: 3500000,
    rating: 4.6,
    image: "https://example.com/room3.jpg",
  },
  // Thêm các phòng khác ở đây
];

const TopRatedRooms = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.roomItem}>
      <Image source={{ uri: item.image }} style={styles.roomImage} />
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phòng được đánh giá cao nhất</Text>
      <FlatList
        data={dummyRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
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
