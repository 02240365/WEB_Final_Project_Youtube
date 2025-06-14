"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "./VideoPage.css"
import VideoPlayer from "../components/videos/VideoPlayer"
import CommentSection from "../components/comments/CommentSection"
import VideoCard from "../components/videos/VideoCard"
import {
  fetchVideoById,
  fetchRelatedVideos,
  likeVideo,
  subscribeToChannel,
  fetchVideoComments,
  addComment,
} from "../services/api"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"

function VideoPage() {
  const { id } = useParams()
  const { user, currentUser } = useAuth()
  const authUser = user || currentUser

  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Load video data
  useEffect(() => {
    if (id) {
      loadVideoData()
      loadComments()
    }
  }, [id])

  const loadVideoData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Loading video with ID:", id)

      // Fetch main video
      const videoData = await fetchVideoById(id)
      console.log("Video data received:", videoData)
      setVideo(videoData)

      // Fetch related videos
      try {
        const relatedData = await fetchRelatedVideos(id)
        setRelatedVideos(relatedData || [])
      } catch (relatedError) {
        console.error("Error loading related videos:", relatedError)
        setRelatedVideos([])
      }
    } catch (error) {
      console.error("Error loading video:", error)
      setError("Failed to load video. Please try again.")
      toast.error("Failed to load video")
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const commentsData = await fetchVideoComments(id)
      setComments(commentsData || [])
    } catch (error) {
      console.error("Error loading comments:", error)
      setComments([])
    }
  }

  const handleAddComment = async (commentText) => {
    try {
      const newComment = await addComment(id, commentText)
      setComments((prev) => [newComment, ...prev])
      toast.success("Comment added!")
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  }

  // Handle like/dislike
  const handleLike = async (isLike) => {
    if (!authUser) {
      toast.error("Please log in to like videos")
      return
    }

    try {
      await likeVideo(id, isLike)
      if (isLike) {
        setIsLiked(!isLiked)
        setIsDisliked(false)
      } else {
        setIsDisliked(!isDisliked)
        setIsLiked(false)
      }
      toast.success(isLike ? "Video liked!" : "Video disliked!")
    } catch (error) {
      console.error("Error liking video:", error)
      toast.error("Failed to like video")
    }
  }

  // Handle subscribe
  const handleSubscribe = async () => {
    if (!authUser) {
      toast.error("Please log in to subscribe")
      return
    }

    if (!video?.channel?.id) {
      toast.error("Channel information not available")
      return
    }

    try {
      await subscribeToChannel(video.channel.id, !isSubscribed)
      setIsSubscribed(!isSubscribed)
      toast.success(isSubscribed ? "Unsubscribed!" : "Subscribed!")
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error("Failed to subscribe")
    }
  }

  // Format numbers (views, likes, etc.)
  const formatNumber = (num) => {
    if (!num) return "0"
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="video-page">
        <div className="video-page__loading">
          <div className="video-page__loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="video-page">
        <div className="video-page__error">
          <h2>Video not found</h2>
          <p>{error || "The video you're looking for doesn't exist."}</p>
          <button onClick={() => window.history.back()} className="video-page__back-btn">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="video-page">
      <div className="video-page__content">
        {/* Main video section */}
        <div className="video-page__main">
          {/* Video player */}
          <div className="video-page__player">
            <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnailUrl} title={video.title} />
          </div>

          {/* Video info */}
          <div className="video-page__info">
            <h1 className="video-page__title">{video.title}</h1>

            <div className="video-page__meta">
              <div className="video-page__stats">
                <span className="video-page__views">{formatNumber(video.views)} views</span>
                <span className="video-page__date">• {formatDate(video.createdAt)}</span>
              </div>

              <div className="video-page__actions">
                <button
                  className={`video-page__action-btn ${isLiked ? "video-page__action-btn--active" : ""}`}
                  onClick={() => handleLike(true)}
                >
                  <span className="video-page__action-icon">👍</span>
                  <span>{formatNumber(video.likes)}</span>
                </button>

                <button
                  className={`video-page__action-btn ${isDisliked ? "video-page__action-btn--active" : ""}`}
                  onClick={() => handleLike(false)}
                >
                  <span className="video-page__action-icon">👎</span>
                  <span>{formatNumber(video.dislikes)}</span>
                </button>

                <button className="video-page__action-btn">
                  <span className="video-page__action-icon">↗</span>
                  <span>Share</span>
                </button>

                <button className="video-page__action-btn">
                  <span className="video-page__action-icon">⋯</span>
                </button>
              </div>
            </div>
          </div>

          {/* Channel info */}
          {video.channel && (
            <div className="video-page__channel">
              <div className="video-page__channel-info">
                <img
                  src={video.channel.profilePicture || "/placeholder.svg"}
                  alt={video.channel.name}
                  className="video-page__channel-avatar"
                />
                <div className="video-page__channel-details">
                  <h3 className="video-page__channel-name">
                    {video.channel.name}
                    {video.channel.verified && <span className="video-page__verified">✓</span>}
                  </h3>
                  <p className="video-page__channel-subscribers">
                    {formatNumber(video.channel.subscribers)} subscribers
                  </p>
                </div>
              </div>

              <button
                className={`video-page__subscribe-btn ${isSubscribed ? "video-page__subscribe-btn--subscribed" : ""}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
          )}

          {/* Video description */}
          <div className="video-page__description">
            <div className="video-page__description-content">
              <p>{video.description || "No description available."}</p>
            </div>
          </div>

          {/* Comments section */}
          <div className="video-page__comments">
            <CommentSection videoId={id} comments={comments} onAddComment={handleAddComment} />
          </div>
        </div>

        {/* Sidebar with related videos */}
        <div className="video-page__sidebar">
          <h3 className="video-page__sidebar-title">Related Videos</h3>
          <div className="video-page__related-videos">
            {relatedVideos.length > 0 ? (
              relatedVideos.map((relatedVideo) => (
                <VideoCard
                  key={relatedVideo.id}
                  video={relatedVideo}
                  channelData={relatedVideo.channel}
                  layout="list"
                />
              ))
            ) : (
              <p className="video-page__no-related">No related videos found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPage
