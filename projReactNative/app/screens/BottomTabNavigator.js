import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UpdateProfile from "../screens/UpdateProfile.js";
import FavoriteScreen from "../screens/FavoriteScreen.js";
import MainHome from "./MainHome.js";
import ViewingsListScreen from "./viewings-list-screen.js";
import Icon from "react-native-vector-icons/FontAwesome";

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
        name="Quản lý đặt lịch"
        component={ViewingsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Hồ sơ"
        component={UpdateProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
