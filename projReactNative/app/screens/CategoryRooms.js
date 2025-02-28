// screens/CategoryRooms.js
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

const CategoryRooms = ({ route }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categoryId, categoryName } = route.params;

  const fetchRooms = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      // Thay thế URL API của bạn
      const response = await fetch(
        `https://your-api.com/api/rooms?category=${categoryId}&page=${page}&limit=10`
      );
      const data = await response.json();

      if (data.rooms.length === 0) {
        setHasMore(false);
      } else {
        setRooms((prevRooms) => [...prevRooms, ...data.rooms]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [categoryId]);

  const renderRoom = ({ item }) => (
    <TouchableOpacity style={styles.roomCard}>
      <Image source={{ uri: item.image }} style={styles.roomImage} />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomAddress}>{item.address}</Text>
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

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#4A90E2" />
      </View>
    );
  };

  return (
    <FlatList
      data={rooms}
      renderItem={renderRoom}
      keyExtractor={(item) => item.id}
      onEndReached={fetchRooms}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
    width: "100%",
    height: 200,
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
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default CategoryRooms;
