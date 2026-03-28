/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("authUser");
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(
      localStorage.getItem("authToken") && localStorage.getItem("authUser"),
    ),
  );
  const [loading] = useState(false);

  // Login function
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  // Update user function (for profile updates)
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
