"use client"

import { useState, useEffect } from "react"
import "./Home.css"
import VideoCard from "../components/videos/VideoCard"
import { fetchVideos, fetchChannels } from "../services/api"
import { toast } from "react-toastify"

// Category filter options
const categories = [
  "All",
  "Music",
  "Gaming",
  "News",
  "Sports",
  "Entertainment",
  "Education",
  "Science & Technology",
  "Comedy",
  "Movies",
  "Anime",
  "Cooking",
  "Travel",
  "Fashion",
  "Fitness",
]

function Home() {
  const [videos, setVideos] = useState([])
  const [channels, setChannels] = useState({})
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch videos and channel data on component mount
  useEffect(() => {
    loadVideos()
  }, [selectedCategory])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch videos based on selected category
      const videosData = await fetchVideos({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        limit: 20,
      })

      setVideos(videosData)

      // Fetch channel data for all videos
      const channelIds = [...new Set(videosData.map((video) => video.channelId))]
      const channelsData = await fetchChannels(channelIds)

      // Convert array to object for easier lookup
      const channelsMap = {}
      channelsData.forEach((channel) => {
        channelsMap[channel.id] = channel
      })

      setChannels(channelsMap)
    } catch (error) {
      console.error("Error loading videos:", error)
      setError("Failed to load videos. Please try again.")
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  if (loading) {
    return (
      <div className="home">
        <div className="home__loading">
          <div className="home__loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home">
        <div className="home__error">
          <p>{error}</p>
          <button onClick={loadVideos} className="home__retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Category filter */}
      <div className="home__categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`home__category-btn ${selectedCategory === category ? "home__category-btn--active" : ""}`}
            onClick={() => handleCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Videos grid */}
      <div className="home__videos">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video.id} video={video} channelData={channels[video.channelId] || {}} layout="grid" />
          ))
        ) : (
          <div className="home__no-videos">
            <p>No videos found for this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
