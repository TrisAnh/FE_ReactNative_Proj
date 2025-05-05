// PostManagerTab.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OwnerRoomsList from "./PostManagement"; // danh sách bài đăng
import CreateRoomScreen from "./CreateRoom"; // màn hình đăng bài mới
import EditRoomScreen from "./EditRoomScreen";
const Stack = createStackNavigator();

export default function PostManagerTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerRoomsList" component={OwnerRoomsList} />
      <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
      <Stack.Screen name="EditRoom" component={EditRoomScreen} />
    </Stack.Navigator>
  );
}
