"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Update the AuthContext to use 'user' instead of 'currentUser' for consistency
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      // Verify token and get user data
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001/api"}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.data)
      } else {
        localStorage.removeItem("authToken")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001/api"}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("authToken", data.token)
      setUser(data.user)
      return data
    } else {
      throw new Error(data.message || "Login failed")
    }
  }

  const register = async (userData) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001/api"}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("authToken", data.token)
      setUser(data.user)
      return data
    } else {
      throw new Error(data.message || "Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
  }

  const value = {
    user,
    currentUser: user, // Provide both for compatibility
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
