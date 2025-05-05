"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/authService"; // Assuming this API exists

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          const userData = await AsyncStorage.getItem("user");

          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            console.warn(
              "(NOBRIDGE) ⚠️ Có token nhưng không tìm thấy thông tin người dùng. Đang tải lại từ server..."
            );

            // Gọi API để lấy user
            const profile = await getProfile();
            if (profile) {
              setUser(profile);
              await AsyncStorage.setItem("user", JSON.stringify(profile));
            } else {
              console.warn(
                "(NOBRIDGE) ❌ Token không hợp lệ hoặc không thể lấy được profile."
              );
            }
          }

          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Function to refresh user data from API
  const refreshUserData = async (userId) => {
    try {
      const userData = await getProfile(); // Or use getUserById(userId) if that's your API
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Login function
  const login = async (userData, token) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
