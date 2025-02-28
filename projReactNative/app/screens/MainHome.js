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
  Modal,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import RoomCategoryList from "../screens/RoomCategoryList.js";
import TopRatedRooms from "../screens/TopRatedRooms.js";
import {
  getRoomCategories,
  getTopViewedRooms,
  searchRooms, // Thêm API search
} from "../services/authService.js";
import { useNavigation } from "@react-navigation/native";

const MainHome = () => {
  const [categories, setCategories] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  // Xử lý tìm kiếm với debounce
  const handleSearch = (text) => {
    setSearchQuery(text);

    // Clear timeout cũ nếu có
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Đặt timeout mới
    const newTimeout = setTimeout(async () => {
      if (text.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchRooms(text);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching rooms:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Delay 500ms

    setSearchTimeout(newTimeout);
  };

  // Render item kết quả tìm kiếm
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        setSearchVisible(false);
        navigation.navigate("RoomDetail", { roomId: item.id });
      }}
    >
      <View style={styles.searchResultContent}>
        <Image
          source={{ uri: item.image || "https://example.com/placeholder.jpg" }}
          style={styles.searchResultImage}
        />
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.searchResultAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={styles.searchResultPrice}>
            {item.price.toLocaleString("vi-VN")} đ/tháng
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setSearchVisible(true)}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm phòng trọ"
              editable={false}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="bell" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => setShowUserMenu(!showUserMenu)}>
              <Image
                source={require("../assets/home.png")}
                style={styles.avatar}
              />
            </TouchableOpacity>
            {showUserMenu && (
              <View style={styles.userMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowUserMenu(false);
                    navigation.navigate("profile");
                  }}
                >
                  <Icon name="user" size={20} color="#4A90E2" />
                  <Text style={styles.menuText}>Thông tin cá nhân</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowUserMenu(false);
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    });
                  }}
                >
                  <Icon name="sign-out" size={20} color="#E53935" />
                  <Text style={[styles.menuText, { color: "#E53935" }]}>
                    Đăng xuất
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.slideshow}></View>
        <RoomCategoryList categories={categories} />
        <TopRatedRooms rooms={topRooms} />
      </ScrollView>

      {/* Modal Search */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSearchVisible(false)}
            >
              <Icon name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInputModal}
              placeholder="Tìm kiếm phòng trọ"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.searchResults}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <Text style={styles.noResults}>
                    Không tìm thấy kết quả phù hợp
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </>
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
  searchButton: {
    flex: 1,
    marginHorizontal: 10,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  avatarContainer: {
    position: "relative",
    zIndex: 1000, // Ensure this is higher than other elements
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
    zIndex: 1, // Ensure this is lower than the avatar and menu
  },
  // Styles cho modal search
  searchModal: {
    flex: 1,
    backgroundColor: "#fff",
    zIndex: 2000, // Đặt giá trị cao hơn slideshow
    elevation: 10, // Dành cho Android
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 10,
  },
  searchInputModal: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  searchResults: {
    padding: 10,
  },
  searchResultItem: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultContent: {
    flexDirection: "row",
    padding: 10,
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultAddress: {
    fontSize: 14,
    color: "#666",
  },
  searchResultPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E53935",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
  },
  userMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Ensure this is higher than other elements
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
});

export default MainHome;
