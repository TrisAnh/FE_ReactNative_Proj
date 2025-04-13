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
  ImageBackground,
  Slider,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import Icon from "react-native-vector-icons/FontAwesome";
import RoomCategoryList from "../screens/RoomCategoryList.js";
import TopRatedRooms from "../screens/TopRatedRooms.js";
import CategoryRooms from "./CategoryRooms.js";
import {
  getRoomCategories,
  getTopRatedRooms,
  searchAndFilterRooms,
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
  const [showFilters, setShowFilters] = useState(false);
  const navigation = useNavigation();

  // Thêm state cho các bộ lọc
  const [roomType, setRoomType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roomTypes, setRoomTypes] = useState([
    { label: "Tất cả", value: "" },
    { label: "Phòng đơn", value: "Phòng đơn" },
    { label: "Phòng đôi", value: "Phòng đôi" },
    { label: "Căn hộ", value: "Căn hộ" },
    { label: "Phòng ghép", value: "Phòng ghép" },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, roomsData] = await Promise.all([
        getRoomCategories(),
        getTopRatedRooms(),
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

  // Xử lý tìm kiếm với debounce và các bộ lọc
  const handleSearch = (text) => {
    setSearchQuery(text);

    // Clear timeout cũ nếu có
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Đặt timeout mới
    const newTimeout = setTimeout(() => {
      performSearch(1); // Tìm kiếm từ trang 1
    }, 500); // Delay 500ms

    setSearchTimeout(newTimeout);
  };

  // Hàm thực hiện tìm kiếm với tất cả các bộ lọc
  const performSearch = async (page = currentPage) => {
    if (
      searchQuery.length >= 2 ||
      roomType ||
      minPrice ||
      maxPrice ||
      sortByPrice
    ) {
      setIsSearching(true);
      try {
        // Tạo đối tượng filters từ các state
        const filters = {
          keyword: searchQuery,
          page: page,
          limit: 10, // Số lượng kết quả mỗi trang
        };

        // Thêm các bộ lọc nếu có
        if (roomType) filters.roomType = roomType;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (sortByPrice) filters.sortByPrice = sortByPrice;

        // Gọi API tìm kiếm và lọc
        const response = await searchAndFilterRooms(filters);

        setSearchResults(response.rooms);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } catch (error) {
        console.error("Error searching rooms:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Xử lý khi thay đổi bộ lọc
  const applyFilters = () => {
    setCurrentPage(1); // Reset về trang 1
    performSearch(1);
    setShowFilters(false);
  };

  // Xử lý phân trang
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      performSearch(prevPage);
    }
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setRoomType("");
    setMinPrice("");
    setMaxPrice("");
    setSortByPrice("");
    setCurrentPage(1);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        console.log("Room ID được chọn:", item._id); // 👈 log ID
        setSearchVisible(false);
        navigation.navigate("RoomDetail", { roomId: item._id });
      }}
    >
      <View style={styles.searchResultContent}>
        <Image
          source={{
            uri:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://example.com/placeholder.jpg",
          }}
          style={styles.searchResultImage}
        />
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.searchResultAddress} numberOfLines={1}>
            {item.address}
          </Text>
          <View style={styles.priceAndRating}>
            <Text style={styles.searchResultPrice}>
              {item.price.toLocaleString("vi-VN")} đ/tháng
            </Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
          <Text style={styles.roomTypeText}>{item.roomType}</Text>
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
        <View style={styles.slideshowContainer}>
          <Image
            source={require("../assets/background.png")}
            style={styles.slideshow}
            resizeMode="cover"
          ></Image>
        </View>
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
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Icon name="filter" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Phần bộ lọc */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterTitle}>Bộ lọc tìm kiếm</Text>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Loại phòng:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={roomType}
                    style={styles.picker}
                    onValueChange={(itemValue) => setRoomType(itemValue)}
                  >
                    {roomTypes.map((type, index) => (
                      <Picker.Item
                        key={index}
                        label={type.label}
                        value={type.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Khoảng giá:</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Giá tối thiểu"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Giá tối đa"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sắp xếp theo giá:</Text>
                <View style={styles.sortButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.sortButton,
                      sortByPrice === "asc" && styles.sortButtonActive,
                    ]}
                    onPress={() => setSortByPrice("asc")}
                  >
                    <Text
                      style={
                        sortByPrice === "asc"
                          ? styles.sortButtonTextActive
                          : styles.sortButtonText
                      }
                    >
                      Tăng dần
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortButton,
                      sortByPrice === "desc" && styles.sortButtonActive,
                    ]}
                    onPress={() => setSortByPrice("desc")}
                  >
                    <Text
                      style={
                        sortByPrice === "desc"
                          ? styles.sortButtonTextActive
                          : styles.sortButtonText
                      }
                    >
                      Giảm dần
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>Đặt lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : (
            <>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.searchResults}
                ListEmptyComponent={
                  searchQuery.length >= 2 ||
                  roomType ||
                  minPrice ||
                  maxPrice ? (
                    <Text style={styles.noResults}>
                      Không tìm thấy kết quả phù hợp
                    </Text>
                  ) : (
                    <Text style={styles.searchPrompt}>
                      Nhập từ khóa hoặc chọn bộ lọc để tìm kiếm
                    </Text>
                  )
                }
              />

              {/* Phân trang */}
              {searchResults.length > 0 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <Icon
                      name="chevron-left"
                      size={16}
                      color={currentPage === 1 ? "#ccc" : "#4A90E2"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.paginationText}>
                    Trang {currentPage} / {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === totalPages &&
                        styles.paginationButtonDisabled,
                    ]}
                    onPress={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={currentPage === totalPages ? "#ccc" : "#4A90E2"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
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
    zIndex: 1000,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
  },
  slideshowContainer: {
    height: 200,
    overflow: "hidden",
    borderRadius: 10,
    marginVertical: 10,
  },
  slideshow: {
    width: "100%",
    height: "120%",
  },
  searchModal: {
    flex: 1,
    backgroundColor: "#fff",
    zIndex: 2000,
    elevation: 10,
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
  filterButton: {
    padding: 10,
    marginLeft: 5,
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
  priceAndRating: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchResultPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E53935",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  roomTypeText: {
    fontSize: 12,
    color: "#4A90E2",
    marginTop: 4,
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
  searchPrompt: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
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
    zIndex: 1000,
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
  // Styles cho bộ lọc
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 45,
    width: "100%",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  priceSeparator: {
    marginHorizontal: 10,
    color: "#666",
  },
  sortButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  sortButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  sortButtonText: {
    color: "#666",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  resetButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 5,
  },
  resetButtonText: {
    color: "#666",
  },
  applyButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    marginLeft: 5,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  // Styles cho phân trang
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  paginationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
  },
  paginationButtonDisabled: {
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  paginationText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: "#666",
  },
});

export default MainHome;
