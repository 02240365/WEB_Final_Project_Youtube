"use client"

// SearchResults.jsx - Search results page component
// Displays search results with filters

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import "./SearchResults.css"
import VideoCard from "../components/videos/VideoCard"
import { searchVideos } from "../services/api"
import { toast } from "react-toastify"

// Filter options
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "upload_date", label: "Upload date" },
  { value: "view_count", label: "View count" },
  { value: "rating", label: "Rating" },
]

const durationOptions = [
  { value: "", label: "Any duration" },
  { value: "short", label: "Under 4 minutes" },
  { value: "medium", label: "4-20 minutes" },
  { value: "long", label: "Over 20 minutes" },
]

const uploadDateOptions = [
  { value: "", label: "Any time" },
  { value: "hour", label: "Last hour" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

function SearchResults() {
  const { searchQuery } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Get current filter values from URL params
  const [filters, setFilters] = useState({
    sortBy: searchParams.get("sort") || "relevance",
    duration: searchParams.get("duration") || "",
    uploadDate: searchParams.get("upload_date") || "",
  })

  // Load search results when query or filters change
  useEffect(() => {
    if (searchQuery) {
      loadSearchResults()
    }
  }, [searchQuery, filters])

  const loadSearchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const results = await searchVideos(searchQuery, filters)
      setVideos(results)
    } catch (error) {
      console.error("Error loading search results:", error)
      setError("Failed to load search results. Please try again.")
      toast.error("Failed to load search results")
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    }

    setFilters(newFilters)

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(filterName === "sortBy" ? "sort" : filterName, value)
    } else {
      newSearchParams.delete(filterName === "sortBy" ? "sort" : filterName)
    }
    setSearchParams(newSearchParams)
  }

  // Clear all filters
  const clearFilters = () => {
    const newFilters = {
      sortBy: "relevance",
      duration: "",
      uploadDate: "",
    }

    setFilters(newFilters)
    setSearchParams({})
  }

  if (loading) {
    return (
      <div className="search-results">
        <div className="search-results__loading">
          <div className="search-results__loading-spinner"></div>
          <p>Searching...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="search-results">
        <div className="search-results__error">
          <p>{error}</p>
          <button onClick={loadSearchResults} className="search-results__retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results">
      <div className="search-results__header">
        <div className="search-results__info">
          <h1 className="search-results__title">Search results for "{searchQuery}"</h1>
          <p className="search-results__count">
            {videos.length} {videos.length === 1 ? "result" : "results"}
          </p>
        </div>

        <button className="search-results__filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          🔍 Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="search-results__filters">
          <div className="search-results__filter-group">
            <label className="search-results__filter-label">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="search-results__filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-results__filter-group">
            <label className="search-results__filter-label">Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange("duration", e.target.value)}
              className="search-results__filter-select"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-results__filter-group">
            <label className="search-results__filter-label">Upload date</label>
            <select
              value={filters.uploadDate}
              onChange={(e) => handleFilterChange("uploadDate", e.target.value)}
              className="search-results__filter-select"
            >
              {uploadDateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button className="search-results__clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      {/* Results */}
      <div className="search-results__content">
        {videos.length > 0 ? (
          <div className="search-results__videos">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} channelData={video.channel} layout="list" />
            ))}
          </div>
        ) : (
          <div className="search-results__no-results">
            <div className="search-results__no-results-icon">🔍</div>
            <h2 className="search-results__no-results-title">No results found</h2>
            <p className="search-results__no-results-text">Try different keywords or remove search filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
