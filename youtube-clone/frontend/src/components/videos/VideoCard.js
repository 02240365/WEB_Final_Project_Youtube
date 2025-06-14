import { Link } from "react-router-dom"
import "./VideoCard.css"
import { formatDistanceToNow } from "date-fns"

function VideoCard({ video, channelData, layout = "grid" }) {
  // Format the view count (e.g., 1.2M, 4.5K)
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  // Format the upload date (e.g., 2 days ago, 3 weeks ago)
  const formatUploadDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <div className={`video-card video-card--${layout}`}>
      <Link to={`/video/${video.id}`} className="video-card__thumbnail-container">
        <img
          src={video.thumbnailUrl || "/placeholder.svg?height=180&width=320"}
          alt={video.title}
          className="video-card__thumbnail"
        />
        <span className="video-card__duration">{video.duration || "10:30"}</span>
      </Link>

      <div className="video-card__info">
        {layout === "grid" && (
          <Link to={`/channel/${channelData.id}`} className="video-card__channel-img-container">
            <img
              src={channelData.profilePicture || "/placeholder.svg?height=36&width=36"}
              alt={channelData.name}
              className="video-card__channel-img"
            />
          </Link>
        )}

        <div className="video-card__text">
          <Link to={`/video/${video.id}`} className="video-card__title">
            {video.title}
          </Link>

          <Link to={`/channel/${channelData.id}`} className="video-card__channel-name">
            {channelData.name}
            {channelData.verified && <span className="video-card__verified-badge">✓</span>}
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
