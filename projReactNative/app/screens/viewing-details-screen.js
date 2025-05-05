"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getViewingById, updateViewingStatus } from "../services/authService";

const ViewingDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("id của đặt lịch được gọi", id);
  // Fetch viewing details
  const fetchViewingDetails = async () => {
    try {
      setLoading(true);
      const data = await getViewingById(id);
      setViewing(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin đặt lịch. Vui lòng thử lại sau."
      );
      console.error("❌ Lỗi khi tải thông tin đặt lịch:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchViewingDetails();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"; // Amber
      case "confirmed":
        return "#10b981"; // Green
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
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!viewing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Không tìm thấy thông tin</Text>
          <Text style={styles.emptyText}>
            Thông tin đặt lịch không tồn tại hoặc đã bị xóa.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Trạng thái</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(viewing.status) + "20" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(viewing.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(viewing.status) },
                ]}
              >
                {getStatusText(viewing.status)}
              </Text>
            </View>
          </View>
          {/* Removed the status action buttons */}
        </View>

        {/* Customer Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{viewing.customerName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{viewing.customerPhone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{viewing.customerEmail}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Viewing Details */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông tin lịch xem</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Ngày xem phòng</Text>
                <Text style={styles.infoValue}>
                  {formatDate(viewing.viewDate)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="home-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Phòng</Text>
                <Text style={styles.infoValue}>
                  {viewing.roomId?.name ||
                    "Phòng #" + viewing.roomId?._id ||
                    "Không xác định"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#6b7280"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Thời gian đặt lịch</Text>
                <Text style={styles.infoValue}>
                  {formatDate(viewing.createdAt)}{" "}
                  {formatTime(viewing.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("mainHome")}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#0066cc"
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              navigation.navigate("RoomDetail", {
                roomId: viewing.roomId?._id,
              });
            }}
          >
            <Ionicons
              name="eye"
              size={20}
              color="#10b981"
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: "#10b981" }]}>
              Xem chi tiết
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    marginBottom: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "500",
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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

export default ViewingDetailsScreen;
