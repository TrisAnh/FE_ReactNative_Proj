import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./app/screens/Home";
import LoginScreen from "./app/screens/LoginScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import ForgotPasswordScreen from "./app/screens/ForgotPassWord";
import OTPVerificationScreen from "./app/screens/OTPVerify";
import NewPasswordScreen from "./app/screens/NewPassWord";
//import EditProfileScreen from "./app/screens/UpdateProfile";
import MainHome from "./app/screens/MainHome";
import OTPVerificationForgotScreen from "./app/screens/OTPVerifyForgot";
import CategoryRooms from "./app/screens/CategoryRooms";
import UpdateProfile from "./app/screens/UpdateProfile";
import BottomTabNavigator from "./app/screens/BottomTabNavigator";
import RoomDetailScreen from "./app/screens/RoomDetail";
import BookViewingScreen from "./app/screens/BookingViewing";
import ViewingsListScreen from "./app/screens/viewings-list-screen";
import ViewingDetailsScreen from "./app/screens/viewing-details-screen";
import CreateRoomScreen from "./app/screens/CreateRoom";
import { AuthProvider } from "./app/context/authContext";
const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="forgotPassWord"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="newPassWord" component={NewPasswordScreen} />
          <Stack.Screen name="otpVerify" component={OTPVerificationScreen} />
          <Stack.Screen
            name="otpVerifyForgot"
            component={OTPVerificationForgotScreen}
          />
          <Stack.Screen name="mainHome" component={MainHome} />
          <Stack.Screen name="profile" component={UpdateProfile} />
          <Stack.Screen name="CategoryRooms" component={CategoryRooms} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
          <Stack.Screen
            name="BookViewingScreen"
            component={BookViewingScreen}
          />
          <Stack.Screen
            name="ViewingsListScreen"
            component={ViewingsListScreen}
          />
          <Stack.Screen
            name="ViewingDetails"
            component={ViewingDetailsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
//<Stack.Screen name="profile" component={EditProfileScreen} />
