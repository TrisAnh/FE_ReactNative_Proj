"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  getRoomsDetail,
  getRoomComments,
  getUserById,
  createComment,
  updateComment,
  deleteComment,
  getProfile,
  createFavorite,
} from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const RoomDetailScreen = ({ route }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [owner, setOwner] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigation = useNavigation();

  // Comment state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchRoomDetail();
    fetchRoomComments();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ Không có token, người dùng chưa đăng nhập.");
        return;
      }

      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } else {
        console.warn(
          "⚠️ Có token nhưng không tìm thấy thông tin người dùng. Đang gọi API..."
        );

        const profile = await getProfile(token); // Gọi API để lấy user nếu chưa có
        if (profile) {
          setCurrentUser(profile);
          await AsyncStorage.setItem("user", JSON.stringify(profile));
        } else {
          console.warn(
            "❌ Token không hợp lệ hoặc không thể lấy được thông tin người dùng từ API."
          );
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const handleToggleFavorite = async () => {
    console.log("Toggle favorite function called");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào yêu thích", [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
        return;
      }

      if (!currentUser) {
        Alert.alert("Thông báo", "Không thể xác định người dùng hiện tại");
        return;
      }

      setFavoriteLoading(true);

      const formData = {
        userId: currentUser._id,
        roomId: roomId,
      };
      console.log("Sending favorite data:", formData);

      const response = await createFavorite(formData);
      console.log("Received response:", response);

      // Cập nhật trạng thái yêu thích dựa trên phản hồi từ server
      if (response) {
        // Đơn giản hóa logic bằng cách đảo ngược trạng thái hiện tại
        setIsFavorite(!isFavorite);
        console.log("Favorite state toggled to:", !isFavorite);

        // Hiển thị thông báo
        Alert.alert(
          "Thông báo",
          response.message || "Đã cập nhật trạng thái yêu thích"
        );
      }

      setFavoriteLoading(false);
    } catch (error) {
      console.error("❌ Lỗi khi thêm/xóa yêu thích:", error);
      Alert.alert(
        "Thông báo",
        "Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại sau."
      );
      setFavoriteLoading(false);
    }
  };

  const fetchRoomDetail = async () => {
    try {
      setLoading(true);
      console.log("Roomid được truyền là: ", roomId);
      const data = await getRoomsDetail(roomId);
      setRoom(data);
      console.log("Dữ liệu phòng", data);

      // Fetch owner information if ownerId exists
      if (data.owner) {
        fetchOwnerInfo(data.owner);
      }

      // Check favorite status if user is logged in
      if (currentUser && currentUser._id) {
        try {
          const formData = {
            userId: currentUser._id,
            roomId: roomId,
            checkOnly: true, // Add this flag to your API to indicate just checking status
          };
          const favoriteResponse = await createFavorite(formData);
          if (favoriteResponse && favoriteResponse.isFavorite !== undefined) {
            setIsFavorite(favoriteResponse.isFavorite);
          }
        } catch (favoriteError) {
          console.error(
            "❌ Lỗi khi kiểm tra trạng thái yêu thích:",
            favoriteError
          );
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.");
      setLoading(false);
      console.error("❌ Lỗi khi tải chi tiết phòng:", err);
    }
  };

  const fetchOwnerInfo = async (ownerId) => {
    try {
      setOwnerLoading(true);
      const id = ownerId._id;
      const ownerData = await getUserById(id);
      //  console.log("Dữ liệu owner", ownerData);
      setOwner(ownerData);
      setOwnerLoading(false);
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin chủ trọ:", err);
      setOwnerLoading(false);
    }
  };

  const fetchRoomComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await getRoomComments(roomId);
      console.log("Dữ liệu comment của bài viết: ", response);
      // Check the structure of the response
      const commentsData = response?.comments || [];

      // If commentsData is an array, proceed with mapping
      if (Array.isArray(commentsData)) {
        // Fetch user info for each comment
        const commentsWithUserInfo = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userData = await getUserById(comment.userId);
              return {
                ...comment,
                userName: userData?.fullName || "Người dùng",
                userAvatar: userData?.avatar || null,
              };
            } catch (error) {
              console.error("Error fetching user for comment:", error);
              return {
                ...comment,
                userName: "Người dùng",
                userAvatar: null,
              };
            }
          })
        );

        setComments(commentsWithUserInfo);
      } else {
        // If not an array, set empty comments
        console.warn("Comments data is not in expected format:", commentsData);
        setComments([]);
      }

      setCommentsLoading(false);
    } catch (err) {
      console.error("❌ Lỗi khi tải bình luận:", err);
      setCommentsLoading(false);
      setComments([]);
    }
  };

  const handleSubmitComment = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để đánh giá", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng nhập",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
      return;
    }

    if (!currentUser) {
      // If we have a token but no user data, try to get user data again
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        } else {
          console.warn(
            "⚠️ Có token nhưng không tìm thấy thông tin người dùng."
          );
          Alert.alert("Thông báo", "Có lỗi xảy ra, vui lòng đăng nhập lại");
          return;
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin người dùng:", error);
        Alert.alert("Thông báo", "Có lỗi xảy ra, vui lòng đăng nhập lại");
        return;
      }
    }

    if (!commentContent.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setCommentLoading(true);

      if (editingComment) {
        // Kiểm tra xem editingComment có _id không
        if (!editingComment._id) {
          console.error("❌ Không tìm thấy ID của bình luận cần sửa!");
          Alert.alert(
            "Thông báo",
            "Không thể sửa bình luận này. Vui lòng thử lại sau."
          );
          setCommentLoading(false);
          return;
        }

        console.log("commentId được truyền vào: ", editingComment._id);
        console.log("Dữ liệu được thay đổi: ", {
          content: commentContent,
          rating: commentRating,
        });

        // Update existing comment - only send content and rating
        await updateComment(editingComment._id, {
          content: commentContent,
          rating: commentRating,
        });
      } else {
        // Create new comment
        const formData = {
          roomId,
          userId: currentUser._id,
          content: commentContent,
          rating: commentRating,
        };
        console.log("Dữ liêu comment được gửi đi: ", formData);
        await createComment(formData);
      }

      // Reset form and refresh comments
      setCommentContent("");
      setCommentRating(5);
      setShowCommentForm(false);
      setEditingComment(null);
      fetchRoomComments();

      setCommentLoading(false);
    } catch (error) {
      console.error("❌ Lỗi khi gửi bình luận:", error);
      Alert.alert(
        "Thông báo",
        "Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại sau."
      );
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    console.log("Đang sửa bình luận:", comment);
    if (!comment || !comment._id) {
      console.error("❌ Bình luận không hợp lệ hoặc không có ID!");
      Alert.alert("Thông báo", "Không thể sửa bình luận này.");
      return;
    }

    setEditingComment(comment);
    setCommentContent(comment.content);
    setCommentRating(comment.rating);
    setShowCommentForm(true);
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa bình luận này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComment(commentId);
            // Remove comment from state
            setComments(
              comments.filter((comment) => comment._id !== commentId)
            );
            Alert.alert("Thành công", "Đã xóa bình luận");
          } catch (error) {
            console.error("❌ Lỗi khi xóa bình luận:", error);
            Alert.alert(
              "Thông báo",
              "Có lỗi xảy ra khi xóa bình luận. Vui lòng thử lại sau."
            );
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleCallOwner = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("Thông báo", "Không có số điện thoại của chủ nhà");
      return;
    }

    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert(
          "Thông báo",
          "Không thể thực hiện cuộc gọi trên thiết bị này"
        );
      }
    });
  };

  const handleEmailOwner = (email) => {
    if (!email) {
      Alert.alert("Thông báo", "Không có địa chỉ email của chủ nhà");
      return;
    }

    Linking.canOpenURL(`mailto:${email}`).then((supported) => {
      if (supported) {
        Linking.openURL(`mailto:${email}?subject=Hỏi về phòng: ${room.name}`);
      } else {
        Alert.alert("Thông báo", "Không thể gửi email trên thiết bị này");
      }
    });
  };

  // Comment Form Modal
  const renderCommentForm = () => {
    return (
      <Modal
        visible={showCommentForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCommentForm(false);
          setEditingComment(null);
          setCommentContent("");
          setCommentRating(5);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingComment ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentForm(false);
                  setEditingComment(null);
                  setCommentContent("");
                  setCommentRating(5);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingLabel}>Đánh giá của bạn</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setCommentRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= commentRating ? "star" : "star-outline"}
                    size={32}
                    color={star <= commentRating ? "#FFD700" : "#ccc"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nội dung đánh giá</Text>
            <TextInput
              style={styles.input}
              placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
              multiline
              numberOfLines={4}
              value={commentContent}
              onChangeText={setCommentContent}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitComment}
              disabled={commentLoading}
            >
              {commentLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingComment ? "Cập nhật" : "Gửi đánh giá"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoomDetail}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.activeFavoriteButton,
            ]}
            onPress={handleToggleFavorite}
            disabled={favoriteLoading} // Chỉ vô hiệu hóa khi đang tải
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#ff3b30" : "#000"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(slideIndex);
            }}
          >
            {room.images && room.images.length > 0 ? (
              room.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.carouselImage}
                />
              ))
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
                <Text style={styles.noImageText}>Không có hình ảnh</Text>
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {room.images && room.images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {room.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    activeImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Room Details */}
        <View style={styles.detailsContainer}>
          {/* Room Name and Views */}
          <View style={styles.nameRatingContainer}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={18} color="#666" />
              <Text style={styles.viewsText}>{room.views || 0} lượt xem</Text>
            </View>
          </View>

          {/* Room Type Badge */}
          <View style={styles.roomTypeBadge}>
            <Text style={styles.roomTypeText}>{room.roomType}</Text>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.addressText}>{room.address}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Owner Information */}
          <Text style={styles.sectionTitle}>Thông tin chủ nhà</Text>
          <View style={styles.ownerCard}>
            {ownerLoading ? (
              <ActivityIndicator
                size="small"
                color="#0066cc"
                style={{ padding: 20 }}
              />
            ) : (
              <>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerAvatarText}>
                      {owner?.fullName
                        ? owner.fullName.charAt(0).toUpperCase()
                        : "?"}
                    </Text>
                  </View>
                  <View style={styles.ownerDetails}>
                    <Text style={styles.ownerName}>
                      {owner?.fullName || "Chủ nhà"}
                    </Text>
                  </View>
                </View>
                <View style={styles.ownerContactButtons}>
                  <TouchableOpacity
                    style={styles.ownerContactButton}
                    onPress={() => handleCallOwner(owner?.phone)}
                  >
                    <Ionicons name="call-outline" size={20} color="#0066cc" />
                    <Text style={styles.ownerContactButtonText}>Gọi điện</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ownerContactButton}
                    onPress={() => handleEmailOwner(owner?.email)}
                  >
                    <Ionicons name="mail-outline" size={20} color="#0066cc" />
                    <Text style={styles.ownerContactButtonText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ownerContactButton}
                    onPress={() => {
                      /* Navigate to owner profile or chat */
                      navigation.navigate("OwnerProfile", {
                        ownerId: owner?._id,
                      });
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#0066cc"
                    />
                    <Text style={styles.ownerContactButtonText}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá phòng</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(room.price)}
              <Text style={styles.priceUnit}>/tháng</Text>
            </Text>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Trạng thái</Text>
            <View style={styles.statusValueContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: room.isActive ? "#4CAF50" : "#F44336" },
                ]}
              />
              <Text style={styles.statusValue}>
                {room.isActive ? "Còn phòng" : "Hết phòng"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Room Features */}
          <Text style={styles.sectionTitle}>Tiện ích phòng</Text>
          <View style={styles.featuresContainer}>
            <View
              style={[
                styles.featureItem,
                !room.utilities?.wifi && styles.disabledFeature,
              ]}
            >
              <Ionicons
                name="wifi-outline"
                size={24}
                color={room.utilities?.wifi ? "#0066cc" : "#ccc"}
              />
              <Text
                style={[
                  styles.featureText,
                  !room.utilities?.wifi && styles.disabledFeatureText,
                ]}
              >
                Wi-Fi
              </Text>
            </View>
            <View
              style={[
                styles.featureItem,
                !room.utilities?.parking && styles.disabledFeature,
              ]}
            >
              <Ionicons
                name="car-outline"
                size={24}
                color={room.utilities?.parking ? "#0066cc" : "#ccc"}
              />
              <Text
                style={[
                  styles.featureText,
                  !room.utilities?.parking && styles.disabledFeatureText,
                ]}
              >
                Chỗ đậu xe
              </Text>
            </View>
            <View
              style={[
                styles.featureItem,
                !room.utilities?.airConditioner && styles.disabledFeature,
              ]}
            >
              <Ionicons
                name="snow-outline"
                size={24}
                color={room.utilities?.airConditioner ? "#0066cc" : "#ccc"}
              />
              <Text
                style={[
                  styles.featureText,
                  !room.utilities?.airConditioner && styles.disabledFeatureText,
                ]}
              >
                Điều hòa
              </Text>
            </View>
            <View
              style={[
                styles.featureItem,
                !room.utilities?.washingMachine && styles.disabledFeature,
              ]}
            >
              <Ionicons
                name="water-outline"
                size={24}
                color={room.utilities?.washingMachine ? "#0066cc" : "#ccc"}
              />
              <Text
                style={[
                  styles.featureText,
                  !room.utilities?.washingMachine && styles.disabledFeatureText,
                ]}
              >
                Máy giặt
              </Text>
            </View>
            <View
              style={[
                styles.featureItem,
                !room.utilities?.kitchen && styles.disabledFeature,
              ]}
            >
              <Ionicons
                name="restaurant-outline"
                size={24}
                color={room.utilities?.kitchen ? "#0066cc" : "#ccc"}
              />
              <Text
                style={[
                  styles.featureText,
                  !room.utilities?.kitchen && styles.disabledFeatureText,
                ]}
              >
                Bếp
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>
            {room.description ||
              "Phòng trọ thoáng mát, sạch sẽ, an ninh tốt. Gần trung tâm, thuận tiện đi lại. Có đầy đủ tiện nghi cơ bản như điều hòa, nóng lạnh, tủ quần áo, bàn ghế."}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsSectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá & Bình luận</Text>
              <TouchableOpacity
                style={styles.addCommentButton}
                onPress={async () => {
                  const token = await AsyncStorage.getItem("token");
                  if (token) {
                    setShowCommentForm(true);
                  } else {
                    Alert.alert("Thông báo", "Bạn cần đăng nhập để đánh giá", [
                      {
                        text: "Hủy",
                        style: "cancel",
                      },
                      {
                        text: "Đăng nhập",
                        onPress: () => navigation.navigate("Login"),
                      },
                    ]);
                  }
                }}
              >
                <Text style={styles.addCommentButtonText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {commentsLoading ? (
              <ActivityIndicator
                size="small"
                color="#0066cc"
                style={{ marginVertical: 20 }}
              />
            ) : comments.length > 0 ? (
              <View>
                {comments.map((comment) => (
                  <View key={comment._id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentUser}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>
                            {comment.userName
                              ? comment.userName.charAt(0)
                              : "U"}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.commentUserName}>
                            {comment.userName || "Người dùng"}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.commentRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={
                              star <= comment.rating ? "star" : "star-outline"
                            }
                            size={14}
                            color={star <= comment.rating ? "#FFD700" : "#ccc"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>

                    {/* Comment actions (edit/delete) if current user is the author */}
                    {currentUser && currentUser._id === comment.userId && (
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleEditComment(comment)}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={16}
                            color="#0066cc"
                          />
                          <Text style={styles.commentActionText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleDeleteComment(comment._id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#ff3b30"
                          />
                          <Text
                            style={[
                              styles.commentActionText,
                              { color: "#ff3b30" },
                            ]}
                          >
                            Xóa
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
                {comments.length > 3 && (
                  <TouchableOpacity style={styles.viewAllCommentsButton}>
                    <Text style={styles.viewAllCommentsText}>
                      Xem tất cả đánh giá
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.noCommentsContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={40}
                  color="#ccc"
                />
                <Text style={styles.noCommentsText}>Chưa có đánh giá nào</Text>
                <Text style={styles.noCommentsSubText}>
                  Hãy là người đầu tiên đánh giá phòng này
                </Text>
              </View>
            )}
          </View>

          {/* Booking Button */}
          <TouchableOpacity
            style={[styles.bookButton, !room.isActive && styles.disabledButton]}
            disabled={!room.isActive}
            onPress={() => {
              if (room.isActive) {
                navigation.navigate("BookViewingScreen", {
                  roomId: room._id,
                  roomName: room.name,
                  ownerId: room.owner._id,
                });
              }
            }}
          >
            <Text style={styles.bookButtonText}>
              {room.isActive ? "Đặt lịch ngay" : "Hết phòng trống"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Comment Form Modal */}
      {renderCommentForm()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0066cc",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFavoriteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  imageCarousel: {
    height: 250,
    width: "100%",
  },
  carouselImage: {
    width,
    height: 250,
    resizeMode: "cover",
  },
  noImageContainer: {
    width,
    height: 250,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 10,
    color: "#999",
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#fff",
  },
  detailsContainer: {
    padding: 16,
  },
  nameRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomName: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  viewsText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  roomTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  roomTypeText: {
    color: "#0066cc",
    fontWeight: "500",
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  // Owner styles
  ownerCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  ownerAvatarImage: {
    width: 60,
    height: 60,
  },
  ownerAvatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  ownerJoinDate: {
    fontSize: 14,
    color: "#666",
  },
  ownerContactButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ownerContactButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  ownerContactButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#0066cc",
  },
  // End owner styles
  priceContainer: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0066cc",
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#666",
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  featureItem: {
    width: "20%",
    alignItems: "center",
    marginBottom: 16,
  },
  disabledFeature: {
    opacity: 0.5,
  },
  featureText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  disabledFeatureText: {
    color: "#ccc",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addCommentButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addCommentButtonText: {
    fontSize: 12,
    color: "#666",
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  commentUserName: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentRating: {
    flexDirection: "row",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    padding: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: "#0066cc",
    marginLeft: 4,
  },
  viewAllCommentsButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewAllCommentsText: {
    color: "#0066cc",
    fontSize: 14,
    fontWeight: "500",
  },
  noCommentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  noCommentsText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  noCommentsSubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  bookButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  // Comment form modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RoomDetailScreen;
