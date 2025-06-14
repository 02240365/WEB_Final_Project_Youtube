"use client"

import { useState, useRef, useEffect } from "react"
import "./VideoPlayer.css"

const VideoPlayer = ({ videoUrl, thumbnailUrl, title }) => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  // Construct video URL - use the provided URL directly
  const getVideoSrc = () => {
    if (!videoUrl) {
      console.log("No video URL provided")
      return null
    }

    console.log("Using video URL:", videoUrl)
    return videoUrl
  }

  const videoSrc = getVideoSrc()

  useEffect(() => {
    console.log("VideoPlayer - Using video source:", videoSrc)
    setIsLoading(false) // Don't pre-check, let video element handle it
  }, [videoSrc])

  const handleVideoError = (e) => {
    console.error("Video playback error:", e)
    const video = e.target
    if (video.error) {
      console.error("Video error details:", {
        code: video.error.code,
        message: video.error.message,
        src: video.src,
      })
    }
    setError("Cannot play this video")
    setIsLoading(false)
  }

  const handleVideoLoad = () => {
    console.log("Video loaded successfully")
    setIsLoading(false)
    setError(null)
  }

  const handleVideoLoadStart = () => {
    console.log("Video load started")
    setIsLoading(true)
  }

  const handleVideoCanPlay = () => {
    console.log("Video can play")
    setIsLoading(false)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  if (error) {
    return (
      <div className="video-player-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Video Unavailable</h3>
          <p>{error}</p>
          <div className="debug-info">
            <p>
              <strong>Video URL:</strong> {videoSrc}
            </p>
          </div>
          <button
            className="retry-button"
            onClick={() => {
              setError(null)
              setIsLoading(true)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="video-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      <video
        ref={videoRef}
        className="video-player"
        src={videoSrc}
        poster={thumbnailUrl}
        controls
        preload="metadata"
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        onLoadStart={handleVideoLoadStart}
        onCanPlay={handleVideoCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        style={{ width: "100%", height: "auto" }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoPlayer
