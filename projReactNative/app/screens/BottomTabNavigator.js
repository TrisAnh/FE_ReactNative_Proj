import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UpdateProfile from "../screens/UpdateProfile.js";
import FavoriteScreen from "../screens/FavoriteScreen.js";
import MainHome from "./MainHome.js";
import ViewingsListScreen from "./viewings-list-screen.js";
import Icon from "react-native-vector-icons/FontAwesome";
import PostManagerTab from "./PostManagerTab"; // import mới

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Trang chủ"
        component={MainHome}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quản lý bài đăng"
        component={PostManagerTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="pencil" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quản lý đặt lịch"
        component={ViewingsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Yêu thích"
        component={FavoriteScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
