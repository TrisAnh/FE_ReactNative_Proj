// navigation/BottomTabNavigator.js
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import MainHome from "../screens/MainHome";
import Favorites from "../screens/Favorites";
import Profile from "../screens/Profile";
import Messages from "../screens/Messages";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Trang chủ":
              iconName = "home";
              break;
            case "Yêu thích":
              iconName = "heart";
              break;
            case "Tin nhắn":
              iconName = "comments";
              break;
            case "Cá nhân":
              iconName = "user";
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Trang chủ" component={MainHome} />
      <Tab.Screen name="Yêu thích" component={Favorites} />
      <Tab.Screen name="Tin nhắn" component={Messages} />
      <Tab.Screen name="Cá nhân" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
