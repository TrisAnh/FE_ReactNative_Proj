import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./app/screens/Home";
import LoginScreen from "./app/screens/LoginScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import ForgotPasswordScreen from "./app/screens/ForgotPassWord";
import OTPVerificationScreen from "./app/screens/OTPVerify";
import NewPasswordScreen from "./app/screens/NewPassWord";
const Stack = createStackNavigator();

export default function App() {
  return (
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
        <Stack.Screen name="forgotPassWord" component={ForgotPasswordScreen} />
        <Stack.Screen name="newPassWord" component={NewPasswordScreen} />
        <Stack.Screen name="otpVerify" component={OTPVerificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
