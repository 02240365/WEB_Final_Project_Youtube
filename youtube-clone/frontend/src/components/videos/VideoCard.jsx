import { Link } from "react-router-dom"
import "./VideoCard.css"
import { formatDistanceToNow } from "date-fns"
import PlaceholderImage from "../common/PlaceholderImage"

function VideoCard({ video, channelData, layout = "grid" }) {
  // Handle missing data
  if (!video) return null

  // Use video.channel if channelData is not provided
  const channel = channelData ||
    video.channel || {
      id: "unknown",
      name: "Unknown Channel",
    }

  // Format the view count (e.g., 1.2M, 4.5K)
  const formatViewCount = (count) => {
    if (!count && count !== 0) return "0"
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  // Format the upload date (e.g., 2 days ago, 3 weeks ago)
  const formatUploadDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "Unknown"
    }
  }

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    if (typeof seconds === "string" && seconds.includes(":")) return seconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get profile picture URL with proper fallback
  const getProfileUrl = () => {
    if (!channel?.profilePicture) {
      return null // Will use placeholder component
    }

    if (channel.profilePicture.startsWith("http")) {
      return channel.profilePicture
    }

    const baseUrl = "http://localhost:5001"
    if (channel.profilePicture.startsWith("/")) {
      return `${baseUrl}${channel.profilePicture}`
    }

    return `${baseUrl}/uploads/profiles/${channel.profilePicture}`
  }

  // Generate colors based on content
  const getProfileColor = () => {
    const colors = ["6c5ce7", "fd79a8", "fdcb6e", "e17055", "74b9ff", "00b894", "e84393", "a29bfe"]
    const index = channel?.name ? channel.name.length % colors.length : 0
    return colors[index]
  }

  const profileUrl = getProfileUrl()

  // Get compact dimensions based on layout
  const getThumbnailDimensions = () => {
    switch (layout) {
      case "shorts":
        return { width: 120, height: 214 }
      default:
        return { width: 240, height: 135 } // Much smaller like YouTube
    }
  }

  const thumbnailDims = getThumbnailDimensions()

  return (
    <div className={`video-card video-card--${layout}`}>
      <Link to={`/video/${video.id}`} className="video-card__thumbnail-container">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            className="video-card__thumbnail"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "block"
            }}
          />
        ) : (
          <PlaceholderImage
            width={thumbnailDims.width}
            height={thumbnailDims.height}
            text={video.title ? video.title.substring(0, 2).toUpperCase() : "VD"}
            className="video-card__thumbnail"
          />
        )}
        {video.duration && (
          <span className="video-card__duration">
            {typeof video.duration === "number" ? formatDuration(video.duration) : video.duration}
          </span>
        )}
      </Link>

      <div className="video-card__info">
        {layout !== "shorts" && (
          <Link to={`/channel/${channel.id}`} className="video-card__channel-img-container">
            {profileUrl ? (
              <img
                src={profileUrl || "/placeholder.svg"}
                alt={channel.name}
                className="video-card__channel-img"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
                }}
              />
            ) : null}
            <div className="video-card__profile-placeholder" style={{ display: profileUrl ? "none" : "block" }}>
              <PlaceholderImage
                width={24}
                height={24}
                text={channel.name ? channel.name.substring(0, 2).toUpperCase() : "CH"}
                color={getProfileColor()}
                className="video-card__channel-img"
              />
            </div>
          </Link>
        )}

        <div className="video-card__text">
          <Link to={`/video/${video.id}`} className="video-card__title">
            {video.title}
          </Link>

          <Link to={`/channel/${channel.id}`} className="video-card__channel-name">
            {channel.name || channel.channelName || channel.username || "Unknown Channel"}
            {channel.verified && <span className="video-card__verified-badge">✓</span>}
          </Link>

          <div className="video-card__metadata">
            <span className="video-card__views">{formatViewCount(video.views)} views</span>
            <span className="video-card__separator">•</span>
            <span className="video-card__upload-date">{formatUploadDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
