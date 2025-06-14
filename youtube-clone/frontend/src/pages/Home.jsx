"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import VideoCard from "../components/videos/VideoCard"
import { useInfiniteVideos } from "../src/hooks/useInfiniteVideos"
import "./Home.css"

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteVideos(selectedCategory)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Enhanced categories with better variety
  const categories = [
    "all",
    "Technology",
    "Education",
    "Entertainment",
    "Music",
    "Gaming",
    "Sports",
    "News",
    "Comedy",
    "Science",
    "Cooking",
    "Travel",
    "Fashion",
    "Fitness",
    "Art",
    "Business",
  ]

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const allVideos = data?.pages?.flatMap((page) => page.videos) || []

  if (isLoading) {
    return (
      <div className="home">
        <div className="category-filters">
          <div className="category-filters-container">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="home">
        <div className="category-filters">
          <div className="category-filters-container">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="content">
          <div className="error-container">
            <h2>⚠️ Error loading videos</h2>
            <p>{error?.message || "Something went wrong while loading videos"}</p>
            <button onClick={() => window.location.reload()}>🔄 Try Again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Full-width category bar with hover effects */}
      <div className="category-filters">
        <div className="category-filters-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main content with compact video grid */}
      <div className="content">
        {/* Compact videos grid */}
        <div className="videos-grid">
          {allVideos.map((video, index) => (
            <VideoCard key={`${video.id}-${index}`} video={video} channelData={video.channel} layout="grid" />
          ))}
        </div>

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <p>Loading more videos...</p>
          </div>
        )}

        {/* Intersection observer trigger */}
        {hasNextPage && (
          <div ref={ref} className="load-more-trigger">
            {/* Invisible trigger element */}
          </div>
        )}

        {/* End of content */}
        {!hasNextPage && allVideos.length > 0 && (
          <div className="end-of-content">
            <p>🎉 You've reached the end! No more videos to load.</p>
          </div>
        )}

        {/* No videos found */}
        {allVideos.length === 0 && !isLoading && (
          <div className="no-videos">
            <h2>📹 No videos found</h2>
            <p>Try selecting a different category or check back later for new content.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
