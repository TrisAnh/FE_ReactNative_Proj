import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const categories = [
  { id: "1", name: "Phòng đơn" },
  { id: "2", name: "Phòng đôi" },
  { id: "3", name: "Căn hộ" },
  { id: "4", name: "Chung cư" },
  { id: "5", name: "Phòng ghép" },
];

const RoomCategoryList = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.name}</Text>
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
  categoryItem: {
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default RoomCategoryList;
