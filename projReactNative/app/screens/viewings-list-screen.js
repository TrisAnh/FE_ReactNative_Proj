import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getSentViewings,
  getPendingViewings,
  getViewingById,
  updateViewingStatus, // Đổi tên hàm để phản ánh chức năng chung
} from "../services/authService";

const ViewingsListScreen = ({ navigation }) => {
  const [sentViewings, setSentViewings] = useState([]);
  const [pendingViewings, setPendingViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, cancelled
  const [viewType, setViewType] = useState("sent"); // sent, pending

  // Fetch viewings data
  const fetchViewings = async () => {
    try {
      setLoading(true);

      // Fetch both types of viewings in parallel
      const [sentData, pendingData] = await Promise.all([
        getSentViewings(),
        getPendingViewings(),
      ]);

      setSentViewings(sentData);
      setPendingViewings(pendingData);
      console.log("Dữ liệu gửi:", sentData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách đặt lịch. Vui lòng thử lại sau."
      );
      console.error("❌ Lỗi khi tải danh sách đặt lịch:", error);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchViewings();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchViewings();
  }, []);

  // Handle viewing status update (approve or reject)
  const handleUpdateViewingStatus = async (id, status) => {
    try {
      // Sử dụng hàm API từ service
      await updateViewingStatus(id, status);
      console.log("id của bài duyệt", id);

      // Refresh the data
      await fetchViewings();

      const message =
        status === "confirmed"
          ? "Đã duyệt lịch xem phòng thành công"
          : "Đã từ chối lịch xem phòng thành công";

      Alert.alert("Thành công", message);
    } catch (error) {
      const errorMessage =
        status === "confirmed"
          ? "Không thể duyệt lịch xem phòng. Vui lòng thử lại sau."
          : "Không thể từ chối lịch xem phòng. Vui lòng thử lại sau.";

      Alert.alert("Lỗi", errorMessage);
      console.error(`❌ Lỗi khi cập nhật trạng thái lịch xem phòng:`, error);
    }
  };

  // Get current viewings based on view type and filter
  const getCurrentViewings = () => {
    const viewings = viewType === "sent" ? sentViewings : pendingViewings;

    if (filter === "all") {
      return viewings;
    } else {
      return viewings.filter((viewing) => viewing.status === filter);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"; // Amber
      case "confirmed":
        return "#10b981"; // Green
      case "rejected": // Thêm trạng thái rejected theo API backend
      case "cancelled":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "rejected": // Thêm trạng thái rejected theo API backend
        return "Đã từ chối";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Render view type tabs
  const renderViewTypeTabs = () => {
    return (
      <View style={styles.viewTypeContainer}>
        <TouchableOpacity
          style={[
            styles.viewTypeTab,
            viewType === "sent" && styles.activeViewTypeTab,
          ]}
          onPress={() => setViewType("sent")}
        >
          <Ionicons
            name="paper-plane-outline"
            size={16}
            color={viewType === "sent" ? "#0066cc" : "#6b7280"}
            style={styles.viewTypeIcon}
          />
          <Text
            style={[
              styles.viewTypeText,
              viewType === "sent" && styles.activeViewTypeText,
            ]}
          >
            Lịch đã gửi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewTypeTab,
            viewType === "pending" && styles.activeViewTypeTab,
          ]}
          onPress={() => setViewType("pending")}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={viewType === "pending" ? "#0066cc" : "#6b7280"}
            style={styles.viewTypeIcon}
          />
          <Text
            style={[
              styles.viewTypeText,
              viewType === "pending" && styles.activeViewTypeText,
            ]}
          >
            Chờ duyệt
          </Text>
          {/* Badge for pending viewings */}
          {pendingViewings.filter((v) => v.status === "pending").length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingViewings.filter((v) => v.status === "pending").length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Render filter tabs
  const renderFilterTabs = () => {
    const tabs = [
      { id: "all", label: "Tất cả" },
      { id: "pending", label: "Chờ xác nhận" },
      { id: "confirmed", label: "Đã xác nhận" },
      { id: "rejected", label: "Đã từ chối" }, // Thêm tab rejected theo API backend
      { id: "cancelled", label: "Đã hủy" },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                filter === tab.id && styles.activeFilterTab,
              ]}
              onPress={() => setFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === tab.id && styles.activeFilterTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render each viewing item
  const renderViewingItem = ({ item }) => {
    const isPendingView = viewType === "pending";
    const canApprove = isPendingView && item.status === "pending";

    return (
      <TouchableOpacity
        style={[styles.viewingCard, isPendingView ? styles.pendingCard : null]}
        onPress={() => navigation.navigate("ViewingDetails", { id: item._id })}
      >
        <View style={styles.viewingHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        <View style={styles.viewingDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#6b7280"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Ngày xem: {formatDate(item.viewDate)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#6b7280"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Đặt lịch: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="call-outline"
                size={16}
                color="#6b7280"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>{item.customerPhone}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="mail-outline"
                size={16}
                color="#6b7280"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.customerEmail}
              </Text>
            </View>
          </View>

          {/* Property information */}
          {item.property && (
            <View style={styles.propertyInfo}>
              <Ionicons
                name="home-outline"
                size={16}
                color="#6b7280"
                style={styles.detailIcon}
              />
              <Text style={styles.propertyText} numberOfLines={1}>
                {item.property.title || "Phòng/căn hộ"}
              </Text>
            </View>
          )}
        </View>

        {/* Approval buttons for pending viewings with pending status */}
        {canApprove && (
          <View style={styles.approvalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => {
                Alert.alert(
                  "Xác nhận",
                  "Bạn có chắc chắn muốn duyệt lịch này?",
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Duyệt",
                      onPress: () =>
                        handleUpdateViewingStatus(item._id, "confirmed"),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.approveButtonText}>Duyệt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                Alert.alert(
                  "Từ chối",
                  "Bạn có chắc chắn muốn từ chối lịch này?",
                  [
                    { text: "Hủy", style: "cancel" },
                    {
                      text: "Từ chối",
                      onPress: () =>
                        handleUpdateViewingStatus(item._id, "rejected"),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="close-outline" size={16} color="#fff" />
              <Text style={styles.rejectButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>
          {viewType === "sent"
            ? "Không có lịch đặt"
            : "Không có lịch chờ duyệt"}
        </Text>
        <Text style={styles.emptyText}>
          {viewType === "sent"
            ? filter === "all"
              ? "Bạn chưa có lịch đặt xem phòng nào."
              : `Không có lịch đặt nào ở trạng thái ${getStatusText(filter)}.`
            : filter === "all"
            ? "Không có lịch chờ duyệt nào."
            : `Không có lịch chờ duyệt nào ở trạng thái ${getStatusText(
                filter
              )}.`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách đặt lịch</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderViewTypeTabs()}
      {renderFilterTabs()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentViewings()}
          renderItem={renderViewingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0066cc"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  viewTypeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  activeViewTypeTab: {
    backgroundColor: "#e6f2ff",
  },
  viewTypeIcon: {
    marginRight: 6,
  },
  viewTypeText: {
    fontSize: 14,
    color: "#6b7280",
  },
  activeViewTypeText: {
    color: "#0066cc",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
  },
  activeFilterTab: {
    backgroundColor: "#e6f2ff",
  },
  filterTabText: {
    fontSize: 14,
    color: "#6b7280",
  },
  activeFilterTabText: {
    color: "#0066cc",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  viewingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  viewingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  viewingDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
  },
  propertyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  propertyText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  approvalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default ViewingsListScreen;
