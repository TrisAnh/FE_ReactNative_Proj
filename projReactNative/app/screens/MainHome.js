"use client";

import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import RoomCategoryList from "../screens/RoomCategoryList.js";
import TopRatedRooms from "../screens/TopRatedRooms.js";
import {
  getRoomCategories,
  getTopViewedRooms,
} from "../services/authService.js";
import { useNavigation } from "@react-navigation/native";
const MainHome = () => {
  const [categories, setCategories] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, roomsData] = await Promise.all([
        getRoomCategories(),
        getTopViewedRooms(),
      ]);
      setCategories(categoriesData);
      setTopRooms(roomsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phòng trọ"
        />
        <TouchableOpacity>
          <Icon name="bell" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: "https://example.com/user-avatar.jpg" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.slideshow}></View>
      <RoomCategoryList categories={categories} />
      <TopRatedRooms rooms={topRooms} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
  },
  slideshow: {
    height: 200,
    backgroundColor: "#4A90E2",
    marginVertical: 10,
  },
});

export default MainHome;
