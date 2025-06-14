"use client"

// Channel.jsx - Channel page component
// Displays channel information and videos

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "./Channel.css"
import VideoCard from "../components/videos/VideoCard"
import { fetchChannelById, fetchVideos, subscribeToChannel } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { formatDistanceToNow } from "date-fns"

function Channel() {
  const { channelId } = useParams()
  const { currentUser } = useAuth()

  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("videos")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)

  // Load channel data on component mount
  useEffect(() => {
    if (channelId) {
      loadChannelData()
    }
  }, [channelId])

  const loadChannelData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch channel details
      const channelData = await fetchChannelById(channelId)
      setChannel(channelData)
      setSubscriberCount(channelData.subscribers || 0)

      // Fetch channel videos
      const videosData = await fetchVideos({ channelId, limit: 20 })
      setVideos(videosData)

      // Check subscription status if user is logged in
      if (currentUser) {
        // This would be an API call to check subscription status
        // setIsSubscribed(channelData.userSubscribed);
      }
    } catch (error) {
      console.error("Error loading channel:", error)
      setError("Failed to load channel. Please try again.")
      toast.error("Failed to load channel")
    } finally {
      setLoading(false)
    }
  }

  // Handle subscribe/unsubscribe
  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error("Please sign in to subscribe")
      return
    }

    try {
      await subscribeToChannel(channelId, !isSubscribed)

      if (isSubscribed) {
        setSubscriberCount(subscriberCount - 1)
        setIsSubscribed(false)
        toast.success("Unsubscribed")
      } else {
        setSubscriberCount(subscriberCount + 1)
        setIsSubscribed(true)
        toast.success("Subscribed!")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error("Failed to subscribe")
    }
  }

  // Format subscriber count
  const formatSubscriberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <div className="channel">
        <div className="channel__loading">
          <div className="channel__loading-spinner"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="channel">
        <div className="channel__error">
          <p>{error || "Channel not found"}</p>
          <button onClick={loadChannelData} className="channel__retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="channel">
      {/* Channel banner */}
      {channel.bannerImage && (
        <div className="channel__banner">
          <img
            src={channel.bannerImage || "/placeholder.svg"}
            alt={`${channel.name} banner`}
            className="channel__banner-image"
          />
        </div>
      )}

      {/* Channel header */}
      <div className="channel__header">
        <div className="channel__info">
          <img src={channel.profilePicture || "/default-avatar.png"} alt={channel.name} className="channel__avatar" />

          <div className="channel__details">
            <h1 className="channel__name">
              {channel.name}
              {channel.verified && <span className="channel__verified-badge">✓</span>}
            </h1>

            <div className="channel__stats">
              <span className="channel__subscribers">{formatSubscriberCount(subscriberCount)} subscribers</span>
              <span className="channel__separator">•</span>
              <span className="channel__video-count">{videos.length} videos</span>
              {channel.createdAt && (
                <>
                  <span className="channel__separator">•</span>
                  <span className="channel__joined">
                    Joined {formatDistanceToNow(new Date(channel.createdAt), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>

            {channel.description && <p className="channel__description">{channel.description}</p>}
          </div>
        </div>

        <div className="channel__actions">
          <button
            className={`channel__subscribe-btn ${isSubscribed ? "channel__subscribe-btn--subscribed" : ""}`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Channel navigation */}
      <div className="channel__nav">
        <button
          className={`channel__nav-item ${activeTab === "videos" ? "channel__nav-item--active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`channel__nav-item ${activeTab === "playlists" ? "channel__nav-item--active" : ""}`}
          onClick={() => setActiveTab("playlists")}
        >
          Playlists
        </button>
        <button
          className={`channel__nav-item ${activeTab === "about" ? "channel__nav-item--active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
      </div>

      {/* Channel content */}
      <div className="channel__content">
        {activeTab === "videos" && (
          <div className="channel__videos">
            {videos.length > 0 ? (
              <div className="channel__videos-grid">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} channelData={channel} layout="grid" />
                ))}
              </div>
            ) : (
              <div className="channel__no-content">
                <div className="channel__no-content-icon">📹</div>
                <h3 className="channel__no-content-title">No videos yet</h3>
                <p className="channel__no-content-text">This channel hasn't uploaded any videos.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="channel__playlists">
            <div className="channel__no-content">
              <div className="channel__no-content-icon">📋</div>
              <h3 className="channel__no-content-title">No playlists yet</h3>
              <p className="channel__no-content-text">This channel hasn't created any playlists.</p>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="channel__about">
            <div className="channel__about-section">
              <h3 className="channel__about-title">Description</h3>
              <p className="channel__about-text">{channel.description || "No description available."}</p>
            </div>

            <div className="channel__about-section">
              <h3 className="channel__about-title">Stats</h3>
              <div className="channel__about-stats">
                <div className="channel__about-stat">
                  <span className="channel__about-stat-label">Joined</span>
                  <span className="channel__about-stat-value">
                    {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                <div className="channel__about-stat">
                  <span className="channel__about-stat-label">Total views</span>
                  <span className="channel__about-stat-value">
                    {channel.totalViews ? formatSubscriberCount(channel.totalViews) : "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Channel
