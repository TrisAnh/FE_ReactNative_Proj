// screens/RoomCategoryList.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const categories = [
  { id: "1", name: "Phòng đơn" },
  { id: "2", name: "Phòng đôi" },
  { id: "3", name: "Căn hộ" },
  { id: "4", name: "Chung cư" },
  { id: "5", name: "Phòng ghép" },
];

const RoomCategoryList = ({ selectedCategory, onSelectCategory }) => {
  const navigation = useNavigation();

  // Trong hàm handleCategoryPress của RoomCategoryList.js
  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryRooms", {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedCategory,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory?.id === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loại phòng</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
});

export default RoomCategoryList;
