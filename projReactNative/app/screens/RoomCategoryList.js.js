import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getRoomCategories } from "../services/authService";

const RoomCategoryList = ({ selectedCategory }) => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getRoomCategories();
        console.log("📌 Dữ liệu danh mục:", data); // Kiểm tra dữ liệu trả về
        setCategories(data);
      } catch (err) {
        setError("Lỗi khi lấy danh mục phòng!");
        console.error("❌ Lỗi khi lấy danh mục phòng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Làm mới danh sách khi người dùng kéo xuống
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  // Dùng useCallback để tối ưu
  const handleCategoryPress = useCallback(
    (category) => {
      console.log("📌 Chọn danh mục:", category);
      navigation.navigate("CategoryRooms", {
        categoryId: category._id,
        categoryName: category.name,
      });
    },
    [navigation]
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?._id === item._id && styles.selectedCategory,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory?._id === item._id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" color="#4A90E2" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loại phòng</Text>
      <FlatList
        data={categories.map((item, index) =>
          typeof item === "string"
            ? { _id: index.toString(), name: item }
            : item
        )} // Đảm bảo mỗi item có _id và name
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory?._id === item._id && styles.selectedCategory,
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory?._id === item._id &&
                  styles.selectedCategoryText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item._id || index.toString()} // Đảm bảo key luôn hợp lệ
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  listContainer: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCategory: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default RoomCategoryList;
