"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { loginUser, registerUser, logoutUser, getCurrentUser } from "../services/auth"
import { toast } from "react-toastify"

// Create the authentication context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (token) {
        const user = await getCurrentUser()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      localStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      localStorage.setItem("authToken", response.token)
      setCurrentUser(response.user)
      toast.success("Logged in successfully!")
      return response
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message || "Failed to log in")
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await registerUser(userData)
      localStorage.setItem("authToken", response.token)
      setCurrentUser(response.user)
      toast.success("Account created successfully!")
      return response
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.message || "Failed to create account")
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("authToken")
      setCurrentUser(null)
      toast.success("Logged out successfully")
    }
  }

  // Update user profile
  const updateProfile = (updatedUser) => {
    setCurrentUser(updatedUser)
  }

  // Context value
  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
