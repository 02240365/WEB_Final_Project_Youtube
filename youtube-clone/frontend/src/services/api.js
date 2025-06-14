// api.js - API service functions with better error handling
// Contains all API calls for videos, channels, comments, etc.

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api"
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || "http://localhost:5001/uploads"

console.log("API Base URL:", API_BASE_URL) // Debug log
console.log("Upload URL:", UPLOAD_URL) // Debug log

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return data.data || data // Handle both {data: []} and direct array responses
}

// Video API functions
export const fetchVideos = async (params = {}) => {
  try {
    console.log("Fetching videos with params:", params)

    const queryParams = new URLSearchParams()

    // Add query parameters
    if (params.category) queryParams.append("category", params.category)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.offset) queryParams.append("offset", params.offset)
    if (params.search) queryParams.append("search", params.search)
    if (params.channelId) queryParams.append("channelId", params.channelId)

    const url = `${API_BASE_URL}/videos?${queryParams}`
    console.log("Fetching from URL:", url)

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    console.log("Response status:", response.status)
    const data = await handleResponse(response)

    // Process video URLs to ensure they have the correct base URL
    if (Array.isArray(data)) {
      data.forEach((video) => {
        if (video.videoUrl && !video.videoUrl.includes("http")) {
          video.videoUrl = `${UPLOAD_URL}/${video.videoUrl.replace(/^\//, "")}`
        }
        if (video.thumbnailUrl && !video.thumbnailUrl.includes("http")) {
          video.thumbnailUrl = `${UPLOAD_URL}/${video.thumbnailUrl.replace(/^\//, "")}`
        }
      })
    }

    console.log("Fetched videos:", data)
    return data
  } catch (error) {
    console.error("Error fetching videos:", error)
    throw error
  }
}

export const fetchVideoById = async (videoId) => {
  try {
    console.log("Fetching video by ID:", videoId)

    const url = `${API_BASE_URL}/videos/${videoId}`
    console.log("Fetching from URL:", url)

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    console.log("Response status:", response.status)
    const data = await handleResponse(response)
    console.log("Fetched video:", data)
    return data
  } catch (error) {
    console.error("Error fetching video:", error)
    throw error
  }
}

export const fetchRelatedVideos = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/related`, {
      headers: getAuthHeaders(),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching related videos:", error)
    throw error
  }
}

// Upload video with thumbnail
export const uploadVideo = async (videoData) => {
  try {
    console.log("Uploading video:", videoData.title)

    const formData = new FormData()

    // Append video file
    formData.append("video", videoData.videoFile)

    // Append thumbnail if provided
    if (videoData.thumbnail) {
      formData.append("thumbnail", videoData.thumbnail)
    }

    // Append other data
    formData.append("title", videoData.title)
    formData.append("description", videoData.description)
    formData.append("category", videoData.category)
    formData.append("tags", JSON.stringify(videoData.tags || []))
    formData.append("isPublic", videoData.isPublic !== false)

    const token = localStorage.getItem("authToken")
    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    const data = await handleResponse(response)
    console.log("Video uploaded successfully:", data)
    return data
  } catch (error) {
    console.error("Error uploading video:", error)
    throw error
  }
}

// Like or dislike a video
export const likeVideo = async (videoId, isLike) => {
  try {
    console.log(`${isLike ? "Liking" : "Disliking"} video:`, videoId)

    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isLike }),
    })

    const data = await handleResponse(response)
    console.log("Like action successful:", data)
    return data
  } catch (error) {
    console.error("Error liking video:", error)
    throw error
  }
}

// Channel API functions
export const fetchChannels = async (channelIds) => {
  try {
    console.log("Fetching channels for IDs:", channelIds)

    const queryParams = new URLSearchParams()
    channelIds.forEach((id) => queryParams.append("ids", id))

    const url = `${API_BASE_URL}/channels?${queryParams}`
    console.log("Fetching from URL:", url)

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    console.log("Response status:", response.status)
    const data = await handleResponse(response)
    console.log("Fetched channels:", data)
    return data
  } catch (error) {
    console.error("Error fetching channels:", error)
    throw error
  }
}

export const fetchChannelById = async (channelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/channels/${channelId}`, {
      headers: getAuthHeaders(),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching channel:", error)
    throw error
  }
}

// Subscribe to a channel
export const subscribeToChannel = async (channelId, subscribe = true) => {
  try {
    console.log(`${subscribe ? "Subscribing to" : "Unsubscribing from"} channel:`, channelId)

    const response = await fetch(`${API_BASE_URL}/channels/${channelId}/subscribe`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ subscribe }),
    })

    const data = await handleResponse(response)
    console.log("Subscription action successful:", data)
    return data
  } catch (error) {
    console.error("Error with subscription:", error)
    throw error
  }
}

// Comment API functions
export const fetchVideoComments = async (videoId) => {
  try {
    console.log("Fetching comments for video:", videoId)

    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/comments`, {
      headers: getAuthHeaders(),
    })

    const data = await handleResponse(response)
    console.log("Fetched comments:", data)
    return data
  } catch (error) {
    console.error("Error fetching comments:", error)
    throw error
  }
}

export const addComment = async (videoId, text) => {
  try {
    console.log("Adding comment to video:", videoId)

    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    })

    const data = await handleResponse(response)
    console.log("Comment added successfully:", data)
    return data
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Watch history
export const addToWatchHistory = async (videoId, watchTime = 0) => {
  try {
    console.log("Adding to watch history:", videoId)

    const response = await fetch(`${API_BASE_URL}/users/me/watch-history`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ videoId, watchTime }),
    })

    const data = await handleResponse(response)
    console.log("Added to watch history:", data)
    return data
  } catch (error) {
    console.error("Error adding to watch history:", error)
    // Don't throw error for watch history to prevent disrupting user experience
    return null
  }
}

// Search API functions
export const searchVideos = async (query, filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("q", query)

    // Add filter parameters
    if (filters.category) queryParams.append("category", filters.category)
    if (filters.duration) queryParams.append("duration", filters.duration)
    if (filters.uploadDate) queryParams.append("uploadDate", filters.uploadDate)
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy)

    const response = await fetch(`${API_BASE_URL}/search?${queryParams}`, {
      headers: getAuthHeaders(),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Error searching videos:", error)
    throw error
  }
}

// User API functions
export const fetchUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

export const updateUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`)
    return response.ok
  } catch (error) {
    console.error("API health check failed:", error)
    return false
  }
}
