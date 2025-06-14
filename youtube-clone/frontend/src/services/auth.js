// auth.js - Authentication service functions
// Handles login, register, logout, and user management

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Login user
export const loginUser = async (email, password) => {
  try {
    console.log("Logging in user:", email)
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await handleResponse(response)
    console.log("Login successful:", data)
    return data.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Register user
export const registerUser = async (userData) => {
  try {
    console.log("Registering user:", userData.email)
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await handleResponse(response)
    console.log("Registration successful:", data)
    return data.data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("authToken")

    if (!token) return

    console.log("Logging out user")
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No auth token found")
    }

    console.log("Fetching current user")
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await handleResponse(response)
    console.log("Current user fetched:", data)
    return data.data.user
  } catch (error) {
    console.error("Get current user error:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No auth token found")
    }

    // Handle file uploads with FormData
    const formData = new FormData()

    // Add profile data
    if (userData.firstName) formData.append("firstName", userData.firstName)
    if (userData.lastName) formData.append("lastName", userData.lastName)
    if (userData.username) formData.append("username", userData.username)
    if (userData.description) formData.append("description", userData.description)
    if (userData.channelName) formData.append("channelName", userData.channelName)

    // Add profile picture if provided
    if (userData.profilePicture && userData.profilePicture instanceof File) {
      formData.append("profilePicture", userData.profilePicture)
    }

    // Add banner image if provided
    if (userData.bannerImage && userData.bannerImage instanceof File) {
      formData.append("bannerImage", userData.bannerImage)
    }

    console.log("Updating user profile")
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await handleResponse(response)
    console.log("Profile updated:", data)
    return data.data
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}
